// Hand-authored (no Google Sheet tab yet). Follows the same shape as the sync script's output —
// see docs/add-new-guide-tool.md. Replace with a synced file once the Sheet tab exists.
import type { GuideContentByLocale } from "../types";

const content: GuideContentByLocale = {
  "en": {
    "name": "Before & After Photo Maker",
    "meta": {
      "title": "Free Before & After Photo Maker | Compare Two Photos Online",
      "description": "Upload a before and after photo, drag the slider to reveal the change, and export a clean comparison image. Free, no watermark, no sign up.",
      "ogTitle": "",
      "ogDescription": ""
    },
    "hero": {
      "headline": "Before & After Photo Maker",
      "subheadline": "Upload two photos and drag the slider to reveal the change between them. Built for transformations, renovations, and progress shots.",
      "image": null,
      "cta": {
        "text": "Compare Two Photos",
        "href": null
      },
      "formats": []
    },
    "toolLinks": {
      "lead": "",
      "items": [
        {
          "id": "1",
          "label": "Photo Quote Maker",
          "href": "/photo-quote-maker"
        },
        {
          "id": "2",
          "label": "Photo Overlay Editor",
          "href": "/photo-overlay-editor"
        },
        {
          "id": "3",
          "label": "Polka Dot Generator",
          "href": "/polka-dot"
        }
      ]
    },
    "features": [
      {
        "id": "1",
        "heading": "Drag Slider Comparison",
        "body": "A static side-by-side leaves the viewer doing the comparing themselves. Drag the divider across the frame and the after photo reveals itself over the before, so the change is obvious in a single motion instead of two separate images to cross-check.",
        "image": null,
        "cta": null
      },
      {
        "id": "2",
        "heading": "Works With Any Two Photos",
        "body": "Fitness progress, home renovations, skincare routines, cleaning jobs, hair color, tattoo touch-ups — any pair of photos taken at different times works. Upload the earlier shot as before and the later one as after, no special framing required.",
        "image": null,
        "cta": null
      },
      {
        "id": "3",
        "heading": "Runs Entirely in Your Browser",
        "body": "Both photos stay on your device. There is no upload to a server, no processing queue, and nothing kept afterward, which matters most for anything involving a client, a patient, or your own face.",
        "image": null,
        "cta": null
      },
      {
        "id": "4",
        "heading": "Free PNG Export, No Watermark",
        "body": "Drag the slider to the position that tells the story best, then export a clean PNG at full resolution. No account, no watermark, no limit on how many times you export.",
        "image": null,
        "cta": null
      }
    ],
    "howTo": {
      "heading": "How to Make a Before & After Photo",
      "steps": [
        {
          "id": "1",
          "heading": "Upload the Before Photo",
          "body": "Choose the earlier photo — the starting point you want to compare against."
        },
        {
          "id": "2",
          "heading": "Upload the After Photo",
          "body": "Add the later photo. The editor lines both photos up in the same frame automatically."
        },
        {
          "id": "3",
          "heading": "Drag the Slider and Download",
          "body": "Drag the divider to the position that best shows the change, then export a PNG with no watermark and no login."
        }
      ]
    },
    "why": {
      "heading": "Why Use This Before & After Photo Maker?",
      "cards": [
        {
          "id": "1",
          "heading": "One Drag, Not Two Photos to Compare",
          "body": "The slider does the comparison for the viewer instead of leaving them to flick between two separate images."
        },
        {
          "id": "2",
          "heading": "No Account, No Watermark",
          "body": "Upload, drag, export. Nothing added to your image and nothing required to start."
        },
        {
          "id": "3",
          "heading": "Private by Default",
          "body": "Photos are processed on your device only — nothing is uploaded to a server."
        }
      ]
    },
    "faq": {
      "heading": "FAQs",
      "items": [
        {
          "id": "1",
          "question": "Is this before and after photo maker free?",
          "answer": "Yes. Uploading, comparing, and exporting a PNG are all free, with no watermark and no account required."
        },
        {
          "id": "2",
          "question": "Are my photos safe and private?",
          "answer": "Yes. Both photos are processed entirely in your browser and are never uploaded to a server."
        },
        {
          "id": "3",
          "question": "Can I control where the slider sits in the exported image?",
          "answer": "Yes. Drag the divider to whichever position best shows the change, then export — the download captures that exact position."
        }
      ]
    },
    "finalCta": {
      "heading": "Make Your Before & After",
      "body": "Upload two photos, drag the slider until the change is clear, and download a clean comparison image.",
      "cta": {
        "text": "Start Comparing",
        "href": null
      }
    }
  }
};

export default content;
