import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Coffee, Brain, Moon, TrendingUp, Heart, Activity, Smile } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useWellbeingStats } from "@/hooks/useWellbeingStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const emotionEmojis: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😰",
  surprise: "😲",
  neutral: "😐",
  happy: "😄",
  calm: "😌",
  stressed: "😓",
  focused: "🎯",
};

export default function Wellbeing() {
  const { stats, loading } = useWellbeingStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
        <div className="text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasData = stats.moodTrends.length > 0 || stats.avgFocusLevel > 0;

  // Generate insights based on real data
  const insights = [
    {
      title: stats.avgFocusLevel >= 70 ? "Great Focus!" : "Boost Your Focus",
      description: stats.avgFocusLevel >= 70 
        ? `Your average focus level is ${stats.avgFocusLevel}%. Keep up the excellent work!`
        : `Your average focus level is ${stats.avgFocusLevel || 0}%. Try the Pomodoro technique for better concentration.`,
      icon: Brain,
      color: "bg-primary",
    },
    {
      title: stats.avgStressLevel <= 40 ? "Low Stress" : "Manage Stress",
      description: stats.avgStressLevel <= 40
        ? `Your stress levels are healthy at ${stats.avgStressLevel}%. Great job maintaining balance!`
        : `Your stress level is ${stats.avgStressLevel}%. Consider taking more breaks.`,
      icon: Heart,
      color: stats.avgStressLevel <= 40 ? "bg-success" : "bg-accent",
    },
    {
      title: "Take a Break",
      description: stats.breakEfficiency >= 80 
        ? "You're taking good breaks! Keep the balance."
        : "Remember to take regular breaks for optimal performance.",
      icon: Coffee,
      color: "bg-secondary",
    },
    {
      title: "Sleep & Recovery",
      description: "Maintain 7-8 hours of sleep for optimal cognitive performance.",
      icon: Moon,
      color: "bg-wellness",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-wellness to-accent bg-clip-text text-transparent">
          Well-being Insights
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {hasData ? "Personalized recommendations based on your data" : "Start tracking to get personalized insights"}
        </p>
      </motion.div>

      {/* Wellness Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Wellness Score"
          value={stats.wellnessScore > 0 ? `${stats.wellnessScore}` : "—"}
          subtitle={stats.wellnessScore >= 70 ? "Excellent" : stats.wellnessScore >= 50 ? "Good" : "Needs attention"}
          icon={Brain}
          gradient
          delay={0.1}
        />
        <StatCard
          title="Burnout Risk"
          value={stats.burnoutRisk}
          subtitle={stats.burnoutRisk === "Low" ? "Keep it up!" : "Take it easy"}
          icon={TrendingUp}
          delay={0.2}
        />
        <StatCard
          title="Break Efficiency"
          value={stats.breakEfficiency > 0 ? `${stats.breakEfficiency}%` : "—"}
          subtitle="Work-break balance"
          icon={Coffee}
          delay={0.3}
        />
      </div>

      {/* Focus & Stress Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-4 sm:p-6 shadow-card border-border/50 h-full">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Focus Level
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-bold text-primary">
                  {stats.avgFocusLevel > 0 ? `${stats.avgFocusLevel}%` : "—"}
                </span>
                <p className="text-sm text-muted-foreground mt-1">Average this week</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgFocusLevel}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-primary rounded-full"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6 shadow-card border-border/50 h-full">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Stress Level
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <span className={`text-4xl sm:text-5xl font-bold ${
                  stats.avgStressLevel <= 40 ? "text-success" : stats.avgStressLevel <= 60 ? "text-accent" : "text-destructive"
                }`}>
                  {stats.avgStressLevel > 0 ? `${stats.avgStressLevel}%` : "—"}
                </span>
                <p className="text-sm text-muted-foreground mt-1">Average this week</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgStressLevel}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    stats.avgStressLevel <= 40 ? "bg-success" : stats.avgStressLevel <= 60 ? "bg-accent" : "bg-destructive"
                  }`}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Mood Trends Chart */}
      {stats.weeklyEmotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="p-4 sm:p-6 shadow-card border-border/50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Focus & Stress Trends
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyEmotions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="focus"
                    name="Focus"
                    stroke="hsl(195, 85%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(195, 85%, 45%)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    name="Stress"
                    stroke="hsl(0, 75%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 75%, 60%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Emotion Distribution */}
      {stats.emotionDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 sm:p-6 shadow-card border-border/50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              Emotion Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {stats.emotionDistribution.slice(0, 6).map((item, index) => (
                <motion.div
                  key={item.emotion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-2xl">{emotionEmojis[item.emotion] || "😐"}</span>
                  <p className="text-sm font-medium capitalize mt-1">{item.emotion}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Mood Frequency */}
      {stats.moodTrends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="p-4 sm:p-6 shadow-card border-border/50">
            <h3 className="font-semibold text-lg mb-4">Mood Frequency This Week</h3>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.moodTrends.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mood" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" name="Times Logged" fill="hsl(165, 65%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <Card className="p-4 sm:p-6 shadow-card border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1 h-full">
              <div className="flex gap-3 sm:gap-4">
                <div className={`${insight.color} p-2 sm:p-3 rounded-xl h-fit shrink-0`}>
                  <insight.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{insight.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{insight.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Card className="p-6 sm:p-8 shadow-card border-border/50 bg-gradient-wellness text-wellness-foreground">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">💡 Daily Wellness Tip</h2>
          <p className="text-base sm:text-lg opacity-90">
            {stats.avgStressLevel > 50
              ? "Your stress levels are elevated. Try the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3-4 times."
              : stats.avgFocusLevel < 50
              ? "To improve focus, try the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break."
              : "Great job maintaining balance! Remember to stay hydrated and take regular breaks to maintain your excellent performance."
            }
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
