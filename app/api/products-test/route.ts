import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Test POST endpoint hit");
    const formData = await req.formData();
    console.log("Request FormData entries:");

    // Log all form data entries
    for (const [key, value] of formData.entries()) {
      console.log(
        `${key}:`,
        value instanceof File ? `File: ${value.name}` : value
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test POST working - FormData received",
      formDataKeys: Array.from(formData.keys()),
    });
  } catch (error) {
    console.error("Test POST error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Test POST failed", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test GET working",
  });
}
