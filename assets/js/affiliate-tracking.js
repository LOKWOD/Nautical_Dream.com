(() => {
  "use strict";

  const links = document.querySelectorAll('a[data-commercial-link="true"]');
  if (!links.length) return;

  for (const link of links) {
    link.addEventListener("click", () => {
      const active = link.dataset.affiliateActive === "true";
      const eventName = active ? "affiliate_click" : "product_outbound_click";
      const eventData = {
        affiliate_active: active,
        affiliate_key: link.dataset.affiliateKey || "",
        affiliate_product: link.dataset.affiliateProduct || "",
        affiliate_retailer: link.dataset.affiliateRetailer || "",
        destination_url: link.href,
        page_path: window.location.pathname,
        link_text: (link.textContent || "").trim().slice(0, 100),
        transport_type: "beacon",
      };

      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, eventData);
      } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: eventName, ...eventData });
      }
    });
  }
})();
