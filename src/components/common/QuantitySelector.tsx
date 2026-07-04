"use client";

import {MinusIcon, PlusIcon} from "@heroicons/react/24/outline";
import {useRef, useState} from "react";
import clsx from "clsx";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
                                   value,
                                   onChange,
                                   min = 1,
                                   max = 99999,
                                   size = "md",
                                   className = "",
                                 }: QuantitySelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const inputValue = inputRef.current?.value ? Number(inputRef.current.value) : min;
    const validatedValue = Math.max(min, Math.min(max, inputValue || min));
    if (validatedValue !== value) {
      onChange(validatedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const isMinReached = value <= min;

  const sizeClasses = {
    sm: {
      wrapper: "h-7",
      button: "h-7 w-7",
      input: "w-16 text-xs",
      text: "w-16 text-xs",
    },
    md: {
      wrapper: "h-9",
      button: "h-9 w-9",
      input: "w-20 text-sm",
      text: "w-20 text-sm",
    },
  };

  return (
      <div
          className={clsx(
              "flex flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700",
              sizeClasses[size].wrapper,
              className
          )}
      >
        <button
            type="button"
            aria-label="Decrease quantity"
            className={clsx(
                "flex cursor-pointer flex-none items-center justify-center rounded-full transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
                sizeClasses[size].button,
                {"opacity-50 cursor-not-allowed": isMinReached}
            )}
            onClick={handleDecrement}
            disabled={isMinReached}
        >
          <MinusIcon className="h-4 w-4 dark:text-neutral-100"/>
        </button>

        {isEditing ? (
            <input
                ref={inputRef}
                type="number"
                className={clsx(
                    "bg-transparent text-center font-medium text-gray-800 dark:text-white focus:outline-none",
                    sizeClasses[size].input
                )}
                value={value}
                onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                min={min}
                max={max}
                autoFocus
            />
        ) : (
            <div
                className={clsx(
                    "text-center font-medium text-gray-800 dark:text-white cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full",
                    sizeClasses[size].text
                )}
                onClick={handleFocus}
            >
              {value}
            </div>
        )}

        <button
            type="button"
            aria-label="Increase quantity"
            className={clsx(
                "flex cursor-pointer flex-none items-center justify-center rounded-full transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
                sizeClasses[size].button
            )}
            onClick={handleIncrement}
        >
          <PlusIcon className="h-4 w-4 dark:text-neutral-100"/>
        </button>
      </div>
  );
}