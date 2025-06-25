
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import FocusIndicator from '@/components/accessibility/FocusIndicator';
import ScreenReaderOnly from '@/components/accessibility/ScreenReaderOnly';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string | number;
}

interface TouchFriendlyTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const TouchFriendlyTabs: React.FC<TouchFriendlyTabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  className,
  orientation = 'horizontal'
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [focusedTab, setFocusedTab] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const nextTab = () => {
      const nextIndex = (index + 1) % tabs.length;
      setFocusedTab(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    };

    const prevTab = () => {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setFocusedTab(prevIndex);
      tabRefs.current[prevIndex]?.focus();
    };

    switch (e.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          e.preventDefault();
          nextTab();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          e.preventDefault();
          prevTab();
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical') {
          e.preventDefault();
          nextTab();
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          e.preventDefault();
          prevTab();
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(tabs[index].id);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedTab(0);
        tabRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = tabs.length - 1;
        setFocusedTab(lastIndex);
        tabRefs.current[lastIndex]?.focus();
        break;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        className={cn(
          'flex bg-gray-100 rounded-lg p-1',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          isMobile && 'min-h-[48px]'
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFocused = focusedTab === index;
          
          return (
            <FocusIndicator key={tab.id}>
              <button
                ref={(el) => (tabRefs.current[index] = el)}
                className={cn(
                  'relative flex items-center justify-center gap-2 px-4 py-2',
                  'rounded-md font-medium transition-all touch-manipulation',
                  'focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-1',
                  isMobile ? 'min-h-[44px] text-sm' : 'min-h-[36px] text-sm',
                  orientation === 'vertical' ? 'w-full justify-start' : 'flex-1',
                  isActive
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50',
                  tab.disabled && 'opacity-50 cursor-not-allowed',
                  isFocused && 'ring-2 ring-brand-teal ring-offset-1'
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedTab(index)}
                disabled={tab.disabled}
              >
                {Icon && (
                  <Icon 
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-brand-teal' : 'text-gray-500'
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className={isMobile ? 'text-sm' : 'text-sm'}>
                  {tab.label}
                </span>
                {tab.badge && (
                  <span
                    className={cn(
                      'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-300 text-gray-700'
                    )}
                    aria-label={`${tab.badge} items`}
                  >
                    {tab.badge}
                  </span>
                )}
                <ScreenReaderOnly>
                  {isActive ? ', selected' : ''}
                  {tab.disabled ? ', disabled' : ''}
                </ScreenReaderOnly>
              </button>
            </FocusIndicator>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={cn(
              'focus:outline-none',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
            tabIndex={0}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TouchFriendlyTabs;
