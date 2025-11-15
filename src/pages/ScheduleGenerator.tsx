import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Trash2, Sparkles } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
}

export default function ScheduleGenerator() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newHours, setNewHours] = useState("");
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);

  const addSubject = () => {
    if (newSubject.trim() && newHours) {
      setSubjects([
        ...subjects,
        { id: Date.now().toString(), name: newSubject, hoursPerWeek: parseInt(newHours) }
      ]);
      setNewSubject("");
      setNewHours("");
    }
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) return;
    
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSchedule({
      subjects,
      totalHours: subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0),
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    setGenerating(false);
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
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.hoursPerWeek}h/week</p>
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
              <Card className="p-6 shadow-glow border-border/50 space-y-4">
                <div className="flex items-center gap-3 mb-4">
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

                <div className="space-y-3">
                  {schedule.days.map((day: string, idx: number) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gradient-subtle rounded-lg"
                    >
                      <h3 className="font-semibold mb-2">{day}</h3>
                      <div className="space-y-2">
                        {schedule.subjects.slice(0, 2).map((subject: Subject, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>{subject.name}</span>
                            <span className="text-muted-foreground ml-auto">
                              {Math.floor(subject.hoursPerWeek / 5 * 60)}min
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
