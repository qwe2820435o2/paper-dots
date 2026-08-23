import { ChevronDown, Upload } from "lucide-react";
import { getTranslations } from "next-intl/server";
import UploadPhotoButton from "@/components/common/UploadPhotoButton";
import HomeHeroCanvas from "./HomeHeroCanvas";

export default async function HomeHero() {
    const t = await getTranslations("home.hero");

    return (
        <section className="relative flex min-h-[min(72vh,720px)] items-center justify-center overflow-hidden px-0 pb-10 pt-14 text-center">
            <div aria-hidden className="absolute inset-0 z-0">
                <HomeHeroCanvas />
            </div>

            <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center px-10">
                <h1
                    className="animate-[hero-rise_0.8s_cubic-bezier(0.2,0.7,0.2,1)_both] text-balance"
                    style={{ fontSize: "clamp(42px, 5vw, 72px)" }}
                >
                    {t.rich("headline", {
                        swash: (chunks) => <span className="swash">{chunks}</span>,
                    })}
                </h1>
                <p
                    className="animate-[hero-rise_0.8s_cubic-bezier(0.2,0.7,0.2,1)_0.08s_both] mt-[22px] max-w-[52ch] text-[clamp(17px,1.5vw,21px)] text-guide-ink-2"
                >
                    {t("subheadline")}
                </p>

                <div className="animate-[hero-rise_0.8s_cubic-bezier(0.2,0.7,0.2,1)_0.16s_both] mt-8 flex flex-col items-center gap-4">
                    <UploadPhotoButton className="guide-btn" trackId="home-hero" target="dot">
                        <Upload size={19} strokeWidth={2.2} />
                        {t("cta")}
                    </UploadPhotoButton>
                    <span className="guide-mono flex items-center gap-2 text-[12.5px] text-guide-mute">
                        <span className="h-2 w-2 rounded-full bg-guide-edge-strong" />
                        {t("badge")}
                    </span>
                </div>

                <a
                    href="#tools"
                    aria-label={t("scrollLabel")}
                    className="animate-[hero-rise_0.8s_ease_0.3s_both,hero-bob_2.4s_ease-in-out_1s_infinite] mt-[38px] grid h-[46px] w-[46px] place-items-center rounded-full border-[1.5px] border-guide-edge-strong bg-guide-paper/70 text-guide-ink-2 backdrop-blur transition-colors hover:border-guide-ink hover:text-guide-ink"
                >
                    <ChevronDown size={20} strokeWidth={2} />
                </a>
            </div>
        </section>
    );
}
