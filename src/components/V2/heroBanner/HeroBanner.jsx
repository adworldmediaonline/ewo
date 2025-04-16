'use client';

import { CldImage } from 'next-cloudinary';

export default function HeroBanner() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1680px',
        margin: '0 auto',
        padding: '0 0.75rem',
      }}
    >
      <CldImage
        src="banner1_zyqptl"
        alt="Banner"
        width={1680}
        height={420}
        sizes="100vw"
        preserveTransformations={true}
        crop="limit"
        priority
        style={{
          width: '100%',
          height: 'auto',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          marginBottom: '1rem',
          // marginTop: '1rem',
        }}
      />
    </div>
  );
}
