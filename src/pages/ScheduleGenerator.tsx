import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Trash2, Sparkles, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
  deadline?: string;
}

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

interface AISchedule {
  weeklyPlan: DayPlan[];
  totalHours: number;
  tips: string[];
  priorities: string[];
}

export default function ScheduleGenerator() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newHours, setNewHours] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [instituteTimetable, setInstituteTimetable] = useState("");
  const [personalEvents, setPersonalEvents] = useState("");
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState<AISchedule | null>(null);
  const { toast } = useToast();

  const addSubject = () => {
    if (newSubject.trim() && newHours) {
      setSubjects([
        ...subjects,
        { 
          id: Date.now().toString(), 
          name: newSubject, 
          hoursPerWeek: parseInt(newHours),
          deadline: newDeadline || undefined
        }
      ]);
      setNewSubject("");
      setNewHours("");
      setNewDeadline("");
    }
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      toast({
        title: "No subjects added",
        description: "Please add at least one subject to generate a schedule.",
        variant: "destructive"
      });
      return;
    }
    
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-schedule', {
        body: {
          subjects,
          instituteTimetable,
          personalEvents,
          startDate: new Date().toLocaleDateString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      });

      if (error) throw error;

      setSchedule(data);
      toast({
        title: "Schedule generated!",
        description: "Your personalized study schedule is ready.",
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Schedule Generator
        </h1>
        <p className="text-muted-foreground">Create your personalized study plan with AI</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 shadow-card border-border/50 space-y-6">
            <h2 className="text-xl font-semibold">Add Your Subjects</h2>
            
            <div className="space-y-3">
              <Input
                placeholder="Subject name (e.g., Mathematics)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <Input
                type="number"
                placeholder="Hours per week"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <Input
                type="date"
                placeholder="Deadline (optional)"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <Button onClick={addSubject} className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {subjects.map((subject) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{subject.hoursPerWeek}h/week</span>
                        {subject.deadline && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {new Date(subject.deadline).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubject(subject.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div>
                <Label htmlFor="timetable" className="text-sm font-medium">
                  Institute Timetable (Optional)
                </Label>
                <Textarea
                  id="timetable"
                  placeholder="E.g., Mon-Fri 9AM-3PM classes, Lab on Wed 2-5PM..."
                  value={instituteTimetable}
                  onChange={(e) => setInstituteTimetable(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="events" className="text-sm font-medium">
                  Personal Events & Activities
                </Label>
                <Textarea
                  id="events"
                  placeholder="E.g., Gym Mon/Wed 6PM, Family dinner Friday 7PM, Weekend trip..."
                  value={personalEvents}
                  onChange={(e) => setPersonalEvents(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </div>

            <Button
              onClick={generateSchedule}
              disabled={subjects.length === 0 || generating}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-soft"
              size="lg"
            >
              {generating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse-glow" />
                  Generating Schedule...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-5 w-5" />
                  Generate AI Schedule
                </>
              )}
            </Button>
          </Card>
        </motion.div>

        {/* Schedule Display */}
        <AnimatePresence>
          {schedule && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring" }}
            >
              <Card className="p-6 shadow-glow border-border/50 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Your Study Plan</h2>
                    <p className="text-sm text-muted-foreground">
                      {schedule.totalHours} hours per week
                    </p>
                  </div>
                </div>

                {/* Priorities */}
                {schedule.priorities && schedule.priorities.length > 0 && (
                  <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent-foreground" />
                      Top Priorities
                    </h3>
                    <ul className="space-y-1">
                      {schedule.priorities.map((priority, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent-foreground mt-0.5">•</span>
                          <span>{priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weekly Schedule */}
                <div className="space-y-3">
                  {schedule.weeklyPlan.map((dayPlan, idx) => (
                    <motion.div
                      key={dayPlan.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-gradient-subtle rounded-lg border border-border/30"
                    >
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {dayPlan.day}
                      </h3>
                      <div className="space-y-2">
                        {dayPlan.sessions.map((session, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 rounded bg-background/50">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {session.time}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {session.type}
                                </span>
                              </div>
                              <p className="text-sm font-medium mt-1">{session.subject}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{session.topic}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Study Tips */}
                {schedule.tips && schedule.tips.length > 0 && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Study Tips
                    </h3>
                    <ul className="space-y-1">
                      {schedule.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
