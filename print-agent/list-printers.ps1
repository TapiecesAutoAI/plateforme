Get-Printer |
Where-Object {
    $_.Name -ne "OneNote (Desktop)" -and
    $_.Name -ne "Microsoft Print to PDF"
} |
Select-Object Name,PortName,PrinterStatus,Type |
ConvertTo-Json -Depth 3