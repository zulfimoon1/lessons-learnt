
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { cn } from '@/lib/utils';
import ScreenReaderOnly from '@/components/accessibility/ScreenReaderOnly';
import FocusIndicator from '@/components/accessibility/FocusIndicator';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  onClick?: () => void;
}

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { student, teacher, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const studentNavItems: NavigationItem[] = [
    {
      icon: Home,
      label: t('nav.dashboard') || 'Dashboard',
      href: '/student-dashboard'
    },
    {
      icon: User,
      label: t('nav.profile') || 'Profile',
      href: '/profile'
    },
    {
      icon: Settings,
      label: t('nav.settings') || 'Settings',
      href: '/settings'
    },
    {
      icon: LogOut,
      label: t('nav.logout') || 'Logout',
      href: '#',
      onClick: handleLogout
    }
  ];

  const teacherNavItems: NavigationItem[] = [
    {
      icon: Home,
      label: t('nav.dashboard') || 'Dashboard',
      href: '/teacher-dashboard'
    },
    {
      icon: User,
      label: t('nav.profile') || 'Profile',
      href: '/profile'
    },
    {
      icon: Settings,
      label: t('nav.settings') || 'Settings',
      href: '/settings'
    },
    {
      icon: LogOut,
      label: t('nav.logout') || 'Logout',
      href: '#',
      onClick: handleLogout
    }
  ];

  const navItems = student ? studentNavItems : teacher ? teacherNavItems : [];

  const handleItemClick = (item: NavigationItem, index: number) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.href);
    }
    setIsOpen(false);
    setFocusedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleItemClick(item, index);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % navItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useKeyboardNavigation({
    onEscape: () => setIsOpen(false),
    enableEscape: true
  });

  if (!student && !teacher) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <FocusIndicator>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20',
              'focus:bg-white/20 touch-manipulation',
              className
            )}
            aria-label={t('nav.openMenu') || 'Open navigation menu'}
          >
            <Menu className="h-5 w-5 text-white" />
            <ScreenReaderOnly>
              {t('nav.navigationMenu') || 'Navigation menu'}
            </ScreenReaderOnly>
          </Button>
        </FocusIndicator>
      </SheetTrigger>

      <SheetContent 
        side="right" 
        className="w-80 bg-white/95 backdrop-blur-sm border-brand-teal/30"
        aria-label={t('nav.mainNavigation') || 'Main navigation'}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-brand-dark">
            {t('nav.menu') || 'Menu'}
          </h2>
          <FocusIndicator>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              aria-label={t('nav.closeMenu') || 'Close menu'}
            >
              <X className="h-4 w-4" />
            </Button>
          </FocusIndicator>
        </div>

        <nav className="space-y-2" role="navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isFocused = focusedIndex === index;
            
            return (
              <FocusIndicator key={item.label}>
                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                    'text-left transition-colors touch-manipulation',
                    'hover:bg-brand-teal/10 focus:bg-brand-teal/10',
                    'text-brand-dark font-medium',
                    isFocused && 'bg-brand-teal/10'
                  )}
                  onClick={() => handleItemClick(item, index)}
                  onKeyDown={(e) => handleKeyDown(e, item, index)}
                  tabIndex={0}
                  role="menuitem"
                  aria-current={isFocused ? 'true' : undefined}
                >
                  <Icon className="h-5 w-5 text-brand-teal" aria-hidden="true" />
                  <span className="text-base">{item.label}</span>
                </button>
              </FocusIndicator>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {student && (
              <>
                <p className="font-medium">{student.full_name}</p>
                <p>{student.school}</p>
                <p>{student.grade}</p>
              </>
            )}
            {teacher && (
              <>
                <p className="font-medium">{teacher.name}</p>
                <p>{teacher.email}</p>
                <p>{teacher.school}</p>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
