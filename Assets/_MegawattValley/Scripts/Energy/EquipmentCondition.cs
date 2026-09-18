using System.Collections.Generic;
using MegawattValley.Data;
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

        /// <summary>
        /// Closest faulted array that is not already under repair. Used by the technician's
        /// auto-dispatch (S6-07).
        /// </summary>
        public static EquipmentCondition FindNearestFaulted(Vector3 from)
        {
            Prune();
            EquipmentCondition best = null;
            float bestDistance = float.MaxValue;
            foreach (var item in Equipment)
            {
                if (item == null || !item.IsFaulted || item.IsRepairing)
                {
                    continue;
                }

                float distance = Vector3.Distance(from, item.transform.position);
                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    best = item;
                }
            }

            return best;
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
        [SerializeField] private SolarArrayDefinition definition;
        [SerializeField] private float condition = 100f;

        [Header("Fallbacks used when no definition is assigned")]
        /// <summary>Wear only accrues while the array is actually generating, so panels do not rot overnight.</summary>
        [SerializeField] private float naturalWearPerSecond = 0.1f;
        [SerializeField] private float faultChancePerSecondAtLowCondition = 0.06f;
        [SerializeField] private float repairCost = 80f;
        [SerializeField] private float preventiveCost = 35f;
        [SerializeField] private float repairSeconds = 2.5f;

        [Header("Tuning")]
        [Tooltip("Output multiplier at 0% condition, before a fault stops generation entirely.")]
        [SerializeField, Range(0f, 1f)] private float wornOutputMultiplier = 0.55f;
        [SerializeField] private float preventiveConditionGain = 25f;
        [SerializeField] private float repairConditionFloor = 70f;

        [SerializeField] private bool isFaulted;
        [SerializeField] private bool isRepairing;
        [SerializeField] private float repairTimer;
        [SerializeField] private float soiling;
        [SerializeField] private bool isCleaning;
        [SerializeField] private float cleanTimer;
        [SerializeField] private float soilingPerSecond = 0.8f;
        [SerializeField] private float baseCleanSeconds = 4f;
        [SerializeField] private float kitCleanSeconds = 1.25f;
        [SerializeField] private float cleanCashCost = 15f;

        private static int _siteCleansCompleted;

        private SolarArrayUnit _solar;
        private TextMesh _label;
        private Material _healthyMaterial;
        private Material _faultMaterial;
        private MeshRenderer _bodyRenderer;

        public float Condition => condition;
        public float Soiling => soiling;
        public bool IsFaulted => isFaulted;
        public bool IsRepairing => isRepairing;
        public bool IsCleaning => isCleaning;
        public SolarArrayUnit Solar => _solar;

        public float RepairCost => definition != null ? definition.RepairCost : repairCost;

        /// <summary>Repair price after the on-site technician's trait is applied.</summary>
        public float EffectiveRepairCost => RepairCost *
            (StaffIdentity.OnSite != null ? StaffIdentity.OnSite.RepairCostMultiplier : 1f);

        public float PreventiveCost => definition != null ? definition.PreventiveCost : preventiveCost;
        private float RepairSeconds => definition != null ? definition.RepairSeconds : repairSeconds;
        private float WearPerSecond => definition != null ? definition.WearPerSecond : naturalWearPerSecond;

        private float FaultChancePerSecondAtLowCondition => definition != null
            ? definition.FaultChancePerSecondAtLowCondition
            : faultChancePerSecondAtLowCondition;

        public static EquipmentCondition Selected { get; private set; }

        public void Configure(SolarArrayDefinition arrayDefinition)
        {
            definition = arrayDefinition;
        }

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
            TickSoiling(dt);
            TickRepair(dt);
            TickClean(dt);
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

            if (keyboard.cKey.wasPressedThisFrame)
            {
                BeginClean();
            }
        }

        private void TickSoiling(float dt)
        {
            if (isFaulted || isRepairing || isCleaning || dt <= 0f)
            {
                return;
            }

            bool generating = _solar == null || (_solar.IsConnectedToGrid && DayNightSun.SolarFactor > 0.05f);
            if (!generating)
            {
                return;
            }

            soiling = Mathf.Min(100f, soiling + soilingPerSecond * dt);
        }

        private void TickClean(float dt)
        {
            if (!isCleaning)
            {
                return;
            }

            cleanTimer -= dt;
            if (cleanTimer > 0f)
            {
                return;
            }

            isCleaning = false;
            soiling = 0f;
            _siteCleansCompleted++;
            ObjectiveLadder.Instance?.NotifyCleaned();
            Debug.Log($"[MegawattValley] Clean complete on {name}.");

            if (_siteCleansCompleted >= 2 && CompanyCapabilities.Instance != null)
            {
                CompanyCapabilities.Instance.Unlock(CapabilityIds.BasicCleaningKit);
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
                condition = Mathf.Max(0f, condition - WearPerSecond * dt);
                float faultChance = Mathf.InverseLerp(50f, 0f, condition) * FaultChancePerSecondAtLowCondition * dt;
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

            float floor = repairConditionFloor +
                          (StaffIdentity.OnSite != null ? StaffIdentity.OnSite.RepairConditionBonus : 0f);
            condition = Mathf.Min(100f, Mathf.Max(condition, floor));
            if (_bodyRenderer != null && _healthyMaterial != null)
            {
                _bodyRenderer.sharedMaterial = _healthyMaterial;
            }

            Debug.Log($"[MegawattValley] Repair complete on {name}.");
            ScenarioObjective.Instance?.NotifyRepairCompleted();
            CompanyCapabilities.Instance?.Unlock(CapabilityIds.RadioDispatch);
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

            Debug.LogWarning($"[MegawattValley] FAULT on {name}. Technician should auto-dispatch (or press F / Repair).");
        }

        public void BeginRepair(bool assignTechnician)
        {
            if (!isFaulted || isRepairing)
            {
                return;
            }

            // Manual / HUD callouts send the tech first; cash is taken when they arrive
            // (BeginRepairOnSite). That way a 2.5s repair timer does not finish before the walk.
            if (assignTechnician && TechnicianActor.Instance != null)
            {
                if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.CanAfford(EffectiveRepairCost))
                {
                    Debug.LogWarning("[MegawattValley] Not enough cash to repair.");
                    return;
                }

                TechnicianActor.Instance.DispatchToRepair(this);
                return;
            }

            BeginRepairOnSite();
        }

        /// <summary>Spend cash and start the repair timer. Called when the technician is on site.</summary>
        public void BeginRepairOnSite()
        {
            if (!isFaulted || isRepairing)
            {
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(EffectiveRepairCost))
            {
                Debug.LogWarning("[MegawattValley] Not enough cash to repair.");
                return;
            }

            isRepairing = true;
            repairTimer = RepairSeconds;
            Debug.Log($"[MegawattValley] Repair started on site (${EffectiveRepairCost:0}).");
        }

        /// <summary>
        /// Restores saved wear. Called after the array is built, so it overrides the healthy
        /// starting state that OnEnable applies to newly placed arrays.
        /// </summary>
        public void RestoreState(float conditionPercent, bool faulted)
        {
            condition = Mathf.Clamp(conditionPercent, 0f, 100f);
            isRepairing = false;
            repairTimer = 0f;
            isFaulted = false;

            if (faulted)
            {
                TriggerFault();
            }

            ApplyGenerationMultiplier();
            RefreshLabel();
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

        /// <summary>Storm / climax damage. Optional forced fault for the risky choice.</summary>
        public void ApplyConditionHit(float amount, bool forceFault)
        {
            if (amount > 0f)
            {
                condition = Mathf.Max(0f, condition - amount);
            }

            if (forceFault || condition <= 0.01f)
            {
                TriggerFault();
            }

            ApplyGenerationMultiplier();
            RefreshLabel();
        }

        public void DoPreventiveMaintenance()
        {
            if (isFaulted || isRepairing)
            {
                Debug.Log("[MegawattValley] Cannot do preventive maintenance during a fault/repair.");
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(PreventiveCost))
            {
                Debug.LogWarning("[MegawattValley] Not enough cash for preventive maintenance.");
                return;
            }

            condition = Mathf.Min(100f, condition + preventiveConditionGain);
            Debug.Log($"[MegawattValley] Preventive maintenance (+{preventiveConditionGain:0} condition, ${PreventiveCost:0}). Now {condition:0}%.");
        }

        public float EffectiveCleanSeconds
        {
            get
            {
                bool kit = CompanyCapabilities.Instance != null &&
                           CompanyCapabilities.Instance.IsUnlocked(CapabilityIds.BasicCleaningKit);
                return kit ? kitCleanSeconds : baseCleanSeconds;
            }
        }

        public void BeginClean()
        {
            if (isFaulted || isRepairing || isCleaning)
            {
                Debug.Log("[MegawattValley] Cannot clean during fault/repair/clean.");
                return;
            }

            if (soiling < 5f)
            {
                Debug.Log("[MegawattValley] Array is already clean enough.");
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(cleanCashCost))
            {
                Debug.LogWarning($"[MegawattValley] Not enough cash to clean (${cleanCashCost:0}).");
                return;
            }

            isCleaning = true;
            cleanTimer = EffectiveCleanSeconds;
            Debug.Log($"[MegawattValley] Cleaning {name} ({cleanTimer:0.0}s, ${cleanCashCost:0}).");
        }

        private void ApplyGenerationMultiplier()
        {
            if (_solar == null)
            {
                return;
            }

            float conditionMul = SolarMath.ConditionMultiplier(condition, isFaulted, wornOutputMultiplier);
            float soilMul = isCleaning ? 0.2f : SolarMath.SoilingMultiplier(soiling);
            _solar.SetOutputMultiplier(conditionMul * soilMul);
        }

        private void RefreshLabel()
        {
            if (_label == null)
            {
                return;
            }

            bool offGrid = _solar != null && !_solar.IsConnectedToGrid;
            string state = isFaulted ? "FAULT" : isRepairing ? "REPAIR" : isCleaning ? "CLEAN" : offGrid ? "NO GRID" : "OK";
            string dust = soiling >= 8f ? $"\nDust {soiling:0}%" : string.Empty;
            _label.text = $"{condition:0}%\n{state}{dust}";
            _label.color = isFaulted || offGrid ? new Color(1f, 0.4f, 0.3f) :
                soiling >= 40f ? new Color(1f, 0.85f, 0.4f) : Color.white;
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
