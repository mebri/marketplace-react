import { useState } from "react";

function ShareButtons({ adId, title, price, city }) {
  const [copied, setCopied] = useState(false);

  const adUrl = `https://mebri.yegna.workers.dev/#/ad/${adId}`;
  const shareText = `🛒 ${title}\n💰 ETB ${Number(
    price || 0
  ).toLocaleString()}\n📍 ${city || "Ethiopia"}\n\nView on የኛ ገበያ:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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

  const handleShare = async () => {
    // Try native share first (mobile — WhatsApp, Telegram, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: adUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed — try fallback below
      }
    }

    // Fallback for desktop or when native share isn't available:
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareText + " " + adUrl
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="share-section">
      <button
        type="button"
        onClick={handleShare}
        className="share-ad-btn"
      >
        📤 Share This Ad
      </button>

      {copied && (
        <p className="share-copied-msg">✅ Link copied!</p>
      )}
    </div>
  );
}

export default ShareButtons;
