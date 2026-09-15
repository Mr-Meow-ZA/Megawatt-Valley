# Stamp the Polaris Megawatt Valley project note from the local Git repo / GitHub HEAD.
# Does not copy design docs into the vault. Fails open if the vault is unavailable.
[CmdletBinding()]
param(
    [string]$RepoRoot = '',
    [string]$VaultNote = 'E:\Obsidian Vaults\Polaris_Vault\02 Projects\Technical\Megawatt Valley.md'
)

$ErrorActionPreference = 'Stop'
if (-not $RepoRoot) {
    $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

if (-not (Test-Path -LiteralPath $VaultNote)) {
    Write-Output "Polaris note not found: $VaultNote"
    exit 0
}

$headShort = (git -C $RepoRoot rev-parse --short HEAD).Trim()
$headFull = (git -C $RepoRoot rev-parse HEAD).Trim()
$subject = (git -C $RepoRoot log -1 --pretty=%s).Trim()
$commitDate = (git -C $RepoRoot log -1 --pretty=%cs).Trim()
$branch = (git -C $RepoRoot rev-parse --abbrev-ref HEAD).Trim()
$statusShort = ((git -C $RepoRoot status -sb) -join ' | ')

$ahead = 0
$behind = 0
git -C $RepoRoot rev-parse --verify origin/main 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    $ahead = [int](git -C $RepoRoot rev-list --count origin/main..HEAD)
    $behind = [int](git -C $RepoRoot rev-list --count HEAD..origin/main)
}

$nextGoal = 'See Docs/SESSION_GOALS.md'
$goalsPath = Join-Path $RepoRoot 'Docs\SESSION_GOALS.md'
if (Test-Path -LiteralPath $goalsPath) {
    $goalLine = Get-Content -LiteralPath $goalsPath -Encoding UTF8 |
        Where-Object { $_ -match '^- \[ \] \*\*S\d+' } |
        Select-Object -First 1
    if ($goalLine) { $nextGoal = $goalLine.Trim() }
}

$stampDate = Get-Date -Format 'yyyy-MM-dd'
$syncBlock = @"
<!-- polaris:github-sync:start -->
## Last GitHub sync

- Stamped: $stampDate
- Branch: ``$branch``
- HEAD: ``$headShort`` (``$headFull``)
- Latest commit: $subject ($commitDate)
- Ahead of origin/main: $ahead / behind: $behind
- ``git status -sb``: $statusShort
- First open session goal: $nextGoal
- Shared handoff: ``Docs/COLLABORATION_GUIDE.md``
<!-- polaris:github-sync:end -->
"@

$note = Get-Content -LiteralPath $VaultNote -Raw -Encoding UTF8

$note = [regex]::Replace($note, '(?m)^updated:.*$', "updated: $stampDate")

# Refresh the HEAD token in Current state when it looks like a short git sha.
$note = [regex]::Replace(
    $note,
    'is on `[^`]+` at `[0-9a-f]{7,40}`(?: \([^)]+\))?',
    "is on ``$branch`` at ``$headShort`` ($commitDate)"
)

$replacement = $syncBlock.TrimEnd().Replace('$', '$$')
$pattern = '(?s)<!-- polaris:github-sync:start -->.*?<!-- polaris:github-sync:end -->'
if ($note -match $pattern) {
    $note = [regex]::Replace($note, $pattern, $replacement)
}
else {
    $note = $note.TrimEnd() + "`r`n`r`n" + $syncBlock.TrimEnd() + "`r`n"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($VaultNote, $note, $utf8NoBom)
Write-Output "Updated Polaris note HEAD=$headShort"
exit 0
