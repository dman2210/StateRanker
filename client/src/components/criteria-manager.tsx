import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusIcon, EditIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCriterionSchema, type Criterion, type InsertCriterion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CriteriaManagerProps {
  selectedCriteria: string[];
  onCriteriaChange: (criteria: string[]) => void;
}

export function CriteriaManager({ selectedCriteria, onCriteriaChange }: CriteriaManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const { toast } = useToast();

  const { data: criteria = [], isLoading } = useQuery<Criterion[]>({
    queryKey: ['/api/criteria']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCriterion) => {
      const response = await apiRequest('POST', '/api/criteria', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/criteria'] });
      setIsDialogOpen(false);
      toast({ title: "Criterion created successfully" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCriterion> }) => {
      const response = await apiRequest('PUT', `/api/criteria/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/criteria'] });
      setIsDialogOpen(false);
      setEditingCriterion(null);
      toast({ title: "Criterion updated successfully" });
    }
  });

  const form = useForm<InsertCriterion>({
    resolver: zodResolver(insertCriterionSchema),
    defaultValues: {
      name: "",
      weight: 1.0,
      color: "#1976D2",
      isActive: true
    }
  });

  const onSubmit = (data: InsertCriterion) => {
    if (editingCriterion) {
      updateMutation.mutate({ id: editingCriterion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    form.reset(criterion);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCriterion(null);
    form.reset({
      name: "",
      weight: 1.0,
      color: "#1976D2",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Rating Criteria</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCriterion ? 'Edit Criterion' : 'Add New Criterion'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Cost of Living" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (importance multiplier)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.1" 
                          min="0.1" 
                          max="5"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} type="color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCriterion ? 'Update' : 'Create'} Criterion
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: criterion.color }}
              ></div>
              <span className="font-medium text-gray-900">{criterion.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{criterion.weight}x</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(criterion)}
              >
                <EditIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
