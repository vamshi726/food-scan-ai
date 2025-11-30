import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Scan } from "lucide-react";

interface BarcodeInputProps {
  onSubmit: (barcode: string) => void;
  isAnalyzing: boolean;
}

export const BarcodeInput = ({ onSubmit, isAnalyzing }: BarcodeInputProps) => {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSubmit(barcode.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Scan or Enter Barcode</h3>
        <p className="text-sm text-muted-foreground">
          Enter the barcode number found on your food package
        </p>
      </div>

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

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Find the barcode on the back or bottom of your product package. It's usually a series of 8-13 digits.
        </p>
      </div>
    </div>
  );
};
