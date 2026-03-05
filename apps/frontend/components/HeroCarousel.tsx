"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Banner {
  id: number | string;
  image: string;
  title: string;
  subtitle?: string;
}

interface HeroCarouselProps {
  banners: Banner[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Handle autoplay safely (avoid banners.length = 0 crash)
  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners]);

  // No banners → no UI
  if (!banners || banners.length === 0) return null;

  const slideVariants = {
    enter: { x: "100%" },
    center: { x: 0 },
    exit: { x: "-100%" },
  };

  const handleDotClick = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto mt-2 overflow-hidden rounded-2xl shadow-lg">
      <div id="hero-carousel" className="relative h-[400px] sm:h-[500px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={banners[current]?.id ?? current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.3 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={banners[current].image}
              alt={banners[current].title}
              fill
              priority
              className="object-cover"
            />

            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {banners[current].title}
              </h2>

              {banners[current].subtitle && (
                <p className="text-lg text-gray-200">
                  {banners[current].subtitle}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div data-testid="hero-carousel-dots" className="absolute bottom-5 left-0 right-0 flex justify-center gap-3">
        {banners.map((_, index) => (
          <motion.button
            key={`dot-${index}`}
            onClick={() => handleDotClick(index)}
            className={`h-3 w-3 rounded-full transition-all duration-500 ${
              index === current ? "bg-blue-500 w-6" : "bg-gray-400"
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
