"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SafeImage from "@/components/ui/safe-image";
import { Check } from "lucide-react";
import type { Product } from "@/lib/models/product";
import { resolveProductImagePath } from "@/lib/utils";

interface ProductFeaturesProps {
  product: Product;
}

export default function ProductFeatures({ product }: ProductFeaturesProps) {
  return (
    <section className="mb-12 md:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true, amount: 0.1 }}
        className="backdrop-blur-sm bg-[#2a3441] border border-blue-500/30 rounded-xl md:rounded-3xl p-6 md:p-12 overflow-hidden relative"
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-10"></div>

        <div className="relative">
          <div className="flex items-center justify-center mb-6 md:mb-10">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full max-w-xs hidden md:block"></div>
            {/* Enhanced responsive text size for better mobile readability */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mx-0 md:mx-6 whitespace-normal md:whitespace-nowrap">
              The {product?.name} Difference
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full max-w-xs hidden md:block"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 md:space-y-6"
              >
                <h3 className="text-lg md:text-2xl font-bold text-cyan-400">
                  Premium Quality Formula
                </h3>
                <p className="text-sm md:text-lg text-gray-300">
                  {product?.name} is manufactured in state-of-the-art facilities
                  under strict quality control standards. Our formula has been
                  perfected over years of research to deliver maximum results
                  with no side effects.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm md:text-lg">
                      FDA Registered Facility
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm md:text-lg">
                      GMP Certified Manufacturing
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm md:text-lg">
                      Third-Party Tested for Purity
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm md:text-lg">
                      Made in the USA
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <div className="relative order-1 md:order-2 flex justify-center mb-6 md:mb-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true, amount: 0.1 }}
                className="relative"
              >
                {/* Responsive bottle size - enhanced for mobile */}
                <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-700/20 rounded-full filter blur-[60px] opacity-70"></div>
                  <SafeImage
                    src={resolveProductImagePath(product?.product_image)}
                    alt="Product Image"
                    fill
                    className="object-contain z-10"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
