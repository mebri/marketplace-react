import { useState } from "react";

function ShareButtons({ adId, title, price, city }) {
  const [copied, setCopied] = useState(false);

  const adUrl = `https://mebri.yegna.workers.dev/#/ad/${adId}`;
  const shareText = `🛒 ${title}\n💰 ETB ${Number(
    price || 0
  ).toLocaleString()}\n📍 ${city || "Ethiopia"}\n\nView on የኛ ገበያ:`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      shareText + " " + adUrl
    )}`;
    window.open(url, "_blank");
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      adUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = adUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: adUrl,
        });
      } catch (err) {
        // User cancelled — do nothing
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="share-section">
      <h3>📤 Share This Ad</h3>
      <div className="share-buttons">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="share-btn share-whatsapp"
        >
          💬 WhatsApp
        </button>

        <button
          type="button"
          onClick={handleTelegram}
          className="share-btn share-telegram"
        >
          ✈️ Telegram
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`share-btn share-copy ${copied ? "copied" : ""}`}
        >
          {copied ? "✅ Copied!" : "🔗 Copy Link"}
        </button>

        {typeof navigator !== "undefined" && navigator.share && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="share-btn share-native"
          >
            📱 More
          </button>
        )}
      </div>
    </div>
  );
}

export default ShareButtons;
