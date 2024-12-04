/**
 * Open Source Video Editor Component
 *
 * This is an open source version of the commercial product found at
 * https://www.reactvideoeditor.com/. The code is intentionally kept in a single
 * component for demonstration purposes and clarity. However, this is not considered
 * best practice for production applications.
 *
 * For production use, it's recommended to:
 * - Split into smaller, focused components
 * - Create custom hooks for state management
 * - Implement proper error boundaries
 *
 * The animation templates used are from:
 * https://www.reactvideoeditor.com/remotion-templates
 */

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
import { Code2, Plus } from "lucide-react";
import { spring } from "remotion";

import { Clip, TextOverlay } from "@/types/types";

/**
 * @fileoverview React Video Editor Component
 * A video editing interface built with React and Remotion.
 * Allows users to:
 * - Add and arrange video clips on a timeline
 * - Add text overlays with animations
 * - Preview the composition in real-time
 * - Supports desktop viewing only
 *
 * @requires @remotion/player - For video playback and composition
 * @requires remotion - For sequences and video manipulation
 */

/**
 * Interface for managing timeline items
 * @typedef {Object} TimelineItem
 * @property {string} id - Unique identifier
 * @property {number} start - Start frame
 * @property {number} duration - Duration in frames
 * @property {number} row - Vertical position in timeline
 */

/**
 * TimelineMarker Component
 * @component
 * @param {Object} props
 * @param {number} props.currentFrame - Current playback position in frames
 * @param {number} props.totalDuration - Total duration of composition in frames
 * @returns {JSX.Element} A visual marker showing current playback position
 */
const TimelineMarker: React.FC<{
  currentFrame: number;
  totalDuration: number;
}> = React.memo(({ currentFrame, totalDuration }) => {
  const markerPosition = useMemo(() => {
    return `${(currentFrame / totalDuration) * 100}%`;
  }, [currentFrame, totalDuration]);

  return (
    <div
      className="absolute top-0 w-[1.4px] bg-red-500 pointer-events-none z-50"
      style={{
        left: markerPosition,
        transform: "translateX(-50%)",
        height: "100px",
        top: "0px",
      }}
    >
      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500 absolute top-[0px] left-1/2 transform -translate-x-1/2" />
    </div>
  );
});

TimelineMarker.displayName = "TimelineMarker";

/**
 * Main Video Editor Component
 * @component
 * @returns {JSX.Element} Complete video editor interface
 *
 * Features:
 * - Video preview player
 * - Timeline with clips and text overlays
 * - Add clip and text overlay buttons
 * - Mobile detection and warning
 * - Real-time playback marker
 *
 * State Management:
 * - clips: Array of video clips
 * - textOverlays: Array of text overlays
 * - totalDuration: Total composition duration
 * - currentFrame: Current playback position
 * - isMobile: Mobile device detection
 */
const ReactVideoEditor: React.FC = () => {
  // State management
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [totalDuration, setTotalDuration] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const playerRef = useRef<PlayerRef>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  /**
   * Adds a new video clip to the timeline
   * Automatically positions it after the last item
   * @function
   */
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

  /**
   * Adds a new text overlay to the timeline
   * Automatically positions it after the last item
   * @function
   */
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
      text: `Welcome to React Video Editor`,
      row: 0,
    };

    setTextOverlays([...textOverlays, newOverlay]);
    updateTotalDuration(clips, [...textOverlays, newOverlay]);
  };

  /**
   * Updates the total duration of the composition
   * @function
   * @param {Clip[]} updatedClips - Current array of video clips
   * @param {TextOverlay[]} updatedTextOverlays - Current array of text overlays
   */
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

  /**
   * Composition component for Remotion Player
   * Renders all clips and text overlays in sequence
   * @function
   * @returns {JSX.Element} Remotion composition
   */
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

  /**
   * Timeline Item Component
   * Renders individual clips and text overlays on the timeline
   * @component
   * @param {Object} props
   * @param {Clip | TextOverlay} props.item - Timeline item data
   * @param {"clip" | "text"} props.type - Item type
   * @param {number} props.index - Item index
   * @returns {JSX.Element} Visual representation of timeline item
   */
  const TimelineItem: React.FC<{
    item: Clip | TextOverlay;
    type: "clip" | "text";
    index: number;
  }> = ({ item, type, index }) => {
    const bgColor = type === "clip" ? "bg-indigo-500" : "bg-purple-500";

    return (
      <div
        key={item.id}
        className={`absolute h-10 ${bgColor} rounded-md`}
        style={{
          left: `${(item.start / totalDuration) * 100}%`,
          width: `calc(${(item.duration / totalDuration) * 100}% - 4px)`,
          top: `${item.row * 44}px`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
          {type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}
        </div>
      </div>
    );
  };

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
        start: 200,
        duration: 100,
        text: "Welcome to React Video Editor",
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
    <div className="flex-col text-white">
      {/* Player section */}
      <div className="mt-10 flex overflow-hidden">
        <div className="border border-gray-700 flex-grow p-6 flex items-center justify-center overflow-hidden bg-gray-800">
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="shadow-lg rounded-lg overflow-hidden bg-slate-900"
              style={{
                width: `700px`,
                height: `400px`,
              }}
            >
              <Player
                ref={playerRef}
                component={Composition}
                durationInFrames={Math.max(1, totalDuration)}
                compositionWidth={1920}
                compositionHeight={1080}
                controls
                fps={30}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                renderLoading={() => <div>Loading...</div>}
                inputProps={{}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div className="h-32 bg-gray-900 w-full overflow-hidden flex flex-col border border-gray-700 rounded-b-md">
        {/* Timeline controls */}
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={addClip}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Clip</span>
            </button>
            <button
              onClick={addTextOverlay}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Text</span>
            </button>
          </div>
        </div>

        {/* Timeline items */}
        <div
          ref={timelineRef}
          className="bg-gray-800 rounded-lg shadow-inner relative hover:cursor-not-allowed "
        >
          <div className="absolute inset-0">
            <div className="top-10 left-0 right-0 bottom-0 overflow-x-auto overflow-y-visible p-2">
              <div
                className="gap-4"
                style={{
                  width: `100%`,
                  height: "100%",
                  position: "relative",
                }}
              >
                <div className="h-10 inset-0 flex flex-col z-0">
                  <div className="flex-grow flex flex-col p-[2px]">
                    <div className="flex-grow bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
                  </div>
                </div>
                {clips.map((clip, index) => (
                  <TimelineItem
                    key={clip.id}
                    item={clip}
                    type="clip"
                    index={index}
                  />
                ))}
                {textOverlays.map((overlay, index) => (
                  <TimelineItem
                    key={overlay.id}
                    item={overlay}
                    type="text"
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
          <TimelineMarker
            currentFrame={currentFrame}
            totalDuration={totalDuration}
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <a
          href="https://github.com/reactvideoeditor/free-react-video-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-blue-700  hover:text-slate-100 transition-colors duration-200"
        >
          <Code2 className="w-5 h-5" />
          Get the Code
        </a>
      </div>
    </div>
  );
};

/**
 * Text Overlay Component
 * Renders animated text overlays in the composition
 * @component
 * @param {Object} props
 * @param {string} props.text - Text to display
 * @returns {JSX.Element} Animated text overlay
 *
 * Features:
 * - Centered positioning
 * - Fade-in animation using Remotion spring
 * - Responsive text sizing
 */
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

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          opacity,
          color: "white",
          fontSize: "5rem",
          fontWeight: "bold",
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export default ReactVideoEditor;
