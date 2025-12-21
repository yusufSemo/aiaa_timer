'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play bell sound
  const playBell = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
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
      // Resume audio context on user interaction
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
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
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Luft Orgs Timer</h1>
        
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