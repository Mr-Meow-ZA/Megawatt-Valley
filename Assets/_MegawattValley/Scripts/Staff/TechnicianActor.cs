using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Placeholder technician. Auto-seeks faults, walks first, then repairs on arrival.
    /// When the site is healthy he does short inspection walks so the site does not look frozen (S4-04, S6-07).
    /// </summary>
    public sealed class TechnicianActor : MonoBehaviour
    {
        public static TechnicianActor Instance { get; private set; }

        [SerializeField] private float moveSpeed = 6f;
        [SerializeField] private Transform homePoint;
        [SerializeField] private bool autoDispatch = true;
        [SerializeField] private float autoDispatchInterval = 0.35f;
        [SerializeField] private float idleInspectionInterval = 10f;
        [SerializeField] private float inspectionLingerSeconds = 1.25f;

        private Transform _target;
        private bool _hasTarget;
        private Vector3 _homePosition;
        private bool _walking;
        private bool _pendingArrivalRepair;
        private float _autoDispatchCooldown;
        private float _idleInspectionCooldown;
        private float _inspectionLingerRemaining;
        private bool _inspectionTrip;
        private TextMesh _statusLabel;

        public float MoveSpeed
        {
            get => moveSpeed;
            set => moveSpeed = Mathf.Max(0.1f, value);
        }

        public bool AutoDispatch
        {
            get => autoDispatch;
            set => autoDispatch = value;
        }

        public bool HasTask => _hasTarget && _target != null;

        public string Activity
        {
            get
            {
                if (_inspectionLingerRemaining > 0f)
                {
                    return "Inspecting array";
                }

                if (HasTask)
                {
                    var condition = _target.GetComponent<EquipmentCondition>();
                    if (condition != null && condition.IsRepairing && !_walking)
                    {
                        return $"Repairing {_target.name}";
                    }

                    if (_pendingArrivalRepair)
                    {
                        return $"Heading to fault";
                    }

                    if (_inspectionTrip)
                    {
                        return "Inspection walk";
                    }

                    return $"Walking to {_target.name}";
                }

                return _walking ? "Returning to base" : "Idle at base";
            }
        }

        private void Awake()
        {
            Instance = this;
            _homePosition = homePoint != null ? homePoint.position : transform.position;
            _idleInspectionCooldown = idleInspectionInterval * 0.4f;

            var identity = GetComponent<StaffIdentity>();
            if (identity != null && identity.ActiveTrait == StaffIdentity.Trait.SpeedyBoots)
            {
                moveSpeed *= 1.45f;
            }

            EnsureStatusLabel();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>Walk to a faulted array; payment and repair timer start on arrival.</summary>
        public void DispatchToRepair(EquipmentCondition equipment)
        {
            if (equipment == null)
            {
                return;
            }

            CancelInspection();
            _target = equipment.transform;
            _hasTarget = true;
            _pendingArrivalRepair = true;
            _inspectionTrip = false;
            Debug.Log($"[MegawattValley] Technician dispatched to repair {equipment.name}.");
        }

        /// <summary>Legacy entry used when a repair is already underway (kept for compatibility).</summary>
        public void AssignRepair(Transform target)
        {
            var condition = target != null ? target.GetComponent<EquipmentCondition>() : null;
            if (condition != null)
            {
                DispatchToRepair(condition);
                return;
            }

            CancelInspection();
            _target = target;
            _hasTarget = target != null;
            _pendingArrivalRepair = false;
            _inspectionTrip = false;
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            if (dt <= 0f)
            {
                RefreshStatusLabel();
                return;
            }

            TickLinger(dt);
            TickMovement(dt);
            TickArrival();
            TickAutoDispatch(dt);
            TickIdleInspection(dt);
            RefreshStatusLabel();
        }

        private void TickLinger(float dt)
        {
            if (_inspectionLingerRemaining <= 0f)
            {
                return;
            }

            _inspectionLingerRemaining -= dt;
            if (_inspectionLingerRemaining <= 0f)
            {
                ClearTask();
            }
        }

        private void TickMovement(float dt)
        {
            if (_inspectionLingerRemaining > 0f)
            {
                _walking = false;
                return;
            }

            Vector3 destination = HasTask ? _target.position : _homePosition;
            destination.y = transform.position.y;

            float distance = Vector3.Distance(transform.position, destination);
            _walking = distance > 0.45f;
            if (_walking)
            {
                transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * dt);
            }
        }

        private void TickArrival()
        {
            if (!HasTask || _walking || _inspectionLingerRemaining > 0f)
            {
                return;
            }

            var condition = _target.GetComponent<EquipmentCondition>();

            if (_inspectionTrip)
            {
                _inspectionTrip = false;
                _inspectionLingerRemaining = inspectionLingerSeconds;
                return;
            }

            if (condition == null)
            {
                ClearTask();
                return;
            }

            if (_pendingArrivalRepair)
            {
                _pendingArrivalRepair = false;
                if (condition.IsFaulted && !condition.IsRepairing)
                {
                    condition.BeginRepairOnSite();
                }
            }

            if (!condition.IsRepairing)
            {
                ClearTask();
            }
        }

        private void TickAutoDispatch(float dt)
        {
            if (!autoDispatch || HasTask || _walking || _inspectionLingerRemaining > 0f)
            {
                return;
            }

            _autoDispatchCooldown -= dt;
            if (_autoDispatchCooldown > 0f)
            {
                return;
            }

            _autoDispatchCooldown = autoDispatchInterval;
            TryDispatchToNearestFault();
        }

        private void TickIdleInspection(float dt)
        {
            if (!autoDispatch || HasTask || _walking || _inspectionLingerRemaining > 0f)
            {
                return;
            }

            // Faults always win over sightseeing.
            if (MaintenanceBoard.FaultedCount > 0)
            {
                return;
            }

            _idleInspectionCooldown -= dt;
            if (_idleInspectionCooldown > 0f)
            {
                return;
            }

            _idleInspectionCooldown = idleInspectionInterval;
            TryStartInspectionWalk();
        }

        private void TryDispatchToNearestFault()
        {
            var fault = MaintenanceBoard.FindNearestFaulted(transform.position);
            if (fault == null)
            {
                return;
            }

            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.CanAfford(fault.EffectiveRepairCost))
            {
                return;
            }

            DispatchToRepair(fault);
        }

        private void TryStartInspectionWalk()
        {
            var equipment = MaintenanceBoard.All;
            if (equipment == null || equipment.Count == 0)
            {
                return;
            }

            // Pick a random healthy array that is not under the tech's feet.
            EquipmentCondition pick = null;
            int candidates = 0;
            for (int i = 0; i < equipment.Count; i++)
            {
                var item = equipment[i];
                if (item == null || item.IsFaulted || item.IsRepairing)
                {
                    continue;
                }

                float distance = Vector3.Distance(transform.position, item.transform.position);
                if (distance < 1.5f)
                {
                    continue;
                }

                candidates++;
                if (Random.Range(0, candidates) == 0)
                {
                    pick = item;
                }
            }

            if (pick == null)
            {
                return;
            }

            _target = pick.transform;
            _hasTarget = true;
            _inspectionTrip = true;
            _pendingArrivalRepair = false;
        }

        private void CancelInspection()
        {
            _inspectionTrip = false;
            _inspectionLingerRemaining = 0f;
        }

        private void ClearTask()
        {
            _hasTarget = false;
            _target = null;
            _pendingArrivalRepair = false;
            _inspectionTrip = false;
            _inspectionLingerRemaining = 0f;
        }

        private void EnsureStatusLabel()
        {
            var labelGo = new GameObject("TechStatus");
            labelGo.transform.SetParent(transform, false);
            labelGo.transform.localPosition = new Vector3(0f, 2.05f, 0f);
            _statusLabel = labelGo.AddComponent<TextMesh>();
            _statusLabel.characterSize = 0.1f;
            _statusLabel.fontSize = 42;
            _statusLabel.anchor = TextAnchor.MiddleCenter;
            _statusLabel.alignment = TextAlignment.Center;
            _statusLabel.color = new Color(1f, 0.95f, 0.55f);
        }

        private void RefreshStatusLabel()
        {
            if (_statusLabel == null)
            {
                return;
            }

            _statusLabel.text = Activity;
            var cam = UnityEngine.Camera.main;
            if (cam != null)
            {
                _statusLabel.transform.rotation =
                    Quaternion.LookRotation(_statusLabel.transform.position - cam.transform.position);
            }
        }
    }
}
