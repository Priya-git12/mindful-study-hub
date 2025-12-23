import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WellbeingStats {
  wellnessScore: number;
  burnoutRisk: string;
  breakEfficiency: number;
  avgFocusLevel: number;
  avgStressLevel: number;
  moodTrends: { mood: string; count: number }[];
  weeklyEmotions: { day: string; focus: number; stress: number; mood: string }[];
  focusTrend: number[];
  stressTrend: number[];
  totalBreakTime: number;
  totalStudyTime: number;
  emotionDistribution: { emotion: string; percentage: number }[];
}

export interface WeeklyAnalytics {
  totalStudyHours: number;
  completionRate: number;
  avgFocusLevel: number;
  avgStressLevel: number;
  breakVsStudyRatio: number;
  dailyBreakdown: { day: string; studyHours: number; breakHours: number; sessions: number }[];
  emotionTrends: { day: string; emotion: string; focus: number; stress: number }[];
  subjectDistribution: { subject: string; hours: number }[];
}

export function useWellbeingStats() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<WellbeingStats>({
    wellnessScore: 0,
    burnoutRisk: "Low",
    breakEfficiency: 0,
    avgFocusLevel: 0,
    avgStressLevel: 0,
    moodTrends: [],
    weeklyEmotions: [],
    focusTrend: [],
    stressTrend: [],
    totalBreakTime: 0,
    totalStudyTime: 0,
    emotionDistribution: [],
  });
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics>({
    totalStudyHours: 0,
    completionRate: 0,
    avgFocusLevel: 0,
    avgStressLevel: 0,
    breakVsStudyRatio: 0,
    dailyBreakdown: [],
    emotionTrends: [],
    subjectDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekStartStr = weekStart.toISOString();

      // Fetch emotion logs for the past week
      const { data: emotions, error: emotionsError } = await supabase
        .from("emotion_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekStartStr)
        .order("created_at", { ascending: true });

      if (emotionsError) console.error("Error fetching emotions:", emotionsError);

      // Fetch study sessions for the past week
      const { data: sessions, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekStartStr)
        .order("created_at", { ascending: false });

      if (sessionsError) console.error("Error fetching sessions:", sessionsError);

      // Fetch completions for the week
      const { data: completions, error: completionsError } = await supabase
        .from("schedule_session_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekStartStr);

      if (completionsError) console.error("Error fetching completions:", completionsError);

      // Fetch active schedule
      const { data: schedule } = await supabase
        .from("study_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      const emotionsList = emotions || [];
      const sessionsList = sessions || [];
      const completionsList = completions || [];

      // Calculate focus and stress averages
      const focusLevels = emotionsList.filter(e => e.focus_level).map(e => e.focus_level!);
      const stressLevels = emotionsList.filter(e => e.stress_level).map(e => e.stress_level!);
      
      const avgFocusLevel = focusLevels.length > 0 
        ? Math.round(focusLevels.reduce((a, b) => a + b, 0) / focusLevels.length) 
        : 0;
      const avgStressLevel = stressLevels.length > 0 
        ? Math.round(stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length) 
        : 0;

      // Mood trends
      const moodCounts: Record<string, number> = {};
      emotionsList.forEach(e => {
        const mood = e.mood || e.emotion;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      const moodTrends = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count);

      // Weekly emotions by day
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyEmotions = dayNames.map(day => {
        const dayEmotions = emotionsList.filter(e => {
          const d = new Date(e.created_at);
          return dayNames[d.getDay()] === day;
        });
        const dayFocus = dayEmotions.filter(e => e.focus_level).map(e => e.focus_level!);
        const dayStress = dayEmotions.filter(e => e.stress_level).map(e => e.stress_level!);
        const dominantMood = dayEmotions.length > 0 ? dayEmotions[dayEmotions.length - 1].emotion : "neutral";
        
        return {
          day,
          focus: dayFocus.length > 0 ? Math.round(dayFocus.reduce((a, b) => a + b, 0) / dayFocus.length) : 0,
          stress: dayStress.length > 0 ? Math.round(dayStress.reduce((a, b) => a + b, 0) / dayStress.length) : 0,
          mood: dominantMood,
        };
      });

      // Focus and stress trends (last 7 data points)
      const focusTrend = focusLevels.slice(-7);
      const stressTrend = stressLevels.slice(-7);

      // Total study time
      const totalStudyTime = sessionsList.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      
      // Estimate break time (20% of study time as standard Pomodoro)
      const totalBreakTime = Math.round(totalStudyTime * 0.2);

      // Emotion distribution
      const emotionCounts: Record<string, number> = {};
      emotionsList.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });
      const totalEmotions = emotionsList.length || 1;
      const emotionDistribution = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({
          emotion,
          percentage: Math.round((count / totalEmotions) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Calculate wellness score (0-100)
      const focusContrib = avgFocusLevel * 0.4;
      const stressContrib = (100 - avgStressLevel) * 0.3;
      const consistencyContrib = Math.min(emotionsList.length * 5, 30);
      const wellnessScore = Math.round(focusContrib + stressContrib + consistencyContrib);

      // Burnout risk based on stress and study patterns
      let burnoutRisk = "Low";
      if (avgStressLevel > 70 || totalStudyTime > 25 * 3600) {
        burnoutRisk = "High";
      } else if (avgStressLevel > 50 || totalStudyTime > 20 * 3600) {
        burnoutRisk = "Medium";
      }

      // Break efficiency
      const breakEfficiency = totalStudyTime > 0 
        ? Math.min(Math.round((totalBreakTime / (totalStudyTime * 0.25)) * 100), 100)
        : 0;

      setStats({
        wellnessScore,
        burnoutRisk,
        breakEfficiency,
        avgFocusLevel,
        avgStressLevel,
        moodTrends,
        weeklyEmotions,
        focusTrend,
        stressTrend,
        totalBreakTime,
        totalStudyTime,
        emotionDistribution,
      });

      // Weekly Analytics
      const totalStudyHours = totalStudyTime / 3600;
      
      // Completion rate
      let plannedSessions = 0;
      if (schedule) {
        const weeklyPlan = schedule.weekly_plan as unknown as Array<{ sessions: unknown[] }>;
        plannedSessions = weeklyPlan?.reduce((acc, day) => acc + (day.sessions?.length || 0), 0) || 0;
      }
      const completionRate = plannedSessions > 0 
        ? Math.round((completionsList.length / plannedSessions) * 100) 
        : 0;

      // Daily breakdown
      const dailyBreakdown = dayNames.map(day => {
        const daySessions = sessionsList.filter(s => {
          const d = new Date(s.created_at);
          return dayNames[d.getDay()] === day;
        });
        const studySeconds = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        const breakSeconds = Math.round(studySeconds * 0.2);
        
        return {
          day,
          studyHours: Math.round((studySeconds / 3600) * 10) / 10,
          breakHours: Math.round((breakSeconds / 3600) * 10) / 10,
          sessions: daySessions.length,
        };
      });

      // Emotion trends by day
      const emotionTrends = weeklyEmotions.map(we => ({
        day: we.day,
        emotion: we.mood,
        focus: we.focus,
        stress: we.stress,
      }));

      // Subject distribution
      const subjectHours: Record<string, number> = {};
      completionsList.forEach(c => {
        const hours = c.duration_seconds / 3600;
        subjectHours[c.subject] = (subjectHours[c.subject] || 0) + hours;
      });
      const subjectDistribution = Object.entries(subjectHours)
        .map(([subject, hours]) => ({
          subject,
          hours: Math.round(hours * 10) / 10,
        }))
        .sort((a, b) => b.hours - a.hours);

      setWeeklyAnalytics({
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        completionRate,
        avgFocusLevel,
        avgStressLevel,
        breakVsStudyRatio: totalStudyTime > 0 ? Math.round((totalBreakTime / totalStudyTime) * 100) : 20,
        dailyBreakdown,
        emotionTrends,
        subjectDistribution,
      });

    } catch (err) {
      console.error("Error fetching wellbeing stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats();
    }
  }, [isAuthenticated, user, fetchStats]);

  return {
    stats,
    weeklyAnalytics,
    loading,
    refetch: fetchStats,
  };
}
