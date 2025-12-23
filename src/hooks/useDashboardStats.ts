import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardStats {
  focusScore: number;
  studyTimeToday: number;
  studyTimeYesterday: number;
  weeklyStudyTime: number;
  weeklyGoal: number;
  currentMood: string | null;
  completedSessionsToday: number;
  totalSessionsToday: number;
  subjectBreakdown: { subject: string; hours: number }[];
  weeklyProgress: { day: string; hours: number }[];
  recentActivity: { subject: string; duration: string; time: string }[];
}

export function useDashboardStats() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    focusScore: 0,
    studyTimeToday: 0,
    studyTimeYesterday: 0,
    weeklyStudyTime: 0,
    weeklyGoal: 40,
    currentMood: null,
    completedSessionsToday: 0,
    totalSessionsToday: 0,
    subjectBreakdown: [],
    weeklyProgress: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);

      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const weekStartStr = weekStart.toISOString().split("T")[0];

      // Fetch study sessions for the past week
      const { data: sessions, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekStartStr)
        .order("created_at", { ascending: false });

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
      }

      // Fetch emotion logs
      const { data: emotions, error: emotionsError } = await supabase
        .from("emotion_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (emotionsError) {
        console.error("Error fetching emotions:", emotionsError);
      }

      // Fetch schedule completions
      const { data: completions, error: completionsError } = await supabase
        .from("schedule_session_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekStartStr);

      if (completionsError) {
        console.error("Error fetching completions:", completionsError);
      }

      // Fetch active schedule for today's goals
      const { data: schedule, error: scheduleError } = await supabase
        .from("study_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
      }

      // Calculate stats
      const sessionsList = sessions || [];
      const completionsList = completions || [];

      // Study time calculations
      let studyTimeToday = 0;
      let studyTimeYesterday = 0;
      let weeklyStudyTime = 0;
      const subjectHours: Record<string, number> = {};
      const dailyHours: Record<string, number> = {};
      const recentActivity: { subject: string; duration: string; time: string }[] = [];

      sessionsList.forEach((session) => {
        const sessionDate = session.created_at.split("T")[0];
        const duration = session.duration_seconds || 0;
        const durationHours = duration / 3600;

        weeklyStudyTime += duration;

        if (sessionDate === todayStr) {
          studyTimeToday += duration;
        }

        if (sessionDate === yesterdayStr) {
          studyTimeYesterday += duration;
        }

        // Subject breakdown
        const subjects = session.subjects_studied || [];
        subjects.forEach((subject: string) => {
          subjectHours[subject] = (subjectHours[subject] || 0) + durationHours / subjects.length;
        });

        // Daily progress
        const dayName = new Date(session.created_at).toLocaleDateString("en-US", { weekday: "short" });
        dailyHours[dayName] = (dailyHours[dayName] || 0) + durationHours;
      });

      // Recent activity from completions
      completionsList.slice(0, 5).forEach((completion) => {
        const hours = Math.floor(completion.duration_seconds / 3600);
        const minutes = Math.floor((completion.duration_seconds % 3600) / 60);
        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        const time = new Date(completion.completed_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        recentActivity.push({
          subject: completion.subject,
          duration,
          time,
        });
      });

      // Calculate today's session progress from schedule
      let completedSessionsToday = 0;
      let totalSessionsToday = 0;

      if (schedule) {
        const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
        const weeklyPlan = schedule.weekly_plan as unknown as Array<{ day: string; sessions: unknown[] }>;
        const todayPlan = weeklyPlan?.find((d) => d.day.toLowerCase() === todayName.toLowerCase());
        
        if (todayPlan) {
          totalSessionsToday = todayPlan.sessions?.length || 0;
          completedSessionsToday = completionsList.filter(
            (c) => c.day.toLowerCase() === todayName.toLowerCase() && 
                   c.created_at.split("T")[0] === todayStr
          ).length;
        }
      }

      // Focus score based on completion rate and consistency
      const focusScore = totalSessionsToday > 0 
        ? Math.round((completedSessionsToday / totalSessionsToday) * 100)
        : sessionsList.length > 0 ? 75 : 0;

      // Weekly progress array
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weeklyProgress = weekDays.map((day) => ({
        day,
        hours: Math.round((dailyHours[day] || 0) * 10) / 10,
      }));

      // Subject breakdown array
      const subjectBreakdown = Object.entries(subjectHours)
        .map(([subject, hours]) => ({
          subject,
          hours: Math.round(hours * 10) / 10,
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 6);

      // Current mood from latest emotion log
      const currentMood = emotions?.[0]?.emotion || null;

      setStats({
        focusScore,
        studyTimeToday,
        studyTimeYesterday,
        weeklyStudyTime,
        weeklyGoal: 40 * 3600, // 40 hours in seconds
        currentMood,
        completedSessionsToday,
        totalSessionsToday,
        subjectBreakdown,
        weeklyProgress,
        recentActivity,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats();
    }
  }, [isAuthenticated, user, fetchStats]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}.${Math.round((minutes / 60) * 10)}h`;
    }
    return `${minutes}m`;
  };

  const getStudyTimeDiff = (): string => {
    const diff = stats.studyTimeToday - stats.studyTimeYesterday;
    const diffMinutes = Math.abs(Math.round(diff / 60));
    
    if (diffMinutes === 0) return "Same as yesterday";
    return diff > 0 
      ? `+${diffMinutes}min from yesterday` 
      : `-${diffMinutes}min from yesterday`;
  };

  const getWeeklyProgressPercentage = (): number => {
    return Math.min(Math.round((stats.weeklyStudyTime / stats.weeklyGoal) * 100), 100);
  };

  return {
    stats,
    loading,
    formatDuration,
    getStudyTimeDiff,
    getWeeklyProgressPercentage,
    refetch: fetchStats,
  };
}
