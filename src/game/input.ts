import { Direction } from './types';

export class InputManager {
  private onDirectionChange: (dir: Direction) => void;
  private onTogglePause: () => void;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private minSwipeDistance = 22; // px - responsive threshold
  private activeElement: HTMLElement | null = null;
  private hasSwiped = false;

  constructor(
    onDirectionChange: (dir: Direction) => void,
    onTogglePause: () => void
  ) {
    this.onDirectionChange = onDirectionChange;
    this.onTogglePause = onTogglePause;
  }

  public bindKeyboard(): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.onDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.onDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.onDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.onDirectionChange('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          this.onTogglePause();
          break;
        case 'Escape':
          e.preventDefault();
          this.onTogglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }

  public bindTouch(element: HTMLElement): () => void {
    this.activeElement = element;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.hasSwiped = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent browser pull-to-refresh or page bouncing during active play
      if (e.cancelable) {
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - this.touchStartX;
        const deltaY = currentY - this.touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Immediate turn trigger as soon as swipe threshold is reached
        if (absX >= this.minSwipeDistance || absY >= this.minSwipeDistance) {
          if (absX > absY) {
            this.onDirectionChange(deltaX > 0 ? 'RIGHT' : 'LEFT');
          } else {
            this.onDirectionChange(deltaY > 0 ? 'DOWN' : 'UP');
          }
          this.hasSwiped = true;
          // Advance anchor point to current position for continuous fluid swiping without lifting finger!
          this.touchStartX = currentX;
          this.touchStartY = currentY;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // If a quick flick occurred that was not caught during move
      if (!this.hasSwiped && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        if (deltaTime < 400) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX >= 16 || absY >= 16) {
            if (absX > absY) {
              this.onDirectionChange(deltaX > 0 ? 'RIGHT' : 'LEFT');
            } else {
              this.onDirectionChange(deltaY > 0 ? 'DOWN' : 'UP');
            }
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
}
