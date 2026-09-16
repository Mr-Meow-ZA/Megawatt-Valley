using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Raycasts from the cursor to the ground and places a visible click marker (S2-01).
    /// </summary>
    public sealed class GroundClickMarker : MonoBehaviour
    {
        [SerializeField] private UnityEngine.Camera worldCamera;
        [SerializeField] private LayerMask groundMask = ~0;
        [SerializeField] private Transform marker;
        [SerializeField] private float markerHeight = 0.05f;

        private void Awake()
        {
            if (worldCamera == null)
            {
                worldCamera = UnityEngine.Camera.main;
            }

            if (marker == null)
            {
                var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                go.name = "ClickMarker";
                go.transform.SetParent(transform, false);
                go.transform.localScale = new Vector3(0.8f, 0.05f, 0.8f);
                var meshRenderer = go.GetComponent<MeshRenderer>();
                if (meshRenderer != null)
                {
                    meshRenderer.sharedMaterial = CreateColorMaterial(new Color(1f, 0.85f, 0.2f));
                }

                Object.Destroy(go.GetComponent<Collider>());
                marker = go.transform;
                marker.gameObject.SetActive(false);
            }
        }

        private void Update()
        {
            var mouse = Mouse.current;
            if (mouse == null || worldCamera == null || !mouse.leftButton.wasPressedThisFrame || UiInputGuard.PointerOverUi)
            {
                return;
            }

            // Defer to build mode when it is placing.
            if (BuildModeController.Instance != null && BuildModeController.Instance.IsPlacing)
            {
                return;
            }

            Ray ray = worldCamera.ScreenPointToRay(mouse.position.ReadValue());
            if (Physics.Raycast(ray, out RaycastHit hit, 500f, groundMask, QueryTriggerInteraction.Ignore))
            {
                marker.gameObject.SetActive(true);
                marker.position = hit.point + Vector3.up * markerHeight;
            }
        }

        internal static Material CreateColorMaterial(Color color)
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var material = new Material(shader) { color = color };
            return material;
        }
    }
}
