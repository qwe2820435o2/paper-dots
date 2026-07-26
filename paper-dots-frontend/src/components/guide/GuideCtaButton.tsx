import Link from "next/link";
import { cn } from "@/lib/utils";

interface GuideCtaButtonProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

/** The mockup's hard-shadow button — press animation lives in guide.css under
 *  `.guide-btn:active`. */
export default function GuideCtaButton({ href, children, className }: GuideCtaButtonProps) {
    return (
        <Link href={href} className={cn("guide-btn", className)}>
            {children}
        </Link>
    );
}
