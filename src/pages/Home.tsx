import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { 
  Scan, 
  MessageCircle, 
  History, 
  Settings, 
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  LogOut,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/welcome");
  };

  const features = [
    {
      icon: Scan,
      title: "Scan Products",
      description: "Analyze nutrition labels and barcodes instantly",
      action: () => navigate("/scan"),
      primary: true,
    },
    {
      icon: MessageCircle,
      title: "NutriCoach",
      description: "Get personalized nutrition advice",
      action: () => navigate("/coach"),
    },
    {
      icon: History,
      title: "Scan History",
      description: "View your previously scanned products",
      action: () => navigate("/scan"),
      disabled: true,
      comingSoon: true,
    },
  ];

  const stats = [
    { icon: Sparkles, label: "AI-Powered", value: "Analysis" },
    { icon: Shield, label: "Health Score", value: "1-10" },
    { icon: Zap, label: "Instant", value: "Results" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" showTagline={false} />
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome{user ? "" : " to NutriScan AI"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {user 
              ? "Ready to make healthier food choices? Start scanning or get personalized advice."
              : "Your AI-powered nutrition assistant. Scan products to get instant health insights."
            }
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 text-center bg-card/50 border-border/50">
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                feature.primary 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : feature.disabled 
                    ? "opacity-60 cursor-not-allowed bg-card/50" 
                    : "bg-card hover:bg-accent"
              }`}
              onClick={feature.disabled ? undefined : feature.action}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  feature.primary 
                    ? "bg-primary-foreground/20" 
                    : "bg-primary/10"
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.primary ? "text-primary-foreground" : "text-primary"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${
                      feature.primary ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {feature.title}
                    </h3>
                    {feature.comingSoon && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    feature.primary ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {feature.description}
                  </p>
                </div>
                
                <ChevronRight className={`h-5 w-5 ${
                  feature.primary ? "text-primary-foreground/60" : "text-muted-foreground"
                }`} />
              </div>
            </Card>
          ))}
        </section>

        {/* Tips Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Pro Tip</h3>
                <p className="text-sm text-muted-foreground">
                  For best results, ensure good lighting when scanning nutrition labels. 
                  Our AI can analyze both barcodes and nutrition fact images.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Bottom Navigation Hint */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pointer-events-none">
        <div className="container mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Tap "Scan Products" to get started
          </p>
        </div>
      </div>
    </div>
  );
}
