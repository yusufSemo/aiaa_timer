'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio element with a data URL containing a simple bell sound
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSp+zPDTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltzy0H4qBSh4yO/VhzoIGWS68+qeUgwNUrDl8KtXEwxMouHysHAkBi2Ezu3dcDEGH3TG7+KVRwwRWrLo75xNEA1Ppe/2snUfBjSL1O/MeywEKHjN8N6PQQsUYbbr7aZSEw5Ep+Txt3AiBi+ByO/WhDkHHWvA7+SYSwwOUqzl8axYFQxGot/xsG8jBSx/ze/ahjQGIG7F7+OWRw0QV7Ho76RQEw5Fpt/3uG8hBTGFzu/XiDYHHWvA7t6TSQwPVKvm77tlHgg5kdnwz4AvBCh4yu/hkEELEmC16+2lUBMPRKbf87hxIQUtgsvv2IU0Bx9txO/kkEcLElSz5O6uWhQMTKHc8LBxIwQpfsxx3hABCfJB4cEBAgUJBgcHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==');
    }
  }, []);

  // Request wake lock when timer starts, release when it stops
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isRunning) {
          wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
          console.log('Wake Lock activated');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        } catch (err) {
          console.log('Wake Lock release error:', err);
        }
      }
    };

    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isRunning]);

  // Play bell sound
  const playBell = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Check for bell times (60, 70, 75 seconds, then loop)
          const timeInCycle = newSeconds % 75;
          if (timeInCycle === 60 || timeInCycle === 70 || timeInCycle === 0) {
            playBell();
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      // Stop button - reset timer
      setIsRunning(false);
      setSeconds(0);
    } else {
      // Start button
      setIsRunning(true);
    }
  };

  const getNextBellTime = (currentSeconds: number): number => {
    const timeInCycle = currentSeconds % 75;
    
    if (timeInCycle < 60) {
      return 60 - timeInCycle; // Time until first bell at 60s
    } else if (timeInCycle < 70) {
      return 70 - timeInCycle; // Time until second bell at 70s
    } else {
      return 75 - timeInCycle; // Time until third bell at 75s
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-12 w-full max-w-md text-center">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Interval Timer</h1>
        
        <div className="mb-6 sm:mb-12">
          <div className="font-mono font-bold text-indigo-600 mb-2 sm:mb-4 leading-none whitespace-nowrap flex justify-center" style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)' }}>
            {formatTime(seconds)}
          </div>
          <div className="text-sm sm:text-lg text-gray-600 font-medium">
            Next bell in {getNextBellTime(seconds)}s
          </div>
        </div>
        
        <button
          onClick={toggleTimer}
          className={`w-full py-5 sm:py-6 px-6 rounded-2xl text-xl sm:text-3xl font-bold transition-all duration-200 active:scale-95 touch-manipulation ${
            isRunning
              ? 'bg-red-500 active:bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-indigo-500 active:bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
          }`}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        
        <div className="mt-4 sm:mt-8 text-xs sm:text-sm text-gray-400">
          Bells at 60s, 70s, and 75s
        </div>
      </div>
    </div>
  );
}