"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./cinematic-video-debug.module.css";

/** Reads media state only. Never calls play(), pause(), load(), or assigns src. */
export function CinematicVideoDebug({ src }: { src: string | null }) {
  const enabled = useSearchParams()?.get("videoDebug") === "1";
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const output = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !enabled) return;
    const video = document.querySelector<HTMLVideoElement>("[data-cinematic-video]");
    const abort = new AbortController();
    const events: { event: string; at: number }[] = [];
    const violations: { directive: string; blocked: string }[] = [];
    let intersection: { isIntersecting: boolean; ratio: number } | null = null;
    let probe: Record<string, unknown> = { status: "pending" };
    let serviceWorker: string | null = null;
    let registrations: number | null = null;
    const safeUrl = (value: string) => {
      if (!value) return null;
      try { const url = new URL(value, location.origin); return url.origin + url.pathname; } catch { return "invalid URL"; }
    };
    const record = (event: Event) => {
      events.push({ event: event.type, at: Math.round(performance.now()) });
      if (events.length > 20) events.shift();
    };
    const csp = (event: SecurityPolicyViolationEvent) => {
      if (event.effectiveDirective !== "media-src" && event.effectiveDirective !== "default-src") return;
      violations.push({ directive: event.effectiveDirective, blocked: safeUrl(event.blockedURI) ?? event.blockedURI });
      if (violations.length > 10) violations.shift();
    };
    const mediaEvents = ["loadstart", "loadedmetadata", "loadeddata", "canplay", "play", "playing", "pause", "waiting", "stalled", "suspend", "abort", "emptied", "error"];
    for (const name of mediaEvents) video?.addEventListener(name, record);
    document.addEventListener("securitypolicyviolation", csp);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      if (entry) intersection = { isIntersecting: entry.isIntersecting, ratio: entry.intersectionRatio };
    }, { threshold: [0, 0.1, 1] });
    if (video) observer?.observe(video);
    if ("serviceWorker" in navigator) {
      serviceWorker = safeUrl(navigator.serviceWorker.controller?.scriptURL ?? "");
      void navigator.serviceWorker.getRegistrations().then((items) => { registrations = items.length; }).catch(() => { registrations = null; });
    }
    // A separate 1KB request, not evidence of the actual media request's status.
    if (src) void fetch(src, { headers: { Range: "bytes=0-1023" }, cache: "no-store", signal: abort.signal }).then(async (response) => {
      probe = { status: response.status, contentType: response.headers.get("content-type"), contentRange: response.headers.get("content-range"), acceptRanges: response.headers.get("accept-ranges"), csp: response.headers.get("content-security-policy") };
      await response.body?.cancel();
    }).catch((error: unknown) => { if (!abort.signal.aborted) probe = { error: error instanceof Error ? error.name : "UnknownError" }; });
    else probe = { status: "no source rendered by server" };

    const timer = window.setInterval(() => {
      // Keep the selected report stable for manual copy on insecure HTTP origins.
      if (document.activeElement === output.current) return;
      let controller: unknown = null;
      let controllerEvents: unknown = null;
      try {
        controller = JSON.parse(video?.dataset.cinematicDiagnostic ?? "null");
        controllerEvents = JSON.parse(video?.dataset.cinematicEvents ?? "[]");
      } catch { /* Diagnostic data may be absent while mounting. */ }
      const style = video ? getComputedStyle(video) : null;
      const resources = performance.getEntriesByType("resource").filter((entry) => entry.name === video?.currentSrc && (entry as PerformanceResourceTiming).initiatorType === "video").slice(-4).map((entry) => {
        const resource = entry as PerformanceResourceTiming & { responseStatus?: number };
        return { url: safeUrl(resource.name), initiator: resource.initiatorType, responseStatus: resource.responseStatus ?? null, transferSize: resource.transferSize, duration: resource.duration };
      });
      setSnapshot(JSON.stringify({
        version: "cinematic-debug-v1", origin: location.origin, secureContext: window.isSecureContext,
        configuredSrc: src, videoPresent: !!video, currentSrc: safeUrl(video?.currentSrc ?? ""),
        readyState: video?.readyState ?? null, networkState: video?.networkState ?? null,
        videoWidth: video?.videoWidth ?? null, videoHeight: video?.videoHeight ?? null,
        paused: video?.paused ?? null, currentTime: video?.currentTime ?? null,
        decodedFrames: video?.getVideoPlaybackQuality?.().totalVideoFrames ?? null,
        muted: video?.muted ?? null, autoplay: video?.autoplay ?? null, playsInline: video?.playsInline ?? null,
        mediaError: video?.error ? { code: video.error.code, message: video.error.message } : null,
        visibility: document.visibilityState, intersection,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        presentation: { opacity: style?.opacity, display: style?.display, visibility: style?.visibility },
        controller, controllerEvents, recentMediaEvents: events,
        rangeProbe: probe, actualMediaResourceTiming: resources,
        serviceWorker: { supported: "serviceWorker" in navigator, controller: serviceWorker, registrations },
        cspViolations: violations,
      }, null, 2));
    }, 750);
    return () => {
      window.clearInterval(timer); abort.abort(); observer?.disconnect();
      for (const name of mediaEvents) video?.removeEventListener(name, record);
      document.removeEventListener("securitypolicyviolation", csp);
    };
  }, [src, enabled]);

  if (process.env.NODE_ENV !== "development" || !enabled || snapshot === null) return null;
  const select = () => { output.current?.focus(); output.current?.select(); };
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(snapshot);
      setCopyStatus("Diagnostik disalin.");
    } catch {
      select(); setCopyStatus("Salin otomatis tidak tersedia pada browser/origin ini. Gunakan Pilih teks, lalu Salin/Ctrl+C.");
    }
  };
  return <aside className={styles.panel} aria-label="Diagnostik video development" data-video-debug>
    <details open>
      <summary>Video diagnostics — development</summary>
      <p>Hanya membaca status. Range probe adalah request terpisah, bukan status request pemutar.</p>
      <div className={styles.actions}><button type="button" onClick={() => void copy()}>Copy Diagnostics</button><button type="button" onClick={select}>Pilih teks</button></div>
      <p role="status">{copyStatus}</p>
      <textarea ref={output} aria-label="Data diagnostik video" readOnly value={snapshot} spellCheck={false} />
    </details>
  </aside>;
}
