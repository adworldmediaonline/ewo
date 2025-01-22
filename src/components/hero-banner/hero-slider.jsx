'use client';
import React from 'react';
import Slider from 'react-slick';
import CloudinaryImage from '../common/CloudinaryImage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// slider data
const sliderData = [
  {
    id: 1,
    img: 'EWO_Slider_01_qadgov_brzwi0',
    mobileImg: 'EWO_430x360_01_x5ieap',
    alt: 'EWO Slider 1',
  },
  {
    id: 2,
    img: 'EWO_Slider_02_frthom_uekltd',
    mobileImg: 'EWO_430x360_03_cbyriq',
    alt: 'EWO Slider 2',
  },
];

const HeroSlider = () => {
  // slider settings
  const settings = {
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    dots: true,
    fade: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
  };

  return (
    <div className="tp-slider-area">
      <Slider {...settings}>
        {sliderData.map(slide => (
          <div key={slide.id}>
            {/* Desktop Image */}
            <div className="d-none d-md-block">
              <CloudinaryImage
                src={slide.img}
                alt={slide.alt}
                width={1920}
                height={516}
                sizes="100vw"
                priority={true}
                quality="auto"
                format="auto"
                dpr="auto"
                crop="fill"
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1920/516',
                  display: 'block',
                }}
              />
            </div>
            {/* Mobile Image */}
            <div className="d-block d-md-none">
              <CloudinaryImage
                src={slide.mobileImg}
                alt={slide.alt}
                width={430}
                height={360}
                sizes="100vw"
                priority={true}
                quality="auto"
                format="auto"
                dpr="auto"
                crop="fill"
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '430/360',
                  display: 'block',
                }}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;
