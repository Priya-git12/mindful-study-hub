import { useState, useEffect, useRef } from "react";

interface TimerState {
  time: number;
  isTracking: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number;
  lastUpdate: number;
}

const STORAGE_KEY = "mindsync-timer-state";

export function usePersistentTimer() {
  const [time, setTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);
        
        // If timer was running, calculate elapsed time since last update
        if (state.isTracking && !state.isPaused && state.lastUpdate) {
          const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
          setTime(state.time + elapsed);
        } else {
          setTime(state.time);
        }
        
        setIsTracking(state.isTracking);
        setIsPaused(state.isPaused);
      } catch (e) {
        console.error("Failed to parse timer state:", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: TimerState = {
      time,
      isTracking,
      isPaused,
      startTime: isTracking ? Date.now() : null,
      pausedTime: isPaused ? time : 0,
      lastUpdate: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [time, isTracking, isPaused]);

  // Timer logic
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, isPaused]);

  const start = () => {
    setIsTracking(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const stop = () => {
    setIsTracking(false);
    setIsPaused(false);
    setTime(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const reset = () => {
    setTime(0);
    setIsTracking(false);
    setIsPaused(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    time,
    isTracking,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
