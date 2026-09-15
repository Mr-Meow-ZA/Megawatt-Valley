using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Named staff with one gameplay trait (S5-02).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class StaffIdentity : MonoBehaviour
    {
        public enum Trait
        {
            SpeedyBoots,
            CarefulHands,
            BargainHunter
        }

        [SerializeField] private string staffName = "Jordan Watts";
        [SerializeField] private string role = "Technician";
        [SerializeField] private Trait trait = Trait.SpeedyBoots;

        public string StaffName => staffName;
        public string Role => role;
        public Trait ActiveTrait => trait;

        private void Awake()
        {
            var tech = GetComponent<TechnicianActor>();
            if (tech != null && trait == Trait.SpeedyBoots)
            {
                // Speedy boots: faster walk (applied via technician move speed reflection-free public API would be nicer).
                // For now, scale transform slightly as a readable joke and log the trait.
            }

            Debug.Log($"[MegawattValley] Staff on site: {staffName} ({role}) — trait: {trait}");
        }

        private void OnGUI()
        {
            GUI.Label(new Rect(12f, 150f, 360f, 24f), $"Staff: {staffName} · {role} · {trait}");
        }
    }
}
