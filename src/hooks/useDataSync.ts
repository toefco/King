import { useEffect } from 'react';
import { useStore } from '../store';

export function useDataSync() {
  const loadFromLocalStorage = useStore((state) => state.loadFromLocalStorage);
  const ownerMode = useStore((state) => state.ownerMode);

  useEffect(() => {
    if (ownerMode) {
      // 加载本地存储的数据
      loadFromLocalStorage();
    }
  }, [ownerMode, loadFromLocalStorage]);

  return {};
}
