import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CriteriaManager } from "./criteria-manager";
import { RATING_LABELS } from "@/lib/constants";
import type { User, Rating } from "@shared/schema";

interface SidebarProps {
  activeView: 'combined' | 'user' | 'wife';
  onViewChange: (view: 'combined' | 'user' | 'wife') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings']
  });

  const user = users.find(u => u.username === 'user');
  const wife = users.find(u => u.username === 'wife');

  const calculateStats = () => {
    if (!user || !wife) return { ratedStates: 0, agreement: 0, topState: 'N/A' };

    const statesWithRatings = new Set([...allRatings.map(r => r.stateCode)]);
    const userRatings = allRatings.filter(r => r.userId === user.id);
    const wifeRatings = allRatings.filter(r => r.userId === wife.id);

    // Calculate agreement rate (simplified)
    let agreements = 0;
    let comparisons = 0;

    statesWithRatings.forEach(stateCode => {
      const userStateRatings = userRatings.filter(r => r.stateCode === stateCode);
      const wifeStateRatings = wifeRatings.filter(r => r.stateCode === stateCode);

      userStateRatings.forEach(userRating => {
        const wifeRating = wifeStateRatings.find(wr => wr.criterionId === userRating.criterionId);
        if (wifeRating) {
          comparisons++;
          if (Math.abs(userRating.rating - wifeRating.rating) <= 2) {
            agreements++;
          }
        }
      });
    });

    const agreementRate = comparisons > 0 ? (agreements / comparisons) * 100 : 0;

    return {
      ratedStates: statesWithRatings.size,
      agreement: Math.round(agreementRate),
      topState: statesWithRatings.size > 0 ? Array.from(statesWithRatings)[0] : 'N/A'
    };
  };

  const stats = calculateStats();

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* View Toggle */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Rating View</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeView === 'combined' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('combined')}
              className="flex-1"
            >
              Combined
            </Button>
            <Button
              variant={activeView === 'user' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('user')}
              className="flex-1"
            >
              You
            </Button>
            <Button
              variant={activeView === 'wife' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('wife')}
              className="flex-1"
            >
              Wife
            </Button>
          </div>
        </div>

        {/* Rating Criteria */}
        <div className="mb-6">
          <CriteriaManager 
            selectedCriteria={selectedCriteria}
            onCriteriaChange={setSelectedCriteria}
          />
        </div>

        {/* Rating Scale Legend */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Scale</h3>
          <div className="space-y-3">
            {Object.entries(RATING_LABELS).map(([range, { color, label }]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{range}</span>
                <div className="flex items-center">
                  <div className={`w-4 h-4 ${color} rounded mr-2`}></div>
                  <span className="text-sm text-gray-900">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">States Rated</span>
              <span className="text-sm font-medium text-gray-900">{stats.ratedStates}/50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Agreement Rate</span>
              <span className="text-sm font-medium text-green-600">{stats.agreement}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top Rated</span>
              <span className="text-sm font-medium text-gray-900">{stats.topState}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
