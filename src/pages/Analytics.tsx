import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart3, Clock, Target, TrendingUp, Brain, Coffee } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useWellbeingStats } from "@/hooks/useWellbeingStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(195, 85%, 45%)", "hsl(165, 65%, 55%)", "hsl(25, 90%, 65%)", "hsl(340, 75%, 65%)", "hsl(145, 65%, 50%)"];

export default function Analytics() {
  const { weeklyAnalytics, loading } = useWellbeingStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
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

  const hasData = weeklyAnalytics.totalStudyHours > 0 || weeklyAnalytics.dailyBreakdown.some(d => d.studyHours > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Weekly Analytics
        </h1>
        <p className="text-muted-foreground">Your study performance at a glance</p>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Study Hours"
          value={`${weeklyAnalytics.totalStudyHours}h`}
          subtitle="This week"
          icon={Clock}
          gradient
          delay={0.1}
        />
        <StatCard
          title="Completion Rate"
          value={`${weeklyAnalytics.completionRate}%`}
          subtitle="Sessions completed"
          icon={Target}
          delay={0.2}
        />
        <StatCard
          title="Avg Focus"
          value={weeklyAnalytics.avgFocusLevel > 0 ? `${weeklyAnalytics.avgFocusLevel}%` : "—"}
          subtitle="Focus level"
          icon={Brain}
          delay={0.3}
        />
        <StatCard
          title="Break Ratio"
          value={`${weeklyAnalytics.breakVsStudyRatio}%`}
          subtitle="Of study time"
          icon={Coffee}
          delay={0.4}
        />
      </div>

      {!hasData ? (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No data yet</h3>
          <p className="text-muted-foreground">Start study sessions to see your analytics here.</p>
        </Card>
      ) : (
        <>
          {/* Daily Study Hours Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 shadow-card border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Daily Study vs Break Time
              </h2>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAnalytics.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="studyHours" name="Study Hours" fill="hsl(195, 85%, 45%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="breakHours" name="Break Hours" fill="hsl(165, 65%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Focus & Stress Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 shadow-card border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Focus & Stress Trends
              </h2>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyAnalytics.emotionTrends}>
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
                      name="Focus Level"
                      stroke="hsl(195, 85%, 45%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(195, 85%, 45%)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      name="Stress Level"
                      stroke="hsl(0, 75%, 60%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(0, 75%, 60%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Subject Distribution */}
          {weeklyAnalytics.subjectDistribution.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 shadow-card border-border/50">
                <h2 className="text-xl font-semibold mb-4">Subject Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={weeklyAnalytics.subjectDistribution}
                          dataKey="hours"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ subject, hours }) => `${subject}: ${hours}h`}
                        >
                          {weeklyAnalytics.subjectDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {weeklyAnalytics.subjectDistribution.map((subject, index) => (
                      <div key={subject.subject} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="flex-1">{subject.subject}</span>
                        <span className="font-medium">{subject.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
