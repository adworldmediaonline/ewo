import { CldImage } from 'next-cloudinary';

const CloudinaryImage = ({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  priority = false,
  className = '',
  style = {},
  loading = 'lazy',
  quality = 'auto',
  format = 'auto',
  dpr = 'auto',
  crop = 'fill',
  gravity = 'auto',
  preserveTransformations = false,
  removeBackground = false,
  objectFit = 'cover',
  ...props
}) => {
  // Ensure src has version number if it's a full URL
  const hasVersion = src?.includes('/v');
  if (src?.startsWith('http') && !hasVersion) {
    console.warn('Cloudinary URL must include version number (/v1234/)');
  }

  // Don't pass loading prop if priority is true
  const loadingProp = priority ? {} : { loading };

  // Combine style with objectFit
  const combinedStyle = {
    ...style,
    objectFit,
    aspectRatio: `${width}/${height}`,
  };

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={combinedStyle}
      quality={quality}
      format={format}
      dpr={dpr}
      crop={crop}
      gravity={gravity}
      preserveTransformations={preserveTransformations}
      removeBackground={removeBackground}
      {...loadingProp}
      {...props}
    />
  );
};

export default CloudinaryImage;
