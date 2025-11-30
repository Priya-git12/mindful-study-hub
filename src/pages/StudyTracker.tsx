import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StudyTracker() {
  // ------------------------------
  // 1️⃣ State declarations
  // ------------------------------
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(""); // Subject selection

  // ------------------------------
  // 2️⃣ Timer effect
  // ------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && !isPaused) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  // ------------------------------
  // 3️⃣ Format seconds to hh:mm:ss
  // ------------------------------
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ------------------------------
  // 4️⃣ Weekly Progress (dynamic)
  // ------------------------------
  const weeklyLogs = JSON.parse(localStorage.getItem("study_logs") || "{}");
  const weeklyData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
    (day) => ({
      day,
      hours: (weeklyLogs[day] || 0) / 3600,
    })
  );

  // ------------------------------
  // 5️⃣ Study by Subject (dynamic)
  // ------------------------------
  const subjectLogs = JSON.parse(localStorage.getItem("subject_logs") || "{}");
  const subjectData = Object.keys(subjectLogs).map((subj) => ({
    subject: subj,
    hours: subjectLogs[subj] / 3600,
  }));

  // ------------------------------
  // 6️⃣ JSX Return
  // ------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Study Tracker
        </h1>
        <p className="text-muted-foreground">
          Track your focus sessions and analyze your progress
        </p>
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

            {/* Subject selection */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-muted-foreground rounded px-3 py-2 w-full mb-4"
            >
              <option value="">Select Subject</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {!isTracking ? (
                <Button
                  size="lg"
                  onClick={() => setIsTracking(true)}
                  disabled={!selectedSubject}
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
                    {isPaused ? (
                      <>
                        <Play className="mr-2 h-5 w-5" /> Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-5 w-5" /> Pause
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      // Save weekly logs
                      const today = new Date()
                        .toLocaleDateString("en-US", { weekday: "short" });
                      const weeklyLogs = JSON.parse(
                        localStorage.getItem("study_logs") || "{}"
                      );
                      weeklyLogs[today] = (weeklyLogs[today] || 0) + time;
                      localStorage.setItem("study_logs", JSON.stringify(weeklyLogs));

                      // Save subject logs
                      if (selectedSubject) {
                        const subjectLogs = JSON.parse(
                          localStorage.getItem("subject_logs") || "{}"
                        );
                        subjectLogs[selectedSubject] =
                          (subjectLogs[selectedSubject] || 0) + time;
                        localStorage.setItem(
                          "subject_logs",
                          JSON.stringify(subjectLogs)
                        );
                      }

                      // Reset timer and selection
                      setIsTracking(false);
                      setIsPaused(false);
                      setTime(0);
                      setSelectedSubject("");
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

      {/* Reset Charts Button */}
      <div className="flex justify-end">
        <Button
          size="md"
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("study_logs");
            localStorage.removeItem("subject_logs");
            setTime(0);
            setSelectedSubject("");
            setIsTracking(false);
            setIsPaused(false);
            window.location.reload();
          }}
        >
          Reset Charts
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <h3 className="text-xl font-semibold mb-6">Weekly Progress</h3>
            <div className="w-full h-64 sm:h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Card>
        </motion.div>

        {/* Study by Subject */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <h3 className="text-xl font-semibold mb-6">Study by Subject</h3>
            <div className="w-full h-64 sm:h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
