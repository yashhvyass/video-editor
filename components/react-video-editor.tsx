"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Player, PlayerRef } from "@remotion/player";
import { Sequence, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { spring } from "remotion";

import { Clip, TextOverlay } from "@/types/types";
import Sidebar from "./sidebar";
import TopBar from "./top-bar";
import VideoPreview from "./video-preview";
import TimelineEnhanced from "./timeline-enhanced";

const ReactVideoEditor: React.FC = () => {
  // State management
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [totalDuration, setTotalDuration] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const playerRef = useRef<PlayerRef>(null);

  const addClip = () => {
    const lastItem = [...clips, ...textOverlays].reduce(
      (latest, item) =>
        item.start + item.duration > latest.start + latest.duration
          ? item
          : latest,
      { start: 0, duration: 0 }
    );

    const newClip: Clip = {
      id: `clip-${clips.length + 1}`,
      start: lastItem.start + lastItem.duration,
      duration: 200,
      src: "https://rwxrdxvxndclnqvznxfj.supabase.co/storage/v1/object/public/react-video-editor/open-source-video.mp4?t=2024-12-04T03%3A16%3A12.359Z",
      row: 0,
    };

    setClips([...clips, newClip]);
    updateTotalDuration([...clips, newClip], textOverlays);
  };

  const addTextOverlay = () => {
    const lastItem = [...clips, ...textOverlays].reduce(
      (latest, item) =>
        item.start + item.duration > latest.start + latest.duration
          ? item
          : latest,
      { start: 0, duration: 0 }
    );

    const newOverlay: TextOverlay = {
      id: `text-${textOverlays.length + 1}`,
      start: lastItem.start + lastItem.duration,
      duration: 100,
      text: `BUILD.`,
      row: 0,
    };

    setTextOverlays([...textOverlays, newOverlay]);
    updateTotalDuration(clips, [...textOverlays, newOverlay]);
  };

  const updateTotalDuration = (
    updatedClips: Clip[],
    updatedTextOverlays: TextOverlay[]
  ) => {
    const lastClipEnd = updatedClips.reduce(
      (max, clip) => Math.max(max, clip.start + clip.duration),
      0
    );
    const lastTextOverlayEnd = updatedTextOverlays.reduce(
      (max, overlay) => Math.max(max, overlay.start + overlay.duration),
      0
    );

    const newTotalDuration = Math.max(lastClipEnd, lastTextOverlayEnd);
    setTotalDuration(newTotalDuration);
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRenderVideo = () => {
    // Placeholder for render functionality
    alert('Render functionality would be implemented here');
  };

  const Composition = useCallback(
    () => (
      <>
        {[...clips, ...textOverlays]
          .sort((a, b) => a.start - b.start)
          .map((item) => (
            <Sequence
              key={item.id}
              from={item.start}
              durationInFrames={item.duration}
            >
              {"src" in item ? (
                <Video src={item.src} />
              ) : (
                <TextOverlayComponent text={item.text} />
              )}
            </Sequence>
          ))}
      </>
    ),
    [clips, textOverlays]
  );

  // Effect for updating current frame
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        if (frame !== null) {
          setCurrentFrame(frame);
        }
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  // Effect for checking mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Effect to add initial clip and text overlay
  useEffect(() => {
    if (clips.length === 0 && textOverlays.length === 0) {
      const initialClip: Clip = {
        id: "clip-1",
        start: 0,
        duration: 200,
        src: "https://rwxrdxvxndclnqvznxfj.supabase.co/storage/v1/object/public/react-video-editor/open-source-video.mp4?t=2024-12-04T03%3A16%3A12.359Z",
        row: 0,
      };

      const initialTextOverlay: TextOverlay = {
        id: "text-1",
        start: 50,
        duration: 100,
        text: "BUILD.",
        row: 0,
      };

      setClips([initialClip]);
      setTextOverlays([initialTextOverlay]);
      updateTotalDuration([initialClip], [initialTextOverlay]);
    }
  }, []);

  // Render mobile view message if on a mobile device
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mobile View Not Supported</h2>
          <p className="text-md">
            This video editor is only available on desktop or laptop devices.
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar onRenderVideo={handleRenderVideo} />
      
      {/* Main Content - Fixed height to prevent timeline from pushing up */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Video Preview - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <VideoPreview
            ref={playerRef}
            composition={Composition}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentFrame={currentFrame}
          />
        </div>
      </div>
      
      {/* Timeline - Fixed height at bottom */}
      <div className="h-64 flex-shrink-0">
        <TimelineEnhanced
          clips={clips}
          textOverlays={textOverlays}
          totalDuration={totalDuration}
          currentFrame={currentFrame}
          onAddClip={addClip}
          onAddText={addTextOverlay}
        />
      </div>
    </div>
  );
};

const TextOverlayComponent: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });

  const scale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    durationInFrames: 30,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: "100%",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          opacity,
          color: "white",
          fontSize: "8rem",
          fontWeight: "900",
          letterSpacing: "0.1em",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export default ReactVideoEditor;