using System;
using System.Collections.Generic;
using MegawattValley.Data;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Runtime unlocked-capability set for the active scenario (E1-01 / E1-02).
    /// </summary>
    public sealed class CompanyCapabilities : MonoBehaviour
    {
        public static CompanyCapabilities Instance { get; private set; }

        [SerializeField] private CapabilityDefinition[] knownCapabilities = Array.Empty<CapabilityDefinition>();
        [SerializeField] private List<string> unlockedIds = new List<string>();

        public event Action<string> CapabilityUnlocked;

        public IReadOnlyList<CapabilityDefinition> KnownCapabilities => knownCapabilities;
        public IReadOnlyList<string> UnlockedIds => unlockedIds;

        private void Awake()
        {
            Instance = this;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void Update()
        {
            // Temporary E1-01 verify path: U unlocks Radio Dispatch.
            var keyboard = Keyboard.current;
            if (keyboard != null && keyboard.uKey.wasPressedThisFrame)
            {
                if (Unlock(CapabilityIds.RadioDispatch))
                {
                    Debug.Log("[MegawattValley] DEBUG unlock: Radio Dispatch (U).");
                }
            }
        }

        public bool IsUnlocked(string capabilityId)
        {
            if (string.IsNullOrEmpty(capabilityId))
            {
                return false;
            }

            return unlockedIds.Contains(capabilityId);
        }

        public bool Unlock(string capabilityId)
        {
            if (string.IsNullOrEmpty(capabilityId) || unlockedIds.Contains(capabilityId))
            {
                return false;
            }

            unlockedIds.Add(capabilityId);
            CapabilityUnlocked?.Invoke(capabilityId);
            Debug.Log($"[MegawattValley] Capability unlocked: {capabilityId}");
            return true;
        }

        public void SetUnlockedIds(IEnumerable<string> ids)
        {
            unlockedIds.Clear();
            if (ids == null)
            {
                return;
            }

            foreach (var id in ids)
            {
                if (!string.IsNullOrEmpty(id) && !unlockedIds.Contains(id))
                {
                    unlockedIds.Add(id);
                }
            }
        }

        public CapabilityDefinition FindDefinition(string capabilityId)
        {
            foreach (var def in knownCapabilities)
            {
                if (def != null && def.Id == capabilityId)
                {
                    return def;
                }
            }

            return null;
        }
    }
}
