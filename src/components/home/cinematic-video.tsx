"use client";

import { useEffect, useRef, useState } from "react";
import { attachCinematicPlayback, initialCinematicState } from "@/lib/cinematic-playback";
import styles from "./cinematic-video.module.css";

export function CinematicVideo({ src, position }: { src: string; position: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState(initialCinematicState);
  useEffect(() => {
    if (!video.current) return;
    const playback = attachCinematicPlayback(video.current, src, setState);
    return () => playback.destroy();
  }, [src]);
  return <div className={styles.player} aria-hidden="true">
    <video ref={video} data-cinematic-video autoPlay muted loop playsInline preload="none" controls={false} aria-hidden="true" tabIndex={-1} disablePictureInPicture disableRemotePlayback className={styles.video} style={{ objectPosition: position, opacity: state.playing && !state.failed && !state.blocked ? 1 : 0 }} />
  </div>;
}
