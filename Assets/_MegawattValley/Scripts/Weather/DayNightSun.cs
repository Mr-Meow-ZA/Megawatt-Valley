using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tiny day factor so solar output visibly changes over time (supports S3-02).
    /// </summary>
    public sealed class DayNightSun : MonoBehaviour
    {
        public static float SolarFactor { get; private set; } = 1f;

        [SerializeField] private Light sunLight;
        [SerializeField] private float dayLengthSeconds = 90f;

        private float _timeOfDay;

        private void Awake()
        {
            if (sunLight == null)
            {
                sunLight = GetComponent<Light>();
            }
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            if (dayLengthSeconds <= 0.01f)
            {
                SolarFactor = 1f;
                return;
            }

            _timeOfDay = (_timeOfDay + dt / dayLengthSeconds) % 1f;
            // Peak at midday (0.25..0.75 daylight-ish sine bump).
            float angle = _timeOfDay * Mathf.PI * 2f;
            SolarFactor = Mathf.Clamp01(Mathf.Sin(angle));

            if (sunLight != null)
            {
                sunLight.transform.rotation = Quaternion.Euler(SolarFactor * 70f + 10f, 30f, 0f);
                sunLight.intensity = Mathf.Lerp(0.15f, 1.2f, SolarFactor);
            }
        }
    }
}
