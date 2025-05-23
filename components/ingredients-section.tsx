"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function IngredientsSection() {
  const ingredients = [
    {
      name: "L-Arginine",
      description:
        "An amino acid that helps improve blood flow by producing nitric oxide, which relaxes blood vessels and enhances circulation throughout the body for better performance.",
      image: "/images/ingredients/l-arginine.png",
    },
    {
      name: "Horny Goat Weed",
      description:
        "A traditional Chinese herb that contains icariin, which helps to increase testosterone levels naturally and improve energy levels and stamina.",
      image: "/images/ingredients/horny-goat-weed.png",
    },
    {
      name: "Maca Root",
      description:
        "A Peruvian plant that has been used for centuries to boost energy, endurance, and libido. It helps balance hormone levels and increase vitality.",
      image: "/images/ingredients/maca-root.png",
    },
    {
      name: "Tribulus Terrestris",
      description:
        "A plant extract that supports muscle growth and strength by potentially increasing testosterone levels and improving protein synthesis in the body.",
      image: "/images/ingredients/tribulus-terrestris.png",
    },
    {
      name: "Saw Palmetto",
      description:
        "A natural extract that supports prostate health and helps maintain proper hormone balance, contributing to overall male wellness and vitality.",
      image: "/images/ingredients/saw-palmetto.png",
    },
    {
      name: "Ginseng",
      description:
        "An adaptogenic herb that helps the body resist stressors and increases energy levels. It improves mental clarity and physical performance.",
      image: "/images/ingredients/ginseng.png",
    },
    {
      name: "Zinc",
      description:
        "An essential mineral that plays a crucial role in testosterone production, immune function, and protein synthesis for muscle development.",
      image: "/images/ingredients/zinc.png",
    },
    {
      name: "Tongkat Ali",
      description:
        "Also known as Longjack, this Southeast Asian herb helps increase free testosterone levels and reduce cortisol, improving muscle mass and reducing stress.",
      image: "/images/ingredients/tongkat-ali.png",
    },
    {
      name: "Fenugreek",
      description:
        "A herb that helps boost testosterone levels naturally while also improving insulin function, which can help with muscle growth and recovery.",
      image: "/images/ingredients/fenugreek.png",
    },
    {
      name: "Boron",
      description:
        "A trace mineral that helps the body metabolize testosterone more efficiently and reduces the amount that gets converted to estrogen.",
      image: "/images/ingredients/boron.png",
    },
  ]

  return (
    <section className="mb-12 md:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true, amount: 0.1 }}
        className="backdrop-blur-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl md:rounded-3xl p-6 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] relative"
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-10 dark-theme:opacity-10 light-theme:opacity-5"></div>

        <div className="relative">
          <div className="flex items-center justify-center mb-6 md:mb-10">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full max-w-xs hidden md:block"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-[var(--text-primary)] mx-0 md:mx-6">
              Key Ingredients
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full max-w-xs hidden md:block"></div>
          </div>

          <div className="space-y-3 md:space-y-6">
            {ingredients.map((ingredient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                viewport={{ once: true, amount: 0.1 }}
                className="bg-[var(--card-inner-bg)] p-3 md:p-6 rounded-lg md:rounded-2xl border border-[var(--card-inner-border)] backdrop-blur-sm group hover:bg-[var(--card-inner-hover)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark-theme:hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] light-theme:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[var(--ingredient-border)] shadow-lg shadow-blue-900/20 dark-theme:shadow-blue-900/20 light-theme:shadow-blue-500/10">
                      <Image
                        src={ingredient.image || "/placeholder.svg"}
                        alt={ingredient.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-base md:text-xl font-bold text-[var(--ingredient-title)] group-hover:opacity-80 transition-colors duration-300 mb-1 md:mb-2">
                      {ingredient.name}
                    </h3>
                    <p className="text-xs md:text-base text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300">
                      {ingredient.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
