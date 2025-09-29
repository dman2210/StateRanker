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
        < />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
