import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Scan, Upload, X, Barcode as BarcodeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface BarcodeInputProps {
  onSubmit: (barcode: string) => void;
  isAnalyzing: boolean;
}

export const BarcodeInput = ({ onSubmit, isAnalyzing }: BarcodeInputProps) => {
  const [barcode, setBarcode] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSubmit(barcode.trim());
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleImageSubmit = () => {
    if (imageData) {
      // TODO: Add OCR logic to extract barcode from image
      toast({
        title: "Coming Soon",
        description: "Barcode image scanning will be available soon. Please use manual entry for now.",
      });
    }
  };

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Scan or Enter Barcode</h3>
        <p className="text-sm text-muted-foreground">
          Upload a barcode image or enter the number manually
        </p>
      </div>

      <Tabs defaultValue="enter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="enter" className="gap-2">
            <BarcodeIcon className="h-4 w-4" />
            Enter Barcode
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enter" className="mt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="e.g., 012345678901"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              disabled={isAnalyzing}
              className="text-lg h-12"
              pattern="[0-9]*"
              inputMode="numeric"
            />

            <Button
              type="submit"
              disabled={!barcode.trim() || isAnalyzing}
              className="w-full h-12 text-base font-semibold gradient-hero hover:opacity-90 transition-opacity shadow-glow"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-5 w-5" />
                  Analyze Product
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          {!preview ? (
            <label className="block">
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <BarcodeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Click to upload barcode image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isAnalyzing}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={preview}
                  alt="Barcode preview"
                  className="w-full h-auto max-h-64 object-contain bg-muted/30"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                  disabled={isAnalyzing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleImageSubmit}
                disabled={isAnalyzing}
                className="w-full h-12 text-base font-semibold gradient-hero hover:opacity-90 transition-opacity shadow-glow"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-5 w-5" />
                    Scan Barcode
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Find the barcode on the back or bottom of your product package. It's usually a series of 8-13 digits.
        </p>
      </div>
    </div>
  );
};
