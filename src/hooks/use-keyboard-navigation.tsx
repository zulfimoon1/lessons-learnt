
import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onTab?: () => void;
  enableArrowKeys?: boolean;
  enableEscape?: boolean;
  enableEnter?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onTab,
  enableArrowKeys = false,
  enableEscape = true,
  enableEnter = false
}: UseKeyboardNavigationProps = {}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (enableEscape && onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      
      case 'Enter':
        if (enableEnter && onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      
      case 'ArrowUp':
        if (enableArrowKeys && onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      
      case 'ArrowDown':
        if (enableArrowKeys && onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      
      case 'Tab':
        if (onTab) {
          onTab();
        }
        break;
    }
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onTab, enableArrowKeys, enableEscape, enableEnter]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { handleKeyDown };
};

export default useKeyboardNavigation;
