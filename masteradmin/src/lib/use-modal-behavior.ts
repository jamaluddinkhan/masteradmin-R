import { useEffect, useRef, type RefObject } from "react";

type ModalEntry = {
  element: HTMLElement;
  close: () => void;
};

const modalStack: ModalEntry[] = [];
let scrollLockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

function lockBodyScroll(): () => void {
  if (scrollLockCount === 0) {
    const body = document.body;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }
  }

  scrollLockCount += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;

    if (scrollLockCount === 0) {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    }
  };
}

function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((item) => item.getClientRects().length > 0);
}

export function useModalBehavior(
  isOpen: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void
): void {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const activeDialog: HTMLElement = dialog;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const entry: ModalEntry = {
      element: activeDialog,
      close: () => closeRef.current(),
    };
    const releaseScrollLock = lockBodyScroll();
    modalStack.push(entry);

    function handleKeyDown(event: KeyboardEvent) {
      if (modalStack[modalStack.length - 1] !== entry) return;

      if (event.key === "Escape") {
        event.preventDefault();
        entry.close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(activeDialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeDialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const autofocusTarget = activeDialog.querySelector<HTMLElement>("[autofocus]");
      const firstFocusable = getFocusableElements(activeDialog)[0];
      (autofocusTarget ?? firstFocusable ?? activeDialog).focus();
    });

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = modalStack.indexOf(entry);
      if (stackIndex !== -1) modalStack.splice(stackIndex, 1);
      releaseScrollLock();

      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [dialogRef, isOpen]);
}