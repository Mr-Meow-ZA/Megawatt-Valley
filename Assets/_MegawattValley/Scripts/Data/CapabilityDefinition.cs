using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// One unlockable company capability (E1-01). Stable id is used in save data and gameplay queries.
    /// </summary>
    [CreateAssetMenu(menuName = "Megawatt Valley/Capability Definition", fileName = "Capability_New")]
    public sealed class CapabilityDefinition : ScriptableObject
    {
        [SerializeField] private string id = "capability_id";
        [SerializeField] private string displayName = "Capability";
        [SerializeField, TextArea(2, 4)] private string description = "What this unlocks for the company.";
        [SerializeField] private string lockedHint = "Locked — earn this by playing.";
        [SerializeField] private string unlockedHint = "Unlocked — your company can do this now.";

        public string Id => string.IsNullOrEmpty(id) ? name : id;
        public string DisplayName => displayName;
        public string Description => description;
        public string LockedHint => lockedHint;
        public string UnlockedHint => unlockedHint;
    }

    /// <summary>Well-known capability ids used by gameplay code.</summary>
    public static class CapabilityIds
    {
        public const string RadioDispatch = "radio_dispatch";
        public const string BasicCleaningKit = "basic_cleaning_kit";
    }
}
