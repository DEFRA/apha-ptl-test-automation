<#
  Runs a seed SQL file against the local ProficiencyTesting database inside one transaction.
  Usage: powershell -File scripts/seed-db.ps1 [apply|rollback]
  The connection string comes from E2E_DB_CONNECTION, else the local default (Windows authentication, no secret).
#>
param([ValidateSet('apply', 'rollback')][string]$Action = 'apply')
$ErrorActionPreference = 'Stop'
$cs = if ($env:E2E_DB_CONNECTION) { $env:E2E_DB_CONNECTION } else { 'Server=(localdb)\MSSQLLocalDB;Database=ProficiencyTesting;Integrated Security=True;' }
$sql = Get-Content -Raw (Join-Path $PSScriptRoot "..\data\seed\$Action.sql")
$c = New-Object System.Data.SqlClient.SqlConnection $cs
$c.Open()
$tx = $c.BeginTransaction()
try {
  $cmd = $c.CreateCommand(); $cmd.Transaction = $tx; $cmd.CommandText = $sql
  $n = $cmd.ExecuteNonQuery()
  $tx.Commit()
  Write-Output "$Action done, rows affected: $n"
} catch { $tx.Rollback(); throw } finally { $c.Close() }
