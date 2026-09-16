using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Simple company cash balance with on-screen readout (S3-01).
    /// </summary>
    public sealed class PlayerEconomy : MonoBehaviour
    {
        public static PlayerEconomy Instance { get; private set; }

        [SerializeField] private float startingCash = 1000f;
        [SerializeField] private float cash;

        public float Cash => cash;

        private void Awake()
        {
            Instance = this;
            cash = startingCash;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public bool TrySpend(float amount)
        {
            if (amount < 0f || cash < amount)
            {
                return false;
            }

            cash -= amount;
            return true;
        }

        public void Add(float amount)
        {
            if (amount <= 0f)
            {
                return;
            }

            cash += amount;
        }

        private void OnGUI()
        {
            const float pad = 12f;
            float installed = PowerBoard.InstalledMegawatts;
            float live = PowerBoard.TotalMegawatts;
            int disconnected = PowerBoard.DisconnectedCount;

            GUI.Box(new Rect(pad, pad, 300f, 154f), GUIContent.none);
            GUI.Label(new Rect(pad + 10f, pad + 8f, 280f, 22f), $"Cash: ${cash:0}");
            GUI.Label(new Rect(pad + 10f, pad + 30f, 280f, 22f), $"Income: ${PowerBoard.TotalRevenuePerSecond:0.0}/s");
            GUI.Label(new Rect(pad + 10f, pad + 52f, 280f, 22f), $"Exporting: {live:0.000} MW");
            GUI.Label(new Rect(pad + 10f, pad + 74f, 280f, 22f), $"Installed: {installed:0.000} MW");
            GUI.Label(new Rect(pad + 10f, pad + 96f, 280f, 22f),
                $"{DayNightSun.ClockText} · sun {DayNightSun.SolarFactor * 100f:0}%");

            string hint = disconnected > 0
                ? $"{disconnected} array(s) outside the grid ring"
                : !DayNightSun.IsDaylight && installed > 0f
                    ? "Night — no sun, no income"
                    : string.Empty;

            if (!string.IsNullOrEmpty(hint))
            {
                GUI.Label(new Rect(pad + 10f, pad + 118f, 280f, 22f), hint);
            }
        }
    }
}
