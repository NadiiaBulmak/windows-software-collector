export interface DeviceInfo {
  deviceId: string;
  hostname: string;
  username: string;
  os: string;
  osVersion: string;
  architecture: string;
}

export interface ApplicationInfo {
  name: string;
  version: string | null;
  publisher: string | null;
  packageId?: string;
  source: 'registry' | 'winget' | 'appx';
}

export interface InventoryPayload {
  schemaVersion: string;
  collectedAt: string;
  device: DeviceInfo;
  applications: ApplicationInfo[];
}