"use client";

import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  presets?: string[];
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FF8000",
  "#8000FF",
  "#0080FF",
  "#80FF00",
  "#FF0080",
  "#00FF80",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#C0C0C0",
  "#808080",
  "#000000",
  "#FFFFFF",
];

export function ColorPicker({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
  disabled = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`space-y-2 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: value }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
          disabled={disabled}
        />
        <Input
          type="color"
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
          className="w-12 h-10 p-1 cursor-pointer"
          disabled={disabled}
        />
      </div>

      {isOpen && !disabled && (
        <div className="grid grid-cols-6 gap-1 p-2 border rounded-md bg-white shadow-sm">
          {presets.map((color, index) => (
            <button
              key={index}
              className="w-8 h-8 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setIsOpen(false);
              }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
