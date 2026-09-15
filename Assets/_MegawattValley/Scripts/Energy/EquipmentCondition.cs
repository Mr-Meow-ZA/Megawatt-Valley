using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Condition, faults, repair, and preventive maintenance for a solar array (S4-01..S4-05).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class EquipmentCondition : MonoBehaviour
    {
        [SerializeField] private float condition = 100f;
        [SerializeField] private float naturalWearPerSecond = 1.2f;
        [SerializeField] private float faultChancePerSecondAtLowCondition = 0.25f;
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

        public static EquipmentCondition Selected { get; private set; }

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

            if (mouse.leftButton.wasPressedThisFrame &&
                (BuildModeController.Instance == null || !BuildModeController.Instance.IsPlacing))
            {
                Ray ray = cam.ScreenPointToRay(mouse.position.ReadValue());
                if (Physics.Raycast(ray, out RaycastHit hit, 500f))
                {
                    var condition = hit.collider.GetComponentInParent<EquipmentCondition>();
                    if (condition == this)
                    {
                        Selected = this;
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

            if (!isFaulted)
            {
                condition = Mathf.Max(0f, condition - naturalWearPerSecond * dt);
                float faultChance = Mathf.InverseLerp(40f, 0f, condition) * faultChancePerSecondAtLowCondition * dt;
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

        private void DoPreventiveMaintenance()
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

            float multiplier = isFaulted ? 0f : Mathf.Lerp(0.2f, 1f, condition / 100f);
            _solar.SetOutputMultiplier(multiplier);
        }

        private void RefreshLabel()
        {
            if (_label == null)
            {
                return;
            }

            string state = isFaulted ? "FAULT" : isRepairing ? "REPAIR" : "OK";
            _label.text = $"{condition:0}%\n{state}";
            _label.color = isFaulted ? new Color(1f, 0.4f, 0.3f) : Color.white;
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

        private void OnGUI()
        {
            if (Selected != this)
            {
                return;
            }

            GUI.Box(new Rect(12f, 210f, 280f, 88f), GUIContent.none);
            GUI.Label(new Rect(22f, 218f, 260f, 22f), $"Selected: {name}");
            GUI.Label(new Rect(22f, 240f, 260f, 22f), $"Condition {condition:0}%  {(isFaulted ? "FAULTED" : "online")}");
            GUI.Label(new Rect(22f, 262f, 260f, 22f), "F repair · M preventive maintenance");
        }
    }
}
