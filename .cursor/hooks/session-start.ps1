# Cursor sessionStart: fetch GitHub, fast-forward a clean main, stamp Polaris, inject context.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { $null = [Console]::In.ReadToEnd() } catch { }

$hookDir = $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $hookDir '..\..')).Path
Set-Location -LiteralPath $repoRoot
$logPath = Join-Path $hookDir 'last-session-start.log'

function Write-HookLog([string]$Message) {
    Add-Content -LiteralPath $logPath -Value ("{0} {1}" -f (Get-Date -Format o), $Message) -Encoding UTF8
}

try {
    Write-HookLog "start repo=$repoRoot"
    git fetch origin 2>&1 | Out-File -FilePath $logPath -Append -Encoding utf8

    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
    $trackedDirty = @(git status --porcelain --untracked-files=no)
    $behind = 0
    git rev-parse --verify origin/main 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $behind = [int](git rev-list --count HEAD..origin/main)
    }

    $pulled = $false
    if ($branch -eq 'main' -and $behind -gt 0 -and $trackedDirty.Count -eq 0) {
        git pull --ff-only origin main 2>&1 | Out-File -FilePath $logPath -Append -Encoding utf8
        if ($LASTEXITCODE -eq 0) { $pulled = $true }
    }

    $syncScript = Join-Path $repoRoot 'Tools\Sync-PolarisMegawattValley.ps1'
    if (Test-Path -LiteralPath $syncScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $syncScript -RepoRoot $repoRoot 2>&1 |
            Out-File -FilePath $logPath -Append -Encoding utf8
    }

    $head = (git rev-parse --short HEAD).Trim()
    $subject = (git log -1 --pretty=%s).Trim()
    $status = (git status -sb | Out-String).Trim()
    $reviewNext = ''
    $reviewPath = Join-Path $repoRoot 'Docs\CHATGPT_REVIEW.md'
    if (Test-Path -LiteralPath $reviewPath) {
        $review = Get-Content -LiteralPath $reviewPath -Raw -Encoding UTF8
        if ($review -match '(?ms)## Recommended next session goal\s+(.*?)(?:\r?\n## |\z)') {
            $reviewNext = $Matches[1].Trim()
        }
    }

    $pullNote = if ($pulled) { "Fast-forwarded main from origin ($behind commit(s))." }
        elseif ($behind -gt 0) { "Local main is $behind commit(s) behind origin/main. Working tree has tracked changes, so pull was skipped. Fetch succeeded; pull after committing or stashing local work." }
        else { "Local main is up to date with origin/main (or origin/main is unavailable)." }

    $context = @"
Megawatt Valley session start (GitHub + Polaris sync hook).

HEAD: $head — $subject
Branch status:
$status

$pullNote

ChatGPT recommended next session goal:
$reviewNext

Required workflow:
- GitHub is the shared handoff layer with ChatGPT. Follow Docs/COLLABORATION_GUIDE.md.
- After meaningful work: commit, push to origin, append Docs/ACTIVITY_LOG.md, update SESSION_GOALS/CURRENT_STATUS if needed, then sync Polaris (Tools/Sync-PolarisMegawattValley.ps1 and the project note).
- Follow Docs/ACTIVE_DEVELOPMENT.md; the true-3D desktop candidate is PR #11. Do not resume legacy Unity/Phaser production.
- Read Docs/CHATGPT_REVIEW.md before a meaningful implementation session if it changed.
"@

    @{ additional_context = $context } | ConvertTo-Json -Compress
    Write-HookLog "ok head=$head pulled=$pulled behind=$behind"
    exit 0
}
catch {
    Write-HookLog ("error " + $_.Exception.Message)
    @{ additional_context = "Megawatt Valley session-start hook failed: $($_.Exception.Message). Still follow Docs/COLLABORATION_GUIDE.md and sync Polaris after meaningful work." } |
        ConvertTo-Json -Compress
    exit 0
}
