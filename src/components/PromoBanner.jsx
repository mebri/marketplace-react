import React from "react";
import { Link } from "react-router-dom";

export default function PromoBanner() {
  return (
    <section className="promo-section">
      {/* Main Promo Card */}
      <div className="promo-hero-card">
        <div className="promo-hero-content">
          <span className="promo-badge">🇪🇹 Ethiopia's Growing Marketplace</span>
          <h1>Buy & Sell Anything in Ethiopia 🇪🇹</h1>
          <p>
            Join thousands of buyers and sellers on የኛ ገበያ. Post your ad for
            <strong> FREE </strong> and reach customers across the country —
            cars, houses, electronics, furniture, services & more.
          </p>
          <div className="promo-hero-buttons">
            <Link to="/post-ad" className="promo-btn promo-btn-primary">
              📢 Post Your Ad — Free
            </Link>
            <Link to="/search" className="promo-btn promo-btn-secondary">
              🔎 Browse Ads
            </Link>
          </div>
        </div>
        <div className="promo-hero-visual">🛒</div>
      </div>

      {/* Feature Cards */}
      <div className="promo-features">
        <div className="promo-feature-card">
          <div className="promo-feature-icon">⚡</div>
          <h3>Fast & Easy</h3>
          <p>Post your ad in under 2 minutes. No complicated steps.</p>
        </div>

        <div className="promo-feature-card">
          <div className="promo-feature-icon">🆓</div>
          <h3>100% Free</h3>
          <p>Posting ads is completely free — no hidden fees, ever.</p>
        </div>

        <div className="promo-feature-card">
          <div className="promo-feature-icon">🔒</div>
          <h3>Safe & Trusted</h3>
          <p>Verified sellers and secure chat system for your safety.</p>
        </div>

        <div className="promo-feature-card">
          <div className="promo-feature-icon">💬</div>
          <h3>Direct Chat</h3>
          <p>Chat with sellers directly on WhatsApp, Telegram, or in-app.</p>
        </div>
      </div>
    </section>
  );
}
