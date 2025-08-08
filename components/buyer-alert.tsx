"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import CounterfeitReplacementModal from "./counterfeit-replacement-modal"

import type { Product } from "@/lib/models/product";

interface BuyerAlertProps {
  product: Product;
}

export default function BuyerAlert({ product }: BuyerAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the alert after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: "auto", opacity: 1, marginBottom: "1.5rem" }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <div className="bg-[#DC2626] text-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-lg w-[95%] mx-auto border-l-4 border-yellow-400">
            <div className="flex items-center justify-center mb-2 md:mb-4">
              <AlertTriangle className="w-5 h-5 md:w-8 md:h-8 mr-2 md:mr-3 text-yellow-300 flex-shrink-0" />
              <span className="text-sm md:text-xl font-black uppercase tracking-wider text-yellow-300 text-center">
                Buyer Alert: Beware of Counterfeits
              </span>
            </div>
            <p className="text-sm md:text-base lg:text-lg text-center leading-relaxed mb-4 md:mb-6">
              Due to the popularity of our product, counterfeit versions are being sold under our old name. To protect
              our customers, we have officially renamed our authentic formula to{" "}
              <span className="font-bold text-yellow-100">{product?.name}</span>. Only purchase from authorized retailers to ensure you
              receive the genuine product.
            </p>

            {/* Counterfeit replacement button */}
            <div className="flex justify-center px-2 md:px-4">
              <CounterfeitReplacementModal product={product} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
