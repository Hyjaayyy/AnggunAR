import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

export async function resolveLocalPhoto(src: string | null): Promise<string | null> {
  if (!src || !/^\/images\/(?:destinations\/[a-z0-9-]+\/(?:cover|detail-01|detail-02)|gallery\/[a-z0-9-]+)\.webp$/.test(src)) return null;
  try { return (await stat(path.join(process.cwd(), "public", src))).isFile() ? src : null; } catch { return null; }
}
