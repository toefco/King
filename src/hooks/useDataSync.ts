import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { saveUserData, syncUserData, fetchUserData } from './api';

const SYNC_INTERVAL = 30000;

export function useDataSync() {
  const ownerMode = useStore((state) => state.ownerMode);
  const exportData = useStore((state) => state.exportData);

  const syncToServer = useCallback(async () => {
    if (!ownerMode) return;

    const userId = localStorage.getItem('talent-showcase-user-id');
    if (!userId) return;

    try {
      const localData = exportData();
      const lastSyncTime = parseInt(localStorage.getItem('talent-showcase-last-sync') || '0');
      
      const response = await syncUserData(userId, localData, lastSyncTime);
      if (response.success && response.lastSyncTime) {
        localStorage.setItem('talent-showcase-last-sync', response.lastSyncTime.toString());
        console.log('[数据同步成功]');
      }
    } catch (e) {
      console.error('[数据同步失败]', e);
    }
  }, [ownerMode, exportData]);

  const syncFromServer = useCallback(async () => {
    if (!ownerMode) return;

    const userId = localStorage.getItem('talent-showcase-user-id');
    if (!userId) return;

    try {
      const response = await fetchUserData(userId);
      if (response.success && response.data) {
        console.log('[从服务器加载数据]');
        return response.data;
      }
    } catch (e) {
      console.error('[从服务器加载失败]', e);
    }
    return null;
  }, [ownerMode]);

  const forceSave = useCallback(async () => {
    if (!ownerMode) return;

    const userId = localStorage.getItem('talent-showcase-user-id');
    if (!userId) return;

    try {
      const localData = exportData();
      const response = await saveUserData(userId, localData);
      if (response.success) {
        localStorage.setItem('talent-showcase-last-sync', Date.now().toString());
        console.log('[数据强制保存成功]');
      }
    } catch (e) {
      console.error('[数据强制保存失败]', e);
    }
  }, [ownerMode, exportData]);

  useEffect(() => {
    if (!ownerMode) return;

    syncFromServer();
    const interval = setInterval(syncToServer, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [ownerMode, syncToServer, syncFromServer]);

  return { syncToServer, syncFromServer, forceSave };
}