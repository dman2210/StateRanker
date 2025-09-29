import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MapView } from "@/pages/map-view";
import { ListView } from "@/pages/list-view";
import NotFound from "@/pages/not-found";
import { MapIcon } from "lucide-react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuth } from "@/hooks/useAuth";

type ViewType = 'map' | 'list' | 'analytics';
type RatingViewType = 'combined' | 'user' | 'wife';

function Router() {
  const [currentView, setCurrentView] = useState<ViewType>('map');
  const [ratingView, setRatingView] = useState<RatingViewType>('combined');

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleRatingViewChange = (view: RatingViewType) => {
    setRatingView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={currentView} onViewChange={handleViewChange} />
      
      <div className="flex max-w-7xl mx-auto">
        <Sidebar activeView={ratingView} onViewChange={handleRatingViewChange} />
        
        <main className="flex-1">
          <Switch>
            <Route path="/" component={() => <MapView activeView={ratingView} />} />
            <Route path="/map" component={() => <MapView activeView={ratingView} />} />
            <Route path="/list" component={() => <ListView activeView={ratingView} />} />
            <Route path="/analytics" component={() => <div className="p-6"><h1>Analytics coming soon...</h1></div>} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <MapIcon className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to State Rater
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to start rating and comparing U.S. states
            </p>
          </div>
          <div className="flex justify-center">
            <LoginDialog />
          </div>
        </div>
      </div>
    );
  }

  return <Router />;
}

export default App;
