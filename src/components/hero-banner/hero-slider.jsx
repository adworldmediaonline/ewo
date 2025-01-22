'use client';
import React, { memo } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const sliderData = [
  {
    id: 1,
    img: '/assets/img/slider/EWO_Slider_01.webp',
    mobileImg: '/assets/img/slider/EWO_430x360_02.webp',
    alt: 'EWO Slider 1',
  },
  {
    id: 2,
    img: '/assets/img/slider/EWO_Slider_02.webp',
    mobileImg: '/assets/img/slider/EWO_430x360_02.webp',
    alt: 'EWO Slider 2',
  },
];

const HeroSlider = memo(() => {
  const settings = {
    autoplay: false, // Disable autoplay initially
    arrows: true,
    dots: true,
    fade: false, // Disable fade for better performance
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
    lazyLoad: false,
  };

  return (
    <div className="tp-slider-area">
      <noscript>
        <style>{`.tp-slider-area{opacity:1 !important}`}</style>
      </noscript>
      <Slider {...settings}>
        {sliderData.map((slide, index) => (
          <div key={slide.id}>
            {/* Desktop Image */}
            <div className="d-none d-md-block">
              <div
                style={{ position: 'relative', width: '100%', height: '516px' }}
              >
                <Image
                  src={slide.img}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
            {/* Mobile Image */}
            <div className="d-block d-md-none">
              <div
                style={{ position: 'relative', width: '100%', height: '360px' }}
              >
                <Image
                  src={slide.mobileImg}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
});

HeroSlider.displayName = 'HeroSlider';

export default HeroSlider;
