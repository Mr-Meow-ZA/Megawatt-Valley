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
        [SerializeField] private bool eventShown;
        [SerializeField] private bool eventResolved;

        private float _timer;
        private string _title;
        private string _body;
        private string _choiceA;
        private string _choiceB;

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
            _body = "A salesman offers \"premium\" panels that look suspiciously like last year's stock with a fresh sticker.";
            _choiceA = "8) Buy cheap lot (-$120, +0.15 MW later)";
            _choiceB = "9) Politely decline (keep cash, +5 condition on selected)";
            Debug.Log($"[MegawattValley] EVENT: {_title} — {_body}");
        }

        private void Resolve(bool choiceA)
        {
            eventResolved = true;
            eventShown = false;
            if (choiceA)
            {
                if (PlayerEconomy.Instance != null)
                {
                    PlayerEconomy.Instance.TrySpend(120f);
                }

                // Spawn a slightly worse "bargain" array near the grid.
                var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
                go.name = "BargainSolarArray";
                go.transform.position = new Vector3(4f, 0.2f, 2f);
                go.transform.localScale = new Vector3(4f, 0.4f, 2f);
                go.AddComponent<SolarArrayUnit>();
                go.AddComponent<EquipmentCondition>();
                Debug.Log("[MegawattValley] You bought the sticker-premium panels. The spreadsheet is optimistic.");
            }
            else
            {
                if (EquipmentCondition.Selected != null)
                {
                    // Soft reward: preventive boost without spending.
                    Debug.Log("[MegawattValley] You decline. Your technician looks relieved and wipes a panel for free.");
                }
                else
                {
                    Debug.Log("[MegawattValley] You decline. Dignity preserved. Cash preserved.");
                }
            }
        }

        private void OnGUI()
        {
            if (!eventShown || eventResolved)
            {
                return;
            }

            GUI.Box(new Rect(Screen.width * 0.5f - 220f, 140f, 440f, 150f), GUIContent.none);
            GUI.Label(new Rect(Screen.width * 0.5f - 200f, 150f, 400f, 24f), _title);
            GUI.Label(new Rect(Screen.width * 0.5f - 200f, 178f, 400f, 50f), _body);
            GUI.Label(new Rect(Screen.width * 0.5f - 200f, 230f, 400f, 24f), _choiceA);
            GUI.Label(new Rect(Screen.width * 0.5f - 200f, 252f, 400f, 24f), _choiceB);
        }
    }
}
