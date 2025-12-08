import { useZxing } from "react-zxing";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Loader2, FlashlightOff, Flashlight } from "lucide-react";

interface CameraScannerProps {
  onResult: (barcode: string) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export const CameraScanner = ({ onResult, onClose, isAnalyzing }: CameraScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    ref,
    torch: { on, off, isOn, isAvailable },
  } = useZxing({
    onDecodeResult(result) {
      const text = result.getText();
      if (text && !isAnalyzing) {
        onResult(text);
      }
    },
    onError(err) {
      console.error("Scanner error:", err);
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setHasPermission(false);
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      }
    },
    paused: isAnalyzing,
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
  });

  useEffect(() => {
    // Check camera permission on mount
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  if (hasPermission === false || error) {
    return (
      <div className="relative bg-muted rounded-xl p-8 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClose}
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
              {error || "Please allow camera access to scan barcodes."}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Use Manual Entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Close button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 z-20"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Torch button */}
      {isAvailable && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 left-3 z-20"
          onClick={() => (isOn ? off() : on())}
        >
          {isOn ? (
            <FlashlightOff className="h-5 w-5" />
          ) : (
            <Flashlight className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Camera view */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
        <video
          ref={ref}
          className="w-full h-full object-cover"
        />

        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-32">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

            {/* Scanning line animation */}
            {!isAnalyzing && (
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            )}
          </div>
        </div>

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Analyzing product...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Point your camera at the barcode
        </p>
      </div>
    </div>
  );
};
