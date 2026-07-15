$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$packager = Join-Path $PSScriptRoot 'package-release.ps1'
& $packager

$archive = Join-Path $projectRoot 'release\game.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($archive)
try {
    $names = @($zip.Entries | ForEach-Object FullName)
    if ($names -notcontains 'index.html') { throw 'release/game.zip must contain index.html at archive root' }
    if ($names | Where-Object { $_ -like 'dist/*' }) { throw 'release/game.zip must not contain a dist/ wrapper' }
}
finally {
    $zip.Dispose()
}
Write-Output 'release archive structure passed'
