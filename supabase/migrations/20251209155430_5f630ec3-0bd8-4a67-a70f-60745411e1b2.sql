-- Create table for storing user study schedules
CREATE TABLE public.study_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subjects JSONB NOT NULL,
  weekly_plan JSONB NOT NULL,
  total_hours INTEGER NOT NULL,
  tips TEXT[] DEFAULT '{}',
  priorities TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own schedules"
ON public.study_schedules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
ON public.study_schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
ON public.study_schedules
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
ON public.study_schedules
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_study_schedules_updated_at
BEFORE UPDATE ON public.study_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tracking session completions linked to schedules
CREATE TABLE public.schedule_session_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.study_schedules(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  session_index INTEGER NOT NULL,
  subject TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, day, session_index)
);

-- Enable Row Level Security
ALTER TABLE public.schedule_session_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own completions"
ON public.schedule_session_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions"
ON public.schedule_session_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
ON public.schedule_session_completions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.schedule_session_completions
FOR DELETE
USING (auth.uid() = user_id);