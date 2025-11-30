import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface BloomStreakProps {
  progress: number; // 0-100
  streak: number;
  fullBloomDays: number;
}

export function BloomStreak({ progress, streak, fullBloomDays }: BloomStreakProps) {
  const getBloomColor = (petalProgress: number) => {
    if (petalProgress < 20) return "hsl(var(--bloom-0))";
    if (petalProgress < 40) return "hsl(var(--bloom-20))";
    if (petalProgress < 60) return "hsl(var(--bloom-40))";
    if (petalProgress < 80) return "hsl(var(--bloom-60))";
    if (petalProgress < 100) return "hsl(var(--bloom-80))";
    return "hsl(var(--bloom-100))";
  };

  const petals = 8;
  const isFullBloom = progress >= 100;

  return (
    <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-card via-card to-muted/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-bloom-100" style={{ color: "hsl(var(--bloom-100))" }} />
              BloomStreak
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your daily progress garden
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: getBloomColor(progress) }}>
              {streak}
            </div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </div>
        </div>

        {/* Flower Visualization */}
        <div className="flex items-center justify-center py-8 relative">
          <motion.div
            className="relative"
            animate={isFullBloom ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: isFullBloom ? Infinity : 0 }}
          >
            {/* Glow effect for full bloom */}
            {isFullBloom && (
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: "hsl(var(--bloom-glow))" }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            {/* Petals */}
            <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10">
              {/* Render petals in a circle */}
              {Array.from({ length: petals }).map((_, i) => {
                const angle = (i * 360) / petals;
                const rotation = angle - 90;
                
                return (
                  <motion.g
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <motion.ellipse
                      cx="100"
                      cy="50"
                      rx="20"
                      ry="35"
                      transform={`rotate(${rotation} 100 100)`}
                      fill={getBloomColor(progress)}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      initial={{ fill: "hsl(var(--bloom-0))" }}
                      animate={{ fill: getBloomColor(progress) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{
                        filter: isFullBloom ? "drop-shadow(0 0 8px hsl(var(--bloom-glow)))" : "none"
                      }}
                    />
                  </motion.g>
                );
              })}

              {/* Center of flower */}
              <motion.circle
                cx="100"
                cy="100"
                r="25"
                fill="hsl(var(--bloom-center))"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Progress Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <motion.span
              className="font-semibold"
              style={{ color: getBloomColor(progress) }}
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: getBloomColor(progress) }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Full Bloom Days */}
          <div className="flex justify-between items-center text-sm pt-2">
            <span className="text-muted-foreground">Full Bloom Days</span>
            <span className="font-semibold text-primary">{fullBloomDays}</span>
          </div>

          {/* Status message */}
          {isFullBloom && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-2"
            >
              <p className="text-sm font-medium" style={{ color: "hsl(var(--bloom-100))" }}>
                🌸 Full Bloom! You're amazing today! 🌸
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}
