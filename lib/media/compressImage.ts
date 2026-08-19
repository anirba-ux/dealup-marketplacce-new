export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
  } = options;

  const image = await loadImage(file);

  let width = image.naturalWidth;
  let height = image.naturalHeight;

  const scale = Math.min(
    1,
    maxWidth / width,
    maxHeight / height,
  );

  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Could not create image canvas.",
    );
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  const blob =
    await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          resolve,
          "image/webp",
          quality,
        );
      },
    );

  if (!blob) {
    throw new Error(
      "Image compression failed.",
    );
  }

  const fileName =
    file.name.replace(
      /\.[^/.]+$/,
      ".webp",
    );

  return new File(
    [blob],
    fileName,
    {
      type: "image/webp",
      lastModified: Date.now(),
    },
  );
}

function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      const url =
        URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);

        reject(
          new Error(
            "Could not load image.",
          ),
        );
      };

      image.src = url;
    },
  );
}