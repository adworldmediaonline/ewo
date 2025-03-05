'use client';
import { useState } from 'react';
import styles from './ProductDetailsContent.module.css';
import PopupVideo from '../common/popup-video';
import CloudinaryImage from '../common/CloudinaryImage';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Mediumzoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function DetailsThumbWrapper({
  imageURLs,
  handleImageActive,
  activeImg,
  imgWidth = 416,
  imgHeight = 480,
  videoId = false,
  status,
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Prepare slides for lightbox
  const slides =
    imageURLs?.map(url => ({
      src: url,
      width: imgWidth * 2,
      height: imgHeight * 2,
    })) || [];

  // Find current slide index
  const currentSlideIndex = slides.findIndex(slide => slide.src === activeImg);

  return (
    <>
      <div className={styles.thumbnailNav}>
        {imageURLs?.map((url, i) => (
          <button
            key={i}
            className={`${styles.thumbnailBtn} ${
              url === activeImg ? styles.active : ''
            }`}
            onClick={() => handleImageActive(url)}
          >
            <CloudinaryImage
              src={url ?? null}
              alt="product thumbnail"
              width={78}
              height={100}
              sizes="78px"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              crop="fill"
              quality="auto"
              format="auto"
              dpr="auto"
            />
          </button>
        ))}
      </div>

      <div className={styles.mainImage}>
        <div onClick={() => setIsLightboxOpen(true)}>
          <Mediumzoom>
            <CloudinaryImage
              src={activeImg}
              alt="product main image"
              width={imgWidth}
              height={imgHeight}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 580px"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                backgroundColor: '#ffffff',
                cursor: 'zoom-in',
              }}
              crop="pad"
              quality="auto"
              format="auto"
              dpr="auto"
              priority={true}
            />
          </Mediumzoom>
        </div>

        {status === 'out-of-stock' && (
          <div className={styles.productBadge}>Out of Stock</div>
        )}

        <div className={styles.imageActions}>
          {videoId && (
            <button
              onClick={e => {
                e.stopPropagation();
                setIsVideoOpen(true);
              }}
              className={styles.imageAction}
              aria-label="Play video"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 8.5L16 12L9.5 15.5V8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
        index={currentSlideIndex}
      />

      {videoId && (
        <PopupVideo
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
          videoId={videoId}
        />
      )}
    </>
  );
}
