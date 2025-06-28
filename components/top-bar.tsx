import { Download, Save, Undo, Redo, Settings } from 'lucide-react';

interface TopBarProps {
  onRenderVideo: () => void;
}

export default function TopBar({ onRenderVideo }: TopBarProps) {
  return (
    <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VE</span>
          </div>
          <span className="text-white font-semibold">Video Editor</span>
        </div>
        
        <div className="h-6 w-px bg-gray-700"></div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Project</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        
        <button
          onClick={onRenderVideo}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Render Video</span>
        </button>
      </div>
    </div>
  );
}