$processes = Get-Process | Sort-Object CPU -Descending | Select-Object -First 15
$result = $processes | Select-Object ProcessName, Id, @{Name = 'CPU_Time(s)'; Expression = { $_.CPU } }, @{Name = 'Memory(MB)'; Expression = { [Math]::Round($_.WorkingSet / 1MB, 2) } }
$result | Format-List
