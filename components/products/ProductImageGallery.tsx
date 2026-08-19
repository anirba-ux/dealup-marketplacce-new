"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImage {
  url: string;
}

interface Props {
  images: ProductImage[];
}

export default function ProductImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.url);
  const [openPreview, setOpenPreview] = useState(false);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const currentIndex = images.findIndex((image) => image.url === selectedImage);

  function previousImage() {
    if (currentIndex === 0) {
      setSelectedImage(images[images.length - 1].url);
    } else {
      setSelectedImage(images[currentIndex - 1].url);
    }
  }

  function nextImage() {
    if (currentIndex === images.length - 1) {
      setSelectedImage(images[0].url);
    } else {
      setSelectedImage(images[currentIndex + 1].url);
    }
  }

  function handleSwipe() {
    const swipeDistance = touchStart - touchEnd;

    
    if (Math.abs(swipeDistance) < 80) return;

    if (swipeDistance > 0) {
      nextImage();
    } else {
      previousImage();
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  }

  useEffect(() => {
    if (!openPreview) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "Escape") {
        setOpenPreview(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPreview, currentIndex]);

  return (
    <div>
      {/* Main Image */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div
          onClick={() => setOpenPreview(true)}
          onTouchStart={(e) => {
            setTouchStart(e.targetTouches[0].clientX);
          }}
          onTouchMove={(e) => {
            setTouchEnd(e.targetTouches[0].clientX);
          }}
          onTouchEnd={handleSwipe}
          className="
    group
    relative
    cursor-zoom-in
    overflow-hidden
  "
        >
          <Image
            src={selectedImage}
            alt="Product"
            fill
            priority
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          {/* Image Counter */}

          <div
            className="
              absolute
              right-4
              top-4

              rounded-full
              bg-black/60

              px-3
              py-1

              text-sm
              font-semibold
              text-white

              backdrop-blur-md
            "
          >
            📷 {currentIndex + 1} / {images.length}
          </div>

          {/* Previous */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="
              absolute
              left-4
              top-1/2

              -translate-y-1/2

              rounded-full
              bg-black/50

              p-3

              text-white

              backdrop-blur-md

              transition
              hover:bg-black/70
            "
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="
              absolute
              right-4
              top-1/2

              -translate-y-1/2

              rounded-full
              bg-black/50

              p-3

              text-white

              backdrop-blur-md

              transition
              hover:bg-black/70
            "
          >
            <ChevronRight size={22} />
          </button>

          <div className="aspect-[4/3] lg:aspect-[16/14]" />
        </div>
      </div>

      {/* Thumbnails */}

      <div className="mt-4 flex gap-3 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image.url)}
            className={`
              group

              overflow-hidden

              rounded-2xl

              border-2

              shadow-sm

              transition-all
              duration-300

              ${
                selectedImage === image.url
                  ? "scale-105 border-[#1565d8] shadow-lg"
                  : "border-transparent hover:scale-105 hover:border-blue-300"
              }
            `}
          >
            <div className="relative h-24 w-24">
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="96px"
                className="
                  object-cover

                  transition-transform
                  duration-300

                  group-hover:scale-110
                "
              />
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Preview */}

      {openPreview && (
        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/90

            p-6
          "
          onClick={() => setOpenPreview(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="
    absolute
    left-6
    top-1/2

    -translate-y-1/2

    rounded-full

    bg-white/20

    p-4

    text-white

    backdrop-blur-md

    transition

    hover:bg-white/40
  "
          >
            <ChevronLeft size={28} />
          </button>

          <Image
            src={selectedImage}
            alt="Preview"
            width={1400}
            height={1000}
            className="
              max-h-[90vh]
              w-auto

              rounded-2xl

              object-contain
            "
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex gap-3 overflow-x-auto rounded-2xl bg-black/40 p-3 backdrop-blur-md">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(image.url);
                  }}
                  className={`
          relative
          h-16
          w-16
          overflow-hidden
          rounded-xl
          border-2
          transition-all

          ${
            selectedImage === image.url
              ? "border-blue-500"
              : "border-transparent hover:border-white"
          }
        `}
                >
                  <Image
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="
    absolute
    right-6
    top-1/2

    -translate-y-1/2

    rounded-full

    bg-white/20

    p-4

    text-white

    backdrop-blur-md

    transition

    hover:bg-white/40
  "
          >
            <ChevronRight size={28} />
          </button>

          <div
            className="
    absolute
    bottom-28
    left-1/2

    -translate-x-1/2

    rounded-full

    bg-black/60

    px-5
    py-2

    text-white

    backdrop-blur-md
  "
          >
            {currentIndex + 1} / {images.length}
          </div>

          <button
            onClick={() => setOpenPreview(false)}
            className="
              absolute
              right-6
              top-6

              rounded-full

              bg-white/20

              p-3

              text-white

              backdrop-blur-md

              transition
              hover:bg-white/40
            "
          >
            <X size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
