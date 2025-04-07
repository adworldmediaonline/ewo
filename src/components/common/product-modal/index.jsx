import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
// internal
import { handleModalClose } from '@/redux/features/productModalSlice';
import DetailsThumbWrapper from '@/components/product-details/details-thumb-wrapper';
import DetailsWrapper from '@/components/product-details/details-wrapper';
import { initialOrderQuantity } from '@/redux/features/cartSlice';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '1000px',
    width: '90%',
    maxHeight: '90vh',
    margin: '0 auto',
    padding: '0',
    border: 'none',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '8px',
    outline: 'none',
  },
};

const ProductModal = () => {
  const { productItem, isModalOpen } = useSelector(state => state.productModal);
  const { img, imageURLs, status } = productItem || {};
  const [activeImg, setActiveImg] = useState(imageURLs?.[0] || img);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // active image change when img change
  useEffect(() => {
    setActiveImg(imageURLs?.[0] || img);
    dispatch(initialOrderQuantity());
    setLoading(false);
  }, [img, imageURLs, dispatch]);

  // handle image active
  const handleImageActive = url => {
    setActiveImg(url);
    setLoading(true);
  };

  return (
    <div>
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => dispatch(handleModalClose())}
        appElement={document.getElementById('__next')}
        ariaHideApp={false}
        style={customStyles}
        contentLabel="Product Modal"
      >
        <div className="tp-product-modal">
          <div className="tp-product-modal-content">
            <button
              onClick={() => dispatch(handleModalClose())}
              type="button"
              className="tp-product-modal-close-btn"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
            <div className="tp-product-modal-wrapper">
              {/* product-details-thumb-wrapper start */}
              <div className="tp-product-modal-thumb">
                <DetailsThumbWrapper
                  activeImg={activeImg}
                  handleImageActive={handleImageActive}
                  imageURLs={imageURLs}
                  imgWidth={416}
                  imgHeight={480}
                  loading={loading}
                  status={status}
                />
              </div>
              {/* product-details-thumb-wrapper end */}

              {/* product-details-wrapper start */}
              <div className="tp-product-modal-details">
                <DetailsWrapper
                  productItem={productItem}
                  handleImageActive={handleImageActive}
                  activeImg={activeImg}
                />
              </div>
              {/* product-details-wrapper end */}
            </div>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

export default ProductModal;
