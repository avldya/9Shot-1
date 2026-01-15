// lib/canvas.ts - Canvas 图像处理工具

/**
 * 加载图像
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 将图像分割为九宫格
 */
export async function splitToGrid9(imageUrl: string): Promise<string[]> {
  const img = await loadImage(imageUrl);
  const cellWidth = Math.floor(img.width / 3);
  const cellHeight = Math.floor(img.height / 3);
  const cells: string[] = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const canvas = document.createElement('canvas');
      canvas.width = cellWidth;
      canvas.height = cellHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(
        img,
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
        0,
        0,
        cellWidth,
        cellHeight
      );

      cells.push(canvas.toDataURL('image/png'));
    }
  }

  return cells;
}

/**
 * 将图像分割为四宫格
 */
export async function splitToGrid4(imageUrl: string): Promise<string[]> {
  const img = await loadImage(imageUrl);
  const cellWidth = Math.floor(img.width / 2);
  const cellHeight = Math.floor(img.height / 2);
  const cells: string[] = [];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const canvas = document.createElement('canvas');
      canvas.width = cellWidth;
      canvas.height = cellHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(
        img,
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
        0,
        0,
        cellWidth,
        cellHeight
      );

      cells.push(canvas.toDataURL('image/png'));
    }
  }

  return cells;
}

/**
 * 从 Canvas 导出图像为 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * 将 Data URL 转换为 Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
