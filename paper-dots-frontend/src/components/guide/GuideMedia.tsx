import Image from "next/image";
import type { GuideImage } from "@/content/guides";
import { cn } from "@/lib/utils";
import GuideMediaPlaceholder from "./GuideMediaPlaceholder";

interface GuideMediaProps {
    image: GuideImage | null;
    /** Tailwind aspect-ratio utility, e.g. "aspect-[4/3]". */
    aspect?: string;
    priority?: boolean;
    className?: string;
}

/** `image === null` renders the placeholder instead of an empty box — see
 *  GuideMediaPlaceholder. `fill` is used deliberately so the sheet never has to supply pixel
 *  dimensions; the aspect ratio comes from the wrapping div instead. */
export default function GuideMedia({ image, aspect = "aspect-[4/3]", priority, className }: GuideMediaProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-guide shadow-guide-lg", aspect, className)}>
            {image ? (
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority={priority}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                />
            ) : (
                <GuideMediaPlaceholder />
            )}
        </div>
    );
}
