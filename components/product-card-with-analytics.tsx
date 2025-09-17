"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Info, ShoppingCart } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
}

interface ProductCardProps {
  product: Product;
  listName?: string;
}

export function ProductCard({
  product,
  listName = "Shop Page Products",
}: ProductCardProps) {
  const { trackProductView, trackCustomEvent, trackAddToCartEvent } =
    useAnalytics();

  const handleProductClick = () => {
    // Track product selection
    trackCustomEvent("select_item", {
      currency: "USD",
      value: parseFloat(product.price),
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          category: product.category,
          price: parseFloat(product.price),
          quantity: 1,
        },
      ],
      item_list_name: listName,
    });
  };

  const handleViewDetails = () => {
    // Track when user clicks to view product details
    trackProductView({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      category: product.category,
      brand: "Verified Supplements",
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track add to cart event
    trackAddToCartEvent([
      {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        category: product.category,
        brand: "Verified Supplements",
      },
    ]);

    // You would also add the actual cart logic here
    console.log("Added to cart:", product.name);
  };

  return (
    <Card
      className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      <CardHeader className="p-0 relative">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={400}
          height={300}
          className="object-cover w-full h-48 md:h-56"
        />
        <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center">
          <Tag className="h-3 w-3 mr-1" /> {product.category}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 hover:text-primary transition-colors">
          <Link href={`/shop/${product.id}`} onClick={handleViewDetails}>
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden">
          {product.description}
        </p>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="text-yellow-500">
            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}
          </span>
          <span className="ml-1">({product.reviews} reviews)</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl font-bold text-primary">${product.price}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={handleViewDetails}
            >
              <Link href={`/shop/${product.id}`}>
                <Info className="mr-2 h-4 w-4" /> View Details
              </Link>
            </Button>
            <Button size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
