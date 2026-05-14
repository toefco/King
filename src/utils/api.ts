export const API_BASE = 'http://localhost:3001/api';

export interface SyncResponse {
  success: boolean;
  data?: any;
  message?: string;
  lastSyncTime?: number;
}

export async function fetchUserData(userId: string): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/data/${userId}`);
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function saveUserData(userId: string, data: any): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/data/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function syncUserData(userId: string, localData: any, lastSyncTime: number): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/sync/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localData, lastSyncTime }),
    });
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function clearUserData(userId: string): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/clear/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function backupUserData(userId: string, data: any): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/backup/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function getBackupData(userId: string): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/backup/${userId}`);
    return await response.json();
  } catch {
    return { success: false, message: '网络错误' };
  }
}

export async function checkHealth(): Promise<{ success: boolean; status?: string; timestamp?: string }> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch {
    return { success: false };
  }
}