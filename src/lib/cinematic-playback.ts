export type CinematicState = { playing: boolean; hasPlayed: boolean; blocked: boolean; failed: boolean };
export const initialCinematicState: CinematicState = { playing: false, hasPlayed: false, blocked: false, failed: false };

/** One controller per video. No source is attached before visible playback is permitted. */
export function attachCinematicPlayback(video: HTMLVideoElement, src: string, report: (state: CinematicState) => void) {
  let state = { ...initialCinematicState };
  let inView = false;
  let loaded = false;
  let disposed = false;
  let pending = false;
  let generation = 0;
  let recovering = false;
  let abortRecoveries = 0;
  let lastError: string | null = null;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const events: Record<string, unknown>[] = [];
  // Read-only diagnostics for the failing browser session; absent from production.
  const diagnose = (event: string) => {
    if (process.env.NODE_ENV !== "development" || disposed) return;
    const snapshot = { event, at: performance.now(), currentTime: video.currentTime, duration: Number.isFinite(video.duration) ? video.duration : null, preload: video.preload, sourceAttribute: video.getAttribute("src"), currentSrc: video.currentSrc, lastError, mediaError: video.error ? { code: video.error.code, message: video.error.message } : null, abortRecoveries, inView, visibility: document.visibilityState, reducedMotion: motion.matches, readyState: video.readyState, networkState: video.networkState, paused: video.paused, blocked: state.blocked, failed: state.failed, videoWidth: video.videoWidth, videoHeight: video.videoHeight, decodedFrames: video.getVideoPlaybackQuality?.().totalVideoFrames ?? null, src: video.currentSrc || src };
    events.push(snapshot);
    if (events.length > 60) events.shift();
    video.dataset.cinematicDiagnostic = JSON.stringify(snapshot);
    video.dataset.cinematicEvents = JSON.stringify(events);
  };
  const update = (patch: Partial<CinematicState>) => {
    if (disposed) return;
    const next = { ...state, ...patch };
    if (Object.keys(next).some((key) => next[key as keyof CinematicState] !== state[key as keyof CinematicState])) {
      state = next; report(state);
    }
  };
  const permitted = () => !disposed && !state.failed && !state.blocked && inView && document.visibilityState === "visible" && !motion.matches;
  const pause = () => { generation++; pending = false; video.autoplay = false; video.pause(); update({ playing: false }); diagnose("paused"); };
  const sync = () => {
    if (disposed) return;
    if (!permitted()) { pause(); return; }
    video.autoplay = true;
    if (!loaded) { loaded = true; video.src = src; diagnose("source-attached"); }
    if (recovering && video.readyState < 2) return;
    recovering = false;
    if (pending) return;
    if (!video.paused) {
      if (video.readyState >= 2) update({ playing: true, hasPlayed: true });
      return;
    }
    const token = ++generation;
    pending = true;
    const rejected = (error: unknown) => {
      if (disposed || token !== generation) return;
      pending = false;
      lastError = typeof error === "object" && error !== null && "name" in error && typeof error.name === "string" ? error.name : "UnknownError";
      diagnose("play-rejected");
      if (lastError === "AbortError" && abortRecoveries < 1) {
        // Loading interruptions are not permission denials. Recover at most once,
        // when frames are available; no polling and no repeated policy retries.
        abortRecoveries++; recovering = true;
        update({ playing: false }); diagnose("interrupted");
        if (video.readyState >= 2) void Promise.resolve().then(sync);
        return;
      }
      if (lastError === "NotAllowedError") {
        video.autoplay = false; video.pause(); update({ playing: false, blocked: true }); diagnose("autoplay-denied");
      } else failed();
    };
    try {
      diagnose("play-requested");
      Promise.resolve(video.play()).then(() => {
        // A disposed controller no longer owns this element after a remount.
        if (disposed) return;
        if (token !== generation) { if (!permitted()) video.pause(); return; }
        pending = false;
        diagnose("play-resolved");
        if (permitted() && !video.paused) update({ playing: true, hasPlayed: true, blocked: false });
      }).catch(rejected);
    } catch (error) { rejected(error); }
  };
  const playing = () => {
    if (disposed) return;
    if (!permitted()) { pause(); return; }
    update({ playing: true, hasPlayed: true, blocked: false });
    recovering = false; diagnose("playing");
  };
  const paused = () => { update({ playing: false }); diagnose("media-paused"); };
  const failed = () => {
    if (disposed) return;
    if (video.error) lastError = `MediaError:${video.error.code}`;
    update({ playing: false, failed: true }); pause();
    if (loaded) { diagnose("source-reset:error"); loaded = false; video.removeAttribute("src"); video.load(); }
    diagnose("failed");
  };
  const ready = () => { diagnose("canplay"); if (recovering) sync(); };
  const mediaEvents = ["loadedmetadata", "loadeddata", "emptied", "abort", "error", "loadstart", "resize", "stalled"] as const;
  const traceMediaEvent = (event: Event) => diagnose(event.type);
  if (process.env.NODE_ENV === "development") {
    for (const event of mediaEvents) video.addEventListener(event, traceMediaEvent);
  }
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  video.addEventListener("playing", playing);
  video.addEventListener("pause", paused);
  video.addEventListener("error", failed);
  video.addEventListener("canplay", ready);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);

  const measuredVisibility = () => {
    const rect = video.getBoundingClientRect();
    inView = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    sync();
  };
  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(([entry]) => { if (entry) { inView = entry.isIntersecting && entry.intersectionRatio >= 0.1; sync(); } }, { threshold: [0, 0.1], rootMargin: "0px" });
    observer.observe(video);
  } else {
    window.addEventListener("scroll", measuredVisibility, { passive: true });
    window.addEventListener("resize", measuredVisibility);
    measuredVisibility();
  }
  sync();
  return {
    destroy() {
      if (disposed) return;
      diagnose("controller-destroy");
      disposed = true; generation++;
      if (process.env.NODE_ENV === "development") {
        for (const event of mediaEvents) video.removeEventListener(event, traceMediaEvent);
      }
      observer?.disconnect();
      window.removeEventListener("scroll", measuredVisibility);
      window.removeEventListener("resize", measuredVisibility);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      video.removeEventListener("playing", playing);
      video.removeEventListener("pause", paused);
      video.removeEventListener("error", failed);
      video.removeEventListener("canplay", ready);
      video.autoplay = false; video.pause();
      if (loaded) { video.removeAttribute("src"); video.load(); }
    },
  };
}
