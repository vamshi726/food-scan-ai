import { useZxing } from "react-zxing";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Loader2, FlashlightOff, Flashlight, Check } from "lucide-react";

interface CameraScannerProps {
  onResult: (barcode: string) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export const CameraScanner = ({ onResult, onClose, isAnalyzing }: CameraScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const hasSubmittedRef = useRef(false);

  const {
    ref,
    torch: { on, off, isOn, isAvailable },
  } = useZxing({
    onDecodeResult(result) {
      const text = result.getText();
      // Only set detected barcode if not already analyzing or confirming
      if (text && !isAnalyzing && !isConfirming && !hasSubmittedRef.current) {
        setDetectedBarcode(text);
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

  // Handle barcode confirmation - auto-confirm after 1.5 seconds of stable detection
  useEffect(() => {
    if (detectedBarcode && !isAnalyzing && !hasSubmittedRef.current) {
      setIsConfirming(true);
      const timer = setTimeout(() => {
        if (!hasSubmittedRef.current) {
          hasSubmittedRef.current = true;
          onResult(detectedBarcode);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [detectedBarcode, isAnalyzing, onResult]);

  const handleManualConfirm = () => {
    if (detectedBarcode && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      onResult(detectedBarcode);
    }
  };

  const handleRescan = () => {
    setDetectedBarcode(null);
    setIsConfirming(false);
    hasSubmittedRef.current = false;
  };

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
            {/* Corner brackets - green when detected */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors ${detectedBarcode ? 'border-green-500' : 'border-primary'}`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors ${detectedBarcode ? 'border-green-500' : 'border-primary'}`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors ${detectedBarcode ? 'border-green-500' : 'border-primary'}`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors ${detectedBarcode ? 'border-green-500' : 'border-primary'}`} />

            {/* Scanning line animation - only show when not detected */}
            {!isAnalyzing && !detectedBarcode && (
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            )}

            {/* Detected checkmark */}
            {detectedBarcode && !isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-2 animate-in zoom-in duration-200">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detected barcode info */}
        {detectedBarcode && !isAnalyzing && (
          <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg pointer-events-auto">
            <div className="text-center mb-3">
              <p className="text-xs text-muted-foreground">Barcode Detected</p>
              <p className="font-mono font-semibold text-lg">{detectedBarcode}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleRescan}
              >
                Rescan
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleManualConfirm}
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Auto-confirming in a moment...
            </p>
          </div>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Analyzing product...</p>
              <p className="text-xs text-muted-foreground mt-1">Searching databases...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {detectedBarcode ? "Barcode detected! Confirm or rescan" : "Point your camera at the barcode"}
        </p>
      </div>
    </div>
  );
};
