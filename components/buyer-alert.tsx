"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import CounterfeitReplacementModal from "./counterfeit-replacement-modal"

export default function BuyerAlert() {
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
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-2 md:p-6 rounded-lg md:rounded-xl shadow-lg w-[92%] mx-auto">
            <div className="flex items-center justify-center mb-1 md:mb-3">
              <AlertTriangle className="w-4 h-4 md:w-7 md:h-7 mr-1 md:mr-2 text-yellow-300" />
              <span className="text-xs md:text-lg font-black uppercase tracking-wider text-yellow-300">
                Buyer Alert: Beware of Counterfeits
              </span>
            </div>
            <p className="text-[10px] md:text-base lg:text-lg">
              Due to the popularity of our product, counterfeit versions are being sold under our old name. To protect
              our customers, we have officially renamed our authentic formula to{" "}
              <span className="font-bold">TRIBAL FORCE X</span>. Only purchase from authorized retailers to ensure you
              receive the genuine product.
            </p>

            {/* Counterfeit replacement button */}
            <div className="mt-1 md:mt-4 flex justify-center px-2 md:px-0">
              <CounterfeitReplacementModal />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
