import type { GuideContent } from "@/content/guides";
import RichText from "./RichText";

interface GuideFaqProps {
    faq: NonNullable<GuideContent["faq"]>;
}

/** Native <details>/<summary> rather than the Radix accordion in src/components/ui: Radix
 *  unmounts closed panel content unless forceMount is set, which would leave seven of eight
 *  answers absent from the server-rendered HTML while this page's FAQPage JSON-LD (added in
 *  a follow-up SEO module) claims they exist. <details> keeps every answer in the markup,
 *  keeps this whole section a server component, and gets keyboard/screen-reader behaviour
 *  for free. The question is deliberately a <summary>, not a heading — matching the mockup,
 *  which never marks FAQ questions up as h3. */
export default function GuideFaq({ faq }: GuideFaqProps) {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-[900px] px-6 lg:px-10">
                <h2 className="text-center">{faq.heading}</h2>
                <div className="mt-10 divide-y divide-guide-edge">
                    {faq.items.map((item, i) => (
                        <details key={item.id} open={i === 0} className="py-6">
                            <summary className="text-lg font-bold text-guide-ink">{item.question}</summary>
                            <RichText as="p" html={item.answer} className="mt-3 text-guide-ink-2" />
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
