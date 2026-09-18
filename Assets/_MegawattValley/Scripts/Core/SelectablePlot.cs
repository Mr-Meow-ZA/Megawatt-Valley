using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Buildable plot pad. Site A starts unlocked; Site B unlocks after 1★ (L1-08).
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public sealed class SelectablePlot : MonoBehaviour
    {
        private static readonly List<SelectablePlot> Plots = new List<SelectablePlot>();

        [SerializeField] private MeshRenderer targetRenderer;
        [SerializeField] private Color normalColor = new Color(0.35f, 0.55f, 0.35f);
        [SerializeField] private Color selectedColor = new Color(0.25f, 0.85f, 0.45f);
        [SerializeField] private Color lockedColor = new Color(0.35f, 0.32f, 0.28f);
        [SerializeField] private bool startsUnlocked = true;
        [SerializeField] private string displayName = "Site A";

        private Material _normalMaterial;
        private Material _selectedMaterial;
        private Material _lockedMaterial;
        private bool _selected;
        private bool _unlocked;

        public static SelectablePlot Current { get; private set; }

        public bool IsUnlocked => _unlocked;
        public string DisplayName => displayName;

        private void Awake()
        {
            if (!Plots.Contains(this))
            {
                Plots.Add(this);
            }

            if (targetRenderer == null)
            {
                targetRenderer = GetComponentInChildren<MeshRenderer>();
            }

            _unlocked = startsUnlocked;
            _normalMaterial = GroundClickMarker.CreateColorMaterial(normalColor);
            _selectedMaterial = GroundClickMarker.CreateColorMaterial(selectedColor);
            _lockedMaterial = GroundClickMarker.CreateColorMaterial(lockedColor);
            ApplyVisual();
        }

        private void OnDestroy()
        {
            Plots.Remove(this);
            if (Current == this)
            {
                Current = null;
            }
        }

        private void Update()
        {
            var mouse = Mouse.current;
            var cam = UnityEngine.Camera.main;
            if (mouse == null || cam == null || !mouse.leftButton.wasPressedThisFrame || UiInputGuard.PointerOverUi)
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
            if (!_unlocked)
            {
                Debug.Log($"[MegawattValley] {displayName} is locked until 1★.");
                return;
            }

            if (Current != null && Current != this)
            {
                Current.Deselect();
            }

            Current = this;
            _selected = true;
            ApplyVisual();
            Debug.Log($"[MegawattValley] Selected plot: {displayName}");
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

        public void SetUnlocked(bool unlocked)
        {
            if (_unlocked == unlocked)
            {
                return;
            }

            _unlocked = unlocked;
            if (!_unlocked && Current == this)
            {
                Deselect();
            }

            ApplyVisual();
            if (_unlocked)
            {
                Debug.Log($"[MegawattValley] Unlocked buildable plot: {displayName}");
            }
        }

        /// <summary>True when the snapped point sits on any unlocked plot collider.</summary>
        public static bool IsInsideUnlockedPlot(Vector3 worldPoint)
        {
            if (Plots.Count == 0)
            {
                return true;
            }

            foreach (var plot in Plots)
            {
                if (plot == null || !plot._unlocked)
                {
                    continue;
                }

                var col = plot.GetComponent<Collider>();
                if (col != null && col.bounds.Contains(worldPoint))
                {
                    return true;
                }
            }

            return false;
        }

        public static void UnlockAllExpansionPlots()
        {
            foreach (var plot in Plots)
            {
                if (plot != null && !plot.startsUnlocked)
                {
                    plot.SetUnlocked(true);
                }
            }
        }

        public static void RestoreUnlockState(bool expansionUnlocked)
        {
            foreach (var plot in Plots)
            {
                if (plot == null)
                {
                    continue;
                }

                plot.SetUnlocked(plot.startsUnlocked || expansionUnlocked);
            }
        }

        private void ApplyVisual()
        {
            if (targetRenderer == null)
            {
                return;
            }

            if (!_unlocked)
            {
                targetRenderer.sharedMaterial = _lockedMaterial;
                return;
            }

            targetRenderer.sharedMaterial = _selected ? _selectedMaterial : _normalMaterial;
        }
    }
}
