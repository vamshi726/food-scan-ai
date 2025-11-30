import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onSubmit: (imageBase64: string) => void;
  isAnalyzing: boolean;
}

export const ImageUpload = ({ onSubmit, isAnalyzing }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSubmit = () => {
    if (imageData) {
      onSubmit(imageData);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Upload Nutrition Label</h3>
        <p className="text-sm text-muted-foreground">
          Take a clear photo of the nutrition facts and ingredients
        </p>
      </div>

      {!preview ? (
        <label className="block">
          <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
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
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain bg-muted/30"
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
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="w-full h-12 text-base font-semibold gradient-hero hover:opacity-90 transition-opacity shadow-glow"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Label...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Analyze Label
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Make sure the nutrition facts table and ingredients list are clearly visible
        </p>
      </div>
    </div>
  );
};
