import { useRef, useCallback } from 'react';

export const useWakeLock = () => {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async (addToLog?: (msg: string) => void) => {
    if ('wakeLock' in navigator) {
      try {
        let canRequest = true;
        if ((navigator as any).permissions) {
          try {
            const status = await (navigator as any).permissions.query({ name: 'screen-wake-lock' });
            if (status.state === 'denied') canRequest = false;
          } catch (e) {
            // Permission query not supported, proceed
          }
        }

        if (canRequest) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          if (addToLog) addToLog('💡 تم تفعيل وضع منع انطفاء الشاشة');
        }
      } catch (err: any) {
        if (err.name !== 'NotAllowedError' && !err.message.includes('permissions policy')) {
          console.error('Wake Lock failed:', err);
        } else {
          if (addToLog) addToLog('⚠️ منع انطفاء الشاشة غير متاح في هذا المتصفح');
        }
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (e) {
        console.error('Failed to release wake lock:', e);
      }
      wakeLockRef.current = null;
    }
  }, []);

  return { requestWakeLock, releaseWakeLock };
};
