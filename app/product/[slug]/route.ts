import { type NextRequest, NextResponse } from "next/server"
import { getProductWithDetails, recordVisit } from "@/lib/models/product"

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductWithDetails(params.slug)

    if (!product) {
      return NextResponse.redirect(new URL("/404", req.url))
    }

    // Record the visit
    const headers = req.headers
    await recordVisit(
      product.id!,
      headers.get("x-forwarded-for") || req.ip,
      headers.get("user-agent"),
      headers.get("referer"),
    )

    // Redirect to the product's redirect link
    return NextResponse.redirect(product.redirect_link)
  } catch (error) {
    console.error("Error processing redirect:", error)
    return NextResponse.redirect(new URL("/500", req.url))
  }
}
