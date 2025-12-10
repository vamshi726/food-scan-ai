import { Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showTagline = true, className = "" }: LogoProps) => {
  const navigate = useNavigate();

  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      icon: "w-4 h-4",
      title: "text-base",
      tagline: "text-[10px]",
    },
    md: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      title: "text-lg",
      tagline: "text-xs",
    },
    lg: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      title: "text-xl",
      tagline: "text-xs",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer select-none relative z-50 ${className}`}
      onClick={() => navigate("/home")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate("/home");
        }
      }}
    >
      <div
        className={`${config.container} flex items-center justify-center rounded-xl bg-primary shadow-md`}
      >
        <Scan className={`${config.icon} text-primary-foreground`} />
      </div>
      <div className="flex flex-col">
        <span className={`${config.title} font-bold leading-tight text-foreground`}>
          Nutri<span className="text-primary">Scan</span> AI
        </span>
        {showTagline && (
          <span className={`${config.tagline} text-muted-foreground leading-tight`}>
            Intelligent Food Analysis
          </span>
        )}
      </div>
    </div>
  );
};
