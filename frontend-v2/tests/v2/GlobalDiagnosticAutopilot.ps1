$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TAPAUTO AI — GLOBAL DIAGNOSTIC AUTOPILOT" -ForegroundColor Cyan
Write-Host "============================================================"

# ============================================================
# BASELINE CHAT9
# ============================================================

$domains = @(
    @{
        Name          = "STARTING"
        Command       = "npm run autopilot:starting"
        Explored      = 1542
        Terminals     = 1139
        Anomalies     = 0
        ManualReviews = $null
    },
    @{
        Name          = "BRAKING"
        Command       = "npx tsx .\tests\v2\BrakingEngineAutopilot.ts"
        Explored      = 1035
        Terminals     = 517
        Anomalies     = 0
        ManualReviews = 157
    },
    @{
        Name          = "BATTERY"
        Command       = "npx tsx .\tests\v2\BatteryEngineAutopilot.ts"
        Explored      = 3000
        Terminals     = 591
        Anomalies     = 0
        ManualReviews = 152
    },
    @{
        Name          = "CHARGING"
        Command       = "npx tsx .\tests\v2\ChargingEngineAutopilot.ts"
        Explored      = 2000
        Terminals     = 1343
        Anomalies     = 0
        ManualReviews = $null
    }
)

# ============================================================
# TYPECHECK
# ============================================================

Write-Host ""
Write-Host "=== TYPECHECK ===" -ForegroundColor Yellow

$typecheckOutput =
    & npm run typecheck 2>&1 |
    Out-String

Write-Host $typecheckOutput

if ($LASTEXITCODE -ne 0) {

    Write-Host ""
    Write-Host "TYPECHECK ECHEC — AUTOPILOT GLOBAL ANNULE." -ForegroundColor Red

    exit 1
}

Write-Host "TYPECHECK : OK" -ForegroundColor Green


# ============================================================
# HELPERS
# ============================================================

function Get-FirstNumber {

    param(
        [string]$Text,
        [string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {

        $match =
            [regex]::Match(
                $Text,
                $pattern,
                [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
            )

        if ($match.Success) {

            return [int]$match.Groups[1].Value
        }
    }

    return $null
}


function Compare-Value {

    param(
        $Actual,
        $Baseline
    )

    if ($null -eq $Baseline) {

        return "-"
    }

    if ($null -eq $Actual) {

        return "?"
    }

    if ($Actual -eq $Baseline) {

        return "OK"
    }

    return "CHANGED"
}


# ============================================================
# RUN
# ============================================================

$results = @()

foreach ($domain in $domains) {

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor DarkCyan
    Write-Host " $($domain.Name)" -ForegroundColor Cyan
    Write-Host "============================================================"

    $output =
        Invoke-Expression $domain.Command 2>&1 |
        Out-String

    $exitCode =
        $LASTEXITCODE

    Write-Host $output

    $explored =
        Get-FirstNumber `
            -Text $output `
            -Patterns @(
                'Parcours\s+explor[^:]*:\s*(\d+)'
            )

    $terminals =
        Get-FirstNumber `
            -Text $output `
            -Patterns @(
                'Parcours\s+terminaux\s*:\s*(\d+)'
            )

    $anomalies =
        Get-FirstNumber `
            -Text $output `
            -Patterns @(
                'TOTAL\s+ANOMALIES\s*:\s*(\d+)',
                'Anomalies\s*:\s*(\d+)'
            )

    $manualReviews =
        Get-FirstNumber `
            -Text $output `
            -Patterns @(
                'TOTAL\s+MANUAL\s+REVIEWS\s*:\s*(\d+)',
                'Manual\s+reviews\s*:\s*(\d+)'
            )

    $result = [PSCustomObject]@{

        Domain =
            $domain.Name

        Exit =
            $exitCode

        Explored =
            $explored

        BaselineExplored =
            $domain.Explored

        ExploredCheck =
            Compare-Value `
                $explored `
                $domain.Explored

        Terminals =
            $terminals

        BaselineTerminals =
            $domain.Terminals

        TerminalsCheck =
            Compare-Value `
                $terminals `
                $domain.Terminals

        Anomalies =
            $anomalies

        BaselineAnomalies =
            $domain.Anomalies

        AnomaliesCheck =
            Compare-Value `
                $anomalies `
                $domain.Anomalies

        ManualReviews =
            $manualReviews

        BaselineManualReviews =
            $domain.ManualReviews

        ManualReviewsCheck =
            Compare-Value `
                $manualReviews `
                $domain.ManualReviews
    }

    $results +=
        $result
}


# ============================================================
# SUMMARY
# ============================================================

Write-Host ""
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " GLOBAL REGRESSION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================"

$results |
    Format-Table `
        Domain,
        Exit,
        Explored,
        BaselineExplored,
        ExploredCheck,
        Terminals,
        BaselineTerminals,
        TerminalsCheck,
        Anomalies,
        AnomaliesCheck,
        ManualReviews,
        BaselineManualReviews,
        ManualReviewsCheck `
        -AutoSize


# ============================================================
# PRAGMATIC VALIDATION
# ============================================================

$regressions = @()
$warnings = @()

foreach ($result in $results) {

    if ($result.Exit -ne 0) {

        $regressions +=
            "$($result.Domain): exit=$($result.Exit)"
    }

    if (
        $result.ExploredCheck -eq
        "?"
    ) {

        $regressions +=
            "$($result.Domain): impossible de lire Parcours explores"
    }
    elseif (
        $result.ExploredCheck -eq
        "CHANGED"
    ) {

        $warnings +=
            "$($result.Domain): explored $($result.BaselineExplored) -> $($result.Explored)"
    }

    if (
        $result.TerminalsCheck -eq
        "?"
    ) {

        $regressions +=
            "$($result.Domain): impossible de lire Parcours terminaux"
    }
    elseif (
        $result.TerminalsCheck -eq
        "CHANGED"
    ) {

        $warnings +=
            "$($result.Domain): terminals $($result.BaselineTerminals) -> $($result.Terminals)"
    }

    if (
        $null -eq $result.Anomalies
    ) {

        $regressions +=
            "$($result.Domain): impossible de lire les anomalies"
    }
    elseif (
        $null -ne $result.BaselineAnomalies -and
        $result.Anomalies -gt
        $result.BaselineAnomalies
    ) {

        $regressions +=
            "$($result.Domain): anomalies $($result.BaselineAnomalies) -> $($result.Anomalies)"
    }
    elseif (
        $result.AnomaliesCheck -eq
        "CHANGED"
    ) {

        $warnings +=
            "$($result.Domain): anomalies $($result.BaselineAnomalies) -> $($result.Anomalies)"
    }

    if (
        $result.ManualReviewsCheck -eq
        "CHANGED"
    ) {

        $warnings +=
            "$($result.Domain): manual reviews $($result.BaselineManualReviews) -> $($result.ManualReviews)"
    }
}


Write-Host ""
Write-Host "============================================================"

if ($regressions.Count -eq 0) {

    Write-Host " GLOBAL STATUS : OK" -ForegroundColor Green
    Write-Host " AUCUNE REGRESSION CRITIQUE DETECTEE" -ForegroundColor Green

}
else {

    Write-Host " GLOBAL STATUS : REGRESSION CRITIQUE" -ForegroundColor Red

    foreach ($regression in $regressions) {
        Write-Host " - $regression" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {

    Write-Host ""
    Write-Host " VARIATIONS NON BLOQUANTES :" -ForegroundColor Yellow

    foreach ($warning in $warnings) {
        Write-Host " - $warning" -ForegroundColor Yellow
    }
}

Write-Host "============================================================"


# ============================================================
# SAVE REPORT
# ============================================================

$reportDirectory =
    ".\tests\v2\reports"

New-Item `
    -ItemType Directory `
    -Path $reportDirectory `
    -Force |
    Out-Null

$timestamp =
    Get-Date -Format "yyyyMMdd-HHmmss"

$report =
    Join-Path `
        $reportDirectory `
        "GlobalDiagnosticAutopilot-$timestamp.csv"

$results |
    Export-Csv `
        -Path $report `
        -NoTypeInformation `
        -Encoding UTF8

Write-Host ""
Write-Host "Rapport :" -ForegroundColor Yellow
Write-Host $report

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " FIN GLOBAL DIAGNOSTIC AUTOPILOT" -ForegroundColor Cyan
Write-Host "============================================================"

