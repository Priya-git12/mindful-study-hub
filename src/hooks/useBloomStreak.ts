import { useState, useEffect } from "react";

interface BloomStreakState {
  progress: number;
  streak: number;
  fullBloomDays: number;
  lastBloomDate: string | null;
  todayStudySeconds: number;
}

const STORAGE_KEY = "mindsync-bloom-streak";
const DAILY_GOAL_HOURS = 4; // 4 hours = 100% progress
const DAILY_GOAL_SECONDS = DAILY_GOAL_HOURS * 3600;

export function useBloomStreak() {
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [fullBloomDays, setFullBloomDays] = useState(0);
  const [todayStudySeconds, setTodayStudySeconds] = useState(0);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: BloomStreakState = JSON.parse(savedState);
        const today = new Date().toDateString();
        
        // Check if it's a new day
        if (state.lastBloomDate !== today) {
          // New day - check if we need to break the streak
          const lastDate = state.lastBloomDate ? new Date(state.lastBloomDate) : null;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
            // Continue streak from yesterday
            if (state.progress >= 100) {
              // Yesterday was a full bloom day
              setStreak(state.streak);
              setFullBloomDays(state.fullBloomDays);
            } else {
              // Streak broken
              setStreak(0);
              setFullBloomDays(state.fullBloomDays);
            }
          } else {
            // More than one day gap - reset streak
            setStreak(0);
            setFullBloomDays(state.fullBloomDays);
          }
          
          // Reset today's progress
          setProgress(0);
          setTodayStudySeconds(0);
        } else {
          // Same day - restore state
          setProgress(state.progress);
          setStreak(state.streak);
          setFullBloomDays(state.fullBloomDays);
          setTodayStudySeconds(state.todayStudySeconds);
        }
      } catch (e) {
        console.error("Failed to parse bloom streak state:", e);
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    const state: BloomStreakState = {
      progress,
      streak,
      fullBloomDays,
      lastBloomDate: new Date().toDateString(),
      todayStudySeconds,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [progress, streak, fullBloomDays, todayStudySeconds]);

  // Add study time and update progress
  const addStudyTime = (seconds: number) => {
    const newTotalSeconds = todayStudySeconds + seconds;
    setTodayStudySeconds(newTotalSeconds);
    
    const newProgress = Math.min((newTotalSeconds / DAILY_GOAL_SECONDS) * 100, 100);
    const wasFullBloom = progress >= 100;
    const isNowFullBloom = newProgress >= 100;
    
    setProgress(newProgress);
    
    // Check if we just achieved full bloom
    if (!wasFullBloom && isNowFullBloom) {
      setFullBloomDays((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    }
  };

  return {
    progress,
    streak,
    fullBloomDays,
    addStudyTime,
  };
}
