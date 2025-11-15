import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <p className="text-muted-foreground">Track your focus sessions and analyze your progress</p>
      </motion.div>

      {/* Timer Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8 shadow-card border-border/50 bg-gradient-primary text-primary-foreground">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold opacity-90">Current Session</h2>
            <div className="text-6xl md:text-7xl font-bold font-mono tracking-wider">
              {formatTime(time)}
            </div>
            <div className="flex gap-4 justify-center pt-4">
              {!isTracking ? (
                <Button
                  size="lg"
                  onClick={() => setIsTracking(true)}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-soft px-8"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => setIsPaused(!isPaused)}
                    variant="outline"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 px-8"
                  >
                    {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      setIsTracking(false);
                      setIsPaused(false);
                      setTime(0);
                    }}
                    variant="outline"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 px-8"
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

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
