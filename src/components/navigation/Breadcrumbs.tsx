
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Breadcrumbs component completely disabled - returns nothing to avoid translation issues
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return null;
};

export default Breadcrumbs;
