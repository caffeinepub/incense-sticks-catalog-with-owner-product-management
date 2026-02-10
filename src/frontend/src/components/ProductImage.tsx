interface ProductImageProps {
  photoUrl: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ photoUrl, alt, className = '' }: ProductImageProps) {
  const imageSrc = photoUrl && photoUrl.trim() !== '' 
    ? photoUrl 
    : '/assets/generated/incense-placeholder.dim_800x800.png';

  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/assets/generated/incense-placeholder.dim_800x800.png';
      }}
    />
  );
}
