import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Moon, Star, Heart, Zap, Coffee, Sun, Sparkles, TrendingUp } from "lucide-react";
import type { DaySummary } from "@/hooks/useEndOfDaySummary";

interface EndOfDaySummaryProps {
  summary: DaySummary | null;
  isOpen: boolean;
  onClose: () => void;
}

const stateConfig: Record<DaySummary['state'], { icon: typeof Moon; color: string; gradient: string }> = {
  motivated: { icon: Zap, color: "text-yellow-500", gradient: "from-yellow-500/20 to-orange-500/20" },
  tired_but_consistent: { icon: Coffee, color: "text-amber-500", gradient: "from-amber-500/20 to-orange-400/20" },
  stressed: { icon: Heart, color: "text-rose-500", gradient: "from-rose-500/20 to-pink-500/20" },
  proud: { icon: Star, color: "text-bloom-500", gradient: "from-bloom-500/20 to-purple-500/20" },
  discouraged: { icon: Moon, color: "text-indigo-400", gradient: "from-indigo-500/20 to-blue-500/20" },
  balanced: { icon: Sun, color: "text-green-500", gradient: "from-green-500/20 to-emerald-500/20" },
  recovering: { icon: Sparkles, color: "text-sky-400", gradient: "from-sky-500/20 to-cyan-500/20" },
  strong_start: { icon: TrendingUp, color: "text-violet-500", gradient: "from-violet-500/20 to-purple-500/20" },
};

const stateLabels: Record<DaySummary['state'], string> = {
  motivated: "Motivated",
  tired_but_consistent: "Tired but Consistent",
  stressed: "Taking it Easy",
  proud: "Proud Achievement",
  discouraged: "Bouncing Back",
  balanced: "Balanced Day",
  recovering: "Rest & Recovery",
  strong_start: "Strong Start",
};

export function EndOfDaySummary({ summary, isOpen, onClose }: EndOfDaySummaryProps) {
  if (!summary) return null;

  const config = stateConfig[summary.state];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 overflow-hidden">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
        
        <div className="relative z-10">
          <DialogHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mx-auto mb-4"
            >
              <div className={`w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg`}>
                <Icon className={`w-8 h-8 ${config.color}`} />
              </div>
            </motion.div>
            
            <DialogTitle className="text-xl font-semibold text-foreground">
              End of Day Reflection
            </DialogTitle>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm font-medium ${config.color}`}
            >
              {stateLabels[summary.state]}
            </motion.p>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 pt-2"
          >
            {/* Stats row */}
            <div className="flex justify-center gap-6 text-center py-3">
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.studyHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Studied</p>
              </div>
              {summary.totalSessions > 0 && (
                <div>
                  <p className="text-2xl font-bold text-foreground">{summary.completedSessions}/{summary.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              )}
              {summary.emotionCount > 0 && (
                <div>
                  <p className="text-2xl font-bold text-foreground">{summary.emotionCount}</p>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {summary.message}
              </p>
              <p className="text-sm font-medium text-foreground/90">
                {summary.closingLine}
              </p>
            </div>

            {/* Action button */}
            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Good Night!
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
