import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const emotionEmojis: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😰",
  surprise: "😲",
  neutral: "😐",
};

const emotionColors: Record<string, string> = {
  joy: "bg-success",
  sadness: "bg-primary",
  anger: "bg-destructive",
  fear: "bg-accent",
  surprise: "bg-secondary",
  neutral: "bg-muted",
};

export default function EmotionAnalyzer() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; confidence: number; reasoning?: string } | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze emotion. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setResult({
        emotion: data.emotion,
        confidence: Math.round(data.confidence),
        reasoning: data.reasoning
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Emotion Analyzer
        </h1>
        <p className="text-muted-foreground">AI-powered emotional insight from your thoughts</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 shadow-card border-border/50 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How are you feeling?</label>
            <Textarea
              placeholder="Share your thoughts or describe how you're feeling today..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!text.trim() || analyzing}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-soft"
            size="lg"
          >
            {analyzing ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-pulse-glow" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Emotion
              </>
            )}
          </Button>
        </Card>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className={`p-8 shadow-glow border-border/50 ${emotionColors[result.emotion]} bg-opacity-10`}>
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-8xl"
                >
                  {emotionEmojis[result.emotion]}
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold capitalize mb-2">{result.emotion}</h3>
                  <p className="text-muted-foreground">Detected with {result.confidence}% confidence</p>
                  {result.reasoning && (
                    <p className="text-sm text-muted-foreground mt-2 italic">{result.reasoning}</p>
                  )}
                </div>

                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full ${emotionColors[result.emotion]} rounded-full`}
                  />
                </div>

                <div className="pt-4 text-sm text-muted-foreground">
                  <p>Remember: It's okay to feel this way. Your emotions are valid.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
