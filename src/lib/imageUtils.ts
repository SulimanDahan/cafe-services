/**
 * Compress an image file using HTML5 Canvas API before uploading.
 * @param file The original image File object.
 * @param maxWidth Maximum width of the compressed image.
 * @param maxHeight Maximum height of the compressed image.
 * @param quality Quality of the compressed image (0 to 1).
 * @returns A Promise resolving to the compressed File object.
 */
export async function compressImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        // Only compress if it's an image
        if (!file.type.startsWith("image/")) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                // Create a canvas to draw the resized image
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    return resolve(file);
                }

                // Fill background with white in case of transparent PNG converted to JPEG
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);

                ctx.drawImage(img, 0, 0, width, height);

                // Convert the canvas to a Blob and then to a File
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return resolve(file);
                        }
                        
                        // Force JPEG format for better compression, except if original is webp/png and user wants alpha (but we already filled white background)
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
