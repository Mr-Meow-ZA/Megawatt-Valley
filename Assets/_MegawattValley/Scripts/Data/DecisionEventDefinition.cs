using System;
using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// One choice on a decision event. Labels support {cost} and {mw} tokens so the text
    /// cannot drift away from the numbers the choice actually applies.
    /// </summary>
    [Serializable]
    public sealed class DecisionChoice
    {
        [SerializeField] private string label = "Do the thing";
        [SerializeField] private float cashCost;
        [SerializeField] private float conditionBonusToAllEquipment;
        [SerializeField] private SolarArrayDefinition spawnsArray;
        [SerializeField] private Vector3 spawnPosition = new Vector3(4f, 0f, 2f);
        [SerializeField] private string resultLog = "Done.";

        public float CashCost => cashCost;
        public float ConditionBonusToAllEquipment => conditionBonusToAllEquipment;
        public SolarArrayDefinition SpawnsArray => spawnsArray;
        public Vector3 SpawnPosition => spawnPosition;
        public string ResultLog => resultLog;

        public string ResolvedLabel
        {
            get
            {
                string text = label ?? string.Empty;
                text = text.Replace("{cost}", $"{cashCost:0}");
                text = text.Replace("{mw}", spawnsArray != null ? $"{spawnsArray.NameplateMegawatts:0.00}" : "0.00");
                text = text.Replace("{condition}", $"{conditionBonusToAllEquipment:0}");
                return text;
            }
        }
    }

    /// <summary>
    /// A humorous decision event with two meaningful choices (S5-01, data-driven in S6-04).
    /// </summary>
    [CreateAssetMenu(menuName = "Megawatt Valley/Decision Event", fileName = "Event_New")]
    public sealed class DecisionEventDefinition : ScriptableObject
    {
        [SerializeField] private string title = "Something Happens";
        [SerializeField, TextArea(2, 5)] private string body = "A thing occurs on site.";
        [SerializeField] private float triggerAfterSeconds = 25f;
        [SerializeField] private DecisionChoice choiceA = new DecisionChoice();
        [SerializeField] private DecisionChoice choiceB = new DecisionChoice();

        public string Title => title;
        public string Body => body;
        public float TriggerAfterSeconds => triggerAfterSeconds;
        public DecisionChoice ChoiceA => choiceA;
        public DecisionChoice ChoiceB => choiceB;
    }
}
