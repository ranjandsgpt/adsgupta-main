/**
 * AdContainer.jsx - Video Ad and Banner Ad Components
 * Supports multiple ad formats with skip functionality
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, SkipForward, Maximize2
} from 'lucide-react';

// Glowing Border Wrapper
export const GlowingBorder = ({ 
  children, 
  className = '', 
  gradient = 'from-cyan-500 via-blue-500 to-purple-500' 
}) => (
  <div className={`relative group ${className}`}>
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`} />
    <div className="relative bg-[#0A0A0A] rounded-2xl">{children}</div>
  </div>
);

// Video Ad Component
export const VideoAd = ({ 
  onSkip, 
  compact = false,
  autoPlay = true,
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  posterSrc = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  skipDelay = 5
}) => {
  const [skipTime, setSkipTime] = useState(skipDelay);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (skipTime > 0) {
      const timer = setTimeout(() => setSkipTime(skipTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [skipTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`rounded-xl overflow-hidden border border-white/10 bg-black relative ${compact ? 'aspect-video' : ''}`}
      data-testid="video-ad"
    >
      {/* AD Badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-xs font-bold rounded z-10">
        AD
      </div>
      
      {/* Skip Button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => canSkip && onSkip?.()}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            canSkip ? 'bg-white text-black hover:bg-gray-100' : 'bg-black/60 text-white/80'
          }`}
          data-testid="video-ad-skip"
        >
          {canSkip ? (
            <span className="flex items-center gap-1">
              <SkipForward size={12} />
              Skip Ad
            </span>
          ) : (
            `Skip in ${skipTime}s`
          )}
        </button>
      </div>
      
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterSrc}
        muted={isMuted}
        loop
        autoPlay={autoPlay}
        playsInline
        data-testid="video-ad-player"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      
      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          {/* Play/Pause */}
          <button 
            onClick={togglePlay}
            className="hover:text-white transition-colors"
            data-testid="video-ad-play"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          {/* Time */}
          <span className="text-xs font-mono">
            {formatTime((progress / 100) * duration)}
          </span>
          
          {/* Progress Bar */}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Duration */}
          <span className="text-xs font-mono">{formatTime(duration)}</span>
          
          {/* Mute */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="hover:text-white transition-colors"
            data-testid="video-ad-mute"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          
          {/* Fullscreen */}
          <button 
            className="hover:text-white transition-colors"
            data-testid="video-ad-fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Banner Ad Component
export const BannerAd = ({ 
  size = '300x250',
  headline = "Discover Premium Products",
  subtext = "Shop AI-curated selections for you",
  imageUrl = "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=400&q=80",
  ctaText = "Shop Now",
  onClick,
  className = ''
}) => {
  const dimensions = {
    '300x250': 'w-[300px] h-[250px]',
    '320x50': 'w-[320px] h-[50px]',
    '728x90': 'w-[728px] h-[90px]',
    '160x600': 'w-[160px] h-[600px]'
  };

  const isCompact = size === '320x50' || size === '728x90';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] cursor-pointer ${dimensions[size] || dimensions['300x250']} ${className}`}
      onClick={onClick}
      data-testid="banner-ad"
    >
      {/* AD Badge */}
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded z-10">
        AD
      </div>

      {isCompact ? (
        // Compact horizontal layout
        <div className="h-full flex items-center gap-3 px-3">
          <img 
            src={imageUrl} 
            alt="" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{headline}</p>
            <p className="text-zinc-500 text-[10px] truncate">{subtext}</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium flex-shrink-0">
            {ctaText}
          </button>
        </div>
      ) : (
        // Standard vertical layout
        <div className="h-full flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          </div>
          <div className="p-4">
            <h4 className="text-white font-medium text-sm mb-1">{headline}</h4>
            <p className="text-zinc-500 text-xs mb-3">{subtext}</p>
            <button className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all">
              {ctaText}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Native In-Article Ad
export const NativeAd = ({ 
  headline,
  description,
  imageUrl,
  sponsor,
  onClick,
  className = ''
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer ${className}`}
    onClick={onClick}
    data-testid="native-ad"
  >
    <div className="flex gap-4 p-4">
      <img 
        src={imageUrl} 
        alt="" 
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-zinc-500 text-[10px]">Sponsored by {sponsor}</span>
        </div>
        <h4 className="text-white font-medium text-sm line-clamp-2">{headline}</h4>
        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default VideoAd;
