import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: boolean;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient = false, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`
        p-6 shadow-card hover:shadow-soft transition-all duration-300 
        hover:-translate-y-1 border-border/50
        ${gradient ? 'bg-gradient-primary text-primary-foreground' : 'bg-card'}
      `}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {subtitle && (
              <p className={`text-sm mt-1 ${gradient ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`
            p-3 rounded-xl 
            ${gradient ? 'bg-primary-foreground/20' : 'bg-primary/10'}
          `}>
            <Icon className={`h-6 w-6 ${gradient ? 'text-primary-foreground' : 'text-primary'}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
