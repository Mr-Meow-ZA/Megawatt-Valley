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

        public float MoveSpeed
        {
            get => moveSpeed;
            set => moveSpeed = Mathf.Max(0.1f, value);
        }

        private void Awake()
        {
            Instance = this;
            if (homePoint == null)
            {
                homePoint = transform;
            }

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
            Vector3 destination = _hasTarget && _target != null
                ? _target.position
                : (homePoint != null ? homePoint.position : transform.position);

            destination.y = transform.position.y;
            transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Mathf.Max(dt, 0f));

            if (_hasTarget && _target != null && Vector3.Distance(transform.position, destination) < 0.4f)
            {
                // Stay near the asset while repairing; clear when no longer repairing.
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
