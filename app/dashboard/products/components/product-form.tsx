"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, ArrowRight, ArrowLeft } from "lucide-react"
import Image from "next/image"
import ThemeCustomizer from "./theme-customizer"
import type { ProductTheme } from "@/lib/models/theme"
import { defaultTheme } from "@/lib/models/theme"

interface Ingredient {
  id?: number
  title: string
  description: string
  image?: string | File
  display_order: number
  isNew?: boolean
}

interface WhyChoose {
  id?: number
  title: string
  description: string
  display_order: number
  isNew?: boolean
}

interface ProductFormProps {
  productId?: number
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!productId

  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    redirect_link: "",
    money_back_days: 60,
    product_image: null as File | null,
    product_badge: null as File | null,
    product_image_preview: "",
    product_badge_preview: "",
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [whyChoose, setWhyChoose] = useState<WhyChoose[]>([])
  const [theme, setTheme] = useState<ProductTheme | null>(null)

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ingredientErrors, setIngredientErrors] = useState<Record<string, Record<string, string>>>({})
  const [whyChooseErrors, setWhyChooseErrors] = useState<Record<string, Record<string, string>>>({})

  // Load existing product data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchProductData = async () => {
        try {
          setLoadingData(true)
          const response = await axios.get(`/api/products/${productId}`)
          const product = response.data

          setFormData({
            name: product.name,
            description: product.description,
            redirect_link: product.redirect_link,
            money_back_days: product.money_back_days,
            product_image: null,
            product_badge: null,
            product_image_preview: product.product_image,
            product_badge_preview: product.product_badge,
          })

          if (product.ingredients) {
            setIngredients(product.ingredients)
          }

          if (product.why_choose) {
            setWhyChoose(product.why_choose)
          }

          if (product.theme) {
            setTheme(product.theme)
          } else {
            setTheme({ ...defaultTheme, product_id: productId })
          }
        } catch (error) {
          console.error("Error fetching product data:", error)
        } finally {
          setLoadingData(false)
        }
      }

      fetchProductData()
    } else {
      // For new products, initialize with default theme
      setTheme({ ...defaultTheme, product_id: 0 })
    }
  }, [productId, isEditing])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target

    if (files && files.length > 0) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)

      setFormData((prev) => ({
        ...prev,
        [name]: file,
        [`${name}_preview`]: previewUrl,
      }))
    }
  }

  // Handle theme changes
  const handleThemeChange = (updatedTheme: Partial<ProductTheme>) => {
    setTheme((prev) => ({ ...prev, ...updatedTheme }) as ProductTheme)
  }

  // Handle theme preview
  const handleThemePreview = () => {
    // Open preview in new tab with theme applied
    if (productId) {
      window.open(`/product/${productId}?preview=true`, "_blank")
    }
  }

  // Add a new ingredient
  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        image: undefined,
        display_order: prev.length,
        isNew: true,
      },
    ])
  }

  // Remove an ingredient
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))

    // Remove any errors for this ingredient
    setIngredientErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index.toString()]
      return newErrors
    })
  }

  // Handle ingredient input changes
  const handleIngredientChange = (index: number, field: string, value: string | File) => {
    setIngredients((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })

    // Clear error for this field if it exists
    if (ingredientErrors[index]?.[field]) {
      setIngredientErrors((prev) => {
        const newErrors = { ...prev }
        if (newErrors[index]) {
          delete newErrors[index][field]
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index]
          }
        }
        return newErrors
      })
    }
  }

  // Handle ingredient file changes
  const handleIngredientFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target

    if (files && files.length > 0) {
      const file = files[0]
      handleIngredientChange(index, "image", file)
    }
  }

  // Add a new why choose point
  const addWhyChoose = () => {
    setWhyChoose((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        display_order: prev.length,
        isNew: true,
      },
    ])
  }

  // Remove a why choose point
  const removeWhyChoose = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index))

    // Remove any errors for this why choose point
    setWhyChooseErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index.toString()]
      return newErrors
    })
  }

  // Handle why choose input changes
  const handleWhyChooseChange = (index: number, field: string, value: string) => {
    setWhyChoose((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })

    // Clear error for this field if it exists
    if (whyChooseErrors[index]?.[field]) {
      setWhyChooseErrors((prev) => {
        const newErrors = { ...prev }
        if (newErrors[index]) {
          delete newErrors[index][field]
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index]
          }
        }
        return newErrors
      })
    }
  }

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate basic info
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.redirect_link.trim()) {
      newErrors.redirect_link = "Redirect link is required"
    } else if (!isValidUrl(formData.redirect_link)) {
      newErrors.redirect_link = "Invalid URL format"
    }

    if (!formData.money_back_days || isNaN(Number(formData.money_back_days))) {
      newErrors.money_back_days = "Money back guarantee days must be a number"
    }

    setErrors(newErrors)

    // Validate ingredients
    const newIngredientErrors: Record<string, Record<string, string>> = {}

    ingredients.forEach((ingredient, index) => {
      const ingredientError: Record<string, string> = {}

      if (!ingredient.title.trim()) {
        ingredientError.title = "Title is required"
      }

      if (!ingredient.description.trim()) {
        ingredientError.description = "Description is required"
      }

      if (Object.keys(ingredientError).length > 0) {
        newIngredientErrors[index.toString()] = ingredientError
      }
    })

    setIngredientErrors(newIngredientErrors)

    // Validate why choose points
    const newWhyChooseErrors: Record<string, Record<string, string>> = {}

    whyChoose.forEach((item, index) => {
      const whyChooseError: Record<string, string> = {}

      if (!item.title.trim()) {
        whyChooseError.title = "Title is required"
      }

      if (!item.description.trim()) {
        whyChooseError.description = "Description is required"
      }

      if (Object.keys(whyChooseError).length > 0) {
        newWhyChooseErrors[index.toString()] = whyChooseError
      }
    })

    setWhyChooseErrors(newWhyChooseErrors)

    // Return true if no errors
    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(newIngredientErrors).length === 0 &&
      Object.keys(newWhyChooseErrors).length === 0
    )
  }

  // Check if a string is a valid URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // If there are errors, switch to the appropriate tab
      if (Object.keys(errors).length > 0) {
        setActiveTab("basic")
      } else if (Object.keys(ingredientErrors).length > 0) {
        setActiveTab("ingredients")
      } else if (Object.keys(whyChooseErrors).length > 0) {
        setActiveTab("why-choose")
      }
      return
    }

    setLoading(true)

    try {
      // Create FormData object
      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("redirect_link", formData.redirect_link)
      data.append("money_back_days", formData.money_back_days.toString())

      if (formData.product_image) {
        data.append("product_image", formData.product_image)
      }

      if (formData.product_badge) {
        data.append("product_badge", formData.product_badge)
      }

      // Create or update the product
      let productResponse
      if (isEditing) {
        productResponse = await axios.put(`/api/products/${productId}`, data)
      } else {
        productResponse = await axios.post("/api/products", data)
      }

      const product = productResponse.data

      // Handle ingredients
      if (isEditing) {
        // Delete all existing ingredients and add new ones
        await axios.delete(`/api/products/${product.id}/ingredients`)
      }

      // Add ingredients
      for (const ingredient of ingredients) {
        const ingredientData = new FormData()
        ingredientData.append("title", ingredient.title)
        ingredientData.append("description", ingredient.description)
        ingredientData.append("display_order", ingredient.display_order.toString())

        if (ingredient.image instanceof File) {
          ingredientData.append("image", ingredient.image)
        } else if (typeof ingredient.image === "string") {
          ingredientData.append("current_image", ingredient.image)
        }

        await axios.post(`/api/products/${product.id}/ingredients`, ingredientData)
      }

      // Handle why choose points
      if (isEditing) {
        // Delete all existing why choose points and add new ones
        await axios.delete(`/api/products/${product.id}/why-choose`)
      }

      // Add why choose points
      for (const item of whyChoose) {
        await axios.post(`/api/products/${product.id}/why-choose`, {
          title: item.title,
          description: item.description,
          display_order: item.display_order,
        })
      }

      // Save theme
      if (theme) {
        await axios.post(`/api/products/${product.id}/theme`, theme)
      }

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if the current tab is valid
  const isTabValid = (tab: string) => {
    switch (tab) {
      case "basic":
        return Object.keys(errors).length === 0
      case "ingredients":
        return Object.keys(ingredientErrors).length === 0
      case "why-choose":
        return Object.keys(whyChooseErrors).length === 0
      case "theme":
        return true // Theme is always valid
      default:
        return true
    }
  }

  // Navigate to the next tab
  const goToNextTab = () => {
    if (activeTab === "basic" && isTabValid("basic")) {
      setActiveTab("ingredients")
    } else if (activeTab === "ingredients" && isTabValid("ingredients")) {
      setActiveTab("why-choose")
    } else if (activeTab === "why-choose" && isTabValid("why-choose")) {
      setActiveTab("theme")
    }
  }

  // Navigate to the previous tab
  const goToPrevTab = () => {
    if (activeTab === "ingredients") {
      setActiveTab("basic")
    } else if (activeTab === "why-choose") {
      setActiveTab("ingredients")
    } else if (activeTab === "theme") {
      setActiveTab("why-choose")
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="why-choose">Why Choose</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Product Information</CardTitle>
              <CardDescription>Enter the basic details about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={5}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect_link">Redirect Link *</Label>
                <Input
                  id="redirect_link"
                  name="redirect_link"
                  value={formData.redirect_link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/buy-now"
                  className={errors.redirect_link ? "border-red-500" : ""}
                />
                {errors.redirect_link && <p className="text-red-500 text-sm">{errors.redirect_link}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="money_back_days">Money Back Guarantee (Days) *</Label>
                <Input
                  id="money_back_days"
                  name="money_back_days"
                  type="number"
                  value={formData.money_back_days}
                  onChange={handleInputChange}
                  placeholder="60"
                  className={errors.money_back_days ? "border-red-500" : ""}
                />
                {errors.money_back_days && <p className="text-red-500 text-sm">{errors.money_back_days}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_image">Product Image</Label>
                  <Input
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.product_image_preview && (
                    <div className="mt-2 relative w-32 h-32 border rounded">
                      <Image
                        src={formData.product_image_preview || "/placeholder.svg"}
                        alt="Product Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_badge">Product Badge</Label>
                  <Input
                    id="product_badge"
                    name="product_badge"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.product_badge_preview && (
                    <div className="mt-2 relative w-32 h-32 border rounded">
                      <Image
                        src={formData.product_badge_preview || "/placeholder.svg"}
                        alt="Badge Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="button" onClick={goToNextTab} disabled={!isTabValid("basic")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Product Ingredients</CardTitle>
              <CardDescription>Add the key ingredients of your product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`ingredient-title-${index}`}>Title *</Label>
                        <Input
                          id={`ingredient-title-${index}`}
                          value={ingredient.title}
                          onChange={(e) => handleIngredientChange(index, "title", e.target.value)}
                          placeholder="Ingredient name"
                          className={ingredientErrors[index]?.title ? "border-red-500" : ""}
                        />
                        {ingredientErrors[index]?.title && (
                          <p className="text-red-500 text-sm">{ingredientErrors[index].title}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ingredient-image-${index}`}>Image</Label>
                        <Input
                          id={`ingredient-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleIngredientFileChange(index, e)}
                        />
                        {typeof ingredient.image === "string" && ingredient.image && (
                          <div className="mt-2 relative w-16 h-16 border rounded">
                            <Image
                              src={ingredient.image || "/placeholder.svg"}
                              alt={`Ingredient ${index + 1}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`ingredient-description-${index}`}>Description *</Label>
                      <Textarea
                        id={`ingredient-description-${index}`}
                        value={ingredient.description}
                        onChange={(e) => handleIngredientChange(index, "description", e.target.value)}
                        placeholder="Describe the ingredient and its benefits"
                        rows={3}
                        className={ingredientErrors[index]?.description ? "border-red-500" : ""}
                      />
                      {ingredientErrors[index]?.description && (
                        <p className="text-red-500 text-sm">{ingredientErrors[index].description}</p>
                      )}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={goToPrevTab}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="button" onClick={goToNextTab} disabled={!isTabValid("ingredients")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="why-choose">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose This Product</CardTitle>
              <CardDescription>Add reasons why customers should choose this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {whyChoose.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeWhyChoose(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor={`why-choose-title-${index}`}>Title *</Label>
                      <Input
                        id={`why-choose-title-${index}`}
                        value={item.title}
                        onChange={(e) => handleWhyChooseChange(index, "title", e.target.value)}
                        placeholder="Feature or benefit title"
                        className={whyChooseErrors[index]?.title ? "border-red-500" : ""}
                      />
                      {whyChooseErrors[index]?.title && (
                        <p className="text-red-500 text-sm">{whyChooseErrors[index].title}</p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`why-choose-description-${index}`}>Description *</Label>
                      <Textarea
                        id={`why-choose-description-${index}`}
                        value={item.description}
                        onChange={(e) => handleWhyChooseChange(index, "description", e.target.value)}
                        placeholder="Explain this feature or benefit"
                        rows={3}
                        className={whyChooseErrors[index]?.description ? "border-red-500" : ""}
                      />
                      {whyChooseErrors[index]?.description && (
                        <p className="text-red-500 text-sm">{whyChooseErrors[index].description}</p>
                      )}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addWhyChoose} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Reason
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={goToPrevTab}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="button" onClick={goToNextTab} disabled={!isTabValid("why-choose")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <ThemeCustomizer
            productId={productId}
            theme={theme}
            onThemeChange={handleThemeChange}
            onPreview={handleThemePreview}
          />
          <Card className="mt-4">
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={goToPrevTab}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="submit" disabled={loading || !isTabValid("theme")}>
                {loading ? "Saving..." : "Save Product"}
                {!loading && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
