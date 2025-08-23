'use client';
import { useEffect, useState } from 'react';
import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import RelatedProducts from './related-products';

export default function ProductDetailsContent({ productItem }) {
  const { _id, img, imageURLs, videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);

  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
  }, [img, imageURLs]);

  // handle image active
  const handleImageActive = img => {
    setActiveImg(img);
  };
  // console.log('productItem', productItem);
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
          />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <RelatedProducts id={_id} />
      </div>
    </>
  );
}
