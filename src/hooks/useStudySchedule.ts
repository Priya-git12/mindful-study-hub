import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { Json } from "@/integrations/supabase/types";

interface ScheduleSession {
  time: string;
  subject: string;
  topic: string;
  type: string;
}

interface DayPlan {
  day: string;
  sessions: ScheduleSession[];
}

interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
  deadline?: string;
}

export interface StudySchedule {
  id: string;
  user_id: string;
  subjects: Subject[];
  weekly_plan: DayPlan[];
  total_hours: number;
  tips: string[];
  priorities: string[];
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "expired";
  created_at: string;
  updated_at: string;
}

export interface SessionCompletion {
  id: string;
  user_id: string;
  schedule_id: string;
  day: string;
  session_index: number;
  subject: string;
  duration_seconds: number;
  completed_at: string;
}

export function useStudySchedule() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeSchedule, setActiveSchedule] = useState<StudySchedule | null>(null);
  const [completions, setCompletions] = useState<SessionCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active schedule on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchActiveSchedule();
    }
  }, [isAuthenticated, user]);

  const fetchActiveSchedule = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Expire old schedules
      await supabase
        .from("study_schedules")
        .update({ status: "expired" })
        .eq("user_id", user.id)
        .eq("status", "active")
        .lt("end_date", today);

      // Fetch current active schedule
      const { data, error } = await supabase
        .from("study_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("end_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching schedule:", error);
        return;
      }

      if (data) {
        const schedule: StudySchedule = {
          id: data.id,
          user_id: data.user_id,
          subjects: data.subjects as unknown as Subject[],
          weekly_plan: data.weekly_plan as unknown as DayPlan[],
          total_hours: data.total_hours,
          tips: data.tips || [],
          priorities: data.priorities || [],
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status as "active" | "completed" | "expired",
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setActiveSchedule(schedule);
        await fetchCompletions(schedule.id);
      } else {
        setActiveSchedule(null);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async (scheduleId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("schedule_session_completions")
        .select("*")
        .eq("schedule_id", scheduleId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching completions:", error);
        return;
      }

      setCompletions(data as SessionCompletion[]);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const acceptSchedule = async (
    subjects: Subject[],
    weeklyPlan: DayPlan[],
    totalHours: number,
    tips: string[],
    priorities: string[],
    startDate: string,
    endDate: string
  ): Promise<StudySchedule | null> => {
    if (!user) return null;

    try {
      // Deactivate any existing active schedules
      await supabase
        .from("study_schedules")
        .update({ status: "completed" })
        .eq("user_id", user.id)
        .eq("status", "active");

      const { data, error } = await supabase
        .from("study_schedules")
        .insert({
          user_id: user.id,
          subjects: subjects as unknown as Json,
          weekly_plan: weeklyPlan as unknown as Json,
          total_hours: totalHours,
          tips: tips,
          priorities: priorities,
          start_date: startDate,
          end_date: endDate,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving schedule:", error);
        toast({
          title: "Failed to save schedule",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      const schedule: StudySchedule = {
        id: data.id,
        user_id: data.user_id,
        subjects: data.subjects as unknown as Subject[],
        weekly_plan: data.weekly_plan as unknown as DayPlan[],
        total_hours: data.total_hours,
        tips: data.tips || [],
        priorities: data.priorities || [],
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status as "active" | "completed" | "expired",
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setActiveSchedule(schedule);
      setCompletions([]);

      toast({
        title: "Schedule accepted!",
        description: "Your study schedule has been saved.",
      });

      return schedule;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  };

  const updateDayPlan = async (
    dayIndex: number,
    newSessions: ScheduleSession[]
  ): Promise<boolean> => {
    if (!activeSchedule || !user) return false;

    try {
      const updatedWeeklyPlan = [...activeSchedule.weekly_plan];
      updatedWeeklyPlan[dayIndex] = {
        ...updatedWeeklyPlan[dayIndex],
        sessions: newSessions,
      };

      const { error } = await supabase
        .from("study_schedules")
        .update({ weekly_plan: updatedWeeklyPlan as unknown as Json })
        .eq("id", activeSchedule.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating day plan:", error);
        toast({
          title: "Failed to update schedule",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setActiveSchedule({
        ...activeSchedule,
        weekly_plan: updatedWeeklyPlan,
      });

      toast({
        title: "Schedule updated",
        description: `${activeSchedule.weekly_plan[dayIndex].day} has been modified.`,
      });

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  const markSessionComplete = async (
    day: string,
    sessionIndex: number,
    subject: string,
    durationSeconds: number
  ): Promise<boolean> => {
    if (!activeSchedule || !user) return false;

    try {
      const { data, error } = await supabase
        .from("schedule_session_completions")
        .insert({
          user_id: user.id,
          schedule_id: activeSchedule.id,
          day,
          session_index: sessionIndex,
          subject,
          duration_seconds: durationSeconds,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already completed",
            description: "This session has already been marked as complete.",
          });
          return false;
        }
        console.error("Error marking complete:", error);
        return false;
      }

      setCompletions([...completions, data as SessionCompletion]);

      toast({
        title: "Session completed! 🎉",
        description: `Great work on ${subject}!`,
      });

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  const isSessionCompleted = (day: string, sessionIndex: number): boolean => {
    return completions.some(
      (c) => c.day === day && c.session_index === sessionIndex
    );
  };

  const getTodaysSessions = (): { sessions: ScheduleSession[]; dayIndex: number } | null => {
    if (!activeSchedule) return null;

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const dayIndex = activeSchedule.weekly_plan.findIndex(
      (d) => d.day.toLowerCase() === today.toLowerCase()
    );

    if (dayIndex === -1) return null;

    return {
      sessions: activeSchedule.weekly_plan[dayIndex].sessions,
      dayIndex,
    };
  };

  const getDailyProgress = (): {
    completed: number;
    total: number;
    subjects: { name: string; completed: boolean }[];
  } => {
    const todayData = getTodaysSessions();
    if (!todayData || !activeSchedule) {
      return { completed: 0, total: 0, subjects: [] };
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const subjects = todayData.sessions.map((session, idx) => ({
      name: session.subject,
      completed: isSessionCompleted(today, idx),
    }));

    return {
      completed: subjects.filter((s) => s.completed).length,
      total: subjects.length,
      subjects,
    };
  };

  const deleteSchedule = async (): Promise<boolean> => {
    if (!activeSchedule || !user) return false;

    try {
      const { error } = await supabase
        .from("study_schedules")
        .delete()
        .eq("id", activeSchedule.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting schedule:", error);
        return false;
      }

      setActiveSchedule(null);
      setCompletions([]);

      toast({
        title: "Schedule deleted",
        description: "You can now create a new schedule.",
      });

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  return {
    activeSchedule,
    completions,
    loading,
    acceptSchedule,
    updateDayPlan,
    markSessionComplete,
    isSessionCompleted,
    getTodaysSessions,
    getDailyProgress,
    deleteSchedule,
    refetch: fetchActiveSchedule,
  };
}
