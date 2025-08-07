import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { ArrowUpDownIcon } from "lucide-react";
import type { Rating, User, State, Criterion } from "@shared/schema";

interface ListViewProps {
  activeView: 'combined' | 'user' | 'wife';
}

type SortField = 'name' | 'rating' | 'userRating' | 'wifeRating';
type SortOrder = 'asc' | 'desc';

export function ListView({ activeView }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('rating');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCriterion, setFilterCriterion] = useState<string>('all');

  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings']
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  const { data: states = [] } = useQuery<State[]>({
    queryKey: ['/api/states']
  });

  const { data: criteria = [] } = useQuery<Criterion[]>({
    queryKey: ['/api/criteria']
  });

  const user = users.find(u => u.username === 'user');
  const wife = users.find(u => u.username === 'wife');

  const stateData = useMemo(() => {
    return states.map(state => {
      const stateRatings = allRatings.filter(r => r.stateCode === state.code);
      const userRatings = user ? stateRatings.filter(r => r.userId === user.id) : [];
      const wifeRatings = wife ? stateRatings.filter(r => r.userId === wife.id) : [];

      // Calculate ratings based on active criteria filter
      const getFilteredRatings = (ratings: Rating[]) => {
        if (filterCriterion === 'all') return ratings;
        return ratings.filter(r => r.criterionId === filterCriterion);
      };

      const filteredUserRatings = getFilteredRatings(userRatings);
      const filteredWifeRatings = getFilteredRatings(wifeRatings);
      const filteredAllRatings = getFilteredRatings(stateRatings);

      const calculateAverage = (ratings: Rating[]) => {
        if (ratings.length === 0) return 0;
        return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      };

      const userAvg = calculateAverage(filteredUserRatings);
      const wifeAvg = calculateAverage(filteredWifeRatings);
      const combinedAvg = calculateAverage(filteredAllRatings);

      return {
        state,
        userRating: userAvg,
        wifeRating: wifeAvg,
        combinedRating: combinedAvg,
        hasUserRatings: filteredUserRatings.length > 0,
        hasWifeRatings: filteredWifeRatings.length > 0,
        hasAnyRatings: filteredAllRatings.length > 0
      };
    });
  }, [states, allRatings, user, wife, filterCriterion]);

  const sortedData = useMemo(() => {
    const sorted = [...stateData].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case 'name':
          aVal = a.state.name;
          bVal = b.state.name;
          break;
        case 'rating':
          aVal = a.combinedRating;
          bVal = b.combinedRating;
          break;
        case 'userRating':
          aVal = a.userRating;
          bVal = b.userRating;
          break;
        case 'wifeRating':
          aVal = a.wifeRating;
          bVal = b.wifeRating;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      const numA = typeof aVal === 'number' ? aVal : 0;
      const numB = typeof bVal === 'number' ? bVal : 0;
      
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [stateData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        {children}
        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  const getRatingDisplay = (rating: number, hasRating: boolean) => {
    if (!hasRating) return <Badge variant="secondary">Not Rated</Badge>;
    return (
      <div className="flex items-center space-x-2">
        <StarRating rating={Math.round(rating)} readonly size="sm" maxRating={10} />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>State Ratings List</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by criterion:</span>
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
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">State</SortableHeader>
                {(activeView === 'combined' || activeView === 'user') && (
                  <SortableHeader field="userRating">Your Rating</SortableHeader>
                )}
                {(activeView === 'combined' || activeView === 'wife') && (
                  <SortableHeader field="wifeRating">Wife's Rating</SortableHeader>
                )}
                {activeView === 'combined' && (
                  <SortableHeader field="rating">Combined Rating</SortableHeader>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.state.code}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{item.state.name}</span>
                      <Badge variant="outline">{item.state.code}</Badge>
                    </div>
                  </TableCell>
                  {(activeView === 'combined' || activeView === 'user') && (
                    <TableCell>
                      {getRatingDisplay(item.userRating, item.hasUserRatings)}
                    </TableCell>
                  )}
                  {(activeView === 'combined' || activeView === 'wife') && (
                    <TableCell>
                      {getRatingDisplay(item.wifeRating, item.hasWifeRatings)}
                    </TableCell>
                  )}
                  {activeView === 'combined' && (
                    <TableCell>
                      {getRatingDisplay(item.combinedRating, item.hasAnyRatings)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
