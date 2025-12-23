import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface EmotionLog {
  id: string;
  user_id: string;
  session_id: string | null;
  emotion: string;
  confidence: number;
  focus_level: number | null;
  stress_level: number | null;
  mood: string | null;
  notes: string | null;
  source: string;
  created_at: string;
}

export interface EmotionStats {
  latestEmotion: string | null;
  avgFocusLevel: number;
  avgStressLevel: number;
  emotionCounts: Record<string, number>;
  totalLogs: number;
}

export function useEmotionLogs() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmotionLogs = useCallback(async (limit?: number) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("emotion_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching emotion logs:", error);
        return;
      }

      setEmotionLogs(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEmotionLogs(50);
    }
  }, [isAuthenticated, user, fetchEmotionLogs]);

  const logEmotion = async (
    emotion: string,
    confidence: number,
    options?: {
      sessionId?: string;
      focusLevel?: number;
      stressLevel?: number;
      mood?: string;
      notes?: string;
      source?: string;
    }
  ): Promise<EmotionLog | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("emotion_logs")
        .insert({
          user_id: user.id,
          emotion,
          confidence,
          session_id: options?.sessionId || null,
          focus_level: options?.focusLevel || null,
          stress_level: options?.stressLevel || null,
          mood: options?.mood || null,
          notes: options?.notes || null,
          source: options?.source || "manual",
        })
        .select()
        .single();

      if (error) {
        console.error("Error logging emotion:", error);
        toast({
          title: "Failed to save emotion",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      setEmotionLogs((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  };

  const getEmotionStats = useCallback((): EmotionStats => {
    if (emotionLogs.length === 0) {
      return {
        latestEmotion: null,
        avgFocusLevel: 0,
        avgStressLevel: 0,
        emotionCounts: {},
        totalLogs: 0,
      };
    }

    const emotionCounts: Record<string, number> = {};
    let focusSum = 0;
    let focusCount = 0;
    let stressSum = 0;
    let stressCount = 0;

    emotionLogs.forEach((log) => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;

      if (log.focus_level) {
        focusSum += log.focus_level;
        focusCount++;
      }

      if (log.stress_level) {
        stressSum += log.stress_level;
        stressCount++;
      }
    });

    return {
      latestEmotion: emotionLogs[0]?.emotion || null,
      avgFocusLevel: focusCount > 0 ? Math.round(focusSum / focusCount) : 0,
      avgStressLevel: stressCount > 0 ? Math.round(stressSum / stressCount) : 0,
      emotionCounts,
      totalLogs: emotionLogs.length,
    };
  }, [emotionLogs]);

  const getTodaysEmotions = useCallback((): EmotionLog[] => {
    const today = new Date().toDateString();
    return emotionLogs.filter(
      (log) => new Date(log.created_at).toDateString() === today
    );
  }, [emotionLogs]);

  return {
    emotionLogs,
    loading,
    logEmotion,
    getEmotionStats,
    getTodaysEmotions,
    refetch: fetchEmotionLogs,
  };
}
