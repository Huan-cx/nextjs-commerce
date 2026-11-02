"use client";

import HeroCarousel from "@/components/common/slider/HeroCarousel";
import {useProductGallery} from "./ProductGalleryContext";

export function ProductGallery() {
  const {images, currentIndex, setCurrentIndex} = useProductGallery();

  return (
      <HeroCarousel
          images={images}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
      />
  );
}
