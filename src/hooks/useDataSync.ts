import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useDataSync() {
  const loadFromLocalStorage = useStore((state) => state.loadFromLocalStorage);
  const saveToStaticData = useStore((state) => state.saveToStaticData);
  const ownerMode = useStore((state) => state.ownerMode);
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    if (ownerMode) {
      // 加载本地存储的数据
      loadFromLocalStorage();
    }
  }, [ownerMode, loadFromLocalStorage]);

  useEffect(() => {
    if (!ownerMode) return;

    // 每30秒自动保存
    const saveInterval = setInterval(async () => {
      try {
        // 获取当前数据
        const currentData = useStore.getState().exportData();
        const dataJson = JSON.stringify(currentData);
        
        // 只有数据有变化时才保存
        if (dataJson !== lastSavedDataRef.current) {
          await saveToStaticData();
          lastSavedDataRef.current = dataJson;
        }
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [ownerMode, saveToStaticData]);

  return {};
}
