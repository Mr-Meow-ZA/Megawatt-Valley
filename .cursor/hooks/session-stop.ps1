# Cursor stop: if GitHub handoff is incomplete, request one follow-up turn.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { $null = [Console]::In.ReadToEnd() } catch { }

$hookDir = $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $hookDir '..\..')).Path
Set-Location -LiteralPath $repoRoot
$logPath = Join-Path $hookDir 'last-session-stop.log'

function Write-HookLog([string]$Message) {
    Add-Content -LiteralPath $logPath -Value ("{0} {1}" -f (Get-Date -Format o), $Message) -Encoding UTF8
}

try {
    $porcelain = @(git status --porcelain)
    $dirty = @($porcelain | Where-Object { $_ -notmatch '(?i)last-session-(start|stop|end)\.log$' })
    $unpushed = @()
    git rev-parse --verify origin/main 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $unpushed = @(git log --oneline origin/main..HEAD)
    }

    if ($dirty.Count -eq 0 -and $unpushed.Count -eq 0) {
        Write-HookLog 'clean'
        Write-Output '{}'
        exit 0
    }

    $dirtyPreview = ($dirty | Select-Object -First 12) -join '; '
    $unpushedPreview = ($unpushed | Select-Object -First 8) -join '; '
    $followup = @"
Complete the Megawatt Valley GitHub + Polaris handoff from Docs/COLLABORATION_GUIDE.md before stopping.

Uncommitted changes ($($dirty.Count)): $dirtyPreview
Unpushed commits ($($unpushed.Count)): $unpushedPreview

Required:
1. Commit meaningful work with a focused message.
2. Append Docs/ACTIVITY_LOG.md.
3. Update Docs/SESSION_GOALS.md and Docs/CURRENT_STATUS.md only if they actually changed.
4. Push to origin so ChatGPT can see the session.
5. Run Tools/Sync-PolarisMegawattValley.ps1 and update the Polaris project note / Activity Hub if status changed.
Follow Docs/ACTIVE_DEVELOPMENT.md; do not resume legacy Unity/Phaser production.
"@

    Write-HookLog "followup dirty=$($dirty.Count) unpushed=$($unpushed.Count)"
    @{ followup_message = $followup } | ConvertTo-Json -Compress
    exit 0
}
catch {
    Write-HookLog ("error " + $_.Exception.Message)
    Write-Output '{}'
    exit 0
}
