
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

// This component is disabled - breadcrumbs are not shown in dashboards
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return null; // Don't render breadcrumbs anywhere
};

export default Breadcrumbs;
