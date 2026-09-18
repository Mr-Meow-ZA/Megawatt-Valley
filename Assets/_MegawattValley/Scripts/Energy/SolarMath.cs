using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Pure generation and revenue maths, kept free of MonoBehaviours so it can be tested
    /// without a scene (S6-05) and reasoned about without reading presentation code.
    /// </summary>
    public static class SolarMath
    {
        /// <summary>
        /// Output multiplier from equipment condition. A faulted array produces nothing; a worn but
        /// working array is penalised down to <paramref name="minMultiplier"/> at 0% condition.
        /// </summary>
        public static float ConditionMultiplier(float conditionPercent, bool faulted, float minMultiplier)
        {
            if (faulted)
            {
                return 0f;
            }

            float normalised = Mathf.Clamp01(conditionPercent / 100f);
            return Mathf.Lerp(Mathf.Clamp01(minMultiplier), 1f, normalised);
        }

        /// <summary>Soiling multiplies after condition. 100% dust → ~40% remaining output.</summary>
        public static float SoilingMultiplier(float soilingPercent)
        {
            float dust = Mathf.Clamp01(soilingPercent / 100f);
            return Mathf.Lerp(1f, 0.4f, dust);
        }

        /// <summary>Instantaneous output. Nothing flows unless the array is connected to the grid.</summary>
        public static float Megawatts(float nameplateMw, float solarFactor, float outputMultiplier, bool connectedToGrid)
        {
            if (!connectedToGrid || nameplateMw <= 0f)
            {
                return 0f;
            }

            return Mathf.Max(0f, nameplateMw) *
                   Mathf.Clamp01(solarFactor) *
                   Mathf.Clamp01(outputMultiplier);
        }

        public static float RevenuePerSecond(float megawatts, float revenuePerMwPerSecond)
        {
            if (megawatts <= 0f || revenuePerMwPerSecond <= 0f)
            {
                return 0f;
            }

            return megawatts * revenuePerMwPerSecond;
        }

        /// <summary>Cash earned across a simulated step.</summary>
        public static float Revenue(float megawatts, float revenuePerMwPerSecond, float deltaSeconds)
        {
            if (deltaSeconds <= 0f)
            {
                return 0f;
            }

            return RevenuePerSecond(megawatts, revenuePerMwPerSecond) * deltaSeconds;
        }
    }
}
