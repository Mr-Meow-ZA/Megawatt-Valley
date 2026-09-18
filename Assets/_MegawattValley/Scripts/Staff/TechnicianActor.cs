using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Placeholder technician who walks to repair targets. When idle, automatically seeks the
    /// nearest faulted array and starts the repair on arrival (S4-04, S6-07).
    /// </summary>
    public sealed class TechnicianActor : MonoBehaviour
    {
        public static TechnicianActor Instance { get; private set; }

        [SerializeField] private float moveSpeed = 6f;
        [SerializeField] private Transform homePoint;
        [SerializeField] private bool autoDispatch = true;
        [SerializeField] private float autoDispatchInterval = 0.5f;

        private Transform _target;
        private bool _hasTarget;
        private Vector3 _homePosition;
        private bool _walking;
        private bool _pendingArrivalRepair;
        private float _autoDispatchCooldown;

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
                if (HasTask)
                {
                    var condition = _target.GetComponent<EquipmentCondition>();
                    if (condition != null && condition.IsRepairing && !_walking)
                    {
                        return $"Repairing {_target.name}";
                    }

                    if (_pendingArrivalRepair)
                    {
                        return $"Heading to fault at {_target.name}";
                    }

                    return $"Walking to {_target.name}";
                }

                return _walking ? "Returning to base" : "Idle at base — watching for faults";
            }
        }

        private void Awake()
        {
            Instance = this;
            _homePosition = homePoint != null ? homePoint.position : transform.position;

            var identity = GetComponent<StaffIdentity>();
            if (identity != null && identity.ActiveTrait == StaffIdentity.Trait.SpeedyBoots)
            {
                moveSpeed *= 1.45f;
            }
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>Called when a repair is already paid for and in progress (manual F / HUD).</summary>
        public void AssignRepair(Transform target)
        {
            _target = target;
            _hasTarget = target != null;
            _pendingArrivalRepair = false;
            Debug.Log("[MegawattValley] Technician assigned to repair.");
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            TickMovement(dt);
            TickArrival();
            TickAutoDispatch(dt);
        }

        private void TickMovement(float dt)
        {
            Vector3 destination = HasTask ? _target.position : _homePosition;
            destination.y = transform.position.y;

            float distance = Vector3.Distance(transform.position, destination);
            _walking = distance > 0.4f;
            if (_walking)
            {
                transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Mathf.Max(dt, 0f));
            }
        }

        private void TickArrival()
        {
            if (!HasTask || _walking)
            {
                return;
            }

            var condition = _target.GetComponent<EquipmentCondition>();
            if (condition == null)
            {
                ClearTask();
                return;
            }

            // Auto-dispatch: pay and start the repair only once the tech is on site.
            if (_pendingArrivalRepair)
            {
                _pendingArrivalRepair = false;
                if (condition.IsFaulted && !condition.IsRepairing)
                {
                    condition.BeginRepair(assignTechnician: false);
                }
            }

            // Stay while the repair timer runs; head home when it finishes or never started.
            if (!condition.IsRepairing)
            {
                ClearTask();
            }
        }

        private void TickAutoDispatch(float dt)
        {
            if (!autoDispatch || HasTask || _walking)
            {
                return;
            }

            _autoDispatchCooldown -= Mathf.Max(dt, 0f);
            if (_autoDispatchCooldown > 0f)
            {
                return;
            }

            _autoDispatchCooldown = autoDispatchInterval;
            TryDispatchToNearestFault();
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

            _target = fault.transform;
            _hasTarget = true;
            _pendingArrivalRepair = true;
            Debug.Log($"[MegawattValley] Technician auto-dispatched to {fault.name}.");
        }

        private void ClearTask()
        {
            _hasTarget = false;
            _target = null;
            _pendingArrivalRepair = false;
        }
    }
}
