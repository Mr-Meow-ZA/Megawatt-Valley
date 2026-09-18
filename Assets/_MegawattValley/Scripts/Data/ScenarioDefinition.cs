using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// Starting conditions and star goals for one scenario (S6-04 / L1-02 / L1-05 / L1-07).
    /// </summary>
    [CreateAssetMenu(menuName = "Megawatt Valley/Scenario Definition", fileName = "Scenario_New")]
    public sealed class ScenarioDefinition : ScriptableObject
    {
        [SerializeField] private string scenarioName = "Prototype Valley";
        [SerializeField] private string objectiveSummary = "Build solar capacity";
        [SerializeField] private float startingCash = 1000f;
        [Tooltip("Cash earned per megawatt of export, per simulation second.")]
        [SerializeField] private float exportTariffPerMwPerSecond = 8f;
        [SerializeField] private float targetInstalledMegawatts = 0.75f;
        [Tooltip("Fail the run if this calendar day is reached without the 1★ MW target.")]
        [SerializeField] private int failAfterDay = 10;
        [SerializeField] private int repairsForTwoStars = 1;
        [SerializeField] private float lifetimeRevenueForThreeStars = 350f;
        [SerializeField] private string twoStarSummary = "Repair at least one faulted array";
        [SerializeField] private string threeStarSummary = "Earn $350 from export revenue";

        public string ScenarioName => scenarioName;
        public string ObjectiveSummary => objectiveSummary;
        public float StartingCash => startingCash;
        public float ExportTariffPerMwPerSecond => exportTariffPerMwPerSecond;
        public float TargetInstalledMegawatts => targetInstalledMegawatts;
        public int FailAfterDay => Mathf.Max(1, failAfterDay);
        public int RepairsForTwoStars => Mathf.Max(1, repairsForTwoStars);
        public float LifetimeRevenueForThreeStars => Mathf.Max(0f, lifetimeRevenueForThreeStars);
        public string TwoStarSummary => string.IsNullOrEmpty(twoStarSummary)
            ? "Repair equipment"
            : twoStarSummary;
        public string ThreeStarSummary => string.IsNullOrEmpty(threeStarSummary)
            ? "Earn export revenue"
            : threeStarSummary;
    }
}
