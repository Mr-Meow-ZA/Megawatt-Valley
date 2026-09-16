using UnityEditor;
using UnityEngine;

namespace MegawattValley.EditorTools
{
    /// <summary>
    /// Batchmode entry point used by Tools/Verify-UnityBuild.ps1. Reaching this method at all
    /// means every assembly in the project compiled.
    /// </summary>
    public static class BuildVerifier
    {
        public static void CompileCheck()
        {
            Debug.Log($"[MegawattValley] Compile check OK. Unity {Application.unityVersion}.");
            EditorApplication.Exit(0);
        }
    }
}
