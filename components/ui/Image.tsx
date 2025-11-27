import React from 'react';

export const ImageComponent = ({ src, alt, caption, aspectRatio = 'VIDEO' }: any) => {
  const ratios: Record<string, string> = {
    VIDEO: 'aspect-video',
    SQUARE: 'aspect-square',
    WIDE: 'aspect-[21/9]',
    PORTRAIT: 'aspect-[3/4]'
  };

  return (
    <figure className="w-full flex flex-col gap-3 group">
      <div className={`w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 ${ratios[aspectRatio] || ratios.VIDEO} relative`}>
        <img 
          src={src || 'https://via.placeholder.com/800x400/18181b/52525b?text=Image'} 
          alt={alt || 'Generated Content'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
      </div>
      {caption && (
        <figcaption className="text-xs text-center text-slate-500 font-medium tracking-wide">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
