"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        setIsActive(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: remainingSeconds.toString().padStart(2, "0"),
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);

  // Calculate percentage for progress bar
  const progressPercentage = (timeLeft / 240) * 100;

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 dark:border-indigo-400/30">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800"></div>

      {/* Animated pulse overlay */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20"
      />

      {/* Content container */}
      <div className="relative p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          {/* Timer info */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-full">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg md:text-xl uppercase tracking-wider">
                LIMITED TIME OFFER
              </h3>
              <p className="text-yellow-300/80 text-sm md:text-base">
                Hurry, Stock Running Low!
              </p>
            </div>
          </div>

          {/* Timer display */}
          <div className="flex items-center space-x-2">
            {/* Minutes */}
            <div className="bg-white dark:bg-indigo-900/80 backdrop-blur-sm rounded-lg p-2 md:p-3 w-16 md:w-20 text-center border border-white/20 dark:border-indigo-400/30">
              <AnimatePresence mode="wait">
                <motion.span
                  key={minutes}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block text-2xl md:text-3xl font-bold text-red-600 dark:text-white"
                >
                  {minutes}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-red-600 dark:text-red-300 font-medium">
                MINUTES
              </span>
            </div>

            <span className="text-white text-2xl md:text-3xl font-bold">:</span>

            {/* Seconds */}
            <div className="bg-white dark:bg-indigo-900/80 backdrop-blur-sm rounded-lg p-2 md:p-3 w-16 md:w-20 text-center border border-white/20 dark:border-indigo-400/30">
              <AnimatePresence mode="wait">
                <motion.span
                  key={seconds}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block text-2xl md:text-3xl font-bold text-red-600 dark:text-white"
                >
                  {seconds}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-red-600 dark:text-red-300 font-medium">
                SECONDS
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 md:mt-4 bg-white/20 dark:bg-indigo-900/30 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-400"
          />
        </div>

        {/* Alert message */}
        {timeLeft < 60 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center justify-center"
          >
            <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-300 mr-1.5" />
            <p className="text-yellow-300 text-xs md:text-sm font-medium">
              Almost gone! Complete your order now.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
