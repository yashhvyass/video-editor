import React, { useRef, useState } from 'react';
import { Clip, TextOverlay } from '@/types/types';

interface TimelineEnhancedProps {
  clips: Clip[];
  textOverlays: TextOverlay[];
  totalDuration: number;
  currentFrame: number;
  onAddClip: () => void;
  onAddText: () => void;
}

const TimelineEnhanced: React.FC<TimelineEnhancedProps> = ({
  clips,
  textOverlays,
  totalDuration,
  currentFrame,
  onAddClip,
  onAddText,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const formatTime = (frame: number) => {
    const seconds = frame / 30;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  const generateTimeMarkers = () => {
    const markers = [];
    const totalSeconds = totalDuration / 30;
    const interval = Math.max(1, Math.floor(totalSeconds / 20));
    
    for (let i = 0; i <= totalSeconds; i += interval) {
      const frame = i * 30;
      markers.push(
        <div
          key={i}
          className="absolute top-0 text-xs text-gray-400"
          style={{ left: `${(frame / totalDuration) * 100}%` }}
        >
          <div className="w-px h-4 bg-gray-600 mb-1"></div>
          <span className="transform -translate-x-1/2 absolute">{formatTime(frame)}</span>
        </div>
      );
    }
    return markers;
  };

  const TimelineItem: React.FC<{
    item: Clip | TextOverlay;
    type: 'clip' | 'text';
    index: number;
    trackIndex: number;
  }> = ({ item, type, index, trackIndex }) => {
    const bgColor = type === 'clip' ? 'bg-purple-500' : 'bg-blue-500';
    const width = (item.duration / totalDuration) * 100;
    const left = (item.start / totalDuration) * 100;

    return (
      <div
        className={`absolute h-12 ${bgColor} rounded border border-gray-600 cursor-pointer hover:brightness-110 transition-all`}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${trackIndex * 60 + 8}px`,
        }}
      >
        <div className="p-2 h-full flex items-center">
          <div className="text-white text-xs font-medium truncate">
            {type === 'clip' ? `Video ${index + 1}` : `Text ${index + 1}`}
          </div>
        </div>
        
        {/* Thumbnail preview for video clips */}
        {type === 'clip' && (
          <div className="absolute inset-0 rounded overflow-hidden opacity-30">
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
          </div>
        )}
      </div>
    );
  };

  const PlayheadMarker = () => (
    <div
      className="absolute top-0 w-0.5 bg-red-500 pointer-events-none z-50"
      style={{
        left: `${(currentFrame / totalDuration) * 100}%`,
        height: '100%',
      }}
    >
      <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -left-1"></div>
    </div>
  );

  return (
    <div className="h-full bg-gray-900 border-t border-gray-700 flex flex-col">
      {/* Timeline Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onAddClip}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            + Video
          </button>
          <button
            onClick={onAddText}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            + Text
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">
            {formatTime(currentFrame)} / {formatTime(totalDuration)}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
            >
              -
            </button>
            <span className="text-gray-400 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 relative pl-20">
        <div className="relative h-full">
          {generateTimeMarkers()}
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 relative overflow-auto" ref={timelineRef}>
        <div className="flex h-full">
          {/* Track Labels */}
          <div className="w-20 bg-gray-800 border-r border-gray-700 flex-shrink-0">
            <div className="h-15 border-b border-gray-700 flex items-center px-3">
              <span className="text-gray-400 text-xs font-medium">V1</span>
            </div>
            <div className="h-15 border-b border-gray-700 flex items-center px-3">
              <span className="text-gray-400 text-xs font-medium">V2</span>
            </div>
            <div className="h-15 border-b border-gray-700 flex items-center px-3">
              <span className="text-gray-400 text-xs font-medium">A1</span>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 relative">
            {/* Track Backgrounds */}
            {[0, 1, 2].map((trackIndex) => (
              <div
                key={trackIndex}
                className="absolute w-full h-15 border-b border-gray-700"
                style={{ top: `${trackIndex * 60}px` }}
              >
                <div className="w-full h-full bg-gray-850 hover:bg-gray-800 transition-colors"></div>
              </div>
            ))}

            {/* Timeline Items */}
            {clips.map((clip, index) => (
              <TimelineItem
                key={clip.id}
                item={clip}
                type="clip"
                index={index}
                trackIndex={0}
              />
            ))}
            
            {textOverlays.map((overlay, index) => (
              <TimelineItem
                key={overlay.id}
                item={overlay}
                type="text"
                index={index}
                trackIndex={1}
              />
            ))}

            {/* Playhead */}
            <PlayheadMarker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineEnhanced;