"use client";

import { useState } from "react";
import type { MediaAsset } from "@/lib/api/public";
import DeleteButton from "./DeleteButton";
import styles from "./admin.module.css";

type MediaItem = { asset: MediaAsset; deleteAction: () => void };
type MediaKind = "image" | "video" | "youtube";

export default function MediaManager({
  items,
  uploadAction,
}: {
  items: MediaItem[];
  uploadAction: (formData: FormData) => void;
}) {
  const [kind, setKind] = useState<MediaKind>("image");

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Rasm va videolar</h2>

      {items.length > 0 && (
        <div className={styles.mediaGrid}>
          {items.map(({ asset, deleteAction }) => (
            <div key={asset.id} className={styles.mediaItem}>
              {asset.media_type === "image" ? (
                <img src={asset.file!} alt={asset.caption} className={styles.mediaThumb} />
              ) : (
                <div className={styles.mediaVideoLabel}>{asset.media_type === "youtube" ? "YouTube" : "Video"}</div>
              )}
              <DeleteButton action={deleteAction} confirmText="Bu faylni o'chirasizmi?">
                <span className={styles.mediaDelete}>&times;</span>
              </DeleteButton>
            </div>
          ))}
        </div>
      )}

      <form action={uploadAction} className={styles.form} encType="multipart/form-data">
        <div className={styles.formRow}>
          <label htmlFor="media-type">Turi</label>
          <select
            id="media-type"
            name="media_type"
            value={kind}
            onChange={(e) => setKind(e.target.value as MediaKind)}
          >
            <option value="image">Rasm</option>
            <option value="video">Video (fayl yuklash)</option>
            <option value="youtube">YouTube havolasi</option>
          </select>
        </div>

        {kind === "youtube" ? (
          <div className={styles.formRow}>
            <label htmlFor="media-youtube-url">YouTube havolasi</label>
            <input
              id="media-youtube-url"
              name="youtube_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
        ) : (
          <div className={styles.formRow}>
            <label htmlFor="media-file">Fayl</label>
            <input
              id="media-file"
              name="file"
              type="file"
              accept={kind === "image" ? "image/*" : "video/*"}
              required
            />
          </div>
        )}

        <div className={styles.formRow}>
          <label htmlFor="media-caption">Izoh (ixtiyoriy)</label>
          <input id="media-caption" name="caption" type="text" />
        </div>
        <button type="submit" className={styles.submitButton}>
          Yuklash
        </button>
      </form>
    </div>
  );
}
