
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OptimizedButton from '@/components/shared/OptimizedButton';
import OptimizedCard from '@/components/shared/OptimizedCard';

interface DisclosureLevel {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  prerequisites?: string[];
}

interface ProgressiveDisclosureProps {
  title: string;
  levels: DisclosureLevel[];
  defaultLevel?: 'beginner' | 'intermediate' | 'advanced';
  onLevelComplete?: (levelId: string) => void;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  levels,
  defaultLevel = 'beginner',
  onLevelComplete
}) => {
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>(
    levels.find(l => l.complexity === defaultLevel)?.id || levels[0]?.id
  );
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels(prev => 
      prev.includes(levelId) 
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const markComplete = (levelId: string) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels(prev => [...prev, levelId]);
      onLevelComplete?.(levelId);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '⚡';
      default: return '📚';
    }
  };

  const canAccessLevel = (level: DisclosureLevel) => {
    if (!level.prerequisites?.length) return true;
    return level.prerequisites.every(prereq => 
      completedLevels.includes(prereq)
    );
  };

  return (
    <OptimizedCard title={title} className="w-full">
      <div className="space-y-4">
        {levels.map((level) => {
          const isExpanded = expandedLevels.includes(level.id);
          const isCompleted = completedLevels.includes(level.id);
          const canAccess = canAccessLevel(level);
          
          return (
            <div key={level.id} className="border rounded-lg">
              <div 
                className={`p-4 cursor-pointer transition-colors ${
                  isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${!canAccess ? 'opacity-50' : ''}`}
                onClick={() => canAccess && toggleLevel(level.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {canAccess ? (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300" />
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getComplexityIcon(level.complexity)}</span>
                        <h3 className="font-semibold">{level.title}</h3>
                        <Badge className={getComplexityColor(level.complexity)}>
                          {level.complexity}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{level.description}</p>
                      {level.estimatedTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ Est. time: {level.estimatedTime}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {!canAccess && (
                    <div className="text-xs text-gray-500">
                      Prerequisites required
                    </div>
                  )}
                </div>
                
                {level.prerequisites && level.prerequisites.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Info className="w-3 h-3" />
                    <span>Requires: {level.prerequisites.join(', ')}</span>
                  </div>
                )}
              </div>
              
              {isExpanded && canAccess && (
                <div className="border-t bg-white p-4">
                  <div className="mb-4">
                    {level.content}
                  </div>
                  
                  {!isCompleted && (
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Lightbulb className="w-4 h-4" />
                        <span>Ready to move on?</span>
                      </div>
                      <OptimizedButton
                        onClick={() => markComplete(level.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Mark Complete <ArrowRight className="w-3 h-3 ml-1" />
                      </OptimizedButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800">Learning Progress</span>
        </div>
        <div className="text-sm text-blue-700">
          {completedLevels.length} of {levels.length} sections completed
        </div>
        <div className="mt-2 bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedLevels.length / levels.length) * 100}%` }}
          />
        </div>
      </div>
    </OptimizedCard>
  );
};

export default ProgressiveDisclosure;
