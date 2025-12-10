import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Loader2, Check, RotateCcw, Image as ImageIcon } from "lucide-react";

interface LabelCameraScannerProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export const LabelCameraScanner = ({ onCapture, onClose, isAnalyzing }: LabelCameraScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
          setHasPermission(true);
          setIsInitializing(false);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      const error = err as Error;
      setHasPermission(false);
      setIsInitializing(false);
      
      if (error.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Could not access camera. Please check permissions.");
      }
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Stop camera stream before submitting
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      onCapture(capturedImage);
    }
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Hidden canvas for capture
  const hiddenCanvas = <canvas ref={canvasRef} className="hidden" />;

  if (isInitializing) {
    return (
      <div className="relative bg-muted rounded-xl p-8">
        {hiddenCanvas}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Starting camera...</p>
        </div>
        <video ref={videoRef} className="hidden" playsInline muted />
      </div>
    );
  }

  if (hasPermission === false || error) {
    return (
      <div className="relative bg-muted rounded-xl p-8 text-center">
        {hiddenCanvas}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <Camera className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Camera Access Required</h3>
            <p className="text-sm text-muted-foreground">
              {error || "Please allow camera access to take photos."}
            </p>
          </div>
          <Button variant="outline" onClick={handleClose}>
            Use File Upload
          </Button>
        </div>
      </div>
    );
  }

  // Show captured image preview
  if (capturedImage) {
    return (
      <div className="relative">
        {hiddenCanvas}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 z-20"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative rounded-xl overflow-hidden bg-black">
          <img
            src={capturedImage}
            alt="Captured nutrition label"
            className="w-full h-auto max-h-[60vh] object-contain"
          />

          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Analyzing label...</p>
                <p className="text-xs text-muted-foreground mt-1">Reading nutrition facts...</p>
              </div>
            </div>
          )}
        </div>

        {!isAnalyzing && (
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRetake}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
            >
              <Check className="h-4 w-4 mr-2" />
              Analyze Label
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {hiddenCanvas}
      
      {/* Close button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 z-20"
        onClick={handleClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Camera view */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Frame overlay for nutrition label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[85%] h-[70%] border-2 border-primary/50 rounded-lg">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            
            {/* Label icon */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Position label here</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capture button */}
      <div className="mt-4 flex justify-center">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full gradient-hero shadow-lg"
          onClick={handleCapture}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-3">
        Center the nutrition label in the frame and tap capture
      </p>
    </div>
  );
};
