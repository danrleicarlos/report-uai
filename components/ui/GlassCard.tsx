"use client";

import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  glow?: "blue" | "cyan" | "emerald" | "violet" | "none";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const glowMap = {
  none: "",
  blue: "hover:shadow-glow-blue",
  cyan: "hover:shadow-glow-cyan",
  emerald: "hover:shadow-glow-emerald",
  violet: "hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = "default", hover = false, glow = "none", padding = "md", className = "", children, ...props }, ref) => {
    const base =
      variant === "strong"
        ? "bg-white/[0.07] backdrop-blur-2xl border border-white/10"
        : variant === "subtle"
        ? "bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
        : "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]";

    const hoverStyles = hover
      ? "transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.13] hover:-translate-y-0.5 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={`rounded-2xl shadow-glass ${base} ${hoverStyles} ${glowMap[glow]} ${paddingMap[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
