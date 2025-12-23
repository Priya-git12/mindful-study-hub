import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface StudyReminder {
  id: string;
  user_id: string;
  title: string;
  time: string;
  days_of_week: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useStudyReminders() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNotifications, setActiveNotifications] = useState<Set<string>>(new Set());

  const fetchReminders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("study_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("time", { ascending: true });

      if (error) {
        console.error("Error fetching reminders:", error);
        return;
      }

      setReminders(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReminders();
    }
  }, [isAuthenticated, user, fetchReminders]);

  // Check reminders every minute
  useEffect(() => {
    if (!isAuthenticated || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false 
      });
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

      reminders.forEach((reminder) => {
        if (!reminder.is_active) return;
        if (!reminder.days_of_week.includes(currentDay)) return;

        // Compare times (format: HH:MM)
        const reminderTime = reminder.time.substring(0, 5);
        
        if (reminderTime === currentTime && !activeNotifications.has(reminder.id)) {
          // Trigger notification
          triggerNotification(reminder);
          setActiveNotifications(prev => new Set(prev).add(reminder.id));
          
          // Clear from active notifications after 1 minute
          setTimeout(() => {
            setActiveNotifications(prev => {
              const updated = new Set(prev);
              updated.delete(reminder.id);
              return updated;
            });
          }, 60000);
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [reminders, isAuthenticated, activeNotifications]);

  const triggerNotification = (reminder: StudyReminder) => {
    // Show toast notification
    toast({
      title: `⏰ ${reminder.title}`,
      description: "Time to start your study session!",
    });

    // Try browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(reminder.title, {
        body: "Time to start your study session!",
        icon: "/favicon.ico",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast({
        title: "Notifications enabled",
        description: "You'll receive study reminders.",
      });
      return true;
    }
    return false;
  };

  const createReminder = async (
    title: string,
    time: string,
    daysOfWeek: string[]
  ): Promise<StudyReminder | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("study_reminders")
        .insert({
          user_id: user.id,
          title,
          time,
          days_of_week: daysOfWeek,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating reminder:", error);
        toast({
          title: "Failed to create reminder",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      setReminders((prev) => [...prev, data]);
      toast({
        title: "Reminder created",
        description: `You'll be reminded at ${time}`,
      });

      return data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  };

  const updateReminder = async (
    id: string,
    updates: Partial<Pick<StudyReminder, "title" | "time" | "days_of_week" | "is_active">>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("study_reminders")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating reminder:", error);
        return false;
      }

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );

      toast({
        title: "Reminder updated",
      });

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  const deleteReminder = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("study_reminders")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting reminder:", error);
        return false;
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: "Reminder deleted",
      });

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  return {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    requestNotificationPermission,
    refetch: fetchReminders,
  };
}
