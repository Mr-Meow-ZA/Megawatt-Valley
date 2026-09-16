using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// One humorous decision event with two meaningful choices (S5-01).
    /// </summary>
    public sealed class HumorousEventController : MonoBehaviour
    {
        [SerializeField] private float firstTriggerSeconds = 25f;
        [SerializeField] private float bargainCost = 120f;
        [SerializeField] private float bargainNameplateMw = 0.15f;
        [SerializeField] private float declineConditionBonus = 8f;
        [SerializeField] private bool eventShown;
        [SerializeField] private bool eventResolved;

        private float _timer;
        private string _title;
        private string _body;
        private string _choiceA;
        private string _choiceB;

        public static HumorousEventController Instance { get; private set; }

        public bool IsPending => eventShown && !eventResolved;
        public string Title => _title;
        public string Body => _body;
        public string ChoiceALabel => _choiceA;
        public string ChoiceBLabel => _choiceB;

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

        public void Choose(bool choiceA)
        {
            if (!IsPending)
            {
                return;
            }

            Resolve(choiceA);
        }

        private void Update()
        {
            if (eventResolved)
            {
                return;
            }

            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            _timer += dt;

            if (!eventShown && _timer >= firstTriggerSeconds)
            {
                ShowEvent();
            }

            var keyboard = Keyboard.current;
            if (!eventShown || keyboard == null)
            {
                return;
            }

            if (keyboard.digit8Key.wasPressedThisFrame) Resolve(choiceA: true);
            if (keyboard.digit9Key.wasPressedThisFrame) Resolve(choiceA: false);
        }

        private void ShowEvent()
        {
            eventShown = true;
            _title = "Supplier Soft Pitch";
            _body = "A salesman offers \"premium\" panels that look suspiciously like last year's stock with a fresh sticker. " +
                    "He is already unloading them.";
            _choiceA = $"Buy the bargain lot\n-${bargainCost:0} for {bargainNameplateMw:0.00} MW";
            _choiceB = $"Politely decline\nFree panel wipe, +{declineConditionBonus:0} condition";
            Debug.Log($"[MegawattValley] EVENT: {_title} — {_body}");
        }

        private void Resolve(bool choiceA)
        {
            eventResolved = true;
            eventShown = false;
            if (choiceA)
            {
                if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(bargainCost))
                {
                    Debug.Log("[MegawattValley] The cheque bounces. The salesman leaves with his panels and your dignity.");
                    return;
                }

                SpawnBargainArray();
                Debug.Log("[MegawattValley] You bought the sticker-premium panels. The spreadsheet is optimistic.");
                return;
            }

            var equipment = MaintenanceBoard.All;
            foreach (var item in equipment)
            {
                item.ApplyServiceBonus(declineConditionBonus);
            }

            Debug.Log($"[MegawattValley] You decline. The technician wipes down {equipment.Count} array(s) out of relief.");
        }

        /// <summary>
        /// The bargain lot is cheap capacity with a worse nameplate than a normal build.
        /// </summary>
        private void SpawnBargainArray()
        {
            var footprint = new Vector3(4f, 0.4f, 2f);

            var root = new GameObject("BargainSolarArray");
            root.transform.position = new Vector3(4f, 0f, 2f);

            var body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.name = "PanelTable";
            body.transform.SetParent(root.transform, false);
            body.transform.localScale = footprint;
            body.transform.localPosition = new Vector3(0f, footprint.y * 0.5f, 0f);
            Destroy(body.GetComponent<Collider>());

            var renderer = body.GetComponent<MeshRenderer>();
            if (renderer != null)
            {
                renderer.sharedMaterial = GroundClickMarker.CreateColorMaterial(new Color(0.3f, 0.3f, 0.42f));
            }

            var collider = root.AddComponent<BoxCollider>();
            collider.center = new Vector3(0f, footprint.y * 0.5f, 0f);
            collider.size = footprint;

            var unit = root.AddComponent<SolarArrayUnit>();
            unit.SetNameplate(bargainNameplateMw);
            root.AddComponent<EquipmentCondition>();
        }
    }
}
