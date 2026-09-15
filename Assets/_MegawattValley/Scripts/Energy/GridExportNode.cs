using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Simple grid export point — solar must be within range to sell power (S3-03).
    /// </summary>
    public sealed class GridExportNode : MonoBehaviour
    {
        public static GridExportNode Instance { get; private set; }

        [SerializeField] private float connectRadius = 18f;

        public float ConnectRadius => connectRadius;

        private void Awake()
        {
            Instance = this;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public bool IsInRange(Vector3 worldPosition)
        {
            Vector3 flat = worldPosition;
            flat.y = transform.position.y;
            return Vector3.Distance(flat, transform.position) <= connectRadius;
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(0.2f, 0.7f, 1f, 0.35f);
            Gizmos.DrawWireSphere(transform.position, connectRadius);
        }
    }
}
