const DEFAULT_MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.8;

export function resizeImage(file: File, maxWidth = DEFAULT_MAX_WIDTH): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
