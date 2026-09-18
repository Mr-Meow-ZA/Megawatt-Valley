using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Company cash + lifetime export revenue for 3★ (S3-01 / L1-07).
    /// </summary>
    public sealed class PlayerEconomy : MonoBehaviour
    {
        public static PlayerEconomy Instance { get; private set; }

        [SerializeField] private ScenarioDefinition scenario;
        [SerializeField] private float startingCash = 1000f;
        [SerializeField] private float cash;
        [SerializeField] private float lifetimeRevenue;

        public float Cash => cash;
        public float LifetimeRevenue => lifetimeRevenue;

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

        /// <summary>Refunds / event payouts — does not count toward 3★ revenue.</summary>
        public void Add(float amount)
        {
            if (amount <= 0f)
            {
                return;
            }

            cash += amount;
        }

        /// <summary>Export income — counts toward 3★ lifetime revenue.</summary>
        public void AddRevenue(float amount)
        {
            if (amount <= 0f)
            {
                return;
            }

            cash += amount;
            lifetimeRevenue += amount;
        }

        public bool CanAfford(float amount)
        {
            return cash >= amount;
        }

        public void SetCash(float amount)
        {
            cash = Mathf.Max(0f, amount);
        }

        public void SetLifetimeRevenue(float amount)
        {
            lifetimeRevenue = Mathf.Max(0f, amount);
        }
    }
}
