
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, HeartIcon, BarChartIcon } from "lucide-react";

interface MobileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  t: (key: string) => string;
}

const MobileTabs: React.FC<MobileTabsProps> = ({ activeTab, onTabChange, t }) => {
  const tabItems = [
    {
      value: 'classes',
      icon: CalendarIcon,
      label: 'My Classes'
    },
    {
      value: 'feedback',
      icon: MessageSquareIcon,
      label: 'Share Thoughts'
    },
    {
      value: 'summary',
      icon: FileTextIcon,
      label: 'My Week'
    },
    {
      value: 'wellness',
      icon: HeartIcon,
      label: 'How I Feel'
    },
    {
      value: 'analytics',
      icon: BarChartIcon,
      label: 'My Progress'
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="grid grid-cols-5 w-max min-w-full h-auto p-1 gap-1">
          {tabItems.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger 
                key={item.value}
                value={item.value} 
                className="flex flex-col items-center py-2 px-2 text-xs min-w-[70px]"
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] leading-tight text-center whitespace-nowrap">
                  {item.label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </ScrollArea>
    </Tabs>
  );
};

export default MobileTabs;
