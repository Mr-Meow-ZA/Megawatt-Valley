using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Placeholder technician who walks to a repair target (S4-04).
    /// </summary>
    public sealed class TechnicianActor : MonoBehaviour
    {
        public static TechnicianActor Instance { get; private set; }

        [SerializeField] private float moveSpeed = 6f;
        [SerializeField] private Transform homePoint;

        private Transform _target;
        private bool _hasTarget;
        private Vector3 _homePosition;
        private bool _walking;

        public float MoveSpeed
        {
            get => moveSpeed;
            set => moveSpeed = Mathf.Max(0.1f, value);
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

                    return $"Walking to {_target.name}";
                }

                return _walking ? "Returning to base" : "Idle at base";
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

        public void AssignRepair(Transform target)
        {
            _target = target;
            _hasTarget = target != null;
            Debug.Log("[MegawattValley] Technician assigned to repair.");
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            Vector3 destination = HasTask ? _target.position : _homePosition;
            destination.y = transform.position.y;

            float distance = Vector3.Distance(transform.position, destination);
            _walking = distance > 0.4f;
            if (_walking)
            {
                transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Mathf.Max(dt, 0f));
            }

            if (HasTask && !_walking)
            {
                // Stay near the asset while repairing; head home once the repair finishes.
                var condition = _target.GetComponent<EquipmentCondition>();
                if (condition == null || !condition.IsRepairing)
                {
                    _hasTarget = false;
                    _target = null;
                }
            }
        }
    }
}
