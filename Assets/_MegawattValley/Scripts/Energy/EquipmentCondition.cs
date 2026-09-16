using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Site-wide view of equipment health, so the HUD and events do not have to search the scene.
    /// </summary>
    public static class MaintenanceBoard
    {
        private static readonly List<EquipmentCondition> Equipment = new List<EquipmentCondition>();

        public static IReadOnlyList<EquipmentCondition> All
        {
            get
            {
                Prune();
                return Equipment;
            }
        }

        public static int FaultedCount
        {
            get
            {
                Prune();
                int count = 0;
                foreach (var item in Equipment)
                {
                    if (item.IsFaulted)
                    {
                        count++;
                    }
                }

                return count;
            }
        }

        public static void Register(EquipmentCondition equipment)
        {
            if (equipment != null && !Equipment.Contains(equipment))
            {
                Equipment.Add(equipment);
            }
        }

        public static void Unregister(EquipmentCondition equipment)
        {
            Equipment.Remove(equipment);
        }

        private static void Prune()
        {
            for (int i = Equipment.Count - 1; i >= 0; i--)
            {
                if (Equipment[i] == null)
                {
                    Equipment.RemoveAt(i);
                }
            }
        }
    }

    /// <summary>
    /// Condition, faults, repair, and preventive maintenance for a solar array (S4-01..S4-05).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class EquipmentCondition : MonoBehaviour
    {
        [SerializeField] private float condition = 100f;

        /// <summary>Wear only accrues while the array is actually generating, so panels do not rot overnight.</summary>
        [SerializeField] private float naturalWearPerSecond = 0.1f;
        [SerializeField] private float faultChancePerSecondAtLowCondition = 0.06f;
        [SerializeField] private float repairCost = 80f;
        [SerializeField] private float preventiveCost = 35f;
        [SerializeField] private float repairSeconds = 2.5f;
        [SerializeField] private bool isFaulted;
        [SerializeField] private bool isRepairing;
        [SerializeField] private float repairTimer;

        private SolarArrayUnit _solar;
        private TextMesh _label;
        private Material _healthyMaterial;
        private Material _faultMaterial;
        private MeshRenderer _bodyRenderer;

        public float Condition => condition;
        public bool IsFaulted => isFaulted;
        public bool IsRepairing => isRepairing;
        public float RepairCost => repairCost;
        public float PreventiveCost => preventiveCost;
        public SolarArrayUnit Solar => _solar;

        public static EquipmentCondition Selected { get; private set; }

        public static void ClearSelection()
        {
            Selected = null;
        }

        private void Awake()
        {
            _solar = GetComponent<SolarArrayUnit>();
            _bodyRenderer = GetComponentInChildren<MeshRenderer>();
            _healthyMaterial = _bodyRenderer != null ? _bodyRenderer.sharedMaterial : null;
            _faultMaterial = GroundClickMarker.CreateColorMaterial(new Color(0.85f, 0.15f, 0.1f));

            var labelGo = new GameObject("ConditionLabel");
            labelGo.transform.SetParent(transform, false);
            labelGo.transform.localPosition = new Vector3(0f, 2.2f, 0f);
            _label = labelGo.AddComponent<TextMesh>();
            _label.characterSize = 0.12f;
            _label.fontSize = 48;
            _label.anchor = TextAnchor.MiddleCenter;
            _label.alignment = TextAlignment.Center;
            _label.color = Color.white;
            RefreshLabel();
        }

        private void OnEnable()
        {
            // Newly placed arrays start healthy.
            condition = 100f;
            isFaulted = false;
            isRepairing = false;
            MaintenanceBoard.Register(this);
        }

        private void OnDisable()
        {
            MaintenanceBoard.Unregister(this);
            if (Selected == this)
            {
                Selected = null;
            }
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            HandleSelectionInput();
            TickWearAndFaults(dt);
            TickRepair(dt);
            ApplyGenerationMultiplier();
            RefreshLabel();
            FaceLabelToCamera();
        }

        private void HandleSelectionInput()
        {
            var mouse = Mouse.current;
            var keyboard = Keyboard.current;
            var cam = UnityEngine.Camera.main;
            if (mouse == null || cam == null)
            {
                return;
            }

            if (mouse.leftButton.wasPressedThisFrame && !UiInputGuard.PointerOverUi &&
                (BuildModeController.Instance == null || !BuildModeController.Instance.IsPlacing))
            {
                Ray ray = cam.ScreenPointToRay(mouse.position.ReadValue());
                if (Physics.Raycast(ray, out RaycastHit hit, 500f))
                {
                    var condition = hit.collider.GetComponentInParent<EquipmentCondition>();
                    if (condition == this)
                    {
                        Selected = this;
                        StaffIdentity.ClearSelection();
                        Debug.Log($"[MegawattValley] Selected equipment {name} ({this.condition:0}%)");
                    }
                }
            }

            if (Selected != this || keyboard == null)
            {
                return;
            }

            if (keyboard.fKey.wasPressedThisFrame)
            {
                BeginRepair(assignTechnician: true);
            }

            if (keyboard.mKey.wasPressedThisFrame)
            {
                DoPreventiveMaintenance();
            }

            if (keyboard.kKey.wasPressedThisFrame)
            {
                TriggerFault();
            }
        }

        private void TickWearAndFaults(float dt)
        {
            if (isRepairing || dt <= 0f)
            {
                return;
            }

            bool generating = _solar == null || _solar.CurrentMegawatts > 0f;
            if (!generating)
            {
                return;
            }

            if (!isFaulted)
            {
                condition = Mathf.Max(0f, condition - naturalWearPerSecond * dt);
                float faultChance = Mathf.InverseLerp(50f, 0f, condition) * faultChancePerSecondAtLowCondition * dt;
                if (Random.value < faultChance || condition <= 0.01f)
                {
                    TriggerFault();
                }
            }
        }

        private void TickRepair(float dt)
        {
            if (!isRepairing)
            {
                return;
            }

            repairTimer -= dt;
            if (repairTimer > 0f)
            {
                return;
            }

            isRepairing = false;
            isFaulted = false;
            condition = Mathf.Max(condition, 70f);
            if (_bodyRenderer != null && _healthyMaterial != null)
            {
                _bodyRenderer.sharedMaterial = _healthyMaterial;
            }

            Debug.Log($"[MegawattValley] Repair complete on {name}.");
        }

        private void TriggerFault()
        {
            if (isFaulted)
            {
                return;
            }

            isFaulted = true;
            condition = Mathf.Min(condition, 15f);
            if (_bodyRenderer != null)
            {
                _bodyRenderer.sharedMaterial = _faultMaterial;
            }

            Debug.LogWarning($"[MegawattValley] FAULT on {name}. Press F to repair (with technician), M for preventive next time.");
        }

        public void BeginRepair(bool assignTechnician)
        {
            if (!isFaulted || isRepairing)
            {
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(repairCost))
            {
                Debug.LogWarning("[MegawattValley] Not enough cash to repair.");
                return;
            }

            isRepairing = true;
            repairTimer = repairSeconds;
            if (assignTechnician && TechnicianActor.Instance != null)
            {
                TechnicianActor.Instance.AssignRepair(transform);
            }

            Debug.Log($"[MegawattValley] Repair started (${repairCost:0}).");
        }

        /// <summary>Free condition recovery from an event or perk, with no cash cost.</summary>
        public void ApplyServiceBonus(float amount)
        {
            if (isFaulted || amount <= 0f)
            {
                return;
            }

            condition = Mathf.Min(100f, condition + amount);
        }

        public void DoPreventiveMaintenance()
        {
            if (isFaulted || isRepairing)
            {
                Debug.Log("[MegawattValley] Cannot do preventive maintenance during a fault/repair.");
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(preventiveCost))
            {
                Debug.LogWarning("[MegawattValley] Not enough cash for preventive maintenance.");
                return;
            }

            condition = Mathf.Min(100f, condition + 25f);
            Debug.Log($"[MegawattValley] Preventive maintenance (+25 condition, ${preventiveCost:0}). Now {condition:0}%.");
        }

        private void ApplyGenerationMultiplier()
        {
            if (_solar == null)
            {
                return;
            }

            float multiplier = isFaulted ? 0f : Mathf.Lerp(0.55f, 1f, condition / 100f);
            _solar.SetOutputMultiplier(multiplier);
        }

        private void RefreshLabel()
        {
            if (_label == null)
            {
                return;
            }

            bool offGrid = _solar != null && !_solar.IsConnectedToGrid;
            string state = isFaulted ? "FAULT" : isRepairing ? "REPAIR" : offGrid ? "NO GRID" : "OK";
            _label.text = $"{condition:0}%\n{state}";
            _label.color = isFaulted || offGrid ? new Color(1f, 0.4f, 0.3f) : Color.white;
        }

        private void FaceLabelToCamera()
        {
            var cam = UnityEngine.Camera.main;
            if (cam == null || _label == null)
            {
                return;
            }

            _label.transform.rotation = Quaternion.LookRotation(_label.transform.position - cam.transform.position);
        }

    }
}
