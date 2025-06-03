'use client';

import { useRef, useState } from 'react';

interface VideoWithFullPosterProps {
  src: string;
  poster: string;
}

export function VideoWithFullPoster({ src, poster }: VideoWithFullPosterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={`absolute top-0 left-0 w-full h-full bg-black rounded-lg transition-all duration-200 ${isPlaying ? 'object-contain' : 'object-cover'}`}
      controls
      autoPlay={false}
      playsInline
      muted={true}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onLoadedMetadata={e => { const video = e.target as HTMLVideoElement; video.volume = 0.2; }}
    />
  );
}
