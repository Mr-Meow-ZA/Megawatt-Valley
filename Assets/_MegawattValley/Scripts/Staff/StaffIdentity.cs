using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Named staff with one gameplay trait, clickable for a details panel (S5-02).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class StaffIdentity : MonoBehaviour
    {
        public enum Trait
        {
            SpeedyBoots,
            CarefulHands,
            BargainHunter
        }

        [SerializeField] private string staffName = "Jordan Watts";
        [SerializeField] private string role = "Technician";
        [SerializeField] private Trait trait = Trait.SpeedyBoots;
        [SerializeField] private bool showNameTag = true;

        private TechnicianActor _technician;
        private TextMesh _nameTag;

        public string StaffName => staffName;
        public string Role => role;
        public Trait ActiveTrait => trait;

        public static StaffIdentity Selected { get; private set; }

        public string TraitDescription
        {
            get
            {
                switch (trait)
                {
                    case Trait.SpeedyBoots:
                        return "Speedy Boots — walks to callouts 45% faster.";
                    case Trait.CarefulHands:
                        return "Careful Hands — repairs restore more condition.";
                    case Trait.BargainHunter:
                        return "Bargain Hunter — cheaper parts on repairs.";
                    default:
                        return "No trait.";
                }
            }
        }

        public static void ClearSelection()
        {
            Selected = null;
        }

        private void Awake()
        {
            _technician = GetComponent<TechnicianActor>();

            if (showNameTag)
            {
                var tagGo = new GameObject("NameTag");
                tagGo.transform.SetParent(transform, false);
                tagGo.transform.localPosition = new Vector3(0f, 1.6f, 0f);
                tagGo.transform.localScale = new Vector3(0.6f, 0.35f, 0.6f);
                _nameTag = tagGo.AddComponent<TextMesh>();
                _nameTag.text = staffName;
                _nameTag.fontSize = 48;
                _nameTag.characterSize = 0.14f;
                _nameTag.anchor = TextAnchor.MiddleCenter;
                _nameTag.alignment = TextAlignment.Center;
                _nameTag.color = Color.white;
            }

            Debug.Log($"[MegawattValley] Staff on site: {staffName} ({role}) — trait: {trait}");
        }

        private void Update()
        {
            HandleSelectionInput();
            FaceNameTagToCamera();
        }

        private void HandleSelectionInput()
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
            if (!Physics.Raycast(ray, out RaycastHit hit, 500f))
            {
                return;
            }

            if (hit.collider.GetComponentInParent<StaffIdentity>() != this)
            {
                return;
            }

            Selected = this;
            EquipmentCondition.ClearSelection();
            Debug.Log($"[MegawattValley] Selected staff {staffName} ({role}).");
        }

        private void FaceNameTagToCamera()
        {
            var cam = UnityEngine.Camera.main;
            if (cam == null || _nameTag == null)
            {
                return;
            }

            _nameTag.transform.rotation = Quaternion.LookRotation(_nameTag.transform.position - cam.transform.position);
        }

        public TechnicianActor Technician => _technician;
    }
}
