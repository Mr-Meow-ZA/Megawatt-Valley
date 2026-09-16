using UnityEngine;

namespace MegawattValley.Data
{
    /// <summary>
    /// Starting conditions and win condition for one scenario (S6-04).
    /// </summary>
    [CreateAssetMenu(menuName = "Megawatt Valley/Scenario Definition", fileName = "Scenario_New")]
    public sealed class ScenarioDefinition : ScriptableObject
    {
        [SerializeField] private string scenarioName = "Prototype Valley";
        [SerializeField] private string objectiveSummary = "Build solar capacity";
        [SerializeField] private float startingCash = 1000f;
        [SerializeField] private float targetInstalledMegawatts = 0.75f;

        public string ScenarioName => scenarioName;
        public string ObjectiveSummary => objectiveSummary;
        public float StartingCash => startingCash;
        public float TargetInstalledMegawatts => targetInstalledMegawatts;
    }
}
