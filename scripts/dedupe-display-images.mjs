import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");

const replacements = {
  "best-boat-coolers.html": {
    "assets/boat-cooler.svg": [
      ["assets/family-boat.svg", "Illustrated family-boating context for choosing cooler size and placement"],
      ["assets/dock-box.svg", "Illustrated dock and storage context for organizing cooler and deck gear"],
      ["assets/waterfront-escape.svg", "Illustrated waterfront day-trip context for portable cooler use"],
      ["assets/editorial/journal-family-pontoon.jpg", "Family boating day-trip context for cooler capacity and deck space"],
    ],
  },
  "best-chartplotters.html": {
    "assets/editorial/gear-navigation.jpg": [
      ["assets/chartplotter.svg", "Illustrated marine chartplotter mounted at a recreational boat helm"],
      ["assets/waterfront-escape.svg", "Illustrated cruising context for route planning and navigation electronics"],
      ["assets/editorial/thousand-islands-river.jpg", "Island cruising waterway used as a real-world navigation-planning example"],
    ],
  },
  "best-life-jackets.html": {
    "assets/editorial/gear-life-jacket.jpg": [
      ["assets/editorial/gear-child-pfd.jpg", "Child wearing a properly fitted personal flotation device"],
      ["assets/editorial/gear-inflatable-pfd.jpg", "Inflatable personal flotation device used for adult boating"],
    ],
  },
  "cape-cod-guide.html": {
    "assets/editorial/cape-cod-provincetown.jpg": [["assets/waterfront-escape.svg", "Illustrated coastal harbor planning scene for a Cape Cod boating trip"]],
    "assets/editorial/cape-cod-canal.jpg": [["assets/family-boat.svg", "Illustrated recreational-boat trip-planning scene for protected and exposed Cape Cod waters"]],
  },
  "chartplotter-needs.html": {
    "assets/editorial/gear-navigation.jpg": [
      ["assets/chartplotter.svg", "Illustrated chartplotter layout for evaluating helm visibility and controls"],
      ["assets/waterfront-escape.svg", "Illustrated cruising context for deciding whether navigation electronics need an upgrade"],
    ],
  },
  "chesapeake-bay-guide.html": {
    "assets/editorial/chesapeake-sailing.jpg": [["assets/waterfront-escape.svg", "Illustrated Chesapeake cruising context for planning anchorages and harbor stops"]],
  },
  "classic-runabouts.html": {
    "assets/editorial/journal-boat-show.jpg": [["assets/classic-runabout.svg", "Illustrated classic wooden runabout profile"]],
  },
  "dock-box-essentials.html": {
    "assets/editorial/journal-dock-lines.jpg": [
      ["assets/dock-box.svg", "Illustrated dock-box organization for commonly used boat gear"],
      ["assets/editorial/journal-fenders.jpg", "Boat fenders staged for docking and dock-box storage"],
    ],
  },
  "end-of-season-checklist.html": {
    "assets/editorial/journal-winter-storage.jpg": [["assets/winterization.svg", "Illustrated winterization and off-season boat-storage checklist"]],
  },
  "erie-canal-guide.html": {
    "assets/editorial/erie-canal-lock.jpg": [["assets/family-boat.svg", "Illustrated recreational boat prepared for a canal-cruising day"]],
  },
  "finger-lakes-guide.html": {
    "assets/editorial/finger-lakes-seneca.jpg": [["assets/waterfront-escape.svg", "Illustrated Finger Lakes waterfront cruising and weekend-planning scene"]],
    "assets/editorial/finger-lakes-watkins.jpg": [["assets/family-boat.svg", "Illustrated family-boat outing used as a Finger Lakes itinerary-planning visual"]],
  },
  "great-family-boat.html": {
    "assets/family-boat.svg": [["assets/editorial/journal-family-pontoon.jpg", "Family aboard a pontoon-style recreational boat"]],
  },
  "guide.html": {
    "assets/editorial/journal-dock-lines.jpg": [["assets/editorial/journal-fenders.jpg", "Boat fenders and docking gear ready for use"]],
  },
  "index.html": {
    "assets/boldt-castle-heart-island.jpg": [["assets/editorial/thousand-islands-boldt.jpg", "A different view of Boldt Castle and the Thousand Islands cruising area"]],
  },
  "lake-champlain-guide.html": {
    "assets/editorial/champlain-burlington.jpg": [
      ["assets/waterfront-escape.svg", "Illustrated big-lake cruising scene for Lake Champlain route planning"],
      ["assets/family-boat.svg", "Illustrated recreational-boat outing for Lake Champlain trip planning"],
      ["assets/editorial/winnipesaukee-cruise.jpg", "Illustrative Northeast lake-cruising context for weather and route planning"],
    ],
  },
  "lake-george-guide.html": {
    "assets/editorial/lake-george-cruise.jpg": [
      ["assets/waterfront-escape.svg", "Illustrated Adirondack lake-weekend planning scene"],
      ["assets/family-boat.svg", "Illustrated family-boating context for a Lake George weekend itinerary"],
    ],
  },
  "lake-winnipesaukee-guide.html": {
    "assets/editorial/winnipesaukee-islands.jpg": [["assets/waterfront-escape.svg", "Illustrated New England lake-cruising and island-hopping scene"]],
  },
  "newport-rhode-island-guide.html": {
    "assets/editorial/newport-harbor.jpg": [["assets/waterfront-escape.svg", "Illustrated coastal harbor weekend-planning scene for Newport"]],
  },
  "thousand-islands-guide.html": {
    "assets/editorial/thousand-islands-river.jpg": [["assets/family-boat.svg", "Illustrated family cruising scene for a Thousand Islands itinerary"]],
  },
};

function replaceImgTag(html, oldSrc, newSrc, newAlt) {
  const escaped = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<img\\b([^>]*?)\\bsrc=(["'])${escaped}\\2([^>]*)>`, "i");
  const match = html.match(pattern);
  if (!match) return { html, changed: false };

  let attributes = `${match[1]}src=${match[2]}${newSrc}${match[2]}${match[3]}`;
  if (/\balt=(["'])[^"']*\1/i.test(attributes)) {
    attributes = attributes.replace(/\balt=(["'])[^"']*\1/i, `alt="${newAlt.replaceAll('"', '&quot;')}"`);
  } else {
    attributes += ` alt="${newAlt.replaceAll('"', '&quot;')}"`;
  }
  return { html: html.replace(pattern, `<img${attributes}>`), changed: true };
}

let changedPages = 0;
let swaps = 0;
for (const [file, byImage] of Object.entries(replacements)) {
  const path = resolve(root, file);
  if (!existsSync(path)) throw new Error(`Duplicate-image target missing: ${file}`);
  let html = readFileSync(path, "utf8");
  let pageChanged = false;

  for (const [oldSrc, targets] of Object.entries(byImage)) {
    for (const [newSrc, alt] of targets) {
      const newPath = resolve(root, newSrc);
      if (!existsSync(newPath)) throw new Error(`${file}: replacement asset missing: ${newSrc}`);
      const result = replaceImgTag(html, oldSrc, newSrc, alt);
      if (!result.changed) break;
      html = result.html;
      pageChanged = true;
      swaps += 1;
    }
  }

  if (pageChanged) {
    writeFileSync(path, html);
    changedPages += 1;
  }
}

console.log(`Display-image dedupe pass complete: ${swaps} repeated inline images replaced across ${changedPages} pages.`);
