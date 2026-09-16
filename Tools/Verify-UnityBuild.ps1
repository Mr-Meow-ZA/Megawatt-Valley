<#
.SYNOPSIS
    Compiles (and optionally bootstraps) Megawatt Valley in a shadow copy of the project.

.DESCRIPTION
    Unity refuses batchmode on a project that is already open in the Editor, which is the
    normal state while Rapha is playtesting. This script mirrors Assets / Packages /
    ProjectSettings into a shadow project outside the repository, runs Unity there in
    batchmode, and reports compile errors. Generated scenes can be copied back.

    The shadow project keeps its Library folder between runs, so repeat runs are fast.

.EXAMPLE
    Tools/Verify-UnityBuild.ps1
    Compile check only.

.EXAMPLE
    Tools/Verify-UnityBuild.ps1 -Method MegawattValley.EditorTools.PrototypeSceneBootstrap.CreatePrototypeScene -CopyBackScenes
    Rebuild the prototype scene and bring it back into the repository.
#>
[CmdletBinding()]
param(
    [string]$Method = 'MegawattValley.EditorTools.BuildVerifier.CompileCheck',
    [switch]$CopyBackScenes,
    [string]$ShadowRoot = (Join-Path $env:LOCALAPPDATA 'MegawattValley-Verify'),
    [string]$UnityExe = 'C:\Program Files\Unity\Hub\Editor\6000.6.0f1\Editor\Unity.exe',
    [int]$TimeoutMinutes = 20
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $UnityExe)) {
    throw "Unity editor not found at '$UnityExe'. Pass -UnityExe."
}

Write-Host "Mirroring project into $ShadowRoot ..."
New-Item -ItemType Directory -Force -Path $ShadowRoot | Out-Null
foreach ($folder in @('Assets', 'Packages', 'ProjectSettings')) {
    $source = Join-Path $repoRoot $folder
    $destination = Join-Path $ShadowRoot $folder
    # /MIR keeps the shadow project identical to the repo, including deletions.
    robocopy $source $destination /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed for '$folder' (exit $LASTEXITCODE)."
    }
}

$logPath = Join-Path $ShadowRoot 'verify.log'
if (Test-Path $logPath) { Remove-Item $logPath -Force }

Write-Host "Running Unity batchmode: $Method"
$arguments = @(
    '-batchmode', '-nographics', '-quit', '-accept-apiupdate',
    '-projectPath', $ShadowRoot,
    '-executeMethod', $Method,
    '-logFile', $logPath
)

# Unity.exe is a GUI-subsystem binary: Start-Process -PassThru and $LASTEXITCODE both fail to
# report its exit code, so start it through ProcessStartInfo instead.
$quoted = $arguments | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $UnityExe
$startInfo.UseShellExecute = $false
# Windows PowerShell 5.1 has no ArgumentList on ProcessStartInfo, so pass one quoted string.
$startInfo.Arguments = $quoted -join ' '

$process = [System.Diagnostics.Process]::Start($startInfo)
if (-not $process.WaitForExit($TimeoutMinutes * 60 * 1000)) {
    $process.Kill()
    throw "Unity batchmode timed out after $TimeoutMinutes minute(s). Log: $logPath"
}

$exitCode = $process.ExitCode
$log = if (Test-Path $logPath) { Get-Content $logPath } else { @() }

$compileErrors = $log | Select-String -Pattern 'error CS\d+' -SimpleMatch:$false | ForEach-Object { $_.Line.Trim() } | Select-Object -Unique
$exceptions = $log | Select-String -Pattern '^(Unhandled )?Exception|^\s*at MegawattValley' | ForEach-Object { $_.Line.Trim() } | Select-Object -Unique

if ($compileErrors) {
    Write-Host ''
    Write-Host 'COMPILE ERRORS' -ForegroundColor Red
    $compileErrors | ForEach-Object { Write-Host "  $_" }
}

if ($exceptions) {
    Write-Host ''
    Write-Host 'EXCEPTIONS' -ForegroundColor Red
    $exceptions | ForEach-Object { Write-Host "  $_" }
}

if ($CopyBackScenes -and $exitCode -eq 0 -and -not $compileErrors) {
    # Copy without /MIR so nothing in the repo is deleted: this only brings over assets Unity
    # generated in the shadow project, notably .meta files and generated .asset files whose
    # GUIDs must stay stable in the repository.
    Write-Host 'Copying generated assets back into the repository ...'
    robocopy (Join-Path $ShadowRoot 'Assets') (Join-Path $repoRoot 'Assets') /E /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed copying assets back (exit $LASTEXITCODE)."
    }
}

Write-Host ''
Write-Host "Unity exit code: $exitCode"
Write-Host "Log: $logPath"

if ($exitCode -ne 0 -or $compileErrors) {
    exit 1
}

Write-Host 'Verification passed.' -ForegroundColor Green
