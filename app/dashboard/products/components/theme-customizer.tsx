"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Eye, Palette, RotateCcw } from "lucide-react"
import type { ProductTheme } from "@/lib/models/theme"
import { defaultTheme } from "@/lib/models/theme"

interface ThemeCustomizerProps {
  productId?: number
  theme: ProductTheme | null
  onThemeChange: (theme: Partial<ProductTheme>) => void
  onPreview: () => void
}

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Nunito, sans-serif", label: "Nunito" },
  { value: "Source Sans Pro, sans-serif", label: "Source Sans Pro" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Merriweather, serif", label: "Merriweather" },
]

const presetThemes = [
  {
    name: "Modern Blue",
    theme: {
      primary_bg_color: "#ffffff",
      secondary_bg_color: "#f8fafc",
      primary_text_color: "#1e293b",
      secondary_text_color: "#64748b",
      primary_button_bg: "#3b82f6",
      primary_button_text: "#ffffff",
      card_bg_color: "#ffffff",
      card_border_color: "#e2e8f0",
      gradient_start: "#3b82f6",
      gradient_end: "#1d4ed8",
    },
  },
  {
    name: "Dark Mode",
    theme: {
      primary_bg_color: "#0f172a",
      secondary_bg_color: "#1e293b",
      primary_text_color: "#f8fafc",
      secondary_text_color: "#cbd5e1",
      primary_button_bg: "#6366f1",
      primary_button_text: "#ffffff",
      card_bg_color: "#1e293b",
      card_border_color: "#334155",
      gradient_start: "#6366f1",
      gradient_end: "#8b5cf6",
    },
  },
  {
    name: "Green Nature",
    theme: {
      primary_bg_color: "#f0fdf4",
      secondary_bg_color: "#dcfce7",
      primary_text_color: "#14532d",
      secondary_text_color: "#166534",
      primary_button_bg: "#16a34a",
      primary_button_text: "#ffffff",
      card_bg_color: "#ffffff",
      card_border_color: "#bbf7d0",
      gradient_start: "#16a34a",
      gradient_end: "#15803d",
    },
  },
  {
    name: "Orange Sunset",
    theme: {
      primary_bg_color: "#fff7ed",
      secondary_bg_color: "#ffedd5",
      primary_text_color: "#9a3412",
      secondary_text_color: "#c2410c",
      primary_button_bg: "#ea580c",
      primary_button_text: "#ffffff",
      card_bg_color: "#ffffff",
      card_border_color: "#fed7aa",
      gradient_start: "#ea580c",
      gradient_end: "#dc2626",
    },
  },
  {
    name: "Purple Luxury",
    theme: {
      primary_bg_color: "#faf5ff",
      secondary_bg_color: "#f3e8ff",
      primary_text_color: "#581c87",
      secondary_text_color: "#7c3aed",
      primary_button_bg: "#8b5cf6",
      primary_button_text: "#ffffff",
      card_bg_color: "#ffffff",
      card_border_color: "#ddd6fe",
      gradient_start: "#8b5cf6",
      gradient_end: "#7c3aed",
    },
  },
]

export default function ThemeCustomizer({ productId, theme, onThemeChange, onPreview }: ThemeCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState<ProductTheme>(
    theme || { ...defaultTheme, product_id: productId || 0 },
  )
  const [activeTab, setActiveTab] = useState("colors")

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  const handleInputChange = (field: keyof ProductTheme, value: string) => {
    const updatedTheme = { ...currentTheme, [field]: value }
    setCurrentTheme(updatedTheme)
    onThemeChange(updatedTheme)
  }

  const applyPresetTheme = (preset: any) => {
    const updatedTheme = { ...currentTheme, ...preset.theme }
    setCurrentTheme(updatedTheme)
    onThemeChange(updatedTheme)
  }

  const resetToDefault = () => {
    const resetTheme = { ...defaultTheme, product_id: productId || 0 }
    setCurrentTheme(resetTheme)
    onThemeChange(resetTheme)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Customization
            </CardTitle>
            <CardDescription>Customize the appearance of your product page</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Theme Presets</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose from pre-designed themes to quickly style your product page
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetThemes.map((preset, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => applyPresetTheme(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">{preset.name}</h4>
                        <div className="flex space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.theme.primary_bg_color }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.theme.primary_button_bg }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.theme.gradient_start }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.theme.gradient_end }}
                          />
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Apply Theme
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            {/* Background Colors */}
            <div>
              <Label className="text-base font-medium">Background Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_bg_color">Primary Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_bg_color"
                      type="color"
                      value={currentTheme.primary_bg_color}
                      onChange={(e) => handleInputChange("primary_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.primary_bg_color}
                      onChange={(e) => handleInputChange("primary_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_bg_color">Secondary Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_bg_color"
                      type="color"
                      value={currentTheme.secondary_bg_color}
                      onChange={(e) => handleInputChange("secondary_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.secondary_bg_color}
                      onChange={(e) => handleInputChange("secondary_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_bg_color">Accent Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent_bg_color"
                      type="color"
                      value={currentTheme.accent_bg_color}
                      onChange={(e) => handleInputChange("accent_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.accent_bg_color}
                      onChange={(e) => handleInputChange("accent_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Text Colors */}
            <div>
              <Label className="text-base font-medium">Text Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_text_color">Primary Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_text_color"
                      type="color"
                      value={currentTheme.primary_text_color}
                      onChange={(e) => handleInputChange("primary_text_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.primary_text_color}
                      onChange={(e) => handleInputChange("primary_text_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_text_color">Secondary Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_text_color"
                      type="color"
                      value={currentTheme.secondary_text_color}
                      onChange={(e) => handleInputChange("secondary_text_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.secondary_text_color}
                      onChange={(e) => handleInputChange("secondary_text_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link_color">Link Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="link_color"
                      type="color"
                      value={currentTheme.link_color}
                      onChange={(e) => handleInputChange("link_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.link_color}
                      onChange={(e) => handleInputChange("link_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Button Colors */}
            <div>
              <Label className="text-base font-medium">Button Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_button_bg">Primary Button Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_button_bg"
                      type="color"
                      value={currentTheme.primary_button_bg}
                      onChange={(e) => handleInputChange("primary_button_bg", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.primary_button_bg}
                      onChange={(e) => handleInputChange("primary_button_bg", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_button_text">Primary Button Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_button_text"
                      type="color"
                      value={currentTheme.primary_button_text}
                      onChange={(e) => handleInputChange("primary_button_text", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.primary_button_text}
                      onChange={(e) => handleInputChange("primary_button_text", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_button_hover_bg">Button Hover</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_button_hover_bg"
                      type="color"
                      value={currentTheme.primary_button_hover_bg}
                      onChange={(e) => handleInputChange("primary_button_hover_bg", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.primary_button_hover_bg}
                      onChange={(e) => handleInputChange("primary_button_hover_bg", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Card Colors */}
            <div>
              <Label className="text-base font-medium">Card & Section Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="card_bg_color">Card Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="card_bg_color"
                      type="color"
                      value={currentTheme.card_bg_color}
                      onChange={(e) => handleInputChange("card_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.card_bg_color}
                      onChange={(e) => handleInputChange("card_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_border_color">Card Border</Label>
                  <div className="flex gap-2">
                    <Input
                      id="card_border_color"
                      type="color"
                      value={currentTheme.card_border_color}
                      onChange={(e) => handleInputChange("card_border_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.card_border_color}
                      onChange={(e) => handleInputChange("card_border_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_shadow_color">Card Shadow</Label>
                  <div className="flex gap-2">
                    <Input
                      id="card_shadow_color"
                      type="color"
                      value={currentTheme.card_shadow_color}
                      onChange={(e) => handleInputChange("card_shadow_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.card_shadow_color}
                      onChange={(e) => handleInputChange("card_shadow_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            {/* Font Family */}
            <div>
              <Label className="text-base font-medium">Font Family</Label>
              <div className="mt-3">
                <select
                  value={currentTheme.font_family}
                  onChange={(e) => handleInputChange("font_family", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            {/* Heading Styles */}
            <div>
              <Label className="text-base font-medium">Heading Styles</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="h1_font_size">H1 Font Size</Label>
                  <Input
                    id="h1_font_size"
                    value={currentTheme.h1_font_size}
                    onChange={(e) => handleInputChange("h1_font_size", e.target.value)}
                    placeholder="2.5rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h1_font_weight">H1 Font Weight</Label>
                  <select
                    value={currentTheme.h1_font_weight}
                    onChange={(e) => handleInputChange("h1_font_weight", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h2_font_size">H2 Font Size</Label>
                  <Input
                    id="h2_font_size"
                    value={currentTheme.h2_font_size}
                    onChange={(e) => handleInputChange("h2_font_size", e.target.value)}
                    placeholder="2rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h2_font_weight">H2 Font Weight</Label>
                  <select
                    value={currentTheme.h2_font_weight}
                    onChange={(e) => handleInputChange("h2_font_weight", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h3_font_size">H3 Font Size</Label>
                  <Input
                    id="h3_font_size"
                    value={currentTheme.h3_font_size}
                    onChange={(e) => handleInputChange("h3_font_size", e.target.value)}
                    placeholder="1.5rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h3_font_weight">H3 Font Weight</Label>
                  <select
                    value={currentTheme.h3_font_weight}
                    onChange={(e) => handleInputChange("h3_font_weight", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Body Text */}
            <div>
              <Label className="text-base font-medium">Body Text</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="body_font_size">Body Font Size</Label>
                  <Input
                    id="body_font_size"
                    value={currentTheme.body_font_size}
                    onChange={(e) => handleInputChange("body_font_size", e.target.value)}
                    placeholder="1rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_line_height">Line Height</Label>
                  <Input
                    id="body_line_height"
                    value={currentTheme.body_line_height}
                    onChange={(e) => handleInputChange("body_line_height", e.target.value)}
                    placeholder="1.6"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            {/* Spacing */}
            <div>
              <Label className="text-base font-medium">Spacing</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="section_padding">Section Padding</Label>
                  <Input
                    id="section_padding"
                    value={currentTheme.section_padding}
                    onChange={(e) => handleInputChange("section_padding", e.target.value)}
                    placeholder="3rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_padding">Card Padding</Label>
                  <Input
                    id="card_padding"
                    value={currentTheme.card_padding}
                    onChange={(e) => handleInputChange("card_padding", e.target.value)}
                    placeholder="1.5rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_padding">Button Padding</Label>
                  <Input
                    id="button_padding"
                    value={currentTheme.button_padding}
                    onChange={(e) => handleInputChange("button_padding", e.target.value)}
                    placeholder="0.75rem 1.5rem"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Border Radius */}
            <div>
              <Label className="text-base font-medium">Border Radius</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="border_radius_sm">Small</Label>
                  <Input
                    id="border_radius_sm"
                    value={currentTheme.border_radius_sm}
                    onChange={(e) => handleInputChange("border_radius_sm", e.target.value)}
                    placeholder="0.375rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border_radius_md">Medium</Label>
                  <Input
                    id="border_radius_md"
                    value={currentTheme.border_radius_md}
                    onChange={(e) => handleInputChange("border_radius_md", e.target.value)}
                    placeholder="0.5rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border_radius_lg">Large</Label>
                  <Input
                    id="border_radius_lg"
                    value={currentTheme.border_radius_lg}
                    onChange={(e) => handleInputChange("border_radius_lg", e.target.value)}
                    placeholder="0.75rem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border_radius_xl">Extra Large</Label>
                  <Input
                    id="border_radius_xl"
                    value={currentTheme.border_radius_xl}
                    onChange={(e) => handleInputChange("border_radius_xl", e.target.value)}
                    placeholder="1rem"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Layout Settings */}
            <div>
              <Label className="text-base font-medium">Layout Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="max_width">Max Width</Label>
                  <Input
                    id="max_width"
                    value={currentTheme.max_width}
                    onChange={(e) => handleInputChange("max_width", e.target.value)}
                    placeholder="1200px"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="container_padding">Container Padding</Label>
                  <Input
                    id="container_padding"
                    value={currentTheme.container_padding}
                    onChange={(e) => handleInputChange("container_padding", e.target.value)}
                    placeholder="1rem"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Gradient Colors */}
            <div>
              <Label className="text-base font-medium">Gradient Effects</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="gradient_start">Gradient Start</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gradient_start"
                      type="color"
                      value={currentTheme.gradient_start}
                      onChange={(e) => handleInputChange("gradient_start", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.gradient_start}
                      onChange={(e) => handleInputChange("gradient_start", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradient_end">Gradient End</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gradient_end"
                      type="color"
                      value={currentTheme.gradient_end}
                      onChange={(e) => handleInputChange("gradient_end", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.gradient_end}
                      onChange={(e) => handleInputChange("gradient_end", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div
                className="mt-3 p-4 rounded-lg border"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.gradient_start}, ${currentTheme.gradient_end})`,
                }}
              >
                <p className="text-white text-center font-medium">Gradient Preview</p>
              </div>
            </div>

            <Separator />

            {/* Header & Footer */}
            <div>
              <Label className="text-base font-medium">Header & Footer</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="header_bg_color">Header Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="header_bg_color"
                      type="color"
                      value={currentTheme.header_bg_color}
                      onChange={(e) => handleInputChange("header_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.header_bg_color}
                      onChange={(e) => handleInputChange("header_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header_text_color">Header Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="header_text_color"
                      type="color"
                      value={currentTheme.header_text_color}
                      onChange={(e) => handleInputChange("header_text_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.header_text_color}
                      onChange={(e) => handleInputChange("header_text_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer_bg_color">Footer Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_bg_color"
                      type="color"
                      value={currentTheme.footer_bg_color}
                      onChange={(e) => handleInputChange("footer_bg_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.footer_bg_color}
                      onChange={(e) => handleInputChange("footer_bg_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer_text_color">Footer Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_text_color"
                      type="color"
                      value={currentTheme.footer_text_color}
                      onChange={(e) => handleInputChange("footer_text_color", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={currentTheme.footer_text_color}
                      onChange={(e) => handleInputChange("footer_text_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Custom CSS */}
            <div>
              <Label className="text-base font-medium">Custom CSS</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add custom CSS to further customize your product page
              </p>
              <Textarea
                value={currentTheme.custom_css || ""}
                onChange={(e) => handleInputChange("custom_css", e.target.value)}
                placeholder="/* Add your custom CSS here */
.custom-class {
  /* Your styles */
}"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
