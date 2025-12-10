import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scan, UserPlus, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 z-50">
        <Logo size="md" />
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 border-primary/20 shadow-xl">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20">
            <Scan className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Nutri<span className="text-primary">Scan</span> AI
          </h1>

          <p className="text-muted-foreground text-lg">
            Your AI-powered nutrition companion
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate("/signup")}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </Button>

          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Button>

          <Button
            onClick={() => navigate("/home")}
            variant="ghost"
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Sign in to get personalized health recommendations based on your profile
        </p>
      </Card>
    </div>
  );
}
