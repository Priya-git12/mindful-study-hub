import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DaySummary {
  state: 'motivated' | 'tired_but_consistent' | 'stressed' | 'proud' | 'discouraged' | 'balanced' | 'recovering' | 'strong_start';
  studyHours: number;
  goalHours: number;
  completedSessions: number;
  totalSessions: number;
  dominantEmotion: string | null;
  avgFocus: number;
  avgStress: number;
  emotionCount: number;
  message: string;
  closingLine: string;
}

const SUMMARY_STORAGE_KEY = 'mindsync_last_summary_date';

export function useEndOfDaySummary() {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateMessage = (data: Omit<DaySummary, 'message' | 'closingLine' | 'state'>): { state: DaySummary['state']; message: string; closingLine: string } => {
    const { studyHours, goalHours, completedSessions, totalSessions, dominantEmotion, avgFocus, avgStress, emotionCount } = data;
    
    const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
    const goalReached = goalHours > 0 ? studyHours >= goalHours * 0.8 : studyHours > 0;
    const isStressed = avgStress >= 7;
    const isFocused = avgFocus >= 6;
    const hasEmotionData = emotionCount > 0;

    // Determine state based on combined analysis
    let state: DaySummary['state'] = 'balanced';
    let message = '';
    let closingLine = '';

    if (isStressed && completionRate < 0.5) {
      state = 'stressed';
      message = `Today felt heavy, and that's okay. You showed up despite the stress, and that takes real courage. ${studyHours > 0 ? `You still put in ${studyHours.toFixed(1)} hours of effort.` : 'Sometimes rest is the most productive choice.'}`;
      closingLine = "Tomorrow is a fresh start. Be gentle with yourself tonight. 🌙";
    } else if (completionRate >= 0.8 && goalReached) {
      state = 'proud';
      message = `What an amazing day! You completed ${completedSessions} of ${totalSessions} sessions and studied for ${studyHours.toFixed(1)} hours. Your dedication really shows.`;
      closingLine = "You should feel proud of yourself. Rest well, champion! ⭐";
    } else if (completionRate >= 0.6 && isFocused) {
      state = 'motivated';
      message = `Great focus today! You maintained strong concentration throughout your ${studyHours.toFixed(1)} hours of study. ${completedSessions > 0 ? `Completed ${completedSessions} sessions with purpose.` : ''}`;
      closingLine = "Keep this momentum going! You're on a great path. 🚀";
    } else if (studyHours > 0 && completionRate < 0.5 && !isStressed) {
      state = 'tired_but_consistent';
      message = `You might not have hit every goal today, but you showed up. ${studyHours.toFixed(1)} hours of effort is still progress. Consistency matters more than perfection.`;
      closingLine = "Every step forward counts. Sleep well and recharge. 💪";
    } else if (studyHours === 0 && hasEmotionData) {
      state = 'recovering';
      message = `Today was a rest day, and that's perfectly valid. Your emotions tell a story, and sometimes we need to pause. ${dominantEmotion ? `Feeling "${dominantEmotion}" is part of your journey.` : ''}`;
      closingLine = "Rest is part of growth. Tomorrow awaits with new energy. 🌱";
    } else if (completionRate < 0.3 && goalHours > 0) {
      state = 'discouraged';
      message = `Today didn't go as planned, but setbacks don't define you. You're still here, still trying. That resilience is what matters most.`;
      closingLine = "One tough day doesn't erase your progress. You've got this. 💜";
    } else if (studyHours > 0 && !hasEmotionData) {
      state = 'strong_start';
      message = `You put in ${studyHours.toFixed(1)} hours of study today. ${completedSessions > 0 ? `Completed ${completedSessions} sessions.` : ''} Nice work showing up for yourself!`;
      closingLine = "Keep building those habits! You're doing great. ✨";
    } else {
      state = 'balanced';
      message = `Today was a balanced day. ${studyHours > 0 ? `You studied for ${studyHours.toFixed(1)} hours` : 'You took time for yourself'}${hasEmotionData ? ` and checked in with your feelings` : ''}. That's healthy progress.`;
      closingLine = "Balance is the key to long-term success. Well done! 🌟";
    }

    return { state, message, closingLine };
  };

  const fetchDaySummary = useCallback(async (): Promise<DaySummary | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Fetch today's study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", `${todayStr}T00:00:00`)
        .lte("created_at", `${todayStr}T23:59:59`);

      // Fetch today's emotion logs
      const { data: emotions } = await supabase
        .from("emotion_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", `${todayStr}T00:00:00`)
        .lte("created_at", `${todayStr}T23:59:59`);

      // Fetch today's schedule completions
      const { data: completions } = await supabase
        .from("schedule_session_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", `${todayStr}T00:00:00`)
        .lte("created_at", `${todayStr}T23:59:59`);

      // Fetch active schedule for goal info
      const { data: schedule } = await supabase
        .from("study_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      // Calculate study hours
      const studyHours = (sessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 3600;

      // Calculate goal from schedule
      let goalHours = 0;
      let totalSessions = 0;
      if (schedule) {
        const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
        const weeklyPlan = schedule.weekly_plan as unknown as Array<{ day: string; sessions: Array<{ duration: number }> }>;
        const todayPlan = weeklyPlan?.find((d) => d.day.toLowerCase() === todayName.toLowerCase());
        if (todayPlan?.sessions) {
          totalSessions = todayPlan.sessions.length;
          goalHours = todayPlan.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60; // duration is in minutes
        }
      }

      const completedSessions = (completions || []).length;

      // Analyze emotions
      const emotionsList = emotions || [];
      const emotionCounts: Record<string, number> = {};
      let focusSum = 0, focusCount = 0, stressSum = 0, stressCount = 0;

      emotionsList.forEach((e) => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
        if (e.focus_level) { focusSum += e.focus_level; focusCount++; }
        if (e.stress_level) { stressSum += e.stress_level; stressCount++; }
      });

      const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const avgFocus = focusCount > 0 ? focusSum / focusCount : 5;
      const avgStress = stressCount > 0 ? stressSum / stressCount : 3;

      const baseData = {
        studyHours,
        goalHours,
        completedSessions,
        totalSessions,
        dominantEmotion,
        avgFocus,
        avgStress,
        emotionCount: emotionsList.length,
      };

      const { state, message, closingLine } = generateMessage(baseData);

      return {
        ...baseData,
        state,
        message,
        closingLine,
      };
    } catch (err) {
      console.error("Error fetching day summary:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkAndShowSummary = useCallback(async () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Show summary after 8 PM (20:00)
    if (hour < 20) return;

    const today = now.toISOString().split("T")[0];
    const lastShown = localStorage.getItem(SUMMARY_STORAGE_KEY);

    // Don't show if already shown today
    if (lastShown === today) return;

    const summaryData = await fetchDaySummary();
    if (summaryData) {
      setSummary(summaryData);
      setShowPopup(true);
    }
  }, [fetchDaySummary]);

  const dismissSummary = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(SUMMARY_STORAGE_KEY, today);
    setShowPopup(false);
  }, []);

  // Force show for testing/manual trigger
  const showSummaryNow = useCallback(async () => {
    const summaryData = await fetchDaySummary();
    if (summaryData) {
      setSummary(summaryData);
      setShowPopup(true);
    }
  }, [fetchDaySummary]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check on mount and every 30 minutes
      checkAndShowSummary();
      const interval = setInterval(checkAndShowSummary, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, checkAndShowSummary]);

  return {
    summary,
    showPopup,
    loading,
    dismissSummary,
    showSummaryNow,
  };
}
