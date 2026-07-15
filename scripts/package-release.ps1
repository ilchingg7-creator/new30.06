$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $projectRoot 'dist'
$release = Join-Path $projectRoot 'release'
$archive = Join-Path $release 'game.zip'

if (-not (Test-Path -LiteralPath (Join-Path $dist 'index.html') -PathType Leaf)) {
    throw 'dist/index.html is missing; run npm run build first'
}

New-Item -ItemType Directory -Path $release -Force | Out-Null
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $archive -CompressionLevel Optimal -Force
Write-Output $archive
