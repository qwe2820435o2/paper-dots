import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";

interface Review {
    id: string;
    quote: string;
    name: string;
    initial: string;
}

const REVIEWS: Review[] = [
    {
        id: "mira",
        quote: "I have zero design skills and I make all my Instagram posts here now. The color matching is what sold me. I never have to guess which shade goes with what.",
        name: "Mira K.",
        initial: "M",
    },
    {
        id: "dan",
        quote: "Used the overlay editor for a winter campaign mockup. Faster than building the same thing in Illustrator, and it honestly looked better.",
        name: "Dan R.",
        initial: "D",
    },
    {
        id: "kenji",
        quote: "I needed a polka dot background for a slide deck and did not want to make an account anywhere. Took about two minutes start to finish.",
        name: "Kenji S.",
        initial: "K",
    },
    {
        id: "priya",
        quote: "The no watermark thing is why I stayed. Every other free editor puts a logo on your work and then asks you to pay to take it off.",
        name: "Priya N.",
        initial: "P",
    },
];

export default function HomeReviews() {
    return (
        <section className="border-y border-guide-edge bg-guide-lime-3 py-24">
            <div className={GUIDE_WRAP}>
                <h2 className="text-center" style={HOME_H2_STYLE}>What people talk about us</h2>

                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="rounded-guide border-[1.5px] border-guide-edge bg-white px-[30px] py-7">
                            <div className="guide-display h-6 text-[44px] font-extrabold leading-[0.6] text-guide-lime">&ldquo;</div>
                            <blockquote className="text-[16.5px] leading-[1.55] text-guide-ink-2">{review.quote}</blockquote>
                            <cite className="mt-5 flex items-center gap-2.5 not-italic">
                                <span className="guide-display grid h-[34px] w-[34px] place-items-center rounded-full border-[1.5px] border-guide-edge-strong bg-guide-lime text-sm font-extrabold text-guide-ink">
                                    {review.initial}
                                </span>
                                <span className="guide-display text-[15px] font-bold text-guide-ink">{review.name}</span>
                            </cite>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
