import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface StudySession {
  id: string;
  user_id: string;
  login_timestamp: string;
  logout_timestamp: string | null;
  duration_seconds: number | null;
  subjects_studied: string[] | null;
  notes: string | null;
  emotion_detected: string | null;
}

export function useStudySession() {
  const { user, isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const sessionCreatedRef = useRef(false);

  // Create a new session when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !sessionCreatedRef.current) {
      createSession();
    }
  }, [isAuthenticated, user]);

  const createSession = async () => {
    if (!user || sessionCreatedRef.current) return;
    
    sessionCreatedRef.current = true;
    setIsCreatingSession(true);

    try {
      const loginTimestamp = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          login_timestamp: loginTimestamp,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create study session:", error);
        sessionCreatedRef.current = false;
        return;
      }

      setCurrentSession(data);
      console.log("Study session created:", data.id);
    } catch (err) {
      console.error("Error creating session:", err);
      sessionCreatedRef.current = false;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const updateSession = async (updates: {
    duration_seconds?: number;
    subjects_studied?: string[];
    notes?: string;
    emotion_detected?: string;
  }) => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .update(updates)
        .eq("id", currentSession.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update session:", error);
        return;
      }

      setCurrentSession(data);
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const endSession = async (durationSeconds?: number) => {
    if (!currentSession) return;

    try {
      const logoutTimestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from("study_sessions")
        .update({
          logout_timestamp: logoutTimestamp,
          duration_seconds: durationSeconds,
        })
        .eq("id", currentSession.id);

      if (error) {
        console.error("Failed to end session:", error);
        return;
      }

      setCurrentSession(null);
      sessionCreatedRef.current = false;
      console.log("Study session ended");
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  const getUserSessions = async (): Promise<StudySession[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error fetching sessions:", err);
      return [];
    }
  };

  return {
    currentSession,
    isCreatingSession,
    createSession,
    updateSession,
    endSession,
    getUserSessions,
  };
}
