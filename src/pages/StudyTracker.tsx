import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw, CheckCircle2, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BloomStreak } from "@/components/BloomStreak";
import { usePersistentTimer } from "@/hooks/usePersistentTimer";
import { useBloomStreak } from "@/hooks/useBloomStreak";
import { useStudySession } from "@/hooks/useStudySession";
import { useStudySchedule } from "@/hooks/useStudySchedule";
import { useToast } from "@/hooks/use-toast";

const weeklyData = [
  { day: "Mon", hours: 4 },
  { day: "Tue", hours: 5.5 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 6 },
  { day: "Fri", hours: 4.5 },
  { day: "Sat", hours: 7 },
  { day: "Sun", hours: 5 },
];

const subjectData = [
  { subject: "Math", hours: 12 },
  { subject: "Physics", hours: 8 },
  { subject: "Chemistry", hours: 6 },
  { subject: "Biology", hours: 5 },
];

export default function StudyTracker() {
  const { time, isTracking, isPaused, start, pause, resume, stop, reset } = usePersistentTimer();
  const { progress, streak, fullBloomDays, addStudyTime } = useBloomStreak();
  const { updateSession } = useStudySession();
  const { activeSchedule, getTodaysSessions, getDailyProgress, markSessionComplete, isSessionCompleted } = useStudySchedule();
  const { toast } = useToast();
  const lastTimeRef = useRef(time);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number | null>(null);

  const todaysSessions = getTodaysSessions();
  const dailyProgress = getDailyProgress();

  // Track study time for bloom progress and update session
  useEffect(() => {
    if (isTracking && !isPaused && time > lastTimeRef.current) {
      const elapsed = time - lastTimeRef.current;
      addStudyTime(elapsed);
      
      // Update session with current duration every 30 seconds
      if (time % 30 === 0) {
        updateSession({ duration_seconds: time });
      }
    }
    lastTimeRef.current = time;
  }, [time, isTracking, isPaused, addStudyTime, updateSession]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (sessionIndex?: number) => {
    if (sessionIndex !== undefined) {
      setSelectedSessionIndex(sessionIndex);
    }
    start();
    toast({
      title: "Focus session started",
      description: "Time to bloom! 🌸",
    });
  };

  const handleStop = async () => {
    if (time > 0) {
      // Save final duration to session
      updateSession({ duration_seconds: time });
      
      // If tracking a scheduled session, mark it complete
      if (selectedSessionIndex !== null && todaysSessions) {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        const session = todaysSessions.sessions[selectedSessionIndex];
        if (session) {
          await markSessionComplete(today, selectedSessionIndex, session.subject, time);
        }
      }
      
      toast({
        title: "Session complete!",
        description: `You studied for ${formatTime(time)}. Great work!`,
      });
    }
    stop();
    setSelectedSessionIndex(null);
  };

  const handleReset = () => {
    reset();
    setSelectedSessionIndex(null);
    toast({
      title: "Timer reset",
      description: "Ready for a fresh start!",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Study Tracker
        </h1>
        <p className="text-muted-foreground">Track your focus sessions and bloom with progress</p>
      </motion.div>

      {/* Today's Schedule from Active Schedule */}
      {activeSchedule && todaysSessions && todaysSessions.sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Today's Schedule
              </h3>
              <div className="text-sm text-muted-foreground">
                {dailyProgress.completed}/{dailyProgress.total} completed
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all"
                  style={{
                    width: dailyProgress.total > 0 
                      ? `${(dailyProgress.completed / dailyProgress.total) * 100}%` 
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaysSessions.sessions.map((session, idx) => {
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                const completed = isSessionCompleted(today, idx);
                const isSelected = selectedSessionIndex === idx && isTracking;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      completed 
                        ? "bg-green-500/10 border-green-500/30" 
                        : isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {session.time}
                      </span>
                      {completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="font-medium text-sm">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">{session.topic}</p>
                    {!completed && !isTracking && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => handleStart(idx)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {isSelected && (
                      <div className="mt-2 text-xs text-primary font-medium">
                        Currently tracking...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Timer and BloomStreak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-8 shadow-card border-border/50 bg-gradient-primary text-primary-foreground h-full">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold opacity-90">
                {selectedSessionIndex !== null && todaysSessions
                  ? `Studying: ${todaysSessions.sessions[selectedSessionIndex]?.subject}`
                  : "Current Session"}
              </h2>
              <motion.div
                className="text-6xl md:text-7xl font-bold font-mono tracking-wider"
                key={time}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1 }}
              >
                {formatTime(time)}
              </motion.div>
              <div className="flex flex-wrap gap-3 justify-center pt-4">
                {!isTracking ? (
                  <Button
                    size="lg"
                    onClick={() => handleStart()}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-soft px-8 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Session
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={isPaused ? resume : pause}
                      variant="outline"
                      className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 px-8 transition-all duration-300"
                    >
                      {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleStop}
                      variant="outline"
                      className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 px-8 transition-all duration-300"
                    >
                      <Square className="mr-2 h-5 w-5" />
                      Stop
                    </Button>
                  </>
                )}
                <Button
                  size="lg"
                  onClick={handleReset}
                  variant="outline"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* BloomStreak Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BloomStreak progress={progress} streak={streak} fullBloomDays={fullBloomDays} />
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <h3 className="text-xl font-semibold mb-6">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <h3 className="text-xl font-semibold mb-6">Study by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
