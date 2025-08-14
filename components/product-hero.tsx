"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CountdownTimer from "./countdown-timer";
import type { Product } from "@/lib/models/product";
import { getImagePath } from "@/lib/utils";

interface ProductHeroProps {
  product?: Product;
}

export default function ProductHero({ product }: ProductHeroProps) {
  return (
    <section className="mb-8 md:mb-20">
      <div className="relative backdrop-blur-sm bg-[#2a3441] border border-blue-500/30 rounded-xl md:rounded-3xl p-4 md:p-12 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full filter blur-[80px] opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 rounded-full filter blur-[80px] opacity-20"></div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 md:space-y-6"
            >
              <p className="text-xs sm:text-sm md:text-xl text-[var(--text-primary)] font-medium leading-relaxed">
                {product?.paragraph || "Now rebranded as "}

                {product?.paragraph
                  ? ""
                  : " – our premium male enhancement formula with powerful natural ingredients for maximum performance."}
              </p>

              {product?.bullet_points && product.bullet_points.length > 0 && (
                <ul className="space-y-2 md:space-y-3">
                  {product.bullet_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[var(--benefit-icon)] mt-1">•</span>
                      <span className="text-sm md:text-base text-[var(--text-primary)]">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <CountdownTimer />

              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <Button
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-yellow-500 to-yellow-400 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-500 text-sm md:text-lg py-3 md:py-7 rounded-xl transition-all duration-300 border border-yellow-400/20"
                  onClick={() => window.open(product?.redirect_link)}
                >
                  <span className="relative z-10 font-bold tracking-wider text-sm md:text-xl text-black">
                    ORDER NOW
                  </span>
                  <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full relative overflow-hidden group bg-transparent border-2 border-blue-400/50 hover:bg-blue-500/10 text-sm md:text-lg py-3 md:py-7 rounded-xl transition-all duration-300 text-blue-400 hover:text-blue-300"
                  onClick={() => {
                    document
                      .getElementById("rename-info-modal")
                      ?.classList.remove("hidden");
                  }}
                >
                  <span className="relative z-10 font-bold tracking-wider text-sm md:text-xl">
                    LEARN MORE
                  </span>
                  <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-blue-400 opacity-20 group-hover:animate-shine" />
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="relative order-1 md:order-2 flex justify-center mb-4 md:mb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Responsive bottle size - enhanced for mobile */}
              <div className="relative w-48 h-60 sm:w-56 sm:h-72 md:w-72 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-600/20 rounded-full filter blur-[60px] opacity-70"></div>
                <Image
                  src={getImagePath(
                    product?.product_image,
                    "/images/product.png"
                  )}
                  alt={`${product?.name || "product"} Product`}
                  fill
                  className="object-contain z-10"
                />
              </div>

              <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 z-20">
                <Image
                  src={getImagePath(
                    product?.product_badge,
                    "/images/New-and-Improved-Badge.png"
                  )}
                  alt="New and Improved Badge"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
