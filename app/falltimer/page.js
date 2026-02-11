// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';

// export default function FallTimer() {
//   const [isRunning, setIsRunning] = useState<boolean>(false);
//   const [seconds, setSeconds] = useState<number>(0);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const wakeLockRef = useRef<WakeLockSentinel | null>(null);
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   // Initialize audio elements
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Xander's gong sound (mp3 file) - bell.mp3
//       const audio = new Audio('/bell.mp3');
//       audio.preload = 'auto';
//       audioRef.current = audio;
      
//       // Yusuf's synthesized ding (Web Audio API)
//       const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
//       audioContextRef.current = new AudioContextConstructor();
//     }
//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//       }
//     };
//   }, []);

//   // Function to unlock/prepare all audio - call on every user interaction
//   const unlockAudio = useCallback(async () => {
//     // Unlock AudioContext
//     if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
//       try {
//         await audioContextRef.current.resume();
//       } catch (err) {
//         console.log('AudioContext resume error:', err);
//       }
//     }
    
//     // Prepare HTML Audio element (without playing audibly)
//     if (audioRef.current) {
//       try {
//         audioRef.current.load();
//       } catch (err) {
//         console.log('Audio load error:', err);
//       }
//     }
//   }, []);

//   // Request wake lock when timer starts, release when it stops
//   useEffect(() => {
//     const requestWakeLock = async () => {
//       try {
//         if ('wakeLock' in navigator && isRunning && navigator.wakeLock) {
//           wakeLockRef.current = await navigator.wakeLock.request('screen');
//         }
//       } catch (err) {
//         console.log('Wake Lock error:', err);
//       }
      
//       if (videoRef.current && isRunning) {
//         videoRef.current.play().catch(err => console.log('Video play error:', err));
//       }
//     };

//     const releaseWakeLock = async () => {
//       if (wakeLockRef.current) {
//         try {
//           await wakeLockRef.current.release();
//           wakeLockRef.current = null;
//         } catch (err) {
//           console.log('Wake Lock release error:', err);
//         }
//       }
      
//       if (videoRef.current) {
//         videoRef.current.pause();
//       }
//     };

//     if (isRunning) {
//       requestWakeLock();
//     } else {
//       releaseWakeLock();
//     }

//     return () => {
//       releaseWakeLock();
//     };
//   }, [isRunning]);

//   // Play Xander's gong sound (bell.mp3) - for 30s and 60s
//   const playXanderGong = useCallback(() => {
//     if (!audioRef.current) return;
    
//     audioRef.current.currentTime = 0;
//     audioRef.current.play().catch(err => console.error('Audio play error:', err));
//   }, []);

//   // Play Yusuf's synthesized ding - for 10s and 20s
//   const playYusufDing = useCallback(() => {
//     if (!audioContextRef.current) return;
    
//     const ctx = audioContextRef.current;
    
//     if (ctx.state === 'suspended') {
//       ctx.resume();
//     }
    
//     const oscillator = ctx.createOscillator();
//     const gainNode = ctx.createGain();
    
//     oscillator.connect(gainNode);
//     gainNode.connect(ctx.destination);
    
//     oscillator.frequency.value = 800;
//     oscillator.type = 'sine';
    
//     gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
//     oscillator.start(ctx.currentTime);
//     oscillator.stop(ctx.currentTime + 0.5);
//   }, []);

//   // Timer logic - using refs to avoid stale closures
//   const playXanderGongRef = useRef(playXanderGong);
//   const playYusufDingRef = useRef(playYusufDing);
  
//   useEffect(() => {
//     playXanderGongRef.current = playXanderGong;
//     playYusufDingRef.current = playYusufDing;
//   }, [playXanderGong, playYusufDing]);

//   useEffect(() => {
//     let interval: NodeJS.Timeout | null = null;
    
//     if (isRunning) {
//       interval = setInterval(() => {
//         setSeconds(prevSeconds => {
//           const newSeconds = prevSeconds + 1;
          
//           // Sound times: 10s & 20s = Yusuf ding, 30s & 60s = Xander gong
//           if (newSeconds === 10 || newSeconds === 20) {
//             playYusufDingRef.current();
//           } else if (newSeconds === 30 || newSeconds === 60) {
//             playXanderGongRef.current();
//           }
          
//           // Auto-stop at 120 seconds
//           if (newSeconds >= 120) {
//             setIsRunning(false);
//             return 0;
//           }
          
//           return newSeconds;
//         });
//       }, 1000);
//     }
    
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isRunning]);

//   const toggleTimer = async () => {
//     // Always unlock audio on any button press
//     await unlockAudio();
    
//     if (isRunning) {
//       setIsRunning(false);
//       setSeconds(0);
//     } else {
//       setIsRunning(true);
//     }
//   };

//   const getNextSoundTime = (currentSeconds: number): number => {
//     if (currentSeconds < 10) {
//       return 10 - currentSeconds;
//     } else if (currentSeconds < 20) {
//       return 20 - currentSeconds;
//     } else if (currentSeconds < 30) {
//       return 30 - currentSeconds;
//     } else if (currentSeconds < 60) {
//       return 60 - currentSeconds;
//     } else {
//       return 120 - currentSeconds;
//     }
//   };

//   const getStatus = (currentSeconds: number): { deduction: string; terminate: boolean } => {
//     if (currentSeconds >= 60) {
//       return { deduction: '', terminate: true };
//     } else if (currentSeconds >= 30) {
//       return { deduction: '-0.3', terminate: false };
//     }
//     return { deduction: '', terminate: false };
//   };

//   const status = getStatus(seconds);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-3 sm:p-6">
//       <video
//         ref={videoRef}
//         loop
//         muted
//         playsInline
//         className="hidden"
//         src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyA1YzY1NzA0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAA/GWIhAAR//73hYmCUC5VXkjQXCrQNyA5kCnhqLs0AAAAMQZ+kQAH//7hYlH/93+f/6QvJwdwEEBN3LfWx94Aw8b/wQEwAAE5ASaAAA0="
//       />
      
//       <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-12 w-full max-w-md text-center">
//         <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Fall Timer</h1>
        
//         <div className="mb-6 sm:mb-12">
//           <div className="font-mono font-bold text-amber-600 mb-2 sm:mb-4 leading-none whitespace-nowrap flex justify-center items-baseline gap-4" style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)' }}>
//             <span>{seconds}s</span>
//             {status.deduction && (
//               <span className="text-red-500" style={{ fontSize: 'clamp(2rem, 9vw, 4rem)' }}>
//                 {status.deduction}
//               </span>
//             )}
//             {status.terminate && (
//               <span className="text-red-600 font-bold" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>
//                 Terminate
//               </span>
//             )}
//           </div>
//           <div className="text-sm sm:text-lg text-gray-600 font-medium">
//             {seconds < 60 ? `Next sound in ${getNextSoundTime(seconds)}s` : `Resets in ${getNextSoundTime(seconds)}s`}
//           </div>
//         </div>
        
//         <button
//           onClick={toggleTimer}
//           className={`w-full py-5 sm:py-6 px-6 rounded-2xl text-xl sm:text-3xl font-bold transition-all duration-200 active:scale-95 touch-manipulation ${
//             isRunning
//               ? 'bg-red-500 active:bg-red-600 text-white shadow-lg shadow-red-500/50'
//               : 'bg-amber-500 active:bg-amber-600 text-white shadow-lg shadow-amber-500/50'
//           }`}
//         >
//           {isRunning ? 'Stop' : 'Start'}
//         </button>
        
//         <div className="mt-4 sm:mt-8 text-xs sm:text-sm text-gray-400">
//           🎵 10s & 20s (ding) • 🔔 30s (-0.3) & 60s (Terminate) • Auto-reset at 120s
//         </div>
//       </div>
//     </div>
//   );
// }