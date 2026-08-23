// Field-name -> messages/*.json dot-path map for the site-wide sheet tabs (Home, Contact).
//
// Unlike the guide-page sheet (see sheet-schema.mjs), this sheet's "Item ID" column is
// already a unique, human-authored key per row (e.g. "why_01_title", "tool_02_cta") rather
// than a bare index — so the mapping here is a flat lookup, no collection/dense-array
// bookkeeping needed. "Field Name" is descriptive prose for spreadsheet readers only and is
// never used for mapping.

export const SITE_TABS = {
    Home: {
        "meta_title": "home.meta.title",
        "meta_description": "home.meta.description",
        "og_title": "home.meta.ogTitle",
        "og_description": "home.meta.ogDescription",
        "og_image_alt": "home.meta.ogImageAlt",

        "hero_h1": "home.hero.headline",
        "hero_subtitle": "home.hero.subheadline",
        "hero_upload_button": "home.hero.cta",
        "hero_trust_badge": "home.hero.badge",

        "tools_h2": "home.toolGrid.heading",
        "tools_intro": "home.toolGrid.lead",
        "tool_01_name": "tools.momentCard.label",
        "tool_01_tagline": "home.toolGrid.cards.momentCard",
        "tool_01_cta": "home.toolGrid.tryItNow",
        "tool_02_name": "tools.dot.label",
        "tool_02_tagline": "home.toolGrid.cards.dot",
        "tool_02_cta": "home.toolGrid.tryItNow",
        "tool_03_name": "tools.polkaDot.label",
        "tool_03_tagline": "home.toolGrid.cards.polkaDot",
        "tool_03_cta": "home.toolGrid.tryItNow",
        "tool_04_name": "tools.geometricPatterns.label",
        "tool_04_tagline": "home.toolGrid.cards.geometricPatterns",
        "tool_04_cta": "home.toolGrid.tryItNow",

        "engine_h2": "home.colorEngine.heading",
        "engine_body": "home.colorEngine.body",
        "engine_cta": "home.colorEngine.cta",

        "why_h2": "home.why.heading",
        "why_01_title": "home.why.cards.free.heading",
        "why_01_desc": "home.why.cards.free.body",
        "why_02_title": "home.why.cards.noWatermark.heading",
        "why_02_desc": "home.why.cards.noWatermark.body",
        "why_03_title": "home.why.cards.unlimited.heading",
        "why_03_desc": "home.why.cards.unlimited.body",
        "why_04_title": "home.why.cards.noAccount.heading",
        "why_04_desc": "home.why.cards.noAccount.body",

        "reviews_h2": "home.reviews.heading",
        "review_01_quote": "home.reviews.items.mira.quote",
        "review_01_author": "home.reviews.items.mira.name",
        "review_02_quote": "home.reviews.items.dan.quote",
        "review_02_author": "home.reviews.items.dan.name",
        "review_03_quote": "home.reviews.items.kenji.quote",
        "review_03_author": "home.reviews.items.kenji.name",
        "review_04_quote": "home.reviews.items.priya.quote",
        "review_04_author": "home.reviews.items.priya.name",

        "faq_h2": "home.faq.heading",
        "faq_01_q": "home.faq.items.free.question",
        "faq_01_a": "home.faq.items.free.answer",
        "faq_02_q": "home.faq.items.watermark.question",
        "faq_02_a": "home.faq.items.watermark.answer",
        "faq_03_q": "home.faq.items.account.question",
        "faq_03_a": "home.faq.items.account.answer",
        "faq_04_q": "home.faq.items.experience.question",
        "faq_04_a": "home.faq.items.experience.answer",
        "faq_05_q": "home.faq.items.audience.question",
        "faq_05_a": "home.faq.items.audience.answer",
        "faq_06_q": "home.faq.items.whatToMake.question",
        "faq_06_a": "home.faq.items.whatToMake.answer",
        "faq_07_q": "home.faq.items.sizes.question",
        "faq_07_a": "home.faq.items.sizes.answer",
        "faq_08_q": "home.faq.items.commercial.question",
        "faq_08_a": "home.faq.items.commercial.answer",

        "cta_h2": "home.finalCta.heading",
        "cta_desc": "home.finalCta.body",
        "cta_button": "home.finalCta.cta",
    },

    Contact: {
        "meta_title": "contact.meta.title",
        "meta_description": "contact.meta.description",

        "hero_h1": "contact.hero.headline",
        "hero_subtitle": "contact.hero.subheadline",

        "about_h2": "contact.about.heading",
        "about_p1": "contact.about.paragraph1",
        "about_p2": "contact.about.paragraph2",
        "about_p3": "contact.about.paragraph3",

        "contact_h2": "contact.getInTouch.heading",
        "contact_intro": "contact.getInTouch.intro",
        "contact_email_label": "contact.getInTouch.emailLabel",
        "contact_email": "contact.getInTouch.email",
        "contact_note": "contact.getInTouch.note",

        "cta_button": "contact.cta.button",
    },
};

export function setPath(obj, dotPath, value) {
    const parts = dotPath.split(".");
    let node = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (typeof node[part] !== "object" || node[part] === null) node[part] = {};
        node = node[part];
    }
    node[parts[parts.length - 1]] = value;
}
