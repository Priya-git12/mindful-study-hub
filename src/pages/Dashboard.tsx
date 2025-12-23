import { StatCard } from "@/components/StatCard";
import { Brain, Clock, TrendingUp, Heart, Calendar, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStudySchedule } from "@/hooks/useStudySchedule";
import { Skeleton } from "@/components/ui/skeleton";

const emotionEmojis: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😰",
  surprise: "😲",
  neutral: "😐",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading, formatDuration, getStudyTimeDiff, getWeeklyProgressPercentage } = useDashboardStats();
  const { getDailyProgress } = useStudySchedule();
  
  const dailyProgress = getDailyProgress();
  const currentMoodEmoji = stats.currentMood ? emotionEmojis[stats.currentMood] || "😐" : "😐";
  const currentMoodText = stats.currentMood 
    ? stats.currentMood.charAt(0).toUpperCase() + stats.currentMood.slice(1)
    : "Not recorded";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center py-8">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Welcome to MindSync
        </h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered study companion for better focus and well-being
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Focus Score"
          value={stats.focusScore > 0 ? `${stats.focusScore}%` : "—"}
          subtitle={stats.focusScore >= 80 ? "Excellent focus!" : stats.focusScore >= 50 ? "Good progress" : "Keep going!"}
          icon={Brain}
          gradient
          delay={0.1}
        />
        <StatCard
          title="Study Time Today"
          value={formatDuration(stats.studyTimeToday)}
          subtitle={getStudyTimeDiff()}
          icon={Clock}
          delay={0.2}
        />
        <StatCard
          title="Weekly Progress"
          value={formatDuration(stats.weeklyStudyTime)}
          subtitle={`${getWeeklyProgressPercentage()}% of goal`}
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          title="Current Mood"
          value={currentMoodEmoji}
          subtitle={currentMoodText}
          icon={Heart}
          delay={0.4}
        />
      </div>

      {/* Today's Goals */}
      {dailyProgress.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="p-6 shadow-card border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Today's Goals
              </h2>
              <span className="text-sm text-muted-foreground">
                {dailyProgress.completed}/{dailyProgress.total} completed
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-muted rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: dailyProgress.total > 0 
                      ? `${(dailyProgress.completed / dailyProgress.total) * 100}%` 
                      : "0%" 
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-primary h-3 rounded-full"
                />
              </div>
              <span className="text-sm font-medium">
                {dailyProgress.total > 0 
                  ? `${Math.round((dailyProgress.completed / dailyProgress.total) * 100)}%`
                  : "0%"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dailyProgress.subjects.map((subject, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    subject.completed 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {subject.completed ? (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    )}
                    <span className="text-sm font-medium truncate">{subject.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="p-6 shadow-card border-border/50">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Recent Activity
          </h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((item, index) => (
                <motion.div
                  key={`${item.subject}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-12 rounded-full bg-primary`} />
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.time}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start a study session to see your progress here</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card
          onClick={() => navigate("/study-tracker")}
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-soft hover:-translate-y-1 bg-gradient-primary text-primary-foreground"
        >
          <h3 className="font-semibold text-lg mb-2">Start Study Session</h3>
          <p className="text-sm opacity-90">
            Begin tracking your focus time
          </p>
        </Card>

        <Card
          onClick={() => navigate("/emotions")}
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-soft hover:-translate-y-1 bg-gradient-wellness text-primary-foreground"
        >
          <h3 className="font-semibold text-lg mb-2">Check Your Mood</h3>
          <p className="text-sm opacity-90">
            How are you feeling today?
          </p>
        </Card>

        <Card
          onClick={() => navigate("/schedule")}
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-soft hover:-translate-y-1 bg-gradient-subtle text-foreground"
        >
          <h3 className="font-semibold text-lg mb-2">View Schedule</h3>
          <p className="text-sm text-muted-foreground">
            See your personalized study plan
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
