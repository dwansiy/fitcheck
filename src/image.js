import { IMAGE_LIMITS } from './config.js';

export async function optimizeImage(file) {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) throw new Error('JPG, PNG, WebP 이미지만 사용할 수 있습니다.');
  if (file.size > IMAGE_LIMITS.maxFileBytes) throw new Error('이미지 크기는 10MB 이하여야 합니다.');

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, IMAGE_LIMITS.maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', IMAGE_LIMITS.quality);
}

export async function createResultCard({ image, result, tpo }) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  const photo = new Image();
  photo.src = image;
  await photo.decode();

  context.fillStyle = '#eae6ff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000';
  context.fillRect(50, 50, 980, 1820);
  context.fillStyle = '#fff';
  context.fillRect(35, 35, 980, 1820);
  drawText(context, 'FITCHECK!', 540, 150, '900 76px Arial', 'center');
  drawCover(context, photo, 115, 230, 850, 850);
  context.strokeStyle = '#000';
  context.lineWidth = 12;
  context.strokeRect(115, 230, 850, 850);
  drawText(context, `${result.score.toLocaleString()} PTS`, 540, 1195, '900 72px Arial', 'center');
  drawText(context, `${tpo} · ${result.tier}`, 540, 1260, '700 32px Arial', 'center');
  wrapText(context, result.roast, 120, 1370, 840, 48);
  drawText(context, 'fitcheck', 540, 1780, '700 28px Arial', 'center');
  return canvas.toDataURL('image/png');
}

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height);
}

function drawText(context, text, x, y, font, align = 'left') {
  context.fillStyle = '#000';
  context.font = font;
  context.textAlign = align;
  context.fillText(text, x, y);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  context.font = '700 32px Arial';
  context.textAlign = 'left';
  const characters = [...text];
  let line = '';
  for (const character of characters) {
    if (context.measureText(line + character).width > maxWidth) {
      context.fillText(line, x, y);
      line = character;
      y += lineHeight;
    } else line += character;
  }
  context.fillText(line, x, y);
}
