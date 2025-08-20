import { ProductForm } from "@/app/dashboard/products/components/product-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Package } from "lucide-react";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <nav className="flex items-center space-x-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <span className="text-gray-400">/</span>
                <Button variant="ghost" size="sm" disabled>
                  <Package className="mr-2 h-4 w-4" />
                  New Product
                </Button>
              </nav>
            </div>
            <div className="text-sm text-gray-500">
              Create New Product
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-8">Create New Product</h1>
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
