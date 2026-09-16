using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Simple company cash balance (S3-01). Starting cash comes from the scenario when one is set.
    /// </summary>
    public sealed class PlayerEconomy : MonoBehaviour
    {
        public static PlayerEconomy Instance { get; private set; }

        [SerializeField] private ScenarioDefinition scenario;
        [SerializeField] private float startingCash = 1000f;
        [SerializeField] private float cash;

        public float Cash => cash;

        private void Awake()
        {
            Instance = this;
            cash = scenario != null ? scenario.StartingCash : startingCash;
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

        public bool CanAfford(float amount)
        {
            return cash >= amount;
        }

        /// <summary>Used when restoring a saved game.</summary>
        public void SetCash(float amount)
        {
            cash = Mathf.Max(0f, amount);
        }
    }
}
