-- Create study_reminders table for configurable study reminders
CREATE TABLE public.study_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TIME NOT NULL,
  days_of_week TEXT[] NOT NULL DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own reminders" 
  ON public.study_reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.study_reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.study_reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
  ON public.study_reminders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_study_reminders_updated_at
  BEFORE UPDATE ON public.study_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create emotion_logs table for storing actual user emotion data
CREATE TABLE public.emotion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  emotion TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  mood TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own emotion logs" 
  ON public.emotion_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emotion logs" 
  ON public.emotion_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotion logs" 
  ON public.emotion_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotion logs" 
  ON public.emotion_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add target_duration_seconds to schedule_session_completions for tracking completion percentage
ALTER TABLE public.schedule_session_completions 
  ADD COLUMN IF NOT EXISTS target_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS completion_percentage DECIMAL(5,2) DEFAULT 100.0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'partial', 'skipped'));