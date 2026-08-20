(() => {
  "use strict";

  const links = document.querySelectorAll('a[data-commercial-link="true"]');
  if (!links.length) return;

  let audioContext = null;

  function playAffiliateKaching() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioContext ||= new AudioContext();

    const play = () => {
      const now = audioContext.currentTime + 0.01;
      const output = audioContext.createGain();
      output.gain.setValueAtTime(0.18, now);
      output.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      output.connect(audioContext.destination);

      // A short register-drawer clack.
      const noiseBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.07), audioContext.sampleRate);
      const noise = noiseBuffer.getChannelData(0);
      for (let index = 0; index < noise.length; index += 1) {
        const envelope = 1 - index / noise.length;
        noise[index] = (Math.random() * 2 - 1) * envelope;
      }
      const clack = audioContext.createBufferSource();
      const clackFilter = audioContext.createBiquadFilter();
      clack.buffer = noiseBuffer;
      clackFilter.type = "bandpass";
      clackFilter.frequency.setValueAtTime(520, now);
      clackFilter.Q.setValueAtTime(0.9, now);
      clack.connect(clackFilter).connect(output);
      clack.start(now);

      // Bright stacked bells create the original "ka-ching" character.
      const bells = [
        { frequency: 659.25, start: 0.045, duration: 0.16, gain: 0.6, type: "triangle" },
        { frequency: 987.77, start: 0.075, duration: 0.2, gain: 0.48, type: "triangle" },
        { frequency: 1318.51, start: 0.16, duration: 0.58, gain: 0.7, type: "sine" },
        { frequency: 2093, start: 0.18, duration: 0.45, gain: 0.32, type: "sine" },
      ];

      for (const bell of bells) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startsAt = now + bell.start;
        oscillator.type = bell.type;
        oscillator.frequency.setValueAtTime(bell.frequency, startsAt);
        gain.gain.setValueAtTime(0.0001, startsAt);
        gain.gain.exponentialRampToValueAtTime(bell.gain, startsAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + bell.duration);
        oscillator.connect(gain).connect(output);
        oscillator.start(startsAt);
        oscillator.stop(startsAt + bell.duration + 0.02);
      }

      window.setTimeout(() => output.disconnect(), 950);
    };

    if (audioContext.state === "suspended") {
      audioContext.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }

  for (const link of links) {
    link.addEventListener("click", () => {
      const active = link.dataset.affiliateActive === "true";
      if (active) playAffiliateKaching();
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
