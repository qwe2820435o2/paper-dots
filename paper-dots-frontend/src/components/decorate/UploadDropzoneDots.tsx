/** The scattered pastel dots inside an empty dropzone. Shared so the site's upload areas keep
 *  one look — they used to be inline markup in `PhotoUploader`, which is how the "Before &
 *  After" dropzones ended up several revisions behind it. Purely decorative: `aria-hidden` and
 *  non-interactive, positioned relative to whichever dropzone it sits in. */
export default function UploadDropzoneDots() {
    return (
        <>
            <span
                aria-hidden
                className="pointer-events-none absolute top-[14%] left-[12%] w-2.5 h-2.5 rounded-full bg-[#C5E89A] opacity-60"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute top-[20%] right-[16%] w-1.5 h-1.5 rounded-full bg-[#F7F6D3]"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute bottom-[22%] left-[18%] w-2 h-2 rounded-full border-[1.5px] border-[#D2EAAA]"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute bottom-[16%] right-[14%] w-3 h-3 rounded-full bg-[#E8F5D2]"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute top-[45%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#FDE7EE]"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute top-[60%] right-[8%] w-2 h-2 rounded-full bg-[#F7F6D3] opacity-80"
            />
        </>
    );
}
