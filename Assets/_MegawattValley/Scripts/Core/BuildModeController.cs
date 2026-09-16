using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Minimal build mode: Solar Array ghost follow + place / demolish (S2-03..S2-08).
    /// </summary>
    public sealed class BuildModeController : MonoBehaviour
    {
        public static BuildModeController Instance { get; private set; }

        [SerializeField] private UnityEngine.Camera worldCamera;
        [SerializeField] private LayerMask groundMask = ~0;
        [SerializeField] private float solarCost = 250f;
        [SerializeField] private float solarNameplateMw = 0.25f;
        [SerializeField] private Vector3 solarFootprint = new Vector3(4f, 0.4f, 2f);
        [SerializeField] private float rotateStepDegrees = 90f;
        [SerializeField] private float demolishRefundFraction = 0.5f;

        private GameObject _ghost;
        private float _ghostYaw;
        private bool _placing;
        private Material _validMaterial;
        private Material _invalidMaterial;
        private SelectablePlot _buildablePlot;

        public bool IsPlacing => _placing;
        public float SolarCost => solarCost;
        public float SolarNameplateMw => solarNameplateMw;
        public bool CanAffordSolar => PlayerEconomy.Instance == null || PlayerEconomy.Instance.CanAfford(solarCost);

        private void Awake()
        {
            Instance = this;
            if (worldCamera == null)
            {
                worldCamera = UnityEngine.Camera.main;
            }

            _validMaterial = GroundClickMarker.CreateColorMaterial(new Color(0.2f, 0.75f, 1f, 0.65f));
            _invalidMaterial = GroundClickMarker.CreateColorMaterial(new Color(1f, 0.25f, 0.2f, 0.65f));
            _buildablePlot = FindAnyObjectByType<SelectablePlot>();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public void ToggleSolarPlacement()
        {
            if (_placing)
            {
                CancelPlacement();
            }
            else
            {
                BeginSolarPlacement();
            }
        }

        private void Update()
        {
            var keyboard = Keyboard.current;
            var mouse = Mouse.current;
            if (keyboard == null || mouse == null || worldCamera == null)
            {
                return;
            }

            if (keyboard.bKey.wasPressedThisFrame)
            {
                BeginSolarPlacement();
            }

            if (keyboard.escapeKey.wasPressedThisFrame)
            {
                CancelPlacement();
            }

            if (keyboard.xKey.wasPressedThisFrame)
            {
                TryDemolishUnderCursor();
            }

            if (!_placing || _ghost == null)
            {
                return;
            }

            if (keyboard.rKey.wasPressedThisFrame)
            {
                _ghostYaw = (_ghostYaw + rotateStepDegrees) % 360f;
            }

            Ray ray = worldCamera.ScreenPointToRay(mouse.position.ReadValue());
            bool hitGround = Physics.Raycast(ray, out RaycastHit hit, 500f, groundMask, QueryTriggerInteraction.Ignore);
            bool valid = hitGround && IsPlacementValid(hit.point, _ghostYaw);

            if (hitGround)
            {
                _ghost.SetActive(true);
                _ghost.transform.position = Snap(hit.point);
                _ghost.transform.rotation = Quaternion.Euler(0f, _ghostYaw, 0f);
                SetGhostMaterial(valid ? _validMaterial : _invalidMaterial);
            }
            else
            {
                _ghost.SetActive(false);
                valid = false;
            }

            if (mouse.leftButton.wasPressedThisFrame && valid && !UiInputGuard.PointerOverUi)
            {
                PlaceSolar(hit.point, _ghostYaw);
            }

            if (mouse.rightButton.wasPressedThisFrame)
            {
                CancelPlacement();
            }
        }

        public void BeginSolarPlacement()
        {
            _placing = true;
            _ghostYaw = 0f;
            if (_ghost == null)
            {
                _ghost = CreateSolarVisual("SolarArrayGhost", isGhost: true);
            }

            _ghost.SetActive(true);
            Debug.Log("[MegawattValley] Build mode: Solar Array. LMB place, R rotate, Esc/RMB cancel, X demolish.");
        }

        public void CancelPlacement()
        {
            _placing = false;
            if (_ghost != null)
            {
                _ghost.SetActive(false);
            }
        }

        private void PlaceSolar(Vector3 point, float yaw)
        {
            if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(solarCost))
            {
                Debug.LogWarning("[MegawattValley] Not enough cash to place solar array.");
                return;
            }

            var placed = CreateSolarVisual("SolarArray", isGhost: false);
            placed.transform.position = Snap(point);
            placed.transform.rotation = Quaternion.Euler(0f, yaw, 0f);
            var unit = placed.AddComponent<SolarArrayUnit>();
            unit.SetNameplate(solarNameplateMw);
            placed.AddComponent<EquipmentCondition>();

            Debug.Log($"[MegawattValley] Placed solar array for ${solarCost:0}.");
            CancelPlacement();
        }

        private void TryDemolishUnderCursor()
        {
            var mouse = Mouse.current;
            if (mouse == null || UiInputGuard.PointerOverUi)
            {
                return;
            }

            Ray ray = worldCamera.ScreenPointToRay(mouse.position.ReadValue());
            if (!Physics.Raycast(ray, out RaycastHit hit, 500f))
            {
                return;
            }

            Demolish(hit.collider.GetComponentInParent<SolarArrayUnit>());
        }

        /// <summary>Demolishes whatever the player currently has selected, for the HUD button.</summary>
        public void DemolishSelected()
        {
            var selected = EquipmentCondition.Selected;
            if (selected != null)
            {
                Demolish(selected.GetComponent<SolarArrayUnit>());
            }
        }

        private void Demolish(SolarArrayUnit unit)
        {
            if (unit == null)
            {
                return;
            }

            if (EquipmentCondition.Selected != null && EquipmentCondition.Selected.gameObject == unit.gameObject)
            {
                EquipmentCondition.ClearSelection();
            }

            float refund = solarCost * demolishRefundFraction;
            if (PlayerEconomy.Instance != null)
            {
                PlayerEconomy.Instance.Add(refund);
            }

            Debug.Log($"[MegawattValley] Demolished solar array. Refunded ${refund:0}.");
            Object.Destroy(unit.gameObject);
        }

        private bool IsPlacementValid(Vector3 point, float yaw)
        {
            Vector3 center = Snap(point) + Vector3.up * (solarFootprint.y * 0.5f);
            Quaternion rotation = Quaternion.Euler(0f, yaw, 0f);
            var hits = Physics.OverlapBox(center, solarFootprint * 0.45f, rotation, ~0, QueryTriggerInteraction.Ignore);
            foreach (var col in hits)
            {
                if (col == null)
                {
                    continue;
                }

                if (col.GetComponentInParent<SelectablePlot>() != null)
                {
                    // Allow placement on the plot surface itself.
                    continue;
                }

                // Ignore the infinite ground plane collider only by name convention.
                if (col.gameObject.name.Contains("Ground"))
                {
                    continue;
                }

                // Any other solid thing here — existing array, building, staff, signage — blocks the footprint.
                return false;
            }

            var plot = SelectablePlot.Current != null ? SelectablePlot.Current : _buildablePlot;
            if (plot == null)
            {
                // Still allow placement in early prototype if the scene has no plot at all.
                return true;
            }

            var plotCollider = plot.GetComponent<Collider>();
            if (plotCollider != null && !plotCollider.bounds.Contains(Snap(point)))
            {
                return false;
            }

            return true;
        }

        private Vector3 Snap(Vector3 point)
        {
            return new Vector3(Mathf.Round(point.x * 2f) / 2f, 0f, Mathf.Round(point.z * 2f) / 2f);
        }

        private GameObject CreateSolarVisual(string objectName, bool isGhost)
        {
            var root = new GameObject(objectName);
            var body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.name = "PanelTable";
            body.transform.SetParent(root.transform, false);
            body.transform.localScale = solarFootprint;
            body.transform.localPosition = new Vector3(0f, solarFootprint.y * 0.5f, 0f);
            Object.Destroy(body.GetComponent<Collider>());

            var meshRenderer = body.GetComponent<MeshRenderer>();
            if (meshRenderer != null)
            {
                meshRenderer.sharedMaterial = isGhost
                    ? _validMaterial
                    : GroundClickMarker.CreateColorMaterial(new Color(0.15f, 0.35f, 0.7f));
            }

            if (!isGhost)
            {
                var col = root.AddComponent<BoxCollider>();
                col.center = new Vector3(0f, solarFootprint.y * 0.5f, 0f);
                col.size = solarFootprint;
            }

            return root;
        }

        private void SetGhostMaterial(Material material)
        {
            var renderers = _ghost.GetComponentsInChildren<MeshRenderer>();
            foreach (var r in renderers)
            {
                r.sharedMaterial = material;
            }
        }
    }
}
