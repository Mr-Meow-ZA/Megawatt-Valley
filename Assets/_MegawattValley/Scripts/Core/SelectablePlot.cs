using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Selectable test plot with clear selected / unselected materials (S2-02).
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public sealed class SelectablePlot : MonoBehaviour
    {
        [SerializeField] private MeshRenderer targetRenderer;
        [SerializeField] private Color normalColor = new Color(0.35f, 0.55f, 0.35f);
        [SerializeField] private Color selectedColor = new Color(0.25f, 0.85f, 0.45f);

        private Material _normalMaterial;
        private Material _selectedMaterial;
        private bool _selected;

        public static SelectablePlot Current { get; private set; }

        private void Awake()
        {
            if (targetRenderer == null)
            {
                targetRenderer = GetComponentInChildren<MeshRenderer>();
            }

            _normalMaterial = GroundClickMarker.CreateColorMaterial(normalColor);
            _selectedMaterial = GroundClickMarker.CreateColorMaterial(selectedColor);
            ApplyVisual();
        }

        private void Update()
        {
            var mouse = Mouse.current;
            var cam = UnityEngine.Camera.main;
            if (mouse == null || cam == null || !mouse.leftButton.wasPressedThisFrame)
            {
                return;
            }

            if (BuildModeController.Instance != null && BuildModeController.Instance.IsPlacing)
            {
                return;
            }

            Ray ray = cam.ScreenPointToRay(mouse.position.ReadValue());
            if (Physics.Raycast(ray, out RaycastHit hit, 500f) && hit.collider != null)
            {
                var plot = hit.collider.GetComponentInParent<SelectablePlot>();
                if (plot == this)
                {
                    Select();
                }
            }
        }

        public void Select()
        {
            if (Current != null && Current != this)
            {
                Current.Deselect();
            }

            Current = this;
            _selected = true;
            ApplyVisual();
            Debug.Log($"[MegawattValley] Selected plot: {name}");
        }

        public void Deselect()
        {
            _selected = false;
            if (Current == this)
            {
                Current = null;
            }

            ApplyVisual();
        }

        private void ApplyVisual()
        {
            if (targetRenderer != null)
            {
                targetRenderer.sharedMaterial = _selected ? _selectedMaterial : _normalMaterial;
            }
        }
    }
}
