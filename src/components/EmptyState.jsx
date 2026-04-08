import React from "react";
import { SearchX, BookOpen, Palette, Upload } from "lucide-react";
import { Button } from "./ui/button";

const ICON_MAP = {
  "search": SearchX,
  "book": BookOpen,
  "palette": Palette,
  "upload": Upload,
};

export const EmptyState = ({
  icon = "search",
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const Icon = ICON_MAP[icon] || SearchX;

  return (
    <div className="animate-fade-in px-4 py-18 text-center">
      <div className="panel mx-auto flex max-w-xl flex-col items-center rounded-2xl px-6 py-10">
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <Icon className="h-10 w-10 text-amber-500/70" />
        </div>
        <h4 className="mb-1 text-lg font-semibold tracking-tight text-slate-100">{title}</h4>
        {description && (
          <p className="mb-5 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button
            variant="outline"
            size="default"
            onClick={onAction}
            className="motion-lift gap-2 border-amber-500/30 font-semibold text-amber-400 transition-colors duration-200 hover:bg-amber-500/10 hover:border-amber-500/50"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
