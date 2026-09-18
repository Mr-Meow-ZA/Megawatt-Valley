using System.Collections.Generic;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Grid export point — solar must be within range of any node to sell power (S3-03 / L1-08).
    /// </summary>
    public sealed class GridExportNode : MonoBehaviour
    {
        private static readonly List<GridExportNode> Nodes = new List<GridExportNode>();

        [SerializeField] private float connectRadius = 14f;
        [SerializeField] private bool showCoverageRing = true;
        [SerializeField] private int coverageRingPosts = 40;

        /// <summary>First registered node (legacy callers / HUD).</summary>
        public static GridExportNode Instance => Nodes.Count > 0 ? Nodes[0] : null;

        public float ConnectRadius => connectRadius;

        private void Awake()
        {
            if (!Nodes.Contains(this))
            {
                Nodes.Add(this);
            }
        }

        private void Start()
        {
            if (showCoverageRing)
            {
                BuildCoverageRing();
            }
        }

        private void OnDestroy()
        {
            Nodes.Remove(this);
        }

        public bool IsInRange(Vector3 worldPosition)
        {
            Vector3 origin = transform.position;
            float dx = worldPosition.x - origin.x;
            float dz = worldPosition.z - origin.z;
            return (dx * dx) + (dz * dz) <= connectRadius * connectRadius;
        }

        public static bool IsInRangeOfAny(Vector3 worldPosition)
        {
            if (Nodes.Count == 0)
            {
                return true;
            }

            foreach (var node in Nodes)
            {
                if (node != null && node.IsInRange(worldPosition))
                {
                    return true;
                }
            }

            return false;
        }

        private void BuildCoverageRing()
        {
            var ringRoot = new GameObject("GridCoverageRing");
            ringRoot.transform.SetParent(transform, false);
            ringRoot.transform.localPosition = Vector3.zero;
            ringRoot.transform.localRotation = Quaternion.identity;
            ringRoot.transform.localScale = Vector3.one;

            var postMaterial = GroundClickMarker.CreateColorMaterial(new Color(0.2f, 0.75f, 1f));
            int posts = Mathf.Max(8, coverageRingPosts);

            for (int i = 0; i < posts; i++)
            {
                float angle = (i / (float)posts) * Mathf.PI * 2f;
                var post = GameObject.CreatePrimitive(PrimitiveType.Cube);
                post.name = "CoveragePost";
                post.transform.SetParent(ringRoot.transform, true);
                post.transform.position = transform.position +
                                          new Vector3(Mathf.Cos(angle) * connectRadius, 0f, Mathf.Sin(angle) * connectRadius);
                post.transform.position = new Vector3(post.transform.position.x, 0.3f, post.transform.position.z);
                post.transform.localScale = new Vector3(0.25f, 0.6f, 0.25f);

                var renderer = post.GetComponent<MeshRenderer>();
                if (renderer != null)
                {
                    renderer.sharedMaterial = postMaterial;
                }

                Destroy(post.GetComponent<Collider>());
            }
        }

        private void OnDrawGizmos()
        {
            Gizmos.color = new Color(0.2f, 0.7f, 1f, 0.35f);
            Gizmos.DrawWireSphere(transform.position, connectRadius);
        }
    }
}
