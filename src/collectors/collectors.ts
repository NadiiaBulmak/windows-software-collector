import { execSync } from 'child_process';
import { ApplicationInfo } from '../types';

function runPowerShellJSON(script: string, sourceName: string): any[] {
  try {
    const cmd = `powershell.exe -NoProfile -NonInteractive -Command "${script} | ConvertTo-Json -Compress"`;
    
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }); // Збільшив буфер
    return output.trim() ? JSON.parse(output) : [];
  } catch (error: any) {
    console.error(`\n❌ Помилка збору з ${sourceName}:`);
    if (error.stderr) {
      console.error(error.stderr.toString());
    } else {
      console.error(error.message);
    }
    return [];
  }
}

export function getRegistryApplications(): ApplicationInfo[] {
  const psScript = `
    $paths = @(
      'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
      'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
      'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
    );
    Get-ItemProperty $paths -ErrorAction SilentlyContinue | 
    Where-Object { $_.DisplayName -and $_.SystemComponent -ne 1 -and $_.ParentKeyName -eq $null } |
    Select-Object DisplayName, DisplayVersion, Publisher
  `.replace(/\n/g, ' ');

  const rawData = runPowerShellJSON(psScript, 'Registry');
  
  return rawData.map(app => ({
    name: app.DisplayName,
    version: app.DisplayVersion || null,
    publisher: app.Publisher || null,
    source: 'registry'
  }));
}

export function getAppXApplications(): ApplicationInfo[] {
  const psScript = `
    Get-AppxPackage | 
    Where-Object { $_.IsFramework -eq $false -and $_.NonRemovable -eq $false } |
    Select-Object Name, Version, Publisher
  `.replace(/\n/g, ' ');

  const rawData = runPowerShellJSON(psScript, 'AppX');

  return rawData.map(app => ({
    name: app.Name,
    version: app.Version || null,
    publisher: app.Publisher ? app.Publisher.replace(/CN=/, '').split(',')[0] : null,
    packageId: app.Name,
    source: 'appx'
  }));
}