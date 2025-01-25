'use client';
import { useState } from 'react';
import PopupVideo from '../common/popup-video';
import CloudinaryImage from '../common/CloudinaryImage';

const DetailsThumbWrapper = ({
  imageURLs,
  handleImageActive,
  activeImg,
  imgWidth = 416,
  imgHeight = 480,
  videoId = false,
  status,
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  return (
    <>
      <div className="tp-product-details-thumb-wrapper tp-tab d-sm-flex">
        <nav>
          <div className="nav nav-tabs flex-sm-column">
            {imageURLs?.map((url, i) => (
              <button
                key={i}
                className={`nav-link ${url === activeImg ? 'active' : ''}`}
                onClick={() => handleImageActive(url)}
              >
                <CloudinaryImage
                  src={url}
                  alt="product thumbnail"
                  width={78}
                  height={100}
                  sizes="(max-width: 768px) 60px, 78px"
                  style={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: '78/100',
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
        </nav>
        <div className="tab-content m-img">
          <div className="tab-pane fade show active">
            <div className="tp-product-details-nav-main-thumb">
              <CloudinaryImage
                src={activeImg}
                alt="product main image"
                width={imgWidth}
                height={imgHeight}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 416px"
                style={{
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '480px',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                  backgroundColor: '#f8f8f8',
                }}
                crop="pad"
                quality="auto"
                format="auto"
                dpr="auto"
                priority={true}
              />
              <div className="tp-product-badge">
                {status === 'out-of-stock' && (
                  <span className="product-hot">out-stock</span>
                )}
              </div>
              {videoId && (
                <div
                  onClick={() => setIsVideoOpen(true)}
                  className="tp-product-details-thumb-video"
                >
                  <a className="tp-product-details-thumb-video-btn cursor-pointer popup-video">
                    <i className="fas fa-play"></i>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* modal popup start */}
      {videoId && (
        <PopupVideo
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
          videoId={videoId}
        />
      )}
      {/* modal popup end */}
    </>
  );
};

export default DetailsThumbWrapper;
