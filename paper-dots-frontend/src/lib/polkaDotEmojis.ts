const EMOJI_FILENAMES = [
    "blob-smiley-face-with-rolling-eyes",
    "blob-smiley-face-with-thermometer",
    "dizzy-blob-smiley-face",
    "ghost",
    "grinning-blob-smiley-face",
    "kissing-blob-smiley-face-with-closed-eyes",
    "laughing-blob-smiley-face",
    "nerd-blob-smiley-face",
    "persevering-blob-smiley-face",
    "sleeping-blob-smiley-face",
    "smiling-face-with-horns",
    "smirking-blob-smiley-face",
    "unamused-blob-smiley-face",
    "winking-blob-smiley-face",
    "yawning-blob-smiley-face",
];

function toLabel(filename: string): string {
    return filename
        .split("-")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

export interface EmojiOption {
    id: string;
    label: string;
    /** Static file path (square, e.g. 128x128), served from /public/emoji. */
    src: string;
}

/** Ready-to-try emoji stamps living in /public/emoji, all square PNGs. */
export const EMOJI_OPTIONS: EmojiOption[] = EMOJI_FILENAMES.map((filename) => ({
    id: filename,
    label: toLabel(filename),
    src: `/emoji/${filename}.png`,
}));

const dataUrlCache = new Map<string, Promise<string>>();

/** Fetches a same-origin image URL and converts it to a data URL, memoized per URL. */
export function toDataUrl(url: string): Promise<string> {
    let cached = dataUrlCache.get(url);
    if (!cached) {
        cached = fetch(url)
            .then((res) => res.blob())
            .then(
                (blob) =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(blob);
                    }),
            );
        dataUrlCache.set(url, cached);
    }
    return cached;
}
