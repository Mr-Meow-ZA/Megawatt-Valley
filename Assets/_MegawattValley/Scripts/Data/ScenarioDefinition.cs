using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// Starting conditions and win condition for one scenario (S6-04 / L1-02).
    /// Starting cash and export tariff live here so ChatGPT / Rapha can propose numbers
    /// without a code change.
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

        public string ScenarioName => scenarioName;
        public string ObjectiveSummary => objectiveSummary;
        public float StartingCash => startingCash;
        public float ExportTariffPerMwPerSecond => exportTariffPerMwPerSecond;
        public float TargetInstalledMegawatts => targetInstalledMegawatts;
    }
}
