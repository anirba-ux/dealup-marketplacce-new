"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Gem,
} from "lucide-react";

// =====================================================
// Product Image
// =====================================================

interface ProductImage {
  url: string;
}

// =====================================================
// Props
// =====================================================

interface Props {
  images: ProductImage[];

  // ===================================================
  // Premium Seller
  // ===================================================

  sellerPremiumSeller?: boolean;

  sellerPremiumBadge?: boolean;
}

// =====================================================
// Product Image Gallery
// =====================================================

export default function ProductImageGallery({
  images,
  sellerPremiumSeller,
  sellerPremiumBadge,
}: Props) {
  // ===================================================
  // Selected Image
  // ===================================================

  const [selectedImage, setSelectedImage] =
    useState(images[0]?.url);

  // ===================================================
  // Fullscreen Preview
  // ===================================================

  const [openPreview, setOpenPreview] =
    useState(false);

  // ===================================================
  // Touch / Swipe
  // ===================================================

  const [touchStart, setTouchStart] =
    useState(0);

  const [touchEnd, setTouchEnd] =
    useState(0);

  // ===================================================
  // Premium Badge
  //
  // Badge appears ONLY when:
  //
  // sellerPremiumSeller === true
  // AND
  // sellerPremiumBadge === true
  //
  // ===================================================

  const hasPremiumBadge =
    sellerPremiumSeller === true &&
    sellerPremiumBadge === true;

  // ===================================================
  // Current Image Index
  // ===================================================

  const currentIndex =
    images.findIndex(
      (image) =>
        image.url === selectedImage,
    );

  // ===================================================
  // Previous Image
  // ===================================================

  function previousImage() {
    if (!images.length) {
      return;
    }

    if (currentIndex <= 0) {
      setSelectedImage(
        images[images.length - 1].url,
      );
    } else {
      setSelectedImage(
        images[currentIndex - 1].url,
      );
    }
  }

  // ===================================================
  // Next Image
  // ===================================================

  function nextImage() {
    if (!images.length) {
      return;
    }

    if (
      currentIndex ===
      images.length - 1
    ) {
      setSelectedImage(
        images[0].url,
      );
    } else {
      setSelectedImage(
        images[currentIndex + 1].url,
      );
    }
  }

  // ===================================================
  // Swipe Handler
  // ===================================================

  function handleSwipe() {
    const swipeDistance =
      touchStart - touchEnd;

    if (
      Math.abs(swipeDistance) < 80
    ) {
      return;
    }

    if (swipeDistance > 0) {
      nextImage();
    } else {
      previousImage();
    }

    // Reset touch positions

    setTouchStart(0);
    setTouchEnd(0);
  }

  // ===================================================
  // Keyboard Navigation
  // ===================================================

  useEffect(() => {
    if (!openPreview) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
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

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    openPreview,
    currentIndex,
  ]);

  // ===================================================
  // No Images
  // ===================================================

  if (!images.length) {
    return (
      <div
        className="
          flex
          aspect-[4/3]
          items-center
          justify-center
          rounded-3xl
          border
          border-slate-200
          bg-slate-100
          text-slate-500
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-400
        "
      >
        No image available
      </div>
    );
  }

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div>
      {/* =================================================
          MAIN IMAGE
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-lg
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <div
          onClick={() =>
            setOpenPreview(true)
          }
          onTouchStart={(e) => {
            setTouchStart(
              e.targetTouches[0]
                .clientX,
            );
          }}
          onTouchMove={(e) => {
            setTouchEnd(
              e.targetTouches[0]
                .clientX,
            );
          }}
          onTouchEnd={handleSwipe}
          className="
            group
            relative
            cursor-zoom-in
            overflow-hidden
          "
        >
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

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

          {/* =================================================
              PREMIUM SELLER BADGE

              Blue Diamond + Premium

              Appears on the product image
              only for active Premium Sellers.
          ================================================= */}

          {hasPremiumBadge && (
            <div
              className="
                absolute
                bottom-4
                left-4
                z-30

                inline-flex
                items-center
                gap-1.5

                rounded-full

                bg-gradient-to-r
                from-blue-600
                to-[#1565d8]

                px-4
                py-2

                text-sm
                font-bold
                text-white

                shadow-lg
                shadow-blue-600/30

                ring-1
                ring-white/30

                backdrop-blur-md

                transition-all
                duration-300

                group-hover:scale-105
              "
            >
              <Gem
                size={17}
                strokeWidth={2.8}
                className="text-white"
              />

              <span>
                Premium
              </span>
            </div>
          )}

          {/* =================================================
              IMAGE COUNTER
          ================================================= */}

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
            📷 {currentIndex + 1} /{" "}
            {images.length}
          </div>

          {/* =================================================
              PREVIOUS BUTTON
          ================================================= */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
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
              <ChevronLeft
                size={22}
              />
            </button>
          )}

          {/* =================================================
              NEXT BUTTON
          ================================================= */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
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
              <ChevronRight
                size={22}
              />
            </button>
          )}

          {/* =================================================
              IMAGE ASPECT RATIO
          ================================================= */}

          <div
            className="
              aspect-[4/3]
              lg:aspect-[16/14]
            "
          />
        </div>
      </div>

      {/* =================================================
          THUMBNAILS
      ================================================= */}

      {images.length > 1 && (
        <div
          className="
            mt-4
            flex
            gap-3
            overflow-x-auto
          "
        >
          {images.map(
            (image, index) => (
              <button
                type="button"
                key={index}
                onClick={() =>
                  setSelectedImage(
                    image.url,
                  )
                }
                aria-label={`Select image ${
                  index + 1
                }`}
                className={`
                  group

                  overflow-hidden

                  rounded-2xl

                  border-2

                  shadow-sm

                  transition-all
                  duration-300

                  ${
                    selectedImage ===
                    image.url
                      ? "scale-105 border-[#1565d8] shadow-lg"
                      : "border-transparent hover:scale-105 hover:border-blue-300"
                  }
                `}
              >
                <div
                  className="
                    relative
                    h-24
                    w-24
                  "
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${
                      index + 1
                    }`}
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
            ),
          )}
        </div>
      )}

      {/* =================================================
          FULLSCREEN PREVIEW
      ================================================= */}

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
          onClick={() =>
            setOpenPreview(false)
          }
        >
          {/* =================================================
              FULLSCREEN PREVIOUS
          ================================================= */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
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
              <ChevronLeft
                size={28}
              />
            </button>
          )}

          {/* =================================================
              FULLSCREEN IMAGE
          ================================================= */}

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

          {/* =================================================
              FULLSCREEN PREMIUM BADGE
          ================================================= */}

          {hasPremiumBadge && (
            <div
              className="
                absolute
                left-6
                top-6
                z-30

                inline-flex
                items-center
                gap-1.5

                rounded-full

                bg-gradient-to-r
                from-blue-600
                to-[#1565d8]

                px-4
                py-2

                text-sm
                font-bold
                text-white

                shadow-lg
                shadow-blue-600/30

                ring-1
                ring-white/30

                backdrop-blur-md
              "
            >
              <Gem
                size={17}
                strokeWidth={2.8}
                className="text-white"
              />

              <span>
                Premium
              </span>
            </div>
          )}

          {/* =================================================
              FULLSCREEN THUMBNAILS
          ================================================= */}

          <div
            className="
              absolute
              bottom-6
              left-1/2

              -translate-x-1/2
            "
          >
            <div
              className="
                flex
                gap-3
                overflow-x-auto

                rounded-2xl
                bg-black/40

                p-3

                backdrop-blur-md
              "
            >
              {images.map(
                (image, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();

                      setSelectedImage(
                        image.url,
                      );
                    }}
                    aria-label={`Select preview image ${
                      index + 1
                    }`}
                    className={`
                      relative

                      h-16
                      w-16

                      overflow-hidden

                      rounded-xl

                      border-2

                      transition-all

                      ${
                        selectedImage ===
                        image.url
                          ? "border-blue-500"
                          : "border-transparent hover:border-white"
                      }
                    `}
                  >
                    <Image
                      src={image.url}
                      alt={`Preview thumbnail ${
                        index + 1
                      }`}
                      fill
                      sizes="64px"
                      className="
                        object-cover
                      "
                    />
                  </button>
                ),
              )}
            </div>
          </div>

          {/* =================================================
              FULLSCREEN NEXT
          ================================================= */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
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
              <ChevronRight
                size={28}
              />
            </button>
          )}

          {/* =================================================
              FULLSCREEN COUNTER
          ================================================= */}

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
            {currentIndex + 1} /{" "}
            {images.length}
          </div>

          {/* =================================================
              CLOSE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setOpenPreview(false)
            }
            aria-label="Close preview"
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