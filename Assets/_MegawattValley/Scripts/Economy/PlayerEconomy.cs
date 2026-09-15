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
            GUI.Box(new Rect(pad, pad, 220f, 64f), GUIContent.none);
            GUI.Label(new Rect(pad + 10f, pad + 8f, 200f, 24f), $"Cash: ${cash:0}");
            GUI.Label(new Rect(pad + 10f, pad + 32f, 200f, 24f), $"Power: {PowerBoard.TotalMegawatts:0.00} MW");
        }
    }
}
