using MegawattValley.Construction;
using MegawattValley.Data;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Runs one humorous decision event from data (S5-01, data-driven in S6-04).
    /// </summary>
    public sealed class HumorousEventController : MonoBehaviour
    {
        [SerializeField] private DecisionEventDefinition eventDefinition;
        [SerializeField] private float fallbackTriggerSeconds = 25f;
        [SerializeField] private bool eventShown;
        [SerializeField] private bool eventResolved;

        private float _timer;

        public static HumorousEventController Instance { get; private set; }

        public bool IsPending => eventShown && !eventResolved && eventDefinition != null;
        public string Title => eventDefinition != null ? eventDefinition.Title : string.Empty;
        public string Body => eventDefinition != null ? eventDefinition.Body : string.Empty;
        public string ChoiceALabel => eventDefinition != null ? eventDefinition.ChoiceA.ResolvedLabel : string.Empty;
        public string ChoiceBLabel => eventDefinition != null ? eventDefinition.ChoiceB.ResolvedLabel : string.Empty;
        public bool CanAffordChoiceA => CanAfford(eventDefinition != null ? eventDefinition.ChoiceA : null);
        public bool CanAffordChoiceB => CanAfford(eventDefinition != null ? eventDefinition.ChoiceB : null);

        private float TriggerSeconds => eventDefinition != null
            ? eventDefinition.TriggerAfterSeconds
            : fallbackTriggerSeconds;

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
            if (IsPending)
            {
                Resolve(choiceA);
            }
        }

        private void Update()
        {
            if (eventResolved || eventDefinition == null)
            {
                return;
            }

            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            _timer += dt;

            if (!eventShown && _timer >= TriggerSeconds)
            {
                eventShown = true;
                Debug.Log($"[MegawattValley] EVENT: {Title} — {Body}");
            }

            var keyboard = Keyboard.current;
            if (!eventShown || keyboard == null)
            {
                return;
            }

            if (keyboard.digit8Key.wasPressedThisFrame)
            {
                Resolve(choiceA: true);
            }

            if (keyboard.digit9Key.wasPressedThisFrame)
            {
                Resolve(choiceA: false);
            }
        }

        private void Resolve(bool choiceA)
        {
            var choice = choiceA ? eventDefinition.ChoiceA : eventDefinition.ChoiceB;

            // An unaffordable choice leaves the decision open rather than silently doing nothing.
            if (choice.CashCost > 0f && PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(choice.CashCost))
            {
                Debug.LogWarning($"[MegawattValley] Cannot afford that choice (${choice.CashCost:0}).");
                return;
            }

            eventResolved = true;
            eventShown = false;

            if (choice.ConditionBonusToAllEquipment > 0f)
            {
                foreach (var equipment in MaintenanceBoard.All)
                {
                    equipment.ApplyServiceBonus(choice.ConditionBonusToAllEquipment);
                }
            }

            if (choice.SpawnsArray != null)
            {
                SolarArrayFactory.CreateArray(choice.SpawnsArray, choice.SpawnPosition, 0f);
            }

            Debug.Log($"[MegawattValley] {choice.ResultLog}");
        }

        private static bool CanAfford(DecisionChoice choice)
        {
            if (choice == null || choice.CashCost <= 0f || PlayerEconomy.Instance == null)
            {
                return true;
            }

            return PlayerEconomy.Instance.CanAfford(choice.CashCost);
        }
    }
}
