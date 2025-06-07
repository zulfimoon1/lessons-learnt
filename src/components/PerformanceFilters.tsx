
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FilterIcon, XIcon, DownloadIcon } from "lucide-react";
import { format } from "date-fns";

interface FilterCriteria {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  subjects: string[];
  classes: string[];
  performanceLevel: string;
  attendance: string;
  searchTerm: string;
}

interface PerformanceFiltersProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  availableSubjects?: string[];
  availableClasses?: string[];
}

const PerformanceFilters = ({ 
  onFiltersChange, 
  availableSubjects = [], 
  availableClasses = [] 
}: PerformanceFiltersProps) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    dateRange: { from: undefined, to: undefined },
    subjects: [],
    classes: [],
    performanceLevel: '',
    attendance: '',
    searchTerm: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateFilters = (newFilters: Partial<FilterCriteria>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const addSubject = (subject: string) => {
    if (!filters.subjects.includes(subject)) {
      updateFilters({
        subjects: [...filters.subjects, subject]
      });
    }
  };

  const removeSubject = (subject: string) => {
    updateFilters({
      subjects: filters.subjects.filter(s => s !== subject)
    });
  };

  const addClass = (className: string) => {
    if (!filters.classes.includes(className)) {
      updateFilters({
        classes: [...filters.classes, className]
      });
    }
  };

  const removeClass = (className: string) => {
    updateFilters({
      classes: filters.classes.filter(c => c !== className)
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterCriteria = {
      dateRange: { from: undefined, to: undefined },
      subjects: [],
      classes: [],
      performanceLevel: '',
      attendance: '',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const exportFilters = () => {
    const filterData = JSON.stringify(filters, null, 2);
    const blob = new Blob([filterData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-filters.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = 
    filters.subjects.length > 0 ||
    filters.classes.length > 0 ||
    filters.performanceLevel ||
    filters.attendance ||
    filters.searchTerm ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Performance Filters
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <XIcon className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportFilters}
            >
              <DownloadIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Students</Label>
          <Input
            id="search"
            placeholder="Search by name or ID..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) => {
                  updateFilters({
                    dateRange: {
                      from: range?.from,
                      to: range?.to,
                    }
                  });
                  if (range?.from && range?.to) {
                    setShowDatePicker(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <Label>Subjects</Label>
          <Select onValueChange={addSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subjects to filter..." />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem 
                  key={subject} 
                  value={subject}
                  disabled={filters.subjects.includes(subject)}
                >
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                  {subject}
                  <XIcon 
                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                    onClick={() => removeSubject(subject)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Classes */}
        <div className="space-y-2">
          <Label>Classes</Label>
          <Select onValueChange={addClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select classes to filter..." />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((className) => (
                <SelectItem 
                  key={className} 
                  value={className}
                  disabled={filters.classes.includes(className)}
                >
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.classes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.classes.map((className) => (
                <Badge key={className} variant="secondary" className="flex items-center gap-1">
                  {className}
                  <XIcon 
                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                    onClick={() => removeClass(className)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Performance Level */}
        <div className="space-y-2">
          <Label>Performance Level</Label>
          <Select 
            value={filters.performanceLevel} 
            onValueChange={(value) => updateFilters({ performanceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select performance level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent (90-100%)</SelectItem>
              <SelectItem value="good">Good (80-89%)</SelectItem>
              <SelectItem value="average">Average (70-79%)</SelectItem>
              <SelectItem value="below-average">Below Average (60-69%)</SelectItem>
              <SelectItem value="poor">Poor (<60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attendance */}
        <div className="space-y-2">
          <Label>Attendance Rate</Label>
          <Select 
            value={filters.attendance} 
            onValueChange={(value) => updateFilters({ attendance: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attendance rate..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent (95-100%)</SelectItem>
              <SelectItem value="good">Good (85-94%)</SelectItem>
              <SelectItem value="average">Average (75-84%)</SelectItem>
              <SelectItem value="poor">Poor (<75%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {filters.searchTerm && (
                <div>Search: "{filters.searchTerm}"</div>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <div>
                  Date: {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd, y") : "Start"} - {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd, y") : "End"}
                </div>
              )}
              {filters.subjects.length > 0 && (
                <div>Subjects: {filters.subjects.join(", ")}</div>
              )}
              {filters.classes.length > 0 && (
                <div>Classes: {filters.classes.join(", ")}</div>
              )}
              {filters.performanceLevel && (
                <div>Performance: {filters.performanceLevel}</div>
              )}
              {filters.attendance && (
                <div>Attendance: {filters.attendance}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceFilters;
