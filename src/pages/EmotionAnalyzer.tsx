import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmotionLogs } from "@/hooks/useEmotionLogs";
import { useStudySession } from "@/hooks/useStudySession";

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
  const [focusLevel, setFocusLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; confidence: number; reasoning?: string; motivation?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { logEmotion } = useEmotionLogs();
  const { currentSession } = useStudySession();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoReady(true);
        };
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to analyze facial expressions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setVideoReady(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !videoReady) {
      toast({
        title: "Camera Not Ready",
        description: "Please wait for the camera to fully load.",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      toast({
        title: "Capture Failed",
        description: "Camera not ready yet. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Validate the image data
      if (imageData && imageData.length > 100) {
        setCapturedImage(imageData);
        stopCamera();
      } else {
        toast({
          title: "Capture Failed",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !capturedImage) return;
    
    setAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          text: text.trim() || undefined,
          image: capturedImage || undefined
        }
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
        reasoning: data.reasoning,
        motivation: data.motivation
      });

      // Save emotion to database with actual user inputs
      await logEmotion(data.emotion, Math.round(data.confidence), {
        sessionId: currentSession?.id,
        focusLevel: focusLevel[0],
        stressLevel: stressLevel[0],
        notes: text.trim() || undefined,
        source: capturedImage ? "camera" : "text",
      });

      toast({
        title: "Emotion logged",
        description: "Your emotional state has been recorded.",
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
        <p className="text-muted-foreground">AI-powered emotional insight from your thoughts and expressions</p>
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
              placeholder="Share your thoughts or describe how you're feeling today... (optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Focus and Stress Level Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Focus Level: {focusLevel[0]}/10</Label>
              <Slider
                value={focusLevel}
                onValueChange={setFocusLevel}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How focused do you feel right now?</p>
            </div>
            <div className="space-y-3">
              <Label>Stress Level: {stressLevel[0]}/10</Label>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How stressed do you feel right now?</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Or capture your expression</label>
            
            {!isCameraActive && !capturedImage && (
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full"
              >
                <Camera className="mr-2 h-5 w-5" />
                Use Camera
              </Button>
            )}

            {isCameraActive && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={captureImage} 
                    className="flex-1"
                    disabled={!videoReady}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {videoReady ? 'Capture' : 'Loading...'}
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img src={capturedImage} alt="Captured" className="w-full aspect-video object-cover" />
                  <Button
                    onClick={clearImage}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={(!text.trim() && !capturedImage) || analyzing}
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

                {result.motivation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-4 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <p className="text-sm font-medium text-foreground">{result.motivation}</p>
                  </motion.div>
                )}

                <div className="pt-2 text-sm text-muted-foreground">
                  <p>Remember: Your emotions are valid. Take care of yourself.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
