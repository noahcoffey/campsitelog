import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const ORIGINALS_DIR = path.join(UPLOAD_DIR, "originals");
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, "thumbnails");
const THUMBNAIL_WIDTH = 400;
const MAX_WIDTH = 2000;

async function ensureDirs() {
  await fs.mkdir(ORIGINALS_DIR, { recursive: true });
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
}

export async function processUpload(file: File) {
  await ensureDirs();

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const id = uuidv4();
  const filename = `${id}${ext}`;
  const thumbnailFilename = `${id}_thumb.webp`;

  // Process original — resize if too large, convert to webp-friendly format
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const processedOriginal =
    metadata.width && metadata.width > MAX_WIDTH
      ? await image.resize(MAX_WIDTH).jpeg({ quality: 85 }).toBuffer()
      : buffer;

  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .resize(THUMBNAIL_WIDTH)
    .webp({ quality: 80 })
    .toBuffer();

  // Write files
  await fs.writeFile(path.join(ORIGINALS_DIR, filename), processedOriginal);
  await fs.writeFile(path.join(THUMBNAILS_DIR, thumbnailFilename), thumbnail);

  return {
    filename,
    thumbnailFilename,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

export async function deleteUpload(
  filename: string,
  thumbnailFilename: string
) {
  await fs
    .unlink(path.join(ORIGINALS_DIR, filename))
    .catch(() => {});
  await fs
    .unlink(path.join(THUMBNAILS_DIR, thumbnailFilename))
    .catch(() => {});
}

export function getOriginalPath(filename: string) {
  return path.join(ORIGINALS_DIR, filename);
}

export function getThumbnailPath(filename: string) {
  return path.join(THUMBNAILS_DIR, filename);
}
