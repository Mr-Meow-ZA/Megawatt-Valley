using MegawattValley.Construction;
using MegawattValley.Data;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Small deck of data-driven decision events (S5-01 / L1-04) plus one late climax (L1-06).
    /// </summary>
    public sealed class HumorousEventController : MonoBehaviour
    {
        [SerializeField] private DecisionEventDefinition[] eventDeck;
        [SerializeField] private DecisionEventDefinition climaxEvent;
        [SerializeField] private float fallbackTriggerSeconds = 25f;
        [SerializeField] private float gapBetweenEventsSeconds = 22f;

        private int _deckIndex;
        private float _timer;
        private bool _eventShown;
        private bool _armed;
        private bool _showingClimax;
        private bool _climaxDone;
        private DecisionEventDefinition _active;

        public static HumorousEventController Instance { get; private set; }

        public bool IsPending => _eventShown && _active != null;
        public string Title => _active != null ? _active.Title : string.Empty;
        public string Body => _active != null ? _active.Body : string.Empty;
        public string ChoiceALabel => _active != null ? _active.ChoiceA.ResolvedLabel : string.Empty;
        public string ChoiceBLabel => _active != null ? _active.ChoiceB.ResolvedLabel : string.Empty;
        public bool CanAffordChoiceA => CanAfford(_active != null ? _active.ChoiceA : null);
        public bool CanAffordChoiceB => CanAfford(_active != null ? _active.ChoiceB : null);

        private void Awake()
        {
            Instance = this;
            ArmCurrent();
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
            TryStartClimax();

            if (!_armed || _active == null || _eventShown)
            {
                PollHotkeys();
                return;
            }

            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            _timer += dt;

            float delay = _deckIndex == 0
                ? (_active.TriggerAfterSeconds > 0f ? _active.TriggerAfterSeconds : fallbackTriggerSeconds)
                : gapBetweenEventsSeconds;

            if (_timer >= delay)
            {
                _eventShown = true;
                Debug.Log($"[MegawattValley] EVENT: {Title} — {Body}");
            }
        }

        private void TryStartClimax()
        {
            if (_climaxDone || _showingClimax || climaxEvent == null || _eventShown)
            {
                return;
            }

            var objective = ScenarioObjective.Instance;
            if (objective != null && objective.IsTerminal)
            {
                return;
            }

            if (PowerBoard.InstalledMegawatts < 0.01f)
            {
                return;
            }

            int day = DayNightSun.Instance != null ? DayNightSun.Instance.DayNumber : 1;
            int triggerDay = objective != null ? Mathf.Max(2, objective.FailAfterDay - 2) : 6;
            if (day < triggerDay)
            {
                return;
            }

            _active = climaxEvent;
            _armed = false;
            _eventShown = true;
            _showingClimax = true;
            Debug.Log($"[MegawattValley] CLIMAX: {Title} — {Body}");
        }

        private void PollHotkeys()
        {
            if (!_eventShown)
            {
                return;
            }

            var keyboard = Keyboard.current;
            if (keyboard == null)
            {
                return;
            }

            if (keyboard.digit8Key.wasPressedThisFrame)
            {
                Resolve(true);
            }

            if (keyboard.digit9Key.wasPressedThisFrame)
            {
                Resolve(false);
            }
        }

        private void Resolve(bool choiceA)
        {
            var choice = choiceA ? _active.ChoiceA : _active.ChoiceB;
            if (choice.CashCost > 0f)
            {
                if (PlayerEconomy.Instance != null && !PlayerEconomy.Instance.TrySpend(choice.CashCost))
                {
                    Debug.LogWarning($"[MegawattValley] Cannot afford that choice (${choice.CashCost:0}).");
                    return;
                }
            }
            else if (choice.CashCost < 0f && PlayerEconomy.Instance != null)
            {
                PlayerEconomy.Instance.Add(-choice.CashCost);
            }

            _eventShown = false;
            _armed = false;

            if (choice.ConditionBonusToAllEquipment > 0f)
            {
                foreach (var equipment in MaintenanceBoard.All)
                {
                    equipment.ApplyServiceBonus(choice.ConditionBonusToAllEquipment);
                }
            }

            if (choice.ConditionPenaltyToAllEquipment > 0f || choice.ForceFaultOnAllEquipment)
            {
                foreach (var equipment in MaintenanceBoard.All)
                {
                    equipment.ApplyConditionHit(choice.ConditionPenaltyToAllEquipment, choice.ForceFaultOnAllEquipment);
                }
            }

            if (choice.SpawnsArray != null)
            {
                SolarArrayFactory.CreateArray(choice.SpawnsArray, choice.SpawnPosition, 0f);
            }

            Debug.Log($"[MegawattValley] {choice.ResultLog}");

            if (_showingClimax)
            {
                _showingClimax = false;
                _climaxDone = true;
                ArmCurrent();
                return;
            }

            _deckIndex++;
            ArmCurrent();
        }

        private void ArmCurrent()
        {
            _active = null;
            _timer = 0f;
            _eventShown = false;
            if (eventDeck == null)
            {
                return;
            }

            while (_deckIndex < eventDeck.Length)
            {
                if (eventDeck[_deckIndex] != null)
                {
                    _active = eventDeck[_deckIndex];
                    _armed = true;
                    return;
                }

                _deckIndex++;
            }
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
