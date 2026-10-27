import type { MediaAsset } from "@/lib/api/public";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import styles from "./site.module.css";

/** Images grid + video/YouTube blocks for a content object's media gallery.
 * Shared by every public detail page (news, equipment, history/manual) so
 * the three don't each hand-roll the same media-type switch. */
export default function MediaGallery({ media }: { media: MediaAsset[] }) {
  const images = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video" || m.media_type === "youtube");

  return (
    <>
      {images.length > 0 && (
        <div className={styles.gallery}>
          {images.map((m) => (
            <img key={m.id} src={m.file!} alt={m.caption} className={styles.galleryItem} />
          ))}
        </div>
      )}
      {videos.map((m) => {
        if (m.media_type === "youtube") {
          const embedUrl = m.youtube_url ? getYoutubeEmbedUrl(m.youtube_url) : null;
          if (!embedUrl) return null;
          return (
            <div key={m.id} style={{ position: "relative", paddingTop: "56.25%", marginTop: 16 }}>
              <iframe
                src={embedUrl}
                title={m.caption || "YouTube video"}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, borderRadius: 10 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <video
            key={m.id}
            src={m.file!}
            controls
            style={{ width: "100%", marginTop: 16, borderRadius: 10 }}
          />
        );
      })}
    </>
  );
}
