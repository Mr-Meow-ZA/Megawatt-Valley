using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// Everything that makes one buildable solar product different from another (S6-04).
    /// Gameplay code reads these values instead of hard-coding balance numbers.
    /// </summary>
    [CreateAssetMenu(menuName = "Megawatt Valley/Solar Array Definition", fileName = "Solar_NewArray")]
    public sealed class SolarArrayDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string displayName = "Solar Array";
        [SerializeField] private string blurb = "Standard fixed-tilt table.";

        [Header("Economy")]
        [SerializeField] private float buildCost = 250f;
        [SerializeField] private float revenuePerMwPerSecond = 8f;
        [SerializeField, Range(0f, 1f)] private float demolishRefundFraction = 0.5f;

        [Header("Generation")]
        [SerializeField] private float nameplateMegawatts = 0.25f;

        [Header("Presentation")]
        [SerializeField] private Vector3 footprint = new Vector3(4f, 0.4f, 2f);
        [SerializeField] private Color bodyColor = new Color(0.15f, 0.35f, 0.7f);

        [Header("Maintenance")]
        [Tooltip("Condition lost per simulated second while the array is generating.")]
        [SerializeField] private float wearPerSecond = 0.1f;
        [SerializeField] private float faultChancePerSecondAtLowCondition = 0.06f;
        [SerializeField] private float repairCost = 80f;
        [SerializeField] private float preventiveCost = 35f;
        [SerializeField] private float repairSeconds = 2.5f;

        public string DisplayName => displayName;
        public string Blurb => blurb;
        public float BuildCost => buildCost;
        public float RevenuePerMwPerSecond => revenuePerMwPerSecond;
        public float DemolishRefundFraction => demolishRefundFraction;
        public float NameplateMegawatts => nameplateMegawatts;
        public Vector3 Footprint => footprint;
        public Color BodyColor => bodyColor;
        public float WearPerSecond => wearPerSecond;
        public float FaultChancePerSecondAtLowCondition => faultChancePerSecondAtLowCondition;
        public float RepairCost => repairCost;
        public float PreventiveCost => preventiveCost;
        public float RepairSeconds => repairSeconds;
    }
}
