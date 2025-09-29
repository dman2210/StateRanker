import { MapIcon, ListIcon, BarChart3Icon, DownloadIcon, UploadIcon, SettingsIcon, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  activeView: 'map' | 'list' | 'analytics';
  onViewChange: (view: 'map' | 'list' | 'analytics') => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const { user, signOut, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

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
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <UploadIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                        <AvatarFallback>
                          {user?.displayName?.[0] || user?.email?.[0] || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.displayName || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <LoginDialog />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
