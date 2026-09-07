import os from 'os';
import crypto from 'crypto';
import { DeviceInfo } from '../types';

function getWindowsName(release: string): string {
  const parts = release.split('.');
  const major = parseInt(parts[0]);
  const build = parseInt(parts[2]);
  if (major === 10) {
    return build >= 22000 ? 'Windows 11' : 'Windows 10';
  } 
  
  if (release.startsWith('6.3')) return 'Windows 8.1';
  if (release.startsWith('6.2')) return 'Windows 8';
  if (release.startsWith('6.1')) return 'Windows 7';
  
  return `Windows NT ${release}`;
}

export function getDeviceInfo(): DeviceInfo {
  const hostname = os.hostname();
  const username = os.userInfo().username;
  
  const deviceId = crypto
    .createHash('sha256')
    .update(`${hostname}-${username}`)
    .digest('hex')
    .substring(0, 16);

  const releaseVersion = os.release();

  return {
    deviceId,
    hostname,
    username,
    os: getWindowsName(releaseVersion),
    osVersion: releaseVersion,
    architecture: os.arch(),
  };
}