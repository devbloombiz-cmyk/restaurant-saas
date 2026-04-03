param(
  [string]$ApiBase = "http://127.0.0.1:5000/api",
  [int]$MaxDbLatencyMs = 120,
  [int]$MaxApiMs = 250
)

$ErrorActionPreference = "Stop"

$response = Invoke-RestMethod -Method Get -Uri "$ApiBase/system/metrics"
$data = $response.data

$alerts = @()

if ($data.dbLatencyMs -gt $MaxDbLatencyMs) {
  $alerts += "High DB latency: $($data.dbLatencyMs) ms"
}

if ($data.apiResponseTimeMs -gt $MaxApiMs) {
  $alerts += "High API response time: $($data.apiResponseTimeMs) ms"
}

if ($alerts.Count -gt 0) {
  $timestamp = Get-Date -Format o
  $line = "[$timestamp] ALERT: " + ($alerts -join " | ")
  Add-Content -Path ".\logs\alerts.log" -Value $line
  Write-Host $line
  exit 1
}

Write-Host "Health monitor check passed"
