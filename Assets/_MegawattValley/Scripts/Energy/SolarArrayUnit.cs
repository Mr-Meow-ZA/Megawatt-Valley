using System.Collections.Generic;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tracks live generation from placed solar arrays (S3-02).
    /// </summary>
    public static class PowerBoard
    {
        private static readonly List<SolarArrayUnit> Units = new List<SolarArrayUnit>();

        public static float TotalMegawatts
        {
            get
            {
                float sum = 0f;
                for (int i = Units.Count - 1; i >= 0; i--)
                {
                    if (Units[i] == null)
                    {
                        Units.RemoveAt(i);
                        continue;
                    }

                    sum += Units[i].CurrentMegawatts;
                }

                return sum;
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
    }

    /// <summary>
    /// One placed solar array with generation + grid connection + revenue (S3-02..S3-04).
    /// </summary>
    public sealed class SolarArrayUnit : MonoBehaviour
    {
        [SerializeField] private float nameplateMw = 0.25f;
        [SerializeField] private float revenuePerMwPerSecond = 4f;
        [SerializeField] private bool connectedToGrid = true;

        public float CurrentMegawatts
        {
            get
            {
                bool connected = connectedToGrid;
                if (GridExportNode.Instance != null)
                {
                    connected = GridExportNode.Instance.IsInRange(transform.position);
                    connectedToGrid = connected;
                }

                return connected ? nameplateMw * DayNightSun.SolarFactor : 0f;
            }
        }

        private void OnEnable()
        {
            PowerBoard.Register(this);
        }

        private void OnDisable()
        {
            PowerBoard.Unregister(this);
        }

        private void Update()
        {
            if (!connectedToGrid || PlayerEconomy.Instance == null)
            {
                return;
            }

            float mw = CurrentMegawatts;
            if (mw <= 0f)
            {
                return;
            }

            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            PlayerEconomy.Instance.Add(mw * revenuePerMwPerSecond * dt);
        }

        public void SetGridConnection(bool connected)
        {
            connectedToGrid = connected;
        }
    }
}
