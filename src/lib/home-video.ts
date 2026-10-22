import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { homeVideo } from "@/data/home-video";

async function available(src: string, allowed: string): Promise<string | null> {
  if (src !== allowed) return null;
  try { return (await stat(path.join(process.cwd(), "public", src))).isFile() ? src : null; } catch { return null; }
}
export async function getHomeVideoMedia() {
  const [src, poster] = await Promise.all([
    available(homeVideo.src, "/videos/home/batam-cinematic-h264.mp4"),
    available(homeVideo.poster, "/images/home/batam-cinematic-poster.webp"),
  ]);
  return { src, poster };
}
