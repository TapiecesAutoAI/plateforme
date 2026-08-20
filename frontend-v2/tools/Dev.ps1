param(
    [switch]$Build,
    [switch]$Test,
    [switch]$All
)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " TaPiecesAuto AI Developer Tool"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if($All){
    $Build = $true
    $Test = $true
}

if($Build){

    Write-Host "Suppression de .next..." -ForegroundColor Yellow

    Remove-Item `
        -Recurse `
        -Force `
        ".next" `
        -ErrorAction SilentlyContinue

    Write-Host ""

    Write-Host "BUILD..." -ForegroundColor Green

    npm.cmd run build

    if($LASTEXITCODE -ne 0){

        Write-Host ""
        Write-Host "BUILD EN ECHEC" -ForegroundColor Red
        exit

    }

    Write-Host ""
    Write-Host "BUILD OK" -ForegroundColor Green
}

if($Test){

    Write-Host ""
    Write-Host "TESTS..." -ForegroundColor Green

    npm.cmd test

    if($LASTEXITCODE -ne 0){

        Write-Host ""
        Write-Host "TESTS EN ECHEC" -ForegroundColor Red
        exit

    }

    Write-Host ""
    Write-Host "TESTS OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Terminé"
Write-Host "=========================================" -ForegroundColor Cyan
