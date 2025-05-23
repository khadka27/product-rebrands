import { type NextRequest, NextResponse } from "next/server"
import { getProductWithDetails, updateProduct, deleteProduct, recordVisit } from "@/lib/models/product"
import { validateProduct } from "@/lib/utils"
import { processImage, ensureDirectoryExists } from "@/lib/utils"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getProductWithDetails(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Record visit if not an API call
    const url = new URL(req.url)
    if (!url.pathname.startsWith("/api/")) {
      const headers = req.headers
      await recordVisit(
        product.id!,
        headers.get("x-forwarded-for") || req.ip,
        headers.get("user-agent"),
        headers.get("referer"),
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Parse the form data
    const formData = await req.formData()

    // Extract product data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const redirect_link = formData.get("redirect_link") as string
    const money_back_days = Number.parseInt(formData.get("money_back_days") as string)

    // Validate product data
    const validation = validateProduct({
      name,
      description,
      redirect_link,
      money_back_days,
    })

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Get existing product
    const existingProduct = await getProductWithDetails(Number.parseInt(params.id))
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Process product image if provided
    let product_image = existingProduct.product_image
    const productImageFile = formData.get("product_image") as File
    if (productImageFile && productImageFile.size > 0) {
      const buffer = Buffer.from(await productImageFile.arrayBuffer())
      const filename = `product_${Date.now()}`
      const targetDir = path.join(process.cwd(), "public", "images", "products")

      ensureDirectoryExists(targetDir)
      product_image = await processImage(
        { buffer, originalname: productImageFile.name } as Express.Multer.File,
        targetDir,
        filename,
      )
    }

    // Process badge image if provided
    let product_badge = existingProduct.product_badge
    const badgeImageFile = formData.get("product_badge") as File
    if (badgeImageFile && badgeImageFile.size > 0) {
      const buffer = Buffer.from(await badgeImageFile.arrayBuffer())
      const filename = `badge_${Date.now()}`
      const targetDir = path.join(process.cwd(), "public", "images", "badges")

      ensureDirectoryExists(targetDir)
      product_badge = await processImage(
        { buffer, originalname: badgeImageFile.name } as Express.Multer.File,
        targetDir,
        filename,
      )
    }

    // Update the product
    const updated = await updateProduct(Number.parseInt(params.id), {
      name,
      description,
      redirect_link,
      product_image,
      product_badge,
      money_back_days,
    })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    // Get the updated product
    const updatedProduct = await getProductWithDetails(Number.parseInt(params.id))
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteProduct(Number.parseInt(params.id))

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
