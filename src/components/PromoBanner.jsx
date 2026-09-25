import React from "react";
import { Link } from "react-router-dom";

export default function PromoBanner() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Main Promo Hero Card */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
          color: "white",
          borderRadius: "20px",
          padding: "35px 30px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(25, 118, 210, 0.35)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, flex: "1 1 300px" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              marginBottom: "14px",
            }}
          >
            🇪🇹 Ethiopia's Growing Marketplace
          </span>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "30px",
              fontWeight: "800",
              lineHeight: 1.2,
              color: "white",
            }}
          >
            Buy &amp; Sell Anything in Ethiopia
          </h1>

          <p
            style={{
              margin: "0 0 22px",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.92)",
              maxWidth: "620px",
            }}
          >
            Join thousands of buyers and sellers on የኛ ገበያ. Post your ad for{" "}
            <strong style={{ color: "#ffeb3b", fontWeight: "800" }}>
              FREE
            </strong>{" "}
            and reach customers across the country — cars, houses, electronics,
            furniture, services &amp; more.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/post-ad"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                textDecoration: "none",
                background: "#ffeb3b",
                color: "#0d47a1",
                boxShadow: "0 4px 14px rgba(255, 235, 59, 0.4)",
                whiteSpace: "nowrap",
              }}
            >
              📢 Post Your Ad — Free
            </Link>
            <Link
              to="/search"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                textDecoration: "none",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              🔎 Browse Ads
            </Link>
          </div>
        </div>

        <div
          style={{
            fontSize: "120px",
            lineHeight: 1,
            opacity: 0.9,
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          🛒
        </div>
      </div>

      {/* Feature Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "22px",
        }}
      >
        {[
          {
            icon: "⚡",
            title: "Fast & Easy",
            text: "Post your ad in under 2 minutes. No complicated steps.",
          },
          {
            icon: "🆓",
            title: "100% Free",
            text: "Posting ads is completely free — no hidden fees, ever.",
          },
          {
            icon: "🔒",
            title: "Safe & Trusted",
            text: "Verified sellers and secure chat system for your safety.",
          },
          {
            icon: "💬",
            title: "Direct Chat",
            text: "Chat with sellers directly on WhatsApp, Telegram, or in-app.",
          },
        ].map((f, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "22px 18px",
              textAlign: "center",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "38px", marginBottom: "10px" }}>
              {f.icon}
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "16px",
                color: "#0f172a",
                fontWeight: "800",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
