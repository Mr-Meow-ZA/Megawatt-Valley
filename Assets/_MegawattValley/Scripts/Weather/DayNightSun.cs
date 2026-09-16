using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Day factor so solar output visibly changes over time (supports S3-02).
    /// </summary>
    public sealed class DayNightSun : MonoBehaviour
    {
        public static float SolarFactor { get; private set; } = 1f;
        public static bool IsDaylight => SolarFactor > 0.01f;
        public static string ClockText { get; private set; } = "Day 1 · 12:00";
        public static DayNightSun Instance { get; private set; }

        public int DayNumber => _dayNumber;
        public float TimeOfDay => _timeOfDay;

        [SerializeField] private Light sunLight;
        [SerializeField] private float dayLengthSeconds = 180f;

        /// <summary>Share of each cycle that produces any sunlight.</summary>
        [SerializeField, Range(0.4f, 0.95f)] private float daylightFraction = 0.8f;

        /// <summary>Darkness is dead time for a solar operator, so it runs faster than daylight.</summary>
        [SerializeField, Range(1f, 8f)] private float nightFastForward = 4f;

        /// <summary>0 = midnight, 0.5 = solar noon. Starting at noon avoids a dead first minute.</summary>
        [SerializeField, Range(0f, 1f)] private float startTimeOfDay = 0.5f;

        private float _timeOfDay;
        private int _dayNumber = 1;

        private void Awake()
        {
            Instance = this;
            if (sunLight == null)
            {
                sunLight = GetComponent<Light>();
            }

            _timeOfDay = Mathf.Repeat(startTimeOfDay, 1f);
            Recalculate();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public void SetClock(int dayNumber, float timeOfDay)
        {
            _dayNumber = Mathf.Max(1, dayNumber);
            _timeOfDay = Mathf.Repeat(timeOfDay, 1f);
            Recalculate();
        }

        private void Update()
        {
            float dt = SimulationClock.Instance != null ? SimulationClock.Instance.SimulationDeltaTime : Time.deltaTime;
            if (dayLengthSeconds > 0.01f && dt > 0f)
            {
                float rate = IsDaylight ? 1f : nightFastForward;
                float advanced = _timeOfDay + (dt * rate) / dayLengthSeconds;
                if (advanced >= 1f)
                {
                    _dayNumber += Mathf.FloorToInt(advanced);
                }

                _timeOfDay = Mathf.Repeat(advanced, 1f);
            }

            Recalculate();
        }

        private void Recalculate()
        {
            if (dayLengthSeconds <= 0.01f)
            {
                SolarFactor = 1f;
            }
            else
            {
                float half = daylightFraction * 0.5f;
                float sunrise = 0.5f - half;
                float sunset = 0.5f + half;
                SolarFactor = _timeOfDay <= sunrise || _timeOfDay >= sunset
                    ? 0f
                    : Mathf.Sin(Mathf.InverseLerp(sunrise, sunset, _timeOfDay) * Mathf.PI);
            }

            int minutes = Mathf.RoundToInt(_timeOfDay * 1440f) % 1440;
            ClockText = $"Day {_dayNumber} · {minutes / 60:00}:{minutes % 60:00}";

            if (sunLight != null)
            {
                sunLight.transform.rotation = Quaternion.Euler(Mathf.Lerp(4f, 78f, SolarFactor), 30f + _timeOfDay * 40f, 0f);
                sunLight.intensity = Mathf.Lerp(0.18f, 1.2f, SolarFactor);
            }
        }
    }
}
