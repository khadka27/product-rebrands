"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import { resolveAvatarImagePath } from "@/lib/utils";
import { Product } from "@/lib/models/product";

interface TestimonialsSectionProps {
  product?: Product;
}

export default function TestimonialsSection({
  product,
}: TestimonialsSectionProps) {
  // Use reviews from product data if available, otherwise fall back to hardcoded testimonials
  const reviews = product?.reviews || [];

  const testimonials =
    reviews.length > 0
      ? reviews.map((review, index) => ({
          text: review.review_text,
          name: review.name,
          location: review.address,
          rating: review.rating,
          image: resolveAvatarImagePath(review.avatar || ""),
        }))
      : [
          // Fallback testimonials if no reviews in database
          {
            text: `I've been using ${product?.name} for 3 weeks, and the results are amazing! It gave me the energy and confidence I needed. My workouts are more productive and I feel stronger than ever.`,
            name: "Michael R.",
            location: "42, New York, NY",
            rating: 5,
            image: "/placeholder-user.jpg",
          },
          {
            text: `I'm amazed by how quickly I felt the difference. My workouts are better, and my energy levels have skyrocketed! I've tried other supplements before, but nothing compares to ${product?.name}.`,
            name: "David T.",
            location: "38, Los Angeles, CA",
            rating: 5,
            image: "/placeholder-user.jpg",
          },
          {
            text: `After trying several products, ${product?.name} is the only one that delivered real results. Highly recommended! I've noticed significant improvements in just two weeks of use.`,
            name: "James K.",
            location: "45, Chicago, IL",
            rating: 4,
            image: "/placeholder-user.jpg",
          },
        ];

  return (
    <section className="mb-12 md:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true, amount: 0.1 }}
        className="backdrop-blur-sm bg-[#2a3441] border border-purple-400/30 rounded-xl md:rounded-3xl p-6 md:p-12 overflow-hidden relative"
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-10"></div>

        <div className="relative">
          <div className="flex items-center justify-center mb-6 md:mb-10">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-xs hidden md:block"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mx-0 md:mx-6">
              Customer Reviews
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-xs hidden md:block"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={`testimonial-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true, amount: 0.1 }}
                className="bg-[#1e2633] p-3 md:p-6 rounded-lg md:rounded-2xl border border-purple-500/20 backdrop-blur-sm group hover:bg-[#243040] transition-all duration-300 relative"
              >
                <Quote className="absolute top-3 right-3 w-4 h-4 md:w-8 md:h-8 text-purple-400" />

                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-purple-500/30 mr-2 md:mr-4">
                    <SafeImage
                      src={resolveAvatarImagePath(testimonial.image)}
                      alt={`${testimonial.name} photo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm md:text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-xs md:text-base text-gray-300">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="flex mb-2 md:mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`star-${index}-${i}`}
                      className={`w-3 h-3 md:w-5 md:h-5 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-500"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm md:text-lg text-gray-300 italic mb-3 md:mb-4 group-hover:text-white transition-colors duration-300 line-clamp-4 md:line-clamp-none">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
