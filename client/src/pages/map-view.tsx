import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { USMap } from "@/components/us-map";
import { RatingPanel } from "@/components/rating-panel";
import { ExpandIcon, BarChart3Icon, DownloadIcon } from "lucide-react";
import type { Rating, User, Criterion } from "@shared/schema";

interface MapViewProps {
  activeView: 'combined' | 'user' | 'wife';
}

export function MapView({ activeView }: MapViewProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [filterCriterion, setFilterCriterion] = useState<string>('all');

  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings']
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  const { data: criteria = [] } = useQuery<Criterion[]>({
    queryKey: ['/api/criteria']
  });

  const user = users.find(u => u.username === 'user');
  const wife = users.find(u => u.username === 'wife');

  const calculateStateRatings = () => {
    const stateRatingsMap = new Map<string, { total: number; count: number; hasRatings: boolean }>();

    // Initialize all states
    const allStateCodes = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    
    allStateCodes.forEach(stateCode => {
      stateRatingsMap.set(stateCode, { total: 0, count: 0, hasRatings: false });
    });

    allRatings.forEach(rating => {
      if (filterCriterion !== 'all' && rating.criterionId !== filterCriterion) {
        return;
      }

      let includeRating = false;
      
      if (activeView === 'combined') {
        includeRating = true;
      } else if (activeView === 'user' && user && rating.userId === user.id) {
        includeRating = true;
      } else if (activeView === 'wife' && wife && rating.userId === wife.id) {
        includeRating = true;
      }

      if (includeRating) {
        const current = stateRatingsMap.get(rating.stateCode) || { total: 0, count: 0, hasRatings: false };
        stateRatingsMap.set(rating.stateCode, {
          total: current.total + rating.rating,
          count: current.count + 1,
          hasRatings: true
        });
      }
    });

    return Array.from(stateRatingsMap.entries()).map(([stateCode, data]) => ({
      stateCode,
      averageRating: data.count > 0 ? data.total / data.count : 0,
      hasRatings: data.hasRatings
    }));
  };

  const stateRatings = calculateStateRatings();

  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode === selectedState ? null : stateCode);
  };

  const closeRatingPanel = () => {
    setSelectedState(null);
  };

  return (
    <div className="p-6">
      {/* Map Container */}
      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>United States Rating Map</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <Select value={filterCriterion} onValueChange={setFilterCriterion}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Criteria</SelectItem>
                    {criteria.map(criterion => (
                      <SelectItem key={criterion.id} value={criterion.id}>
                        {criterion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <ExpandIcon className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <USMap
            stateRatings={stateRatings}
            onStateClick={handleStateClick}
            selectedState={selectedState}
          />
        </CardContent>
      </Card>

      {/* Rating Panel */}
      {selectedState && (
        <RatingPanel
          selectedState={selectedState}
          onClose={closeRatingPanel}
        />
      )}

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 right-6 flex space-x-3">
        <Button variant="secondary" className="shadow-lg">
          <BarChart3Icon className="h-4 w-4 mr-2" />
          View Rankings
        </Button>
        <Button className="shadow-lg">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
}
