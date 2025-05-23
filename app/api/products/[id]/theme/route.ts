import { type NextRequest, NextResponse } from "next/server"
import { getProductTheme, upsertProductTheme, deleteProductTheme } from "@/lib/models/theme"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const theme = await getProductTheme(Number.parseInt(params.id))

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error("Error fetching theme:", error)
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const themeData = await req.json()

    const theme = await upsertProductTheme({
      product_id: Number.parseInt(params.id),
      ...themeData,
    })

    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    console.error("Error saving theme:", error)
    return NextResponse.json({ error: "Failed to save theme" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const themeData = await req.json()

    const theme = await upsertProductTheme({
      product_id: Number.parseInt(params.id),
      ...themeData,
    })

    return NextResponse.json(theme)
  } catch (error) {
    console.error("Error updating theme:", error)
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteProductTheme(Number.parseInt(params.id))

    if (!deleted) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting theme:", error)
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 })
  }
}
