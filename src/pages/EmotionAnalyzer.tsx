import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Camera, X, Upload, Loader2 } from "lucide-react";
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

const ANALYSIS_TIMEOUT = 30000; // 30 seconds timeout

export default function EmotionAnalyzer() {
  const [text, setText] = useState("");
  const [focusLevel, setFocusLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; confidence: number; reasoning?: string; motivation?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { logEmotion } = useEmotionLogs();
  const { currentSession } = useStudySession();

  const startCamera = async () => {
    try {
      // First set camera active to render the video element
      setIsCameraActive(true);
      setVideoReady(false);
      
      // Small delay to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        
        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(new Error('Failed to load video'));
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(new Error('Camera initialization timeout'));
          }, 10000);
        });
        
        // Play the video stream
        await videoRef.current.play();
        setVideoReady(true);
        
        toast({
          title: "Camera Ready",
          description: "Position your face in the frame and click Capture.",
        });
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setVideoReady(false);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowed')) {
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access in your browser settings.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('NotFound') || errorMessage.includes('DevicesNotFound')) {
        toast({
          title: "No Camera Found",
          description: "No camera device was detected on this device.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Camera Error",
          description: errorMessage || "Failed to start camera. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setVideoReady(false);
  }, []);

  const captureImage = useCallback(() => {
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
      
      if (imageData && imageData.length > 100) {
        setImageLoading(true);
        // Create an image element to verify the captured image loads
        const img = new Image();
        img.onload = () => {
          setCapturedImage(imageData);
          setImageLoading(false);
          stopCamera();
          toast({
            title: "Image Captured",
            description: "Your photo is ready for analysis.",
          });
        };
        img.onerror = () => {
          setImageLoading(false);
          toast({
            title: "Capture Failed",
            description: "Failed to process captured image. Please try again.",
            variant: "destructive",
          });
        };
        img.src = imageData;
      } else {
        toast({
          title: "Capture Failed",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [videoReady, stopCamera, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setImageLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      // Verify the image loads correctly
      const img = new Image();
      img.onload = () => {
        setCapturedImage(imageData);
        setImageLoading(false);
        toast({
          title: "Image Uploaded",
          description: "Your photo is ready for analysis.",
        });
      };
      img.onerror = () => {
        setImageLoading(false);
        toast({
          title: "Upload Failed",
          description: "Failed to process uploaded image. Please try another.",
          variant: "destructive",
        });
      };
      img.src = imageData;
    };

    reader.onerror = () => {
      setImageLoading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast]);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setImageLoading(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() && !capturedImage) return;
    if (analyzing) return; // Prevent double submission
    
    // Cancel any previous analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;
    
    setAnalyzing(true);
    setResult(null); // Clear previous result
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, ANALYSIS_TIMEOUT);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          text: text.trim() || undefined,
          image: capturedImage || undefined
        }
      });

      // Check if aborted
      if (controller.signal.aborted) {
        throw new Error('Analysis timed out');
      }

      clearTimeout(timeoutId);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Failed to analyze emotion");
      }

      if (data?.error) {
        // Handle specific face detection errors
        if (data.error.includes('face') || data.error.includes('Face')) {
          toast({
            title: "Face Detection Issue",
            description: data.error,
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error);
      }

      if (!data?.emotion) {
        throw new Error('Invalid response from analysis');
      }

      setResult({
        emotion: data.emotion,
        confidence: Math.round(data.confidence || 75),
        reasoning: data.reasoning,
        motivation: data.motivation
      });

      // Save emotion to database with actual user inputs
      try {
        await logEmotion(data.emotion, Math.round(data.confidence || 75), {
          sessionId: currentSession?.id,
          focusLevel: focusLevel[0],
          stressLevel: stressLevel[0],
          notes: text.trim() || undefined,
          source: capturedImage ? "camera" : "text",
        });

        toast({
          title: "Emotion Analyzed",
          description: "Your emotional state has been recorded successfully.",
        });
      } catch (logError) {
        console.error('Failed to log emotion:', logError);
        // Still show success for analysis even if logging fails
        toast({
          title: "Emotion Analyzed",
          description: "Analysis complete. Note: Failed to save to history.",
        });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Analysis error:', err);
      
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      
      if (errorMessage.includes('timed out') || errorMessage.includes('aborted')) {
        toast({
          title: "Analysis Timeout",
          description: "The analysis took too long. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [text, capturedImage, analyzing, focusLevel, stressLevel, currentSession?.id, logEmotion, toast]);

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
            <label className="block text-sm font-medium">Or capture/upload your expression</label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!isCameraActive && !capturedImage && !imageLoading && (
              <div className="flex gap-2">
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Use Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
              </div>
            )}

            {imageLoading && (
              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading image...</span>
              </div>
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
                  {!videoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
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

            {capturedImage && !imageLoading && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs text-foreground">
                    ✓ Image ready for analysis
                  </div>
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
