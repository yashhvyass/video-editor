import { Video, Type, Music, Image, Layers, Settings, Download } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'audio', icon: Music, label: 'Audio' },
    { id: 'caption', icon: Layers, label: 'Caption' },
    { id: 'image', icon: Image, label: 'Image' },
  ];

  return (
    <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full h-12 flex flex-col items-center justify-center text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-700 p-2">
        <button className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}