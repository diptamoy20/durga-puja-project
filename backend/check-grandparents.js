const { execSync } = require('child_process');
try {
  const pids = [11536, 30236, 6836, 24828, 30036, 18120, 20584, 6380, 33444];
  const script = `Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -in @(${pids.join(',')}) } | Select-Object ProcessId, ParentProcessId, Name, CommandLine | ConvertTo-Json`;
  const out = execSync(`powershell -NoProfile -Command "${script}"`).toString();
  console.log(JSON.parse(out));
} catch (e) {
  console.error(e.message);
}
