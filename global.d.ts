declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }

  interface WakeLockSentinel {
    release: () => Promise<void>;
    released: boolean;
    onrelease?: () => void;
  }

  interface Navigator {
    wakeLock?: {
      request: (type: "screen") => Promise<WakeLockSentinel>;
    };
  }
}

export {};
