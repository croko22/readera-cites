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
    <div className="animate-fade-in-up px-4 py-18 text-center">
      <div className="panel mx-auto flex max-w-xl flex-col items-center rounded-2xl border-border px-6 py-10">
        <div className="mb-4 rounded-xl border border-border bg-secondary p-4">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h4 className="mb-1 text-lg font-semibold tracking-tight text-foreground">{title}</h4>
        {description && (
          <p className="mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button
            variant="default"
            size="default"
            onClick={onAction}
            className="motion-lift gap-2 font-semibold"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
