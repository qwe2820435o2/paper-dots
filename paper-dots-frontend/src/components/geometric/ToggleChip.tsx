"use client";

interface ToggleChipProps {
    selected: boolean;
    onClick: () => void;
    /** Classes applied only when selected — callers keep their own visual treatment. */
    selectedClassName: string;
    /** Classes applied only when not selected. */
    unselectedClassName: string;
    /** Shared classes applied regardless of selection (sizing, shape, layout). */
    className?: string;
    ariaLabel?: string;
    children: React.ReactNode;
}

/** A single button in a mutually-exclusive set (Grid Style, Export format, ...), with the
 *  aria-pressed/selected-class boilerplate factored out. Callers still own their own selected vs
 *  unselected visual treatment — this only removes the repeated structure, not the styling. */
export default function ToggleChip({
    selected,
    onClick,
    selectedClassName,
    unselectedClassName,
    className = "",
    ariaLabel,
    children,
}: ToggleChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            aria-label={ariaLabel}
            className={`transition-colors ${className} ${selected ? selectedClassName : unselectedClassName}`}
        >
            {children}
        </button>
    );
}
