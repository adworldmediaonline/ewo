'use client';
import { useEffect, useState } from 'react';
import DetailsBottomInfo from './details-bottom-info';
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

  return (
    <>
      <div className="">
        <div className="">
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
        <div className="">
          <DetailsWrapper
            productItem={productItem}
            handleImageActive={handleImageActive}
            activeImg={activeImg}
          />
        </div>
      </div>

      <div className="">
        <DetailsBottomInfo productItem={productItem} />
        <RelatedProducts id={_id} />
      </div>
    </>
  );
}
