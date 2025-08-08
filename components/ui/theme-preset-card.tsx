"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductTheme } from "@/lib/models/product-theme";

interface ThemePresetCardProps {
  theme: ProductTheme;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePresetCard({
  theme,
  name,
  isSelected,
  onClick,
}: ThemePresetCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Theme Preview */}
          <div
            className="h-16 rounded-md p-3 flex items-center justify-between"
            style={{
              backgroundColor: theme.primary_bg_color,
              color: theme.primary_text_color,
            }}
          >
            <div className="text-sm font-medium">Sample Text</div>
            <div
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: theme.primary_button_bg,
                color: theme.primary_button_text,
              }}
            >
              Button
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex gap-1">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: theme.primary_bg_color }}
              title="Primary Background"
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: theme.secondary_bg_color }}
              title="Secondary Background"
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: theme.accent_bg_color }}
              title="Accent"
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: theme.primary_button_bg }}
              title="Primary Button"
            />
          </div>

          {/* Theme Name */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{name}</span>
            {isSelected && (
              <Badge variant="default" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
