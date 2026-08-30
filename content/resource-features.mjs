import { relatedSet } from "./editorial-catalog.mjs";

export const resourceFeatures = [
  {
    slug: "weather.html",
    type: "journal",
    schemaType: "HowTo",
    seoTitle: "Marine Weather Planning for Recreational Boaters | Nautical Dream",
    title: "How to Read Marine Weather Before You Leave the Dock",
    description: "A practical marine weather planning guide for recreational boaters, covering wind, waves, thunderstorms, visibility, water temperature and go-or-no-go decisions.",
    ogDescription: "Turn forecasts, radar and what you see at the launch into a conservative boating decision.",
    eyebrow: "Seamanship and safety",
    dek: "A forecast is not a verdict. Good captains combine official information, local geography and what the water is doing in front of them.",
    readTime: "15 minute read",
    hero: {
      key: "chesapeake-sailing",
      alt: "Sailboats underway beneath a changing sky on Chesapeake Bay",
    },
    lede: "The most dangerous weather briefing is the one reduced to a sun icon and a single wind number. A summer forecast can look pleasant at breakfast and still carry an afternoon thunderstorm window, a sharp wind shift or cold water that changes the consequence of a routine mistake. Marine weather planning is not about predicting every gust. It is about recognizing the conditions that can outrun the boat, the crew or the nearest safe harbor—and leaving enough margin to act before they do.",
    facts: [
      ["Primary sources", "National Weather Service, NOAA charts and local notices"],
      ["Recheck", "The night before, morning of departure and at the launch"],
      ["Captain’s rule", "Use the most conservative credible signal"],
    ],
    sections: [
      {
        heading: "Start with the boat and crew, not the forecast",
        body: `<p>A ten-knot breeze does not mean the same thing to a twenty-two-foot bowrider, a high-sided pontoon and a thirty-five-foot cruiser. Direction matters too. Ten knots blowing down the long axis of a lake can build a short, steep chop, while the same wind close under a lee shore may leave the water deceptively flat until the boat turns for home. Write down the limits that matter for your boat before studying the forecast: comfortable wind, safe wave height, minimum visibility and maximum distance from shelter.</p><p>The crew can lower those limits. Children, an inexperienced second operator, an older passenger with limited mobility or anyone prone to seasickness deserves more margin. So does a first trip of the season, a recently repaired engine or an unfamiliar route. A go-or-no-go decision is not a test of courage. It is a comparison between expected conditions and the weakest part of the day’s plan.</p>`,
        callout: { title: "A useful predeparture question", body: `<p>If the engine stopped at the farthest point on today’s route, would the forecast still leave time and sea room to solve the problem?</p>` },
      },
      {
        heading: "Read the complete official forecast",
        body: `<p>Begin with the forecast written for the water you will actually use. Coastal boaters should read the appropriate marine zone forecast and any Small Craft Advisory, gale warning, dense fog advisory or special marine warning. Inland boaters should combine the local point forecast with lake-specific products where available. The National Weather Service’s Lake Champlain forecast, for example, adds wave and wind detail that a city forecast cannot provide.</p><p>Read the discussion and timing, not only the headline. “Southwest wind 5 to 10 knots, becoming northwest 15 knots with gusts to 25 in the afternoon” describes two different trips. The outbound leg may feel benign; the return could be wet, slow and directly into a building chop. Note when the shift is expected and plan to be tied up before it, not crossing open water as it arrives.</p>`,
        image: { key: "champlain-burlington", alt: "Lake Champlain viewed from Burlington with broad open water and distant mountains", caption: "Long fetch and mountain-driven wind effects make a lake-specific forecast more valuable than a generic city forecast." },
      },
      {
        heading: "Wind direction often matters more than the number",
        body: `<p>Forecast wind speed is only the beginning. Trace the direction across the chart. The uninterrupted distance over which wind blows—the fetch—helps determine how much sea can build. A harbor protected from a southwest breeze may be exposed when the wind swings northeast. A route that is comfortable in the morning can become an upwind slog home even when the numerical forecast changes only modestly.</p><p>Look for funnels. Bluffs, valleys, bridge openings and island gaps can accelerate wind locally. The lee side of an island may provide useful shelter, but the transition around its point can be rougher than the open-water average. When local captains say a particular reach “stands up” in a north wind, that knowledge deserves a place beside the app. Record those observations after each trip; a personal log becomes a remarkably good forecast translator.</p>`,
      },
      {
        heading: "Understand waves as a boat-handling problem",
        body: `<p>Wave height alone does not describe comfort. Closely spaced two-foot waves can be far more punishing to a small planing boat than a gentle ocean swell of greater height. Direction relative to course also changes the ride: head seas pound, following seas can push the stern, and beam seas increase roll. Shallow water, opposing current and wind against tide can make waves steeper.</p><p>Published values are forecasts over an area, not a promise at your bow. Significant wave height is a statistical measure; individual waves can be larger. Slow down before conditions force the issue, secure loose equipment and keep people low and supported. If maintaining control requires repeated hard impacts or passengers can no longer move safely, the plan has already exceeded its sensible comfort limit.</p>`,
        pullQuote: "The time to shorten a route is when the crew is still comfortable and every safe harbor remains an option.",
      },
      {
        heading: "Thunderstorms demand an exit plan",
        body: `<p>Summer thunderstorms combine several hazards: lightning, abrupt gust fronts, torrential rain, reduced visibility and rapidly changing waves. Radar is useful, but it does not make a small boat stormproof. Cells can grow between scans, and the fastest route to the dock may cross the worst part of a line. Read the convective outlook and hourly timing before departure, then keep a continuous eye on the sky and alerts.</p><p>Identify shelter before casting off. “We can run back if it gets bad” is not a plan unless the distance, boat speed, no-wake zones and docking time have been counted. A marina fuel dock may close, a public ramp may become crowded and an exposed anchorage may be worse than staying underway. If thunder is audible, lightning is already close enough to end the outing. Get ashore or into substantial shelter according to local safety guidance; do not wait under a bimini and debate the next radar frame.</p>`,
        image: { key: "newport-narragansett", alt: "Narragansett Bay water and shoreline beneath a broad coastal sky", caption: "On open bays, weather can erase a comfortable margin faster than distance on the chart suggests." },
      },
      {
        heading: "Fog and visibility change navigation workload",
        body: `<p>Reduced visibility is not simply a reason to drive more slowly. It increases collision risk, makes unlit hazards harder to identify and can overwhelm a crew that has never practiced instrument-assisted navigation. Radar and AIS add information, but neither replaces a proper lookout, sound signals, safe speed or familiarity with collision regulations. Small craft and floating debris may not present a reliable target.</p><p>If fog is possible, set up the chartplotter before it arrives, confirm running lights and sound-producing equipment, and keep the route away from unnecessary traffic. Know how to display position, course and nearby hazards without digging through menus. When the crew lacks that skill, the conservative choice is to remain docked. A device is not a substitute for an operator who understands its limitations.</p>`,
      },
      {
        heading: "Cold water can make a warm day hazardous",
        body: `<p>Air temperature creates false confidence in spring and late fall. Cold-water immersion can trigger involuntary gasping and rapid loss of useful movement long before hypothermia becomes the headline concern. Check water temperature, dress for immersion and wear an appropriate life jacket rather than storing it under a seat. Children and weak swimmers need especially careful fit and supervision.</p><p>Cold water also changes the rescue calculation. A person-overboard recovery that feels like a drill in August may become immediately urgent in May. Review how the crew will stop, return, make contact and get a wet person over the side of the actual boat. High freeboard, a stern-drive propeller and a boarding ladder that deploys only from aboard are real design constraints.</p>`,
        image: { key: "gear-life-jacket", alt: "A life jacket prepared for use aboard a recreational boat", caption: "Water temperature—not the sunshine at the ramp—should drive clothing and life-jacket decisions." },
      },
      {
        heading: "Use apps as windows into sources, not competing truth machines",
        body: `<p>Different apps may display different model runs, update times and interpolation. When two forecasts disagree, investigate the source and timestamp instead of averaging the numbers. Favor official warnings and the product written for the operating area. Radar shows recent precipitation movement; it does not display every dangerous gust. Lightning maps can lag. Crowd-sourced wind readings may come from instruments in sheltered or elevated locations.</p><p>Download what you need before losing service. Keep VHF weather capability where appropriate, and know which channel carries local information. Take screenshots only as a backup; stale screenshots should never be mistaken for a current warning. The aim is a layered picture: official forecast, radar, observations, local geography and the water in front of the bow.</p>`,
      },
      {
        heading: "Build decision points into the route",
        body: `<p>A weather-conscious itinerary has off-ramps. Mark the last protected harbor before a long crossing, the anchorage that remains safe after a forecast wind shift and the point beyond which returning would take longer than continuing. Tell the crew what would trigger a change: a gust threshold, deteriorating visibility, repeated lightning alerts, a passenger becoming cold or the arrival of a forecast wind shift.</p><p>Fuel margin is weather margin. Head seas and detours increase consumption, while a reserve makes it possible to choose the safer harbor rather than the nearest fuel pump. The same applies to daylight. A late start reduces options, especially on unfamiliar water where buoys, crab pots or shoals are difficult to identify at dusk.</p>`,
        image: { key: "winnipesaukee-cruise", alt: "A small cruising boat underway on an inland lake", caption: "A route with protected alternatives lets the captain react early instead of racing a forecast change." },
        callout: { title: "Simple turnaround rule", body: `<p>Decide the turnaround time and weather trigger before the first line comes aboard. A rule made at breakfast is usually better than one negotiated in worsening chop.</p>` },
      },
      {
        heading: "Recheck at the launch—and believe what you see",
        body: `<p>Stand still for a minute at the ramp. Look at flag movement, whitecaps, cloud bases, haze and what returning boats are doing. Compare observed wind with the forecast. A protected launch can conceal the open lake, so seek a view down the main body of water. Ask the harbormaster or marina staff about local conditions, but remember that another captain’s acceptable day may not suit your boat or passengers.</p><p>If forecast, sky and water disagree, use the most conservative signal. Delaying an hour can clarify a passing shower; abandoning the outing preserves the option to boat next weekend. Owners often regret being talked into a marginal departure. Few regret drinking coffee ashore while a line of squalls crosses the lake.</p>`,
      },
      {
        heading: "A repeatable five-minute briefing",
        body: `<ol><li>Read the complete official forecast, warnings and expected timing.</li><li>Trace wind direction over the route and identify exposed reaches.</li><li>Check radar, visibility, water temperature and daylight.</li><li>Name two safe alternatives and the trigger for using them.</li><li>Brief the crew on life jackets, communications and the turnaround plan.</li></ol><p>Repeat the check during the day, especially before leaving a protected stop for open water. Weather judgment improves when it is treated as a routine rather than a dramatic decision made only in obvious storms.</p>`,
      },
      {
        heading: "Final word: margin is the point",
        body: `<p>Experienced boating does not mean operating at the edge of what the hull can survive. It means recognizing how quickly a small mechanical issue, sick passenger or missed turn can consume the margin that pleasant weather provided. Choose conditions that leave room for the unexpected.</p><p>The best weather day is not necessarily flat calm. A moderate breeze can cool the cockpit and reward good boat handling. The goal is informed consent: know what is expected, know what the boat and crew can handle, and keep a conservative path home. That judgment—not the app with the prettiest map—is the most valuable instrument aboard.</p>`,
      },
    ],
    faqs: [
      { question: "What wind speed is too high for boating?", answer: "There is no universal number. Boat size and design, wind direction, fetch, waves, route, operator experience and crew condition all matter. Set a conservative boat-specific limit and lower it for unfamiliar water or vulnerable passengers." },
      { question: "How often should I check weather during a trip?", answer: "Check the night before, the morning of departure, at the launch and before any exposed leg. Continue monitoring alerts, the sky and changing water conditions while underway." },
      { question: "Can radar on a phone keep me safe from thunderstorms?", answer: "Radar is helpful but can be delayed and cannot show every hazardous gust. Use official warnings, visual observations and a preplanned exit; do not rely on a phone image to thread between cells." },
      { question: "Why can the lake be rough when the marina is calm?", answer: "Shoreline protection can shelter a marina while wind builds waves across a long fetch outside. Islands, gaps and headlands can also accelerate or redirect wind." },
      { question: "What should I do if conditions are worse than forecast?", answer: "Reduce speed, secure the crew, put on life jackets if they are not already worn and use the safest nearby shelter or return route. Do not press on merely because the original itinerary said to." },
    ],
    sources: [
      ["National Weather Service marine forecasts", "https://www.weather.gov/marine/"],
      ["NOAA National Data Buoy Center", "https://www.ndbc.noaa.gov/"],
      ["National Weather Service Lake Champlain forecast", "https://www.weather.gov/btv/recreation"],
      ["U.S. Coast Guard boating safety", "https://www.uscgboating.org/"],
    ],
    related: relatedSet({ destinationStart: 3, journalStart: 3 }),
    backHref: "index.html",
    backLabel: "Back to Nautical Dream",
  },
  {
    slug: "guide.html",
    type: "journal",
    seoTitle: "How Nautical Dream Tests and Recommends Boating Gear",
    title: "How We Evaluate Boating Gear",
    description: "Nautical Dream's boating gear review methodology: how we assess fit, installation, safety, ownership cost, maintenance, failures and value before recommending a product.",
    ogDescription: "The standards behind Nautical Dream buying guides, from use-case and installation to maintenance, failure modes and long-term value.",
    eyebrow: "Editorial standards",
    dek: "A product earns space aboard by solving a real problem without creating a worse one. Here is how we judge that tradeoff.",
    readTime: "14 minute read",
    hero: { key: "journal-dock-lines", alt: "Working boats, dock lines and marina equipment ready for use" },
    lede: "Boating gear is unusually easy to recommend badly. A cooler can win an insulation test and still be too heavy to lift over the gunwale. A chartplotter can top a feature comparison and become unreadable behind a steering wheel. A life jacket can satisfy a regulation and remain in a locker because nobody wants to wear it. Nautical Dream evaluates products in the context that matters: a moving, wet, sun-exposed boat with limited space, limited power and people whose comfort and safety depend on honest choices.",
    facts: [
      ["First question", "What problem does the product solve aboard?"],
      ["Full cost", "Purchase, installation, accessories and upkeep"],
      ["Editorial standard", "Suitability outranks commission or novelty"],
    ],
    disclosure: "Nautical Dream may earn a commission from qualifying purchases. Commercial relationships do not determine our categories, recommendations, cautions or final verdicts.",
    sections: [
      {
        heading: "We begin with a use case, not a bestseller list",
        body: `<p>“Best” without a boat, crew and operating area is meaningless. A heavy rotomolded cooler may be excellent for an overnight fishing crew and absurd on a sixteen-foot bowrider. A premium offshore inflatable life jacket may suit an adult captain but not a child, weak swimmer or tow-sports participant. We define who a product is for, how it will be used and what constraint matters most before comparing brands.</p><p>Every guide should state who should buy, who should avoid, a sensible budget choice and what extra money buys at the premium end. When a lower-priced product meets the job with less weight or complexity, that is not a consolation prize. It may be the better recommendation.</p>`,
      },
      {
        heading: "The boat is part of the test",
        body: `<p>Marine products do not live on a clean workbench. We consider mounting area, cable runs, electrical load, spray exposure, glare, engine vibration, salt, ultraviolet light, deck traffic and how equipment must be stored. Published dimensions can hide handles, drain plugs, cable bend radius or the room required to open a lid. A good guide tells the reader to measure the complete working envelope, not just the headline dimensions.</p><p>Installation can change the verdict. A discounted display that requires a new transducer and network backbone may cost more than an apparently expensive compatible replacement. A cooler without tie-down points can become a dangerous moving object. A life jacket whose inflation mechanism is difficult to inspect may be neglected. We treat those consequences as product characteristics, even when they are not printed on the box.</p>`,
        image: { key: "gear-chartplotter", src: "assets/chartplotter.svg", alt: "Marine chartplotter installed at a recreational powerboat helm", caption: "A feature list cannot show whether the complete system fits the helm, power supply and operator." },
      },
      {
        heading: "Specifications are verified at the model level",
        body: `<p>Manufacturers often sell several packages under one family name. Screen sizes, included maps, transducers, accessories, buoyancy types and warranties can differ. We link to current manufacturer material and identify the family or configuration being discussed. Readers should still verify the exact model number before ordering because retailers sometimes combine old and new inventory on one page.</p><p>We separate manufacturer claims from editorial judgment. Capacity, dimensions, certification and stated warranty can come from the maker; comfort, suitability and value require interpretation. When evidence is incomplete, we say so. “Up to” performance in controlled conditions is not converted into a promise aboard.</p>`,
      },
      {
        heading: "Safety products receive a different standard",
        body: `<p>A safety recommendation must explain approval category, intended use, fit, inspection and maintenance. We do not imply that one life jacket suits every person or activity. Children require the correct size and design. Inflatables are not appropriate for every user and must be armed and serviceable. A wearable device stored in plastic or buried beneath gear offers little practical protection.</p><p>We prioritize U.S. Coast Guard guidance, current labels and manufacturer instructions. Regulations vary with vessel, activity and jurisdiction, so a guide should send readers to authoritative sources rather than invent a universal rule. Any product recall or known safety notice materially changes a recommendation.</p>`,
        callout: { title: "Safety correction policy", body: `<p>If a recommendation becomes unsafe, recalled or materially misleading, we correct or remove it rather than waiting for a scheduled annual refresh.</p>` },
      },
      {
        heading: "Performance is weighed against usability",
        body: `<p>Maximum performance can reduce everyday value. More insulation adds weight and bulk. A brighter screen may draw more power. An offshore-grade jacket can be uncomfortable for casual warm-weather use. We look for the point where performance supports the use case without making the product difficult to carry, wear, operate or maintain.</p><p>Controls should be considered in realistic conditions: glare, polarized lenses, gloves, wet hands and motion. Latches, zippers and buckles must be operable by the intended user. A second operator should be able to understand essential electronics. Gear that works only for the owner under ideal conditions is less capable than the specification sheet suggests.</p>`,
      },
      {
        heading: "Ownership cost includes everything after checkout",
        body: `<p>The price on the product page is rarely the whole project. Our guides account for mounting hardware, electrical protection, professional labor, charts or subscriptions, replacement cartridges, batteries, cleaning supplies, spare parts and storage. We distinguish an approximate purchase price from an installed or ownership range and avoid false precision when labor and boat condition vary widely.</p><p>Time belongs in the cost calculation. A product that requires frequent attention may be appropriate for a disciplined owner and wrong for someone who wants simple seasonal use. Proprietary accessories and limited repairability can make a low purchase price expensive over several seasons.</p>`,
        image: { key: "journal-engine-maintenance", alt: "A boat owner performing careful outboard engine maintenance", caption: "Maintenance burden is part of ownership cost, even when no invoice arrives with it." },
      },
      {
        heading: "We look for common failure modes",
        body: `<p>A useful buyer’s guide should tell readers how a category disappoints. Electronics may reboot because of poor power rather than a bad display. Cooler gaskets and latches wear; drains become inaccessible when installed against a bulkhead. Inflatable life jackets can be incorrectly armed or left with expired components. Failure analysis prevents two mistakes: replacing the wrong component and blaming a product for a poor installation.</p><p>We distinguish between an isolated complaint, a predictable wear item and a design limitation. User reports can reveal patterns, but they are not treated as proof without context. Saltwater exposure, incorrect wiring, overloading and neglected maintenance matter. When a common issue can be prevented with care or installation, the guide explains how.</p>`,
      },
      {
        heading: "Alternatives are part of an honest verdict",
        body: `<p>No recommendation should pretend the category has only three brands. We name credible alternatives when another ecosystem, boat type or budget makes them relevant. Sometimes the best alternative is keeping the product already aboard, repairing it or buying a simpler tool. A tablet may supplement a chartplotter; it should not automatically replace one. A soft cooler may serve a lunch run better than a premium hard chest.</p><p>We also explain switching cost. Marine electronics, battery tools and proprietary mounting systems can lock owners into an ecosystem. Compatibility has economic value. A competitor can be technically stronger and still be a poor upgrade if every sensor, cable and mount must be replaced.</p>`,
      },
      {
        heading: "Affiliate links do not create a recommendation",
        body: `<p>Nautical Dream may use affiliate links, which can earn the publication a commission without changing the reader’s price. That business model supports research and site operation, but it creates an obligation to be explicit. A recommendation should remain the same if the link stops paying. Products without affiliate programs can still be included, and a guide can conclude that no purchase is necessary.</p><p>Sponsored content, supplied products and paid placements must be identified. Access is not a positive verdict. When first-hand long-term testing is unavailable, we do not imply that a writer has logged seasons with the product. We rely on transparent source material and category analysis, then describe the limits of that evidence.</p>`,
        pullQuote: "A recommendation should survive the disappearance of its commission link.",
      },
      {
        heading: "Prices are ranges, not theater",
        body: `<p>Marine prices move with model years, bundles, dealer labor, regional freight and seasonal promotions. A constantly stale exact price is less useful than a realistic tier and a list of what the package must include. We use terms such as budget, midrange and premium only after defining the relevant category; a budget offshore electronics project is not the same amount as a budget day-boat cooler.</p><p>Readers should compare identical model numbers and included accessories. A sale bundle may omit the chart region or transducer needed. Shipping can be significant for bulky products, while a local dealer may include rigging, setup or post-sale support that changes the value comparison.</p>`,
      },
      {
        heading: "Updates follow the boating calendar",
        body: `<p>Core guides are reviewed when manufacturers change a product family, authoritative safety guidance changes or a meaningful new alternative appears. We also update around commissioning and storage seasons when owners make larger purchase decisions. Each long-form page carries an updated date, and important current claims link to primary sources.</p><p>An update is not merely changing the year in the title. The recommendation, availability, compatibility, source links and ownership advice must still hold. If a product remains the right choice, the guide should explain why rather than manufacturing novelty for search traffic.</p>`,
      },
      {
        heading: "How readers can use our guides well",
        body: `<ol><li>Start with the “who should buy” and “who should avoid” sections.</li><li>Measure the boat and inventory compatible equipment before choosing a model.</li><li>Price the complete project, including installation and required accessories.</li><li>Read maintenance and common-failure sections before purchasing.</li><li>Verify current specifications, approval labels and availability with the manufacturer.</li></ol><p>Then make the decision slowly enough to catch a mismatch. The best buying guide does not push a reader toward checkout. It helps eliminate wrong products until the remaining choice makes sense aboard.</p>`,
        image: { key: "journal-dock-lines", alt: "Working dock lines and boating equipment arranged for practical use", caption: "Useful gear earns its place through fit, serviceability and repeated use—not showroom appeal." },
      },
      {
        heading: "Corrections and reader feedback",
        body: `<p>Boaters often know a local installation detail or failure pattern that a general guide misses. Specific, verifiable corrections are welcome at <a href="contact.html">our contact page</a>. Include the exact model, year, operating environment and supporting documentation when possible. We review substantive corrections and update material claims when warranted.</p><p>Our final standard is straightforward: a reader should understand why a product fits, what it will really cost, how it can fail and what ownership asks of them. If a guide does not answer those questions, it is not finished.</p>`,
      },
    ],
    faqs: [
      { question: "Does Nautical Dream accept free products?", answer: "Supplied products may be considered, but access does not guarantee coverage or a favorable verdict. Any material relationship should be disclosed in the relevant article." },
      { question: "Do affiliate commissions affect rankings?", answer: "They should not. Recommendations are based on suitability, safety, ownership cost and value. Products without commission programs may be included, and no-purchase alternatives can be the conclusion." },
      { question: "How often are buying guides updated?", answer: "Guides are reviewed when meaningful models, safety guidance or availability changes. An updated date reflects substantive review, not a cosmetic year change." },
      { question: "Are prices guaranteed?", answer: "No. Marine pricing varies by package, dealer, region and season. Readers should verify the exact model number, included accessories and installation cost before buying." },
      { question: "How can I submit a correction?", answer: "Use the contact page and include the exact model, claim, supporting source and relevant operating context. Material errors are corrected as soon as they can be verified." },
    ],
    sources: [
      ["U.S. Coast Guard boating safety guidance", "https://www.uscgboating.org/"],
      ["NOAA nautical chart resources", "https://nauticalcharts.noaa.gov/"],
      ["Federal Trade Commission endorsement guides", "https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews"],
    ],
    related: relatedSet({ destinationStart: 6, journalStart: 1 }),
    backHref: "gear.html",
    backLabel: "Back to gear",
  },
];
