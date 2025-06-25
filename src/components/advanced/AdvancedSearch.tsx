
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchFilter {
  key: string;
  label: string;
  values: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'feedback' | 'student' | 'teacher';
  tags: string[];
  relevance: number;
}

interface AdvancedSearchProps {
  data?: SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  data = [],
  onResultSelect,
  className
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  const availableFilters: SearchFilter[] = [
    {
      key: 'type',
      label: t('search.type') || 'Type',
      values: ['class', 'feedback', 'student', 'teacher']
    },
    {
      key: 'subject',
      label: t('search.subject') || 'Subject',
      values: ['Mathematics', 'Science', 'English', 'History']
    },
    {
      key: 'grade',
      label: t('search.grade') || 'Grade',
      values: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
    }
  ];

  const filteredResults = useMemo(() => {
    let results = data;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    Object.entries(selectedFilters).forEach(([filterKey, filterValues]) => {
      if (filterValues.length > 0) {
        results = results.filter(item => {
          if (filterKey === 'type') {
            return filterValues.includes(item.type);
          }
          return filterValues.some(value => 
            item.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
          );
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }, [data, searchQuery, selectedFilters]);

  const toggleFilter = (filterKey: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterKey] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return updated.length > 0
        ? { ...prev, [filterKey]: updated }
        : { ...prev, [filterKey]: [] };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t('search.placeholder') || 'Search classes, feedback, users...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-12"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {t('search.filters') || 'Filters'}
              </CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-3 h-3 mr-1" />
                  {t('search.clear') || 'Clear'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableFilters.map((filter) => (
              <div key={filter.key}>
                <h4 className="text-sm font-medium mb-2">{filter.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {filter.values.map((value) => {
                    const isSelected = selectedFilters[filter.key]?.includes(value);
                    return (
                      <Badge
                        key={value}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter(filter.key, value)}
                      >
                        {value}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchQuery || activeFilterCount > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {filteredResults.length} {t('search.results') || 'results found'}
          </p>
          {filteredResults.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onResultSelect?.(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{result.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.description}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                      {result.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AdvancedSearch;
