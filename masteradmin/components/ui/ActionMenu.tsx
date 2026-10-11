"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type MenuPosition = {
  left: number;
  top: number;
};

type ActionMenuProps = {
  label: string;
  width?: number;
  triggerClassName: string;
  triggerContent: ReactNode;
  children: ReactNode;
};

export default function ActionMenu({
  label,
  width = 192,
  triggerClassName,
  triggerContent,
  children,
}: ActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const availableWidth = Math.max(0, window.innerWidth - 16);
      const menuWidth = Math.min(menuRect.width, availableWidth);
      const menuHeight = Math.min(menuRect.height, window.innerHeight - 16);
      const left = Math.max(
        8,
        Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - 8)
      );
      let top = triggerRect.bottom + 6;

      if (top + menuHeight > window.innerHeight - 8) {
        top = triggerRect.top - menuHeight - 6;
      }

      top = Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8));
      setPosition({ left, top });
      window.requestAnimationFrame(() => {
        menu.querySelector<HTMLElement>("[role='menuitem']")?.focus();
      });
    });

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function closeMenu() {
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []
      );
      if (items.length === 0) return;

      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? (direction === 1 ? 0 : items.length - 1)
        : (currentIndex + direction + items.length) % items.length;
      items[nextIndex].focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open, width]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setPosition(null);
          setOpen((current) => !current);
        }}
        className={triggerClassName}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {triggerContent}
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="admin-dropdown-menu fixed"
          style={{
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            width,
            maxWidth: "calc(100vw - 16px)",
            maxHeight: "calc(100dvh - 16px)",
            visibility: position ? "visible" : "hidden",
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}