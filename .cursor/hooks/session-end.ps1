# Cursor sessionEnd: stamp the Polaris Megawatt Valley note from current Git HEAD.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { $null = [Console]::In.ReadToEnd() } catch { }

$hookDir = $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $hookDir '..\..')).Path
Set-Location -LiteralPath $repoRoot
$logPath = Join-Path $hookDir 'last-session-end.log'
$syncScript = Join-Path $repoRoot 'Tools\Sync-PolarisMegawattValley.ps1'

try {
    if (Test-Path -LiteralPath $syncScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $syncScript -RepoRoot $repoRoot 2>&1 |
            Out-File -FilePath $logPath -Encoding utf8
    }
}
catch {
    Add-Content -LiteralPath $logPath -Value ("{0} error {1}" -f (Get-Date -Format o), $_.Exception.Message) -Encoding UTF8
}

Write-Output '{}'
exit 0
