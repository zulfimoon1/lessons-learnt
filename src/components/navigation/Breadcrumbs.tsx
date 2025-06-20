
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Breadcrumbs component completely disabled - returns nothing
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return null;
};

export default Breadcrumbs;
