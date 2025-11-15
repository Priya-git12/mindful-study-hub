import { StatCard } from "@/components/StatCard";
import { Brain, Clock, TrendingUp, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const moodEmojis = ["😊", "😌", "🙂", "😐", "😔"];
  const currentMood = 1; // 0-4 scale

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
          value="87%"
          subtitle="Above average"
          icon={Brain}
          gradient
          delay={0.1}
        />
        <StatCard
          title="Study Time Today"
          value="4.5h"
          subtitle="+30min from yesterday"
          icon={Clock}
          delay={0.2}
        />
        <StatCard
          title="Weekly Progress"
          value="32h"
          subtitle="85% of goal"
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          title="Current Mood"
          value={moodEmojis[currentMood]}
          subtitle="Feeling good"
          icon={Heart}
          delay={0.4}
        />
      </div>

      {/* Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="p-6 shadow-card border-border/50">
          <h2 className="text-2xl font-semibold mb-6">Today's Activity</h2>
          <div className="space-y-4">
            {[
              { subject: "Mathematics", duration: "2h 15m", color: "bg-primary" },
              { subject: "Physics", duration: "1h 30m", color: "bg-secondary" },
              { subject: "Chemistry", duration: "45m", color: "bg-accent" },
            ].map((item, index) => (
              <motion.div
                key={item.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-12 rounded-full ${item.color}`} />
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.duration}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${item.color} bg-opacity-10 text-sm font-medium`}>
                  Active
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { title: "Start Study Session", description: "Begin tracking your focus time", gradient: "bg-gradient-primary" },
          { title: "Check Your Mood", description: "How are you feeling today?", gradient: "bg-gradient-wellness" },
          { title: "View Schedule", description: "See your personalized study plan", gradient: "bg-gradient-subtle" },
        ].map((action, index) => (
          <Card
            key={action.title}
            className={`
              p-6 cursor-pointer transition-all duration-300
              hover:shadow-soft hover:-translate-y-1
              ${action.gradient} ${index === 2 ? 'text-foreground' : 'text-primary-foreground'}
            `}
          >
            <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
            <p className={`text-sm ${index === 2 ? 'text-muted-foreground' : 'opacity-90'}`}>
              {action.description}
            </p>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
