"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductTheme } from "@/lib/models/product"

const defaultTheme: ProductTheme = {
  primaryColor: "#ff5722",
  secondaryColor: "#f44336",
  accentColor: "#ffc107",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  headingColor: "#111111",
  buttonColor: "#ff5722",
  buttonTextColor: "#ffffff",
  fontFamily: "Inter, sans-serif",
  borderRadius: "8px",
  customCSS: "",
}

const presetThemes = [
  {
    name: "Default",
    theme: defaultTheme,
  },
  {
    name: "Dark",
    theme: {
      primaryColor: "#ff5722",
      secondaryColor: "#f44336",
      accentColor: "#ffc107",
      backgroundColor: "#121212",
      textColor: "#e0e0e0",
      headingColor: "#ffffff",
      buttonColor: "#ff5722",
      buttonTextColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
      customCSS: "",
    },
  },
  {
    name: "Blue",
    theme: {
      primaryColor: "#2196f3",
      secondaryColor: "#1976d2",
      accentColor: "#03a9f4",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      headingColor: "#111111",
      buttonColor: "#2196f3",
      buttonTextColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
      customCSS: "",
    },
  },
  {
    name: "Green",
    theme: {
      primaryColor: "#4caf50",
      secondaryColor: "#388e3c",
      accentColor: "#8bc34a",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      headingColor: "#111111",
      buttonColor: "#4caf50",
      buttonTextColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
      customCSS: "",
    },
  },
]

interface ThemeCustomizerProps {
  initialTheme?: ProductTheme
  onChange: (theme: ProductTheme) => void
}

export function ThemeCustomizer({ initialTheme = defaultTheme, onChange }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState<ProductTheme>(initialTheme || defaultTheme)

  const handleChange = (key: keyof ProductTheme, value: string) => {
    const updatedTheme = { ...theme, [key]: value }
    setTheme(updatedTheme)
    onChange(updatedTheme)
  }

  const applyPreset = (presetTheme: ProductTheme) => {
    setTheme(presetTheme)
    onChange(presetTheme)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
        <CardDescription>Customize the appearance of your product page</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="mb-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="presets">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {presetThemes.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => applyPreset(preset.theme)}
                >
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.theme.primaryColor }}></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.theme.secondaryColor }}
                    ></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.theme.accentColor }}></div>
                  </div>
                  <span>{preset.name}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headingColor">Heading Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="headingColor"
                    type="color"
                    value={theme.headingColor}
                    onChange={(e) => handleChange("headingColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.headingColor}
                    onChange={(e) => handleChange("headingColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonColor"
                    type="color"
                    value={theme.buttonColor}
                    onChange={(e) => handleChange("buttonColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.buttonColor}
                    onChange={(e) => handleChange("buttonColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonTextColor">Button Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonTextColor"
                    type="color"
                    value={theme.buttonTextColor}
                    onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.buttonTextColor}
                    onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <select
                  id="fontFamily"
                  value={theme.fontFamily}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Oswald', sans-serif">Oswald</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Input
                  id="borderRadius"
                  type="text"
                  value={theme.borderRadius}
                  onChange={(e) => handleChange("borderRadius", e.target.value)}
                  placeholder="8px"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customCSS">Custom CSS</Label>
                <textarea
                  id="customCSS"
                  value={theme.customCSS || ""}
                  onChange={(e) => handleChange("customCSS", e.target.value)}
                  className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                  placeholder="/* Add your custom CSS here */"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Preview</h3>
          <div
            className="p-4 rounded-md"
            style={{
              backgroundColor: theme.backgroundColor as React.CSSProperties['backgroundColor'],
              color: theme.textColor as React.CSSProperties['color'],
              fontFamily: theme.fontFamily as React.CSSProperties['fontFamily'],
              borderRadius: theme.borderRadius as React.CSSProperties['borderRadius'],
            }}
          >
            <h1 style={{ color: theme.headingColor as React.CSSProperties['color'] }}>Sample Heading</h1>
            <p>This is how your text will look with the current theme settings.</p>
            <button
              className="px-4 py-2 mt-2 rounded-md"
              style={{
                backgroundColor: theme.buttonColor as React.CSSProperties['backgroundColor'],
                color: theme.buttonTextColor as React.CSSProperties['color'],
                borderRadius: theme.borderRadius as React.CSSProperties['borderRadius'],
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
