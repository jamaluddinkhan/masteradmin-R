"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type AdminSelectOption = {
  value: string;
  label: string;
};

type AdminSelectProps = {
  id?: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  className?: string;
  disabled?: boolean;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

export default function AdminSelect({
  id,
  ariaLabel,
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}: AdminSelectProps) {
  const generatedId = useId();
  const controlId = id ?? `admin-select-${generatedId}`;
  const listboxId = `${controlId}-listbox`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportPadding = 8;
      const availableAbove = triggerRect.top - viewportPadding;
      const availableBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
      const preferredHeight = Math.min(menu.scrollHeight, 240);
      const openAbove = availableBelow < preferredHeight && availableAbove > availableBelow;
      const availableHeight = Math.max(80, openAbove ? availableAbove : availableBelow);
      const maxHeight = Math.min(240, availableHeight, window.innerHeight - viewportPadding * 2);
      const height = Math.min(menu.scrollHeight, maxHeight);
      const width = Math.min(triggerRect.width, window.innerWidth - viewportPadding * 2);
      const left = Math.max(
        viewportPadding,
        Math.min(triggerRect.left, window.innerWidth - width - viewportPadding)
      );
      const top = openAbove
        ? Math.max(viewportPadding, triggerRect.top - height - 4)
        : Math.min(triggerRect.bottom + 4, window.innerHeight - height - viewportPadding);

      setPosition({ left, top, width, maxHeight });
      window.requestAnimationFrame(() => {
        menu.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
      });
    });

    function handleOutsidePointer(event: PointerEvent) {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleScroll(event: Event) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, options.length]);

  function closeMenu() {
    setOpen(false);
    setPosition(null);
  }

  function selectOption(option: AdminSelectOption) {
    onChange(option.value);
    closeMenu();
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setPosition(null);
        setOpen(true);
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setPosition(null);
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = options[activeIndex];
        if (option) selectOption(option);
      } else {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setPosition(null);
        setOpen(true);
      }
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
    }
  }

  const menuStyle: CSSProperties = {
    left: position?.left ?? 0,
    top: position?.top ?? 0,
    width: position?.width ?? 280,
    maxHeight: position?.maxHeight ?? "min(240px, calc(100dvh - 16px))",
    visibility: position ? "visible" : "hidden",
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
          setPosition(null);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className={`admin-input admin-select-trigger ${className}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOption?.label ?? "Select an option"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-admin-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="admin-select-menu fixed"
          style={{ ...menuStyle, zIndex: 1100 }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={`${option.value}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`admin-select-option ${isActive ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span className="min-w-0 flex-1 break-words">{option.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}