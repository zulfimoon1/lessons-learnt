
import React, { useState, useEffect } from 'react';
import { X, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OptimizedButton from '@/components/shared/OptimizedButton';

interface FeatureTooltipProps {
  title: string;
  description: string;
  isVisible: boolean;
  onDismiss: () => void;
  onTryFeature?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  feature?: 'new' | 'advanced' | 'tip';
  demoContent?: React.ReactNode;
  shortcuts?: string[];
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  title,
  description,
  isVisible,
  onDismiss,
  onTryFeature,
  position = 'top',
  feature = 'tip',
  demoContent,
  shortcuts = []
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getFeatureColor = () => {
    switch (feature) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tip': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeatureIcon = () => {
    switch (feature) {
      case 'new': return '✨';
      case 'advanced': return '🚀';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  };

  const handleTryFeature = () => {
    setHasTried(true);
    onTryFeature?.();
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`absolute z-50 ${positionClasses[position]} ${isAnimating ? 'animate-fade-in' : ''}`}>
      <Card className="w-80 shadow-lg border-2 border-blue-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getFeatureIcon()}</span>
              <Badge className={getFeatureColor()}>
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
              </Badge>
            </div>
            <OptimizedButton
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </OptimizedButton>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {demoContent && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
              {demoContent}
            </div>
          )}
          
          {shortcuts.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts:</p>
              <div className="flex flex-wrap gap-1">
                {shortcuts.map((shortcut, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                    {shortcut}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <OptimizedButton
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="text-xs"
            >
              Got it
            </OptimizedButton>
            
            {onTryFeature && (
              <OptimizedButton
                size="sm"
                onClick={handleTryFeature}
                className={`text-xs ${hasTried ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                disabled={hasTried}
              >
                {hasTried ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Tried it!
                  </>
                ) : (
                  <>
                    Try it <ArrowRight className="w-3 h-3 ml-1" />
                  </>
                )}
              </OptimizedButton>
            )}
          </div>
          
          {/* Tooltip arrow */}
          <div className={`absolute w-3 h-3 bg-white border-l border-t border-blue-200 transform rotate-45 ${
            position === 'top' ? 'top-full -mt-2 left-1/2 -ml-1.5' :
            position === 'bottom' ? 'bottom-full -mb-2 left-1/2 -ml-1.5' :
            position === 'left' ? 'left-full -ml-2 top-1/2 -mt-1.5' :
            'right-full -mr-2 top-1/2 -mt-1.5'
          }`} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureTooltip;
