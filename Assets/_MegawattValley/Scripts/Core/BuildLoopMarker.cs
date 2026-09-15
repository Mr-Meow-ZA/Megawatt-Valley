using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Harmless compile marker proving the Cursor → Unity → GitHub loop (S0-04).
    /// </summary>
    public static class BuildLoopMarker
    {
        public const string SessionGoal = "S0-04";
        public const string Message = "Cursor can edit Megawatt Valley scripts and Unity compiles them.";

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
        private static void Announce()
        {
            Debug.Log($"[MegawattValley] {SessionGoal}: {Message}");
        }
    }
}
