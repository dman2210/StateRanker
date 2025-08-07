import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./star-rating";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { State, Criterion, Rating, User } from "@shared/schema";

interface RatingPanelProps {
  selectedState: string | null;
  onClose: () => void;
}

interface StateRatingData {
  state: State;
  userRatings: Rating[];
  wifeRatings: Rating[];
  combinedRating: number;
}

export function RatingPanel({ selectedState, onClose }: RatingPanelProps) {
  const [activeUser, setActiveUser] = useState<'user' | 'wife'>('user');
  const { toast } = useToast();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  const { data: criteria = [] } = useQuery<Criterion[]>({
    queryKey: ['/api/criteria']
  });

  const { data: state } = useQuery<State>({
    queryKey: ['/api/states', selectedState],
    enabled: !!selectedState
  });

  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings'],
    enabled: !!selectedState
  });

  const createRatingMutation = useMutation({
    mutationFn: async (ratingData: {
      userId: string;
      stateCode: string;
      criterionId: string;
      rating: number;
    }) => {
      const response = await apiRequest('POST', '/api/ratings', ratingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ratings'] });
      toast({ title: "Rating saved successfully" });
    }
  });

  if (!selectedState || !state) return null;

  const user = users.find(u => u.username === 'user');
  const wife = users.find(u => u.username === 'wife');

  if (!user || !wife) return null;

  const stateRatings = allRatings.filter(r => r.stateCode === selectedState);
  const userRatings = stateRatings.filter(r => r.userId === user.id);
  const wifeRatings = stateRatings.filter(r => r.userId === wife.id);

  const calculateCombinedRating = (): number => {
    if (criteria.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    criteria.forEach(criterion => {
      const userRating = userRatings.find(r => r.criterionId === criterion.id);
      const wifeRating = wifeRatings.find(r => r.criterionId === criterion.id);

      if (userRating || wifeRating) {
        const avgRating = ((userRating?.rating || 0) + (wifeRating?.rating || 0)) / 
          ((userRating ? 1 : 0) + (wifeRating ? 1 : 0));
        
        weightedSum += avgRating * criterion.weight;
        totalWeight += criterion.weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const combinedRating = calculateCombinedRating();

  const handleRatingChange = async (criterionId: string, rating: number) => {
    const currentUserId = activeUser === 'user' ? user.id : wife.id;
    
    await createRatingMutation.mutateAsync({
      userId: currentUserId,
      stateCode: selectedState,
      criterionId,
      rating
    });
  };

  const getUserRating = (criterionId: string, isWife: boolean = false): number => {
    const ratings = isWife ? wifeRatings : userRatings;
    const rating = ratings.find(r => r.criterionId === criterionId);
    return rating?.rating || 0;
  };

  return (
    <Card className="mt-6">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle>{state.name}</CardTitle>
            <Badge variant="secondary">
              {combinedRating > 0 ? `${combinedRating.toFixed(1)}/10` : 'Not Rated'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Ratings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900">Your Ratings</h4>
              <Button
                variant={activeUser === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveUser('user')}
              >
                Edit Your Ratings
              </Button>
            </div>
            <div className="space-y-4">
              {criteria.map((criterion) => {
                const rating = getUserRating(criterion.id, false);
                return (
                  <div key={criterion.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{criterion.name}</span>
                    <div className="flex items-center space-x-2">
                      <StarRating
                        rating={rating}
                        onRatingChange={activeUser === 'user' ? (newRating) => handleRatingChange(criterion.id, newRating) : undefined}
                        readonly={activeUser !== 'user'}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600 w-6">{rating || '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Wife's Ratings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900">Wife's Ratings</h4>
              <Button
                variant={activeUser === 'wife' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveUser('wife')}
              >
                Edit Wife's Ratings
              </Button>
            </div>
            <div className="space-y-4">
              {criteria.map((criterion) => {
                const rating = getUserRating(criterion.id, true);
                return (
                  <div key={criterion.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{criterion.name}</span>
                    <div className="flex items-center space-x-2">
                      <StarRating
                        rating={rating}
                        onRatingChange={activeUser === 'wife' ? (newRating) => handleRatingChange(criterion.id, newRating) : undefined}
                        readonly={activeUser !== 'wife'}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600 w-6">{rating || '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Combined Rating Summary */}
        {combinedRating > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">Combined Rating</h5>
                  <p className="text-sm text-gray-600">Weighted average of both ratings</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{combinedRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">out of 10</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
