import React, { forwardRef } from 'react';
import { Player, PlayerRef } from "@remotion/player";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react';

interface VideoPreviewProps {
  composition: React.ComponentType;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentFrame: number;
}

const VideoPreview = forwardRef<PlayerRef, VideoPreviewProps>(
  ({ composition, totalDuration, isPlaying, onPlayPause, currentFrame }, ref) => {
    const formatTime = (frame: number) => {
      const seconds = frame / 30;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="flex-1 bg-gray-900 flex flex-col">
        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <Player
              ref={ref}
              component={composition}
              durationInFrames={Math.max(1, totalDuration)}
              compositionWidth={1920}
              compositionHeight={1080}
              controls={false}
              fps={30}
              style={{
                width: "100%",
                height: "100%",
              }}
              renderLoading={() => (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-white">Loading...</div>
                </div>
              )}
              inputProps={{}}
            />
            
            {/* Custom overlay controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onPlayPause}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  <button className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                    <SkipBack className="w-4 h-4 text-white" />
                  </button>
                  
                  <button className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>
                  
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentFrame)} / {formatTime(totalDuration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                    <Volume2 className="w-4 h-4 text-white" />
                  </button>
                  
                  <button className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                    <Maximize className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;