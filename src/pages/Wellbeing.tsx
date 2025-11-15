import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Coffee, Brain, Moon, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const insights = [
  {
    title: "Take a Break",
    description: "You've been studying for 2 hours. Time for a 15-minute break to recharge.",
    icon: Coffee,
    color: "bg-accent",
  },
  {
    title: "Peak Performance",
    description: "Your focus is highest between 9 AM - 11 AM. Schedule complex tasks then.",
    icon: Brain,
    color: "bg-primary",
  },
  {
    title: "Sleep Schedule",
    description: "Maintain 7-8 hours of sleep for optimal cognitive performance.",
    icon: Moon,
    color: "bg-secondary",
  },
  {
    title: "Weekly Progress",
    description: "Great job! You're 15% more productive than last week.",
    icon: TrendingUp,
    color: "bg-success",
  },
];

export default function Wellbeing() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-wellness to-accent bg-clip-text text-transparent">
          Well-being Insights
        </h1>
        <p className="text-muted-foreground">AI-powered recommendations for better productivity and health</p>
      </motion.div>

      {/* Wellness Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Wellness Score"
          value="82"
          subtitle="Very Good"
          icon={Brain}
          gradient
          delay={0.1}
        />
        <StatCard
          title="Burnout Risk"
          value="Low"
          subtitle="Keep it up!"
          icon={TrendingUp}
          delay={0.2}
        />
        <StatCard
          title="Break Efficiency"
          value="95%"
          subtitle="Well balanced"
          icon={Coffee}
          delay={0.3}
        />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="p-6 shadow-card border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <div className="flex gap-4">
                <div className={`${insight.color} p-3 rounded-xl h-fit`}>
                  <insight.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                  <p className="text-muted-foreground text-sm">{insight.description}</p>
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
        transition={{ delay: 0.8 }}
      >
        <Card className="p-8 shadow-card border-border/50 bg-gradient-wellness text-wellness-foreground">
          <h2 className="text-2xl font-bold mb-4">💡 Daily Wellness Tip</h2>
          <p className="text-lg opacity-90">
            The Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. 
            After 4 sessions, take a longer 15-30 minute break. This helps maintain focus 
            and prevents burnout.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
