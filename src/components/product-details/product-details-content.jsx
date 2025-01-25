'use client';
import React, { useState, useEffect } from 'react';
import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import { useDispatch } from 'react-redux';
import DetailsTabNav from './details-tab-nav';
import RelatedProducts from './related-products';

const ProductDetailsContent = ({ productItem }) => {
  const { _id, img, imageURLs, videoId, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);
  const dispatch = useDispatch();

  // active image change when img change
  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
  }, [img, imageURLs]);

  // handle image active
  const handleImageActive = url => {
    setActiveImg(url);
  };

  return (
    <section className="tp-product-details-area">
      <div className="tp-product-details-top pb-115">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-6">
              {/* product-details-thumb-wrapper start */}
              <div className="product-details-thumb-wrapper-outer">
                <DetailsThumbWrapper
                  activeImg={activeImg}
                  handleImageActive={handleImageActive}
                  imageURLs={imageURLs}
                  imgWidth={580}
                  imgHeight={670}
                  videoId={videoId}
                  status={status}
                />
              </div>
              {/* product-details-thumb-wrapper end */}
            </div>
            <div className="col-xl-6 col-lg-6 ps-lg-4">
              {/* product-details-wrapper start */}
              <DetailsWrapper
                productItem={productItem}
                handleImageActive={handleImageActive}
                activeImg={activeImg}
                detailsBottom={true}
              />
              {/* product-details-wrapper end */}
            </div>
          </div>
        </div>
      </div>

      {/* product details description */}
      <div className="tp-product-details-bottom pb-10">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <DetailsTabNav product={productItem} />
            </div>
          </div>
        </div>
      </div>
      {/* product details description */}

      {/* related products start */}
      <section className="tp-related-product pt-95 pb-50">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <h3 className="tp-section-title-6">Related Products</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <RelatedProducts id={_id} />
          </div>
        </div>
      </section>
      {/* related products end */}
    </section>
  );
};

export default ProductDetailsContent;
