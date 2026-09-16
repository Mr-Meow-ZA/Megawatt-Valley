namespace MegawattValley.Core
{
    /// <summary>
    /// World interaction reads raw mouse state, so it cannot tell that a click landed on the HUD.
    /// The HUD sets this each frame and world systems skip clicks while it is true.
    /// </summary>
    public static class UiInputGuard
    {
        public static bool PointerOverUi { get; set; }
    }
}
