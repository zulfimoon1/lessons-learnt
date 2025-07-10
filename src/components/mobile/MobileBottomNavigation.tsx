import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, UserIcon, MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileBottomNavigationProps {
  userType?: 'student' | 'teacher';
  onMenuClick?: () => void;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ 
  userType, 
  onMenuClick 
}) => {
  const location = useLocation();
  const { t } = useLanguage();

  const studentNavItems = [
    { icon: HomeIcon, label: t('navigation.dashboard'), path: '/student-dashboard' },
    { icon: BookOpenIcon, label: t('navigation.classes'), path: '/student-dashboard?tab=classes' },
    { icon: UserIcon, label: t('navigation.profile'), path: '/student-dashboard?tab=wellness' },
  ];

  const teacherNavItems = [
    { icon: HomeIcon, label: t('navigation.dashboard'), path: '/teacher-dashboard' },
    { icon: BookOpenIcon, label: t('navigation.classes'), path: '/teacher-dashboard?tab=classes' },
    { icon: UserIcon, label: t('navigation.profile'), path: '/teacher-dashboard?tab=profile' },
  ];

  const navItems = userType === 'student' ? studentNavItems : teacherNavItems;

  const isActive = (path: string) => {
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] touch-manipulation',
                active 
                  ? 'text-brand-teal bg-brand-teal/10' 
                  : 'text-gray-500 hover:text-brand-teal hover:bg-brand-teal/5'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] text-gray-500 hover:text-brand-teal hover:bg-brand-teal/5 touch-manipulation"
          >
            <MenuIcon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{t('common.menu')}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;