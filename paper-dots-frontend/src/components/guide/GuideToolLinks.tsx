import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";

interface GuideToolLinksProps {
    toolLinks: NonNullable<GuideContent["toolLinks"]>;
}

export default function GuideToolLinks({ toolLinks }: GuideToolLinksProps) {
    return (
        <section className="border-y border-guide-edge bg-guide-lime-3 py-16">
            <div className={GUIDE_WRAP}>
                <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
                    <div className="guide-display max-w-[210px] text-[19px] font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink">
                        {toolLinks.lead}
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                        {toolLinks.items.map((tool) => (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                className="guide-display group flex items-center justify-between gap-3.5 rounded-guide-sm border border-guide-edge bg-guide-card px-[22px] py-5 text-[17px] font-bold tracking-[-0.02em] text-guide-ink transition-all hover:-translate-y-[3px] hover:border-guide-ink hover:shadow-guide"
                            >
                                {tool.label}
                                <ArrowRight
                                    size={17}
                                    strokeWidth={2}
                                    className="shrink-0 opacity-35 transition-all group-hover:translate-x-[3px] group-hover:opacity-100"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
