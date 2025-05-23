import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { generateProductId, processImage } from "@/lib/server-utils";
import multer from "multer";
import { Readable } from "stream";
import type { Express } from "express";

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to run multer middleware
function runMiddleware(req: NextRequest, middleware: any) {
  return new Promise((resolve, reject) => {
    const res: any = {};
    res.status = () => res;
    res.json = (data: any) => {
      res.data = data;
      return res;
    };
    res.end = () => {};

    const readable = new Readable();
    readable._read = () => {};
    readable.push(req.body);
    readable.push(null);

    const mockReq: any = {
      ...req,
      body: readable,
      headers: req.headers,
      file: null,
    };

    middleware(mockReq, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(mockReq);
    });
  });
}

export async function GET() {
  try {
    const connection = await db.getConnection();

    try {
      const [products]: any = await connection.query(
        "SELECT * FROM products ORDER BY created_at DESC"
      );

      return NextResponse.json(products);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const redirect_link = formData.get("redirect_link") as string;
    const money_back_days = Number.parseInt(
      formData.get("money_back_days") as string
    );
    const imageFile = formData.get("image") as File;

    // Generate slug and product ID
    const slug = generateSlug(name);
    const productId = generateProductId();

    // Process image if provided
    let imagePath = "";
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const file = {
        buffer,
        originalname: imageFile.name,
        mimetype: imageFile.type,
      } as Express.Multer.File;

      imagePath = await processImage(file, "public/images/products", slug);
    }

    // Create product in database
    const connection = await db.getConnection();

    try {
      const [result]: any = await connection.query(
        `INSERT INTO products 
        (name, description, slug, product_id, redirect_link, money_back_days, product_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          slug,
          productId,
          redirect_link,
          money_back_days,
          imagePath,
        ]
      );

      // Get the newly created product
      const [products]: any = await connection.query(
        "SELECT * FROM products WHERE id = ?",
        [result.insertId]
      );

      return NextResponse.json(products[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
