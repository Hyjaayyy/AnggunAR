import Image from "next/image";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { homeVideo } from "@/data/home-video";
import { getHomeVideoMedia } from "@/lib/home-video";
import { getHomeVideoDictionary } from "@/i18n/home-video";
import type { Locale } from "@/i18n/config";
import { CinematicVideo } from "./cinematic-video";
import { CinematicVideoDebug } from "./cinematic-video-debug";
import styles from "./cinematic-video.module.css";

export async function CinematicSection({ locale }: { locale: Locale }) {
  const copy = getHomeVideoDictionary(locale);
  const { src, poster } = await getHomeVideoMedia();
  return <section aria-labelledby="cinematic-title" data-cinematic-frame className={`dark-surface ${styles.section} ${styles.frame}`}>
        {poster ? <Image src={poster} alt="" aria-hidden="true" fill sizes="100vw" className={styles.poster} style={{ objectPosition: homeVideo.position }} />
          : <div className={styles.fallback} data-cinematic-fallback aria-hidden="true" />}
        {src && <CinematicVideo src={src} position={homeVideo.position} />}
        <div className={styles.overlay} data-cinematic-overlay aria-hidden="true" />
        <Container className={styles.content}><div className={styles.heading}><p className={styles.eyebrow}>{copy.eyebrow}</p><h2 id="cinematic-title">{copy.title}</h2><p className={styles.description}>{copy.description}</p></div></Container>
        {process.env.NODE_ENV === "development" && <Suspense fallback={null}><CinematicVideoDebug src={src} /></Suspense>}
  </section>;
}
