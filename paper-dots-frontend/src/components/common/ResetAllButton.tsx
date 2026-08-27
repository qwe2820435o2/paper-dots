"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    onReset: () => void;
}

/** "Start over" for the photo-based editors, matching the control `polka-dot` and `geometric`
 *  already offer. Lives in each editor's upload panel rather than next to Export: that is where
 *  someone goes to change the photo anyway, and it keeps a destructive action away from the
 *  download button. */
export default function ResetAllButton({ onReset }: Props) {
    const t = useTranslations("editor.common");

    return (
        <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium py-2 rounded-full border border-[#D2EAAA] text-[#64748b] hover:bg-[#F4FAE8] hover:text-[#1a1a2e] transition-colors"
        >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {t("resetAll")}
        </button>
    );
}
