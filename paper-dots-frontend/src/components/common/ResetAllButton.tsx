"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    onReset: () => void;
}

/** ms the button stays armed after a first click before reverting on its own — long enough to
 *  read the confirm label, short enough that it doesn't stay a trap for a later, unrelated click
 *  in roughly the same spot. */
const CONFIRM_TIMEOUT = 3000;

/** "Start over" for the photo-based editors, matching the control `polka-dot` and `geometric`
 *  already offer. Lives in each editor's upload panel rather than next to Export: that is where
 *  someone goes to change the photo anyway, and it keeps a destructive action away from the
 *  download button.
 *
 *  There's no undo anywhere in these editors, so a stray click here throws away everything —
 *  every photo and every setting — at once. Requires a second click within `CONFIRM_TIMEOUT` to
 *  actually reset, rather than a native `confirm()`, so it stays inline with the rest of the
 *  panel's styling instead of a jarring browser dialog. */
export default function ResetAllButton({ onReset }: Props) {
    const t = useTranslations("editor.common");
    const [armed, setArmed] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    function handleClick() {
        if (armed) {
            if (timerRef.current) clearTimeout(timerRef.current);
            setArmed(false);
            onReset();
            return;
        }
        setArmed(true);
        timerRef.current = setTimeout(() => setArmed(false), CONFIRM_TIMEOUT);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`w-full flex items-center justify-center gap-1.5 text-[13px] font-medium py-2 rounded-full border transition-colors ${
                armed
                    ? "border-[#EF4444] text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2]"
                    : "border-[#D2EAAA] text-[#64748b] hover:bg-[#F4FAE8] hover:text-[#1a1a2e]"
            }`}
        >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {armed ? t("confirmResetAll") : t("resetAll")}
        </button>
    );
}
