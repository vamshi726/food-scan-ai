import { useState } from "react";
import { BarcodeInput } from "./BarcodeInput";
import { ImageUpload } from "./ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Barcode, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { NutritionAnalysis } from "@/types/nutrition";

interface ScannerSectionProps {
  onAnalysisComplete: (analysis: NutritionAnalysis) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export const ScannerSection = ({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}: ScannerSectionProps) => {
  const [activeTab, setActiveTab] = useState("barcode");
  const { toast } = useToast();

  const handleBarcodeSubmit = async (barcode: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-nutrition", {
        body: { barcode },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      onAnalysisComplete(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your food has been analyzed successfully!",
      });
    } catch (error) {
      console.error("Error analyzing barcode:", error);
      toast({
        title: "Error",
        description: "Failed to analyze the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSubmit = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-nutrition", {
        body: { image: imageBase64 },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      onAnalysisComplete(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your food has been analyzed successfully!",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Error",
        description: "Failed to analyze the label. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 shadow-card border-border/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="barcode" className="gap-2">
            <Barcode className="h-4 w-4" />
            Barcode
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Label Photo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="barcode" className="mt-0">
          <BarcodeInput onSubmit={handleBarcodeSubmit} isAnalyzing={isAnalyzing} />
        </TabsContent>
        <TabsContent value="image" className="mt-0">
          <ImageUpload onSubmit={handleImageSubmit} isAnalyzing={isAnalyzing} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
