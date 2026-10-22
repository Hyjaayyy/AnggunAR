import { stat } from "node:fs/promises";
import path from "node:path";
import { homeVideo } from "@/data/home-video";

/** Next's bundled range parser rejects suffixes larger than the representation.
 * Normalize only that case; Next still owns streaming and conditional requests. */
export async function normalizeVideoSuffix(headers: Headers): Promise<Headers | undefined> {
  const suffix = /^bytes=-(\d+)$/.exec(headers.get("range") ?? "");
  if (!suffix) return;
  let size: number;
  try {
    const file = await stat(path.join(process.cwd(), "public", homeVideo.src));
    if (!file.isFile()) return;
    size = file.size;
  } catch { return; } // Preserve Next's normal handling if the asset is unavailable.
  if (size === 0 || Number(suffix[1]) <= size) return;
  const normalized = new Headers(headers);
  normalized.set("range", "bytes=0-");
  return normalized;
}
