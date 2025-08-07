import { MapIcon, ListIcon, BarChart3Icon, DownloadIcon, UploadIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeView: 'map' | 'list' | 'analytics';
  onViewChange: (view: 'map' | 'list' | 'analytics') => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapIcon className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">State Rater</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant={activeView === 'map' ? 'default' : 'ghost'}
              onClick={() => onViewChange('map')}
              className="flex items-center space-x-2"
            >
              <MapIcon className="h-4 w-4" />
              <span>Map View</span>
            </Button>
            <Button
              variant={activeView === 'list' ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              className="flex items-center space-x-2"
            >
              <ListIcon className="h-4 w-4" />
              <span>List View</span>
            </Button>
            <Button
              variant={activeView === 'analytics' ? 'default' : 'ghost'}
              onClick={() => onViewChange('analytics')}
              className="flex items-center space-x-2"
            >
              <BarChart3Icon className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <DownloadIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <UploadIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
