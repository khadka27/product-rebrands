import { type NextRequest, NextResponse } from "next/server"
import { createProduct, getAllProducts, getProductStats } from "@/lib/models/product"
import { validateProduct } from "@/lib/utils"
import multer from "multer"
import { processImage } from "@/lib/utils"
import path from "path"
import { ensureDirectoryExists } from "@/lib/utils"
import type { Express } from "express"

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() })

// Helper function to run multer middleware
async function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const stats = url.searchParams.get("stats")

    if (stats === "true") {
      const statsData = await getProductStats()
      return NextResponse.json(statsData)
    } else {
      const products = await getAllProducts()
      return NextResponse.json(products)
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    // Process product image
    let product_image = ""
    const productImageFile = formData.get("product_image") as File
    if (productImageFile) {
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

    // Process badge image
    let product_badge = ""
    const badgeImageFile = formData.get("product_badge") as File
    if (badgeImageFile) {
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

    // Create the product
    const product = await createProduct({
      name,
      description,
      redirect_link,
      product_image,
      product_badge,
      money_back_days,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
