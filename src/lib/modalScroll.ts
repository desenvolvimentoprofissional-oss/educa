import { useEffect, useRef, RefObject } from 'react';

let scrollLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';
const focusReturnStack: (HTMLElement | null)[] = [];
const activeModalStack: HTMLElement[] = [];
const pendingTriggerByModal = new WeakMap<HTMLElement, HTMLElement | null>();
const lastKnownTriggerByModal = new WeakMap<HTMLElement, HTMLElement | null>();
let pendingFocusReturnTimer: ReturnType<typeof setTimeout> | null = null;
let pendingFocusReturnEl: HTMLElement | null = null;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isElementConnected(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  if (typeof el.isConnected === 'boolean') return el.isConnected;
  if (typeof document !== 'undefined' && typeof document.contains === 'function') {
    return document.contains(el);
  }
  return true;
}

function isElementInside(container: HTMLElement, target: Element | null | undefined): boolean {
  if (!target) return false;
  if (container === target) return true;
  if (typeof container.contains === 'function') {
    return container.contains(target);
  }
  let current: Node | null = target;
  while (current) {
    if (current === container) return true;
    current = current.parentNode;
  }
  return false;
}

function isElementVisible(el: HTMLElement, stopAt?: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.hidden || current.getAttribute?.('aria-hidden') === 'true') return false;
    if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
    }
    if (stopAt && current === stopAt) break;
    current = current.parentElement;
  }
  return true;
}

function isElementFocusable(el: HTMLElement | null | undefined, stopAt?: HTMLElement): boolean {
  if (!el || typeof el.focus !== 'function' || !isElementConnected(el)) return false;
  if ((el as HTMLButtonElement).disabled === true) return false;
  if (typeof el.getAttribute === 'function' && el.getAttribute('disabled') !== null) return false;
  return isElementVisible(el, stopAt);
}

function getVisibleFocusables(modal: HTMLElement): HTMLElement[] {
  if (typeof modal.querySelectorAll !== 'function') return [];
  return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(el =>
    isElementFocusable(el, modal)
  );
}

function focusFirstInModal(modal: HTMLElement) {
  const focusables = getVisibleFocusables(modal);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }
  if (typeof modal.focus === 'function') {
    modal.focus();
  }
}

function restoreModalOrTriggerFocus(previousEl: HTMLElement | null) {
  const topModal = activeModalStack[activeModalStack.length - 1];
  if (topModal) {
    if (isElementFocusable(previousEl) && isElementInside(topModal, previousEl)) {
      previousEl!.focus();
      return;
    }
    const currentActive = typeof document !== 'undefined' ? document.activeElement : null;
    if (!isElementInside(topModal, currentActive)) {
      focusFirstInModal(topModal);
    }
    return;
  }
  if (isElementFocusable(previousEl)) {
    previousEl!.focus();
  }
}

function consumePendingFocusReturn(): { hadTimer: boolean; element: HTMLElement | null } {
  if (pendingFocusReturnTimer !== null) {
    clearTimeout(pendingFocusReturnTimer);
    pendingFocusReturnTimer = null;
    const el = pendingFocusReturnEl;
    pendingFocusReturnEl = null;
    return { hadTimer: true, element: el };
  }
  return { hadTimer: false, element: null };
}

export function lockScroll() {
  if (typeof window === 'undefined') return;
  const pending = consumePendingFocusReturn();
  if (typeof document !== 'undefined') {
    const topModal = activeModalStack[activeModalStack.length - 1];
    if (activeModalStack.length > scrollLockCount && topModal) {
      if (pendingTriggerByModal.has(topModal)) {
        focusReturnStack.push(pendingTriggerByModal.get(topModal) ?? null);
        pendingTriggerByModal.delete(topModal);
      } else {
        focusReturnStack.push(pending.hadTimer ? pending.element : (lastKnownTriggerByModal.get(topModal) ?? null));
      }
    } else if (pending.hadTimer) {
      focusReturnStack.push(pending.element);
    } else {
      focusReturnStack.push(document.activeElement as HTMLElement | null);
    }
  }
  if (scrollLockCount === 0) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }
  scrollLockCount++;
}

export function unlockScroll() {
  if (typeof window === 'undefined') return;
  scrollLockCount--;
  if (scrollLockCount <= 0) {
    scrollLockCount = 0;
    document.body.style.overflow = originalOverflow || '';
    document.body.style.paddingRight = originalPaddingRight || '';
  }
  const previousEl = focusReturnStack.pop() ?? null;
  if (pendingFocusReturnTimer !== null) {
    clearTimeout(pendingFocusReturnTimer);
  }
  pendingFocusReturnEl = previousEl;
  pendingFocusReturnTimer = setTimeout(() => {
    pendingFocusReturnTimer = null;
    pendingFocusReturnEl = null;
    try {
      restoreModalOrTriggerFocus(previousEl);
    } catch {}
  }, 0);
}

function trapTabNavigation(e: KeyboardEvent, container: HTMLElement) {
  const currentFocusables = getVisibleFocusables(container);
  if (currentFocusables.length === 0) {
    e.preventDefault();
    if (typeof container.focus === 'function') container.focus();
    return;
  }
  const first = currentFocusables[0];
  const last = currentFocusables[currentFocusables.length - 1];
  const activeEl = document.activeElement;
  if (!isElementInside(container, activeEl)) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
    return;
  }
  if (e.shiftKey && activeEl === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && activeEl === last) {
    e.preventDefault();
    first.focus();
  }
}

function recordModalTriggerBeforeFocus(container: HTMLElement) {
  const pending = consumePendingFocusReturn();
  const candidate = pending.hadTimer
    ? pending.element
    : (document.activeElement as HTMLElement | null);

  if (candidate && !isElementInside(container, candidate)) {
    lastKnownTriggerByModal.set(container, candidate);
  }
  if (scrollLockCount <= activeModalStack.length) {
    const resolved =
      candidate && !isElementInside(container, candidate)
        ? candidate
        : (lastKnownTriggerByModal.get(container) ?? null);
    pendingTriggerByModal.set(container, resolved);
  }
}

export function useModalAccessibility(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    recordModalTriggerBeforeFocus(container);
    activeModalStack.push(container);
    focusFirstInModal(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      const topModal = activeModalStack[activeModalStack.length - 1];
      if (topModal && topModal !== container) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onCloseRef.current();
      } else if (e.key === 'Tab') {
        trapTabNavigation(e, container);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      pendingTriggerByModal.delete(container);
      const idx = activeModalStack.lastIndexOf(container);
      if (idx !== -1) activeModalStack.splice(idx, 1);
    };
  }, [isOpen, containerRef]);
}


