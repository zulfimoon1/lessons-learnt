import React from 'react';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// This component is deprecated and should not be used in dashboards
// Keeping for backward compatibility but not rendering
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return null; // Don't render breadcrumbs in dashboards
};

export default Breadcrumbs;
