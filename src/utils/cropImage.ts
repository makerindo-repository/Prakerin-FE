/**
 * Center-crops an image to a square, then resizes it to `size x size`
 * (default 200x200), all client-side via <canvas>. Returns a new File
 * with the same name/type as the original so it can be sent straight to
 * the upload endpoint like any other selected file.
 */
export function resizeImageToSquare(file: File, size = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Center-crop to a square using the smaller dimension so we don't
      // stretch/distort the photo.
      const cropSize = Math.min(img.width, img.height);
      const sx = (img.width - cropSize) / 2;
      const sy = (img.height - cropSize) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung di browser ini."));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      // Keep PNG for transparency-capable types, JPEG otherwise (smaller file).
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputType === "image/jpeg" ? 0.9 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gagal memproses gambar."));
            return;
          }
          const resizedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("File bukan gambar yang valid."));
    };

    img.src = objectUrl;
  });
}

/**
 * Center-crops an image to a 3:4 aspect ratio ("pas foto" size commonly used in Indonesia),
 * then resizes it to a reasonable size (e.g. 300x400) client-side via <canvas>.
 */
export function resizeImageToPasFoto(file: File, width = 300, height = 400): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Determine the bounding box to center-crop at 3:4 aspect ratio
      const imageRatio = img.width / img.height;
      const targetRatio = width / height; // 3/4 = 0.75

      let cropWidth = img.width;
      let cropHeight = img.height;

      if (imageRatio > targetRatio) {
        // Image is wider than 3:4, crop sides
        cropWidth = img.height * targetRatio;
      } else {
        // Image is taller than 3:4, crop top/bottom
        cropHeight = img.width / targetRatio;
      }

      const sx = (img.width - cropWidth) / 2;
      const sy = (img.height - cropHeight) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung di browser ini."));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputType === "image/jpeg" ? 0.9 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gagal memproses gambar."));
            return;
          }
          const resizedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("File bukan gambar yang valid."));
    };

    img.src = objectUrl;
  });
}