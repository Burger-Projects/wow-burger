import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import wowLogo from "../../Assets/wow-burger-logo.png";
import "./QrStandeePoster.css";

const QrStandeePoster = ({ defaultUrl }) => {
  const targetUrl = defaultUrl || (typeof window !== "undefined" ? `${window.location.origin}/menu` : "https://wow-burger-ui.onrender.com/menu");
  const [qrUrl, setQrUrl] = useState(targetUrl);
  const [tableNo, setTableNo] = useState("");
  const posterRef = useRef(null);

  const fullUrl = tableNo.trim() ? `${qrUrl}?table=${encodeURIComponent(tableNo.trim())}` : qrUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Menu link copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-standee-container">
      {/* Controls Bar (Hidden during print) */}
      <div className="qr-controls-bar no-print">
        <div className="qr-control-field">
          <label>QR Menu URL:</label>
          <input
            type="url"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://wow-burger-ui.onrender.com/menu"
          />
        </div>

        <div className="qr-control-field">
          <label>Table Number (Optional):</label>
          <input
            type="text"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            placeholder="e.g. Table 05"
          />
        </div>

        <div className="qr-action-buttons">
          <button type="button" className="qr-btn qr-btn-primary" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print Poster
          </button>
          <button type="button" className="qr-btn qr-btn-secondary" onClick={handleCopyLink}>
            <i className="fas fa-copy"></i> Copy Link
          </button>
        </div>
      </div>

      {/* The Printable Standee Poster */}
      <div className="qr-poster-wrapper">
        <div className="qr-poster-card" ref={posterRef}>
          {/* Decorative food pattern overlay background */}
          <div className="qr-poster-bg"></div>

          {/* Top Header Section */}
          <div className="qr-poster-header">
            <span className="qr-badge">SCAN AND ORDER</span>
            <h1 className="qr-title-main">OUR MENU</h1>
            <p className="qr-subtitle">SCAN TO VIEW OUR FRESH MENU & SPECIALS</p>
          </div>

          {/* Center QR Code Container */}
          <div className="qr-code-box-wrapper">
            <div className="qr-code-box">
              <QRCodeSVG
                value={fullUrl}
                size={230}
                bgColor="#FFFFFF"
                fgColor="#111111"
                level="H"
                includeMargin={true}
              />
            </div>
            {tableNo.trim() && <div className="qr-table-tag">{tableNo.trim().toUpperCase()}</div>}
          </div>

          {/* Bottom Branding Arc */}
          <div className="qr-poster-bottom">
            <div className="qr-arc-curve"></div>
            <div className="qr-brand-area">
              <img src={wowLogo} alt="WOW Burger Logo" className="qr-wow-logo" />
              <div className="qr-brand-tagline">WOW BURGER</div>
              <p className="qr-url-display">{fullUrl.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrStandeePoster;
