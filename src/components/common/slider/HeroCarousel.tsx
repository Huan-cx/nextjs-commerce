"use client";

import * as React from "react";
import Image from "next/image";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import {GridTileImage} from "@/components/theme/ui/grid/Tile";
import {Shimmer} from "@/components/common/Shimmer";
import {HeroCarouselShimmer, HeroCarouselThumbnailShimmer,} from "./HeroCarouselShimmer";

export default function HeroCarousel({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const [current, setCurrent] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const prevSlide = () => {
    setIsLoading(true);
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIsLoading(true);
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <>
        <HeroCarouselShimmer />
        <HeroCarouselThumbnailShimmer count={3} />
      </>
    );
  }
  const buttonClassName =
    "flex h-full cursor-pointer items-center justify-center px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white";

  return (
    <>
      <div className="group relative overflow-hidden">
        <div
          key={current}
          className="group relative h-full max-h-[738px] w-full overflow-hidden rounded-2xl transition-opacity duration-600 ease-in-out"
          style={{
            aspectRatio: "380/316",
          }}
        >
          <div className="relative h-full w-full">
            {isLoading && (
              <Shimmer
                className="absolute inset-0 z-10 h-full w-full"
                rounded="lg"
              />
            )}
            <Image
              fill
              alt={images[current]?.altText as string}
              className={`h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              priority={true}
              sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 66vw, 1000px"
              src={images[current]?.src as string}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        </div>

        {images?.length > 1 ? (
          <div className="absolute bottom-[5%] flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-gray-500/70 bg-gray-500/70 text-white/80 backdrop-blur transition-all duration-300 dark:border-black dark:bg-neutral-900/80">
              <button
                aria-label="Previous image"
                className={buttonClassName}
                onClick={prevSlide}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-white/80" />
              <button
                aria-label="Next image"
                className={buttonClassName}
                onClick={nextSlide}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images?.length > 1 ? (
        <ul className="fade-in my-3 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden py-1 sm:my-7 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === current;

            return (
              <li
                key={image.src}
                className="relative aspect-square w-16 md:w-32 flex-shrink-0"
              >
                <button
                  className="h-full w-full"
                  onClick={() => {
                    setCurrent(index);
                  }}
                >
                  <GridTileImage
                    active={isActive}
                    alt={image.altText}
                    fill
                    objectFit="cover"
                    src={image.src}
                    sizes="(max-width: 768px) 16vw, 10vw"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : isLoading ? (
        <div className="my-3 sm:my-7 lg:mb-0">
          <div className="relative aspect-square w-16 md:w-32">
            <Shimmer className="h-full w-full" rounded="lg" />
          </div>
        </div>
      ) : null}
    </>
  );
}
