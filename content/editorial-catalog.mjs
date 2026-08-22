export const catalog = {
  destinations: [
    ["oneida-lake-family-boating.html", "Oneida Lake Family Boat Plan"],
    ["skaneateles-lake-family-boating.html", "Skaneateles Lake Family Boat Plan"],
    ["lake-george-guide.html", "Lake George Weekend Guide"],
    ["thousand-islands-guide.html", "Thousand Islands Cruising Guide"],
    ["finger-lakes-guide.html", "Finger Lakes Boating Guide"],
    ["lake-champlain-guide.html", "Lake Champlain Cruising Guide"],
    ["lake-winnipesaukee-guide.html", "Lake Winnipesaukee Guide"],
    ["newport-rhode-island-guide.html", "Newport by Boat"],
    ["cape-cod-guide.html", "Cape Cod Boating Guide"],
    ["chesapeake-bay-guide.html", "Chesapeake Bay Cruising Guide"],
    ["erie-canal-guide.html", "Erie Canal Boating Guide"],
  ],
  guides: [
    ["boat-throwable-flotation-device-guide.html", "Boat Throwable Flotation Device Guide"],
    ["marine-binoculars-buying-guide.html", "Marine Binoculars Buying Guide"],
    ["best-chartplotters.html", "Best Marine Chartplotters"],
    ["best-boat-coolers.html", "Best Boat Coolers"],
    ["best-life-jackets.html", "Best Life Jackets for Boating"],
  ],
  journal: [
    ["classic-runabouts.html", "Why Classic Runabouts Still Matter"],
    ["chartplotter-needs.html", "How Much Chartplotter Do You Need?"],
    ["dock-box-essentials.html", "What Belongs in a Dock Box"],
    ["end-of-season-checklist.html", "The End-of-Season Checklist"],
    ["great-family-boat.html", "What Makes a Great Family Boat"],
    ["waterfront-escape.html", "How to Plan a Waterfront Escape"],
  ],
};

export function relatedSet(overrides = {}) {
  const rotate = (items, start = 0) => [...items.slice(start), ...items.slice(0, start)].slice(0, 3);
  return {
    destinations: overrides.destinations || rotate(catalog.destinations, overrides.destinationStart || 0),
    guides: overrides.guides || rotate(catalog.guides, overrides.guideStart || 0),
    journal: overrides.journal || rotate(catalog.journal, overrides.journalStart || 0),
  };
}
