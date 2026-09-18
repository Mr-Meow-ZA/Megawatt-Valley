using MegawattValley.Data;
using MegawattValley.Persistence;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MegawattValley.Core
{
    /// <summary>
    /// Star-tier scenario clear (L1-05 / L1-07): 1★ MW, 2★ repairs, 3★ revenue; fail on deadline without 1★.
    /// </summary>
    public sealed class ScenarioObjective : MonoBehaviour
    {
        [SerializeField] private ScenarioDefinition scenario;
        [SerializeField] private float fallbackTargetMegawatts = 0.75f;
        [SerializeField] private int fallbackFailAfterDay = 10;
        [SerializeField] private int fallbackRepairsForTwoStars = 1;
        [SerializeField] private float fallbackRevenueForThreeStars = 350f;

        [SerializeField] private bool oneStar;
        [SerializeField] private bool twoStar;
        [SerializeField] private bool threeStar;
        [SerializeField] private bool failed;
        [SerializeField] private int repairsCompleted;

        public static ScenarioObjective Instance { get; private set; }

        public ScenarioDefinition Scenario => scenario;

        /// <summary>Legacy alias: 1★ MW target met.</summary>
        public bool IsComplete => oneStar;
        public bool IsFailed => failed;
        public bool HasOneStar => oneStar;
        public bool HasTwoStar => twoStar;
        public bool HasThreeStar => threeStar;
        public bool IsTerminal => failed || threeStar;
        public int StarCount => (oneStar ? 1 : 0) + (twoStar ? 1 : 0) + (threeStar ? 1 : 0);
        public int RepairsCompleted => repairsCompleted;

        public float TargetInstalledMegawatts => scenario != null
            ? scenario.TargetInstalledMegawatts
            : fallbackTargetMegawatts;

        public int FailAfterDay => scenario != null
            ? scenario.FailAfterDay
            : fallbackFailAfterDay;

        public int RepairsForTwoStars => scenario != null
            ? scenario.RepairsForTwoStars
            : fallbackRepairsForTwoStars;

        public float LifetimeRevenueForThreeStars => scenario != null
            ? scenario.LifetimeRevenueForThreeStars
            : fallbackRevenueForThreeStars;

        public string Description => scenario != null
            ? scenario.ObjectiveSummary
            : "Build solar capacity";

        public string StarsLabel
        {
            get
            {
                char a = oneStar ? '★' : '☆';
                char b = twoStar ? '★' : '☆';
                char c = threeStar ? '★' : '☆';
                return $"{a}{b}{c}";
            }
        }

        public string NextGoalText
        {
            get
            {
                if (failed)
                {
                    return "Deadline missed — restart to try again";
                }

                if (threeStar)
                {
                    return "3★ clear — Sunny Slope mastered";
                }

                if (!oneStar)
                {
                    return Description;
                }

                if (!twoStar)
                {
                    return scenario != null ? scenario.TwoStarSummary : "Repair a faulted array";
                }

                return scenario != null ? scenario.ThreeStarSummary : "Earn export revenue";
            }
        }

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

        public void SetCompleted(bool value)
        {
            oneStar = value;
            if (oneStar)
            {
                failed = false;
                SelectablePlot.UnlockAllExpansionPlots();
            }
        }

        public void SetStars(bool one, bool two, bool three)
        {
            oneStar = one;
            twoStar = two;
            threeStar = three;
            if (oneStar)
            {
                SelectablePlot.UnlockAllExpansionPlots();
            }
        }

        public void SetRepairsCompleted(int count)
        {
            repairsCompleted = Mathf.Max(0, count);
        }

        public void SetFailed(bool value)
        {
            failed = value;
        }

        public void NotifyRepairCompleted()
        {
            repairsCompleted++;
            EvaluateStars();
        }

        public void RestartScenario()
        {
            SaveGameService.Instance?.DeleteSave();
            var scene = SceneManager.GetActiveScene();
            if (scene.buildIndex >= 0)
            {
                SceneManager.LoadScene(scene.buildIndex);
            }
            else
            {
                SceneManager.LoadScene(scene.name);
            }
        }

        private void Update()
        {
            if (failed)
            {
                return;
            }

            EvaluateStars();

            if (threeStar)
            {
                return;
            }

            int day = DayNightSun.Instance != null ? DayNightSun.Instance.DayNumber : 1;
            if (!oneStar && day >= FailAfterDay)
            {
                failed = true;
                SimulationClock.Instance?.SetSpeedIndex(0);
                Debug.Log($"[MegawattValley] SCENARIO FAILED: day {day} without 1★ ({TargetInstalledMegawatts:0.00} MW).");
            }
        }

        private void EvaluateStars()
        {
            if (!oneStar && PowerBoard.InstalledMegawatts >= TargetInstalledMegawatts)
            {
                oneStar = true;
                SelectablePlot.UnlockAllExpansionPlots();
                Debug.Log($"[MegawattValley] 1★ CLEAR: {TargetInstalledMegawatts:0.00} MW installed. Site B unlocked.");
            }

            if (oneStar && !twoStar && repairsCompleted >= RepairsForTwoStars)
            {
                twoStar = true;
                Debug.Log($"[MegawattValley] 2★ CLEAR: {repairsCompleted} repair(s) completed.");
            }

            float revenue = PlayerEconomy.Instance != null ? PlayerEconomy.Instance.LifetimeRevenue : 0f;
            if (twoStar && !threeStar && revenue >= LifetimeRevenueForThreeStars)
            {
                threeStar = true;
                SimulationClock.Instance?.SetSpeedIndex(0);
                Debug.Log($"[MegawattValley] 3★ CLEAR: ${revenue:0} lifetime export revenue.");
            }
        }
    }
}
