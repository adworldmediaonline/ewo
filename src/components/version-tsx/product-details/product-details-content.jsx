'use client';
import { useState, useRef } from 'react';
import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import ProductVideoPlayer from './product-video-player';
import ProductDetailsFixedBar from './product-details-fixed-bar';
import {
  getProductImageSrc,
  getProductImageSrcsForGallery,
} from '@/lib/product-image';

export default function ProductDetailsContent({ productItem, children }) {
  const mainImg = getProductImageSrc(productItem || {});
  let imageURLs = getProductImageSrcsForGallery(productItem || {});
  // When product has only main image (no variants), include it in gallery
  if (imageURLs.length === 0 && mainImg) {
    imageURLs = [mainImg];
  }
  const { videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || mainImg);
  const addToCartRef = useRef(null);
  const proceedToBuyRef = useRef(null);

  // handle image active
  const handleImageActive = img => {
    setActiveImg(img);
  };

  return (
    <>
      {/* Main product section - Desktop: Side by side, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image gallery - Desktop: Sticky left column, Mobile: First */}
        <div className="order-1 lg:order-1">
          <div className="lg:sticky lg:top-4">
            <DetailsThumbWrapper
              activeImg={activeImg}
              handleImageActive={handleImageActive}
              imageURLs={imageURLs}
              productItem={productItem}
              imgWidth={580}
              imgHeight={580}
              videoId={videoId}
              status={status}
            />
          </div>
        </div>

        {/* Product details - Desktop: Right column, Mobile: Second */}
        <div className="order-2 lg:order-2">
          <DetailsWrapper
            productItem={productItem}
            handleImageActive={handleImageActive}
            activeImg={activeImg}
            onAddToCartRef={addToCartRef}
            onProceedToBuyRef={proceedToBuyRef}
          />
        </div>
      </div>

      {/* Product Video Section - Compact spacing */}
      {videoId && (
        <div className="mb-12">
          <ProductVideoPlayer
            videoId={videoId}
            productTitle={productItem?.title}
          />
        </div>
      )}

      {/* More Details - Renders above Related Products */}
      {productItem?.moreDetails && productItem.moreDetails.trim() !== '' && (
        <div className="mb-16">
          <section
            className="prose prose-sm max-w-none text-foreground [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto"
            dangerouslySetInnerHTML={{ __html: productItem.moreDetails }}
          />
        </div>
      )}

      {/* Related Products - Passed as children slot from parent */}
      {children}

      {/* Fixed Bottom Bar for Mobile */}
      <ProductDetailsFixedBar
        productItem={productItem}
        onAddToCart={(prd) => addToCartRef.current?.(prd)}
        onProceedToBuy={(prd) => proceedToBuyRef.current?.(prd)}
      />
    </>
  );
}
