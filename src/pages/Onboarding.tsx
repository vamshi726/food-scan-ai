import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const healthIssuesOptions = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "PCOS",
  "Thyroid Issues",
  "IBS",
  "Celiac Disease",
  "None",
];

const sensitivitiesOptions = [
  "Lactose",
  "Gluten",
  "Soy",
  "Caffeine",
  "Artificial Sweeteners",
  "MSG",
  "None",
];

const intolerancesOptions = [
  "Peanuts",
  "Tree Nuts",
  "Shellfish",
  "Eggs",
  "Fish",
  "Wheat",
  "Dairy",
  "None",
];

const dietaryPreferencesOptions = [
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Mediterranean",
  "Halal",
  "Kosher",
  "None",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [profileData, setProfileData] = useState({
    age: "",
    gender: "",
  });

  const [healthData, setHealthData] = useState({
    healthIssues: [] as string[],
    sensitivities: [] as string[],
    intolerances: [] as string[],
    dietaryPreferences: [] as string[],
  });

  const addItem = (category: keyof typeof healthData, item: string) => {
    if (!healthData[category].includes(item)) {
      setHealthData({
        ...healthData,
        [category]: [...healthData[category], item],
      });
    }
  };

  const removeItem = (category: keyof typeof healthData, item: string) => {
    setHealthData({
      ...healthData,
      [category]: healthData[category].filter((i) => i !== item),
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        age: parseInt(profileData.age) || null,
        gender: profileData.gender || null,
      })
      .eq("id", user.id);

    if (profileError) {
      toast({
        title: "Error",
        description: profileError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Insert health preferences
    const { error: healthError } = await supabase
      .from("health_preferences")
      .insert({
        user_id: user.id,
        health_issues: healthData.healthIssues,
        sensitivities: healthData.sensitivities,
        intolerances: healthData.intolerances,
        dietary_preferences: healthData.dietaryPreferences,
      });

    setLoading(false);

    if (healthError) {
      toast({
        title: "Error",
        description: healthError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile complete!",
      description: "You're all set to scan products",
    });
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 z-50">
        <Logo size="md" />
      </div>

      <Card className="w-full max-w-2xl p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Step {step} of 2: {step === 1 ? "Basic Info" : "Health Preferences"}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={profileData.age}
                onChange={(e) =>
                  setProfileData({ ...profileData, age: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profileData.gender}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Health Issues */}
            <div className="space-y-3">
              <Label>Health Issues</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {healthIssuesOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={healthData.healthIssues.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => addItem("healthIssues", option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {healthData.healthIssues.map((item) => (
                  <Badge key={item} className="gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeItem("healthIssues", item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sensitivities */}
            <div className="space-y-3">
              <Label>Sensitivities</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {sensitivitiesOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={healthData.sensitivities.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => addItem("sensitivities", option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {healthData.sensitivities.map((item) => (
                  <Badge key={item} className="gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeItem("sensitivities", item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Intolerances/Allergies */}
            <div className="space-y-3">
              <Label>Allergies & Intolerances</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {intolerancesOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={healthData.intolerances.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => addItem("intolerances", option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {healthData.intolerances.map((item) => (
                  <Badge key={item} className="gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeItem("intolerances", item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-3">
              <Label>Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {dietaryPreferencesOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={healthData.dietaryPreferences.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => addItem("dietaryPreferences", option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {healthData.dietaryPreferences.map((item) => (
                  <Badge key={item} className="gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeItem("dietaryPreferences", item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Back
              </Button>
              <Button onClick={handleSaveProfile} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
