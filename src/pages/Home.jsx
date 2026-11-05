/* =========================================================
   HERO MARQUEE (Right to Left)
========================================================= */
.home-hero {
  width: 100%;
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  padding: 18px 0; /* Slimmer padding for the scrolling text */
  margin: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-marquee {
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}

.hero-marquee-content {
  display: inline-flex;
  align-items: center;
  /* Animation forces it to start right and go left */
  animation: scrollRightToLeft 25s linear infinite;
  padding-left: 100%;
}

.hero-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 10px;
}

.hero-dot {
  color: #ff9800; /* Orange dot separator */
  font-size: 20px;
  margin: 0 10px;
}

@keyframes scrollRightToLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* =========================================================
   MOBILE HEADER ICONS (No Hamburger)
========================================================= */
.mobile-quick-actions {
  display: none;
}

@media (max-width: 850px) {
  .navbar-nav, .navbar-actions {
    display: none !important;
  }

  .mobile-quick-actions {
    display: flex !important;
    align-items: center;
    gap: 8px;
    margin-left: auto; 
  }

  .mobile-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: #f1f5f9;
    border-radius: 50%;
    text-decoration: none;
    font-size: 20px;
    border: none;
    cursor: pointer;
    color: #333;
    position: relative;
    padding: 0;
  }

  .mobile-icon-btn:hover {
    background: #e2e8f0;
  }

  .notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 10px;
    font-weight: bold;
    border: 2px solid #ffffff;
  }

  .guest-login-btn, .guest-register-btn {
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 8px;
  }
  .guest-login-btn { color: #1976d2; }
  .guest-register-btn { background: #1976d2; color: white; }

  /* Mobile Second Row */
  .mobile-second-row {
    display: flex;
    gap: 10px;
    padding: 10px 15px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }

  .mobile-row-btn {
    flex: 1;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
  }

  .mobile-dashboard-btn { background: #e0f2fe; color: #0369a1; }
  .mobile-postad-btn { background: #16a34a; color: white; }
}
