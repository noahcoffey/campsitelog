import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import sharp from "sharp";

let dir: string;
beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "camplog-upload-"));
  vi.stubEnv("UPLOAD_DIR", dir);
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await fs.rm(dir, { recursive: true, force: true });
});

describe("processUpload", () => {
  it("resizes large images and writes original + webp thumbnail", async () => {
    const { processUpload, getOriginalPath, getThumbnailPath, deleteUpload } = await import("@/lib/upload");
    const png = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: "#336699" } }).png().toBuffer();
    const file = new File([new Uint8Array(png)], "Photo.PNG", { type: "image/png" });
    const r = await processUpload(file);
    expect(r.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(r.thumbnailFilename).toMatch(/_thumb\.webp$/);
    expect(r.width).toBe(2400);
    expect(r.height).toBe(1200);
    const orig = await sharp(getOriginalPath(r.filename)).metadata();
    expect(orig.width).toBe(2000);
    const thumb = await sharp(getThumbnailPath(r.thumbnailFilename)).metadata();
    expect(thumb.format).toBe("webp");
    expect(thumb.width).toBe(400);
    await deleteUpload(r.filename, r.thumbnailFilename);
    await expect(fs.access(getOriginalPath(r.filename))).rejects.toThrow();
    await expect(deleteUpload("missing", "missing")).resolves.toBeUndefined();
  });
});
