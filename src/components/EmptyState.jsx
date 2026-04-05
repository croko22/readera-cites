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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <Icon className="h-10 w-10 text-amber-500/70" />
      </div>
      <h4 className="text-lg font-semibold text-slate-200 mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-slate-400 max-w-md mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="default"
          onClick={onAction}
          className="gap-2 font-semibold border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
