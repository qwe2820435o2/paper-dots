// Verifies writeIfChanged's core guarantee: identical content is a no-op (mtime untouched,
// reported "unchanged"), different content is written and reported "written", and dryRun
// never touches disk even when content differs.
//
// Run with: node scripts/test/emit.smoke.mjs

import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeIfChanged } from "../lib/emit.mjs";

const failures = [];
function check(label, condition) {
    if (!condition) failures.push(label);
}

async function main() {
    const dir = await mkdtemp(join(tmpdir(), "guide-emit-test-"));
    const filePath = join(dir, "content.ts");

    try {
        const r1 = await writeIfChanged(filePath, "const a = 1;\n");
        check("first write -> written", r1 === "written");
        check("first write -> file exists with expected content", (await readFile(filePath, "utf8")) === "const a = 1;\n");

        const mtimeBefore = (await stat(filePath)).mtimeMs;

        const r2 = await writeIfChanged(filePath, "const a = 1;\n");
        check("identical content -> unchanged", r2 === "unchanged");
        const mtimeAfter = (await stat(filePath)).mtimeMs;
        check("identical content -> mtime untouched", mtimeBefore === mtimeAfter);

        const r3 = await writeIfChanged(filePath, "const a = 2;\n");
        check("different content -> written", r3 === "written");
        check("different content -> file updated", (await readFile(filePath, "utf8")) === "const a = 2;\n");

        const r4 = await writeIfChanged(filePath, "const a = 3;\n", { dryRun: true });
        check("dryRun with different content -> reports written", r4 === "written");
        check("dryRun -> file NOT actually updated", (await readFile(filePath, "utf8")) === "const a = 2;\n");

        // CRLF in existing file must not be reported as drift against LF-normalized new content.
        const crlfPath = join(dir, "crlf.ts");
        await writeIfChanged(crlfPath, "line1\nline2\n");
        const crlfContent = (await readFile(crlfPath, "utf8")).replace(/\n/g, "\r\n");
        await import("node:fs/promises").then((fs) => fs.writeFile(crlfPath, crlfContent, "utf8"));
        const r5 = await writeIfChanged(crlfPath, "line1\nline2\n");
        check("CRLF-on-disk vs LF-in-memory -> treated as unchanged", r5 === "unchanged");
    } finally {
        await rm(dir, { recursive: true, force: true });
    }

    if (failures.length > 0) {
        console.error(`FAIL (${failures.length} checks failed):`);
        for (const f of failures) console.error("  - " + f);
        process.exit(1);
    }
    console.log("PASS: writeIfChanged behaves deterministically.");
}

main().catch((err) => {
    console.error(err.stack ?? String(err));
    process.exit(1);
});
