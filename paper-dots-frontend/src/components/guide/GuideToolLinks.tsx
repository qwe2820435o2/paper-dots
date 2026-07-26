import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";

interface GuideToolLinksProps {
    toolLinks: NonNullable<GuideContent["toolLinks"]>;
}

export default function GuideToolLinks({ toolLinks }: GuideToolLinksProps) {
    return (
        <section className="bg-guide-lime-3 py-16">
            <div className={GUIDE_WRAP}>
                <div className="mb-6 flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-sm font-semibold uppercase tracking-[0.08em] text-guide-mute">
                        {toolLinks.lead}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {toolLinks.items.map((tool) => (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                className="flex items-center gap-2 rounded-guide-sm border border-guide-edge bg-guide-card px-5 py-3 font-bold text-guide-ink shadow-guide transition-colors hover:border-guide-edge-strong"
                            >
                                {tool.label}
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
