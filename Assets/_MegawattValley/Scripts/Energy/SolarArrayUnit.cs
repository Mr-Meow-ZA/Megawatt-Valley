using System.Collections.Generic;
using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tracks live generation from placed solar arrays (S3-02).
    /// </summary>
    public static class PowerBoard
    {
        private static readonly List<SolarArrayUnit> Units = new List<SolarArrayUnit>();

        /// <summary>Power actually being exported right now.</summary>
        public static float TotalMegawatts
        {
            get
            {
                Prune();
                float sum = 0f;
                foreach (var unit in Units)
                {
                    sum += unit.CurrentMegawatts;
                }

                return sum;
            }
        }

        /// <summary>Nameplate capacity built, regardless of sun or condition.</summary>
        public static float InstalledMegawatts
        {
            get
            {
                Prune();
                float sum = 0f;
                foreach (var unit in Units)
                {
                    sum += unit.NameplateMegawatts;
                }

                return sum;
            }
        }

        public static float TotalRevenuePerSecond
        {
            get
            {
                Prune();
                float sum = 0f;
                foreach (var unit in Units)
                {
                    sum += unit.RevenuePerSecond;
                }

                return sum;
            }
        }

        /// <summary>Arrays built outside grid export range — they earn nothing.</summary>
        public static int DisconnectedCount
        {
            get
            {
                Prune();
                int count = 0;
                foreach (var unit in Units)
                {
                    if (!unit.IsConnectedToGrid)
                    {
                        count++;
                    }
                }

                return count;
            }
        }

        public static void Register(SolarArrayUnit unit)
        {
            if (unit != null && !Units.Contains(unit))
            {
                Units.Add(unit);
            }
        }

        public static void Unregister(SolarArrayUnit unit)
        {
            Units.Remove(unit);
        }

        private static void Prune()
        {
            for (int i = Units.Count - 1; i >= 0; i--)
            {
                if (Units[i] == null)
                {
                    Units.RemoveAt(i);
                }
            }
        }
    }

    /// <summary>
    /// One placed solar array with generation + grid connection + revenue (S3-02..S3-04).
    /// Balance values come from a <see cref="SolarArrayDefinition"/> when one is assigned.
    /// </summary>
    public sealed class SolarArrayUnit : MonoBehaviour
    {
        [SerializeField] private SolarArrayDefinition definition;

        [Header("Fallbacks used when no definition is assigned")]
        [SerializeField] private float nameplateMw = 0.25f;
        [SerializeField] private float revenuePerMwPerSecond = 8f;

        [SerializeField] private bool connectedToGrid = true;
        [SerializeField] private float outputMultiplier = 1f;

        public SolarArrayDefinition Definition => definition;
        public float NameplateMegawatts => definition != null ? definition.NameplateMegawatts : nameplateMw;
        public float RevenuePerMwPerSecond => definition != null ? definition.RevenuePerMwPerSecond : revenuePerMwPerSecond;
        public bool IsConnectedToGrid => connectedToGrid;

        public float CurrentMegawatts =>
            SolarMath.Megawatts(NameplateMegawatts, DayNightSun.SolarFactor, outputMultiplier, connectedToGrid);

        public float RevenuePerSecond => SolarMath.RevenuePerSecond(CurrentMegawatts, RevenuePerMwPerSecond);

        public void Configure(SolarArrayDefinition arrayDefinition)
        {
            definition = arrayDefinition;
        }

        public void SetOutputMultiplier(float multiplier)
        {
            outputMultiplier = Mathf.Clamp01(multiplier);
        }

        private void OnEnable()
        {
            RefreshGridConnection();
            PowerBoard.Register(this);
        }

        private void OnDisable()
        {
            PowerBoard.Unregister(this);
        }

        private void Update()
        {
            RefreshGridConnection();

            if (PlayerEconomy.Instance == null)
            {
                return;
            }

            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            PlayerEconomy.Instance.Add(SolarMath.Revenue(CurrentMegawatts, RevenuePerMwPerSecond, dt));
        }

        private void RefreshGridConnection()
        {
            connectedToGrid = GridExportNode.Instance == null ||
                              GridExportNode.Instance.IsInRange(transform.position);
        }
    }
}
