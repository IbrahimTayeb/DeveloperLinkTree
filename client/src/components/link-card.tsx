import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  title: string;
  url: string;
  icon?: string;
  theme?: string;
  trackClick?: boolean;
  linkId?: string;
  className?: string;
}

export function LinkCard({ title, url, icon = "fas fa-link", theme = "gradient", trackClick = false, linkId, className }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const clickMutation = useMutation({
    mutationFn: async () => {
      if (trackClick && linkId) {
        const response = await apiRequest("POST", `/api/links/${linkId}/click`);
        return response.json();
      }
      return { url };
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (trackClick) {
      clickMutation.mutate();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "light":
        return "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
      case "dark":
        return "bg-gray-800 text-white border-gray-600 hover:bg-gray-700";
      default:
        return "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20";
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={clickMutation.isPending}
      className={cn(
        "link-card block w-full border rounded-xl p-4 text-center transition-all duration-200 transform",
        getThemeClasses(),
        isHovered && "translate-y-[-2px]",
        isHovered && theme === "gradient" && "shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)]",
        clickMutation.isPending && "opacity-50 cursor-not-allowed",
        className
      )}
      data-testid={`link-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-center space-x-3">
        <i className={cn(icon, "text-xl")} />
        <span className="font-medium">{title}</span>
      </div>
    </button>
  );
}
