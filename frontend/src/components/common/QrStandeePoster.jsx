import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import wowLogo from "../../Assets/wow-burger-logo.png";
import "./QrStandeePoster.css";

const QrStandeePoster = ({ defaultUrl }) => {
  const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // Default to public Render production URL with HashRouter path so real mobile phone scans work 100% reliably
  const productionUrl = "https://wow-burger-ui.onrender.com/#/menu";
  const initialUrl = defaultUrl || (isLocalHost ? productionUrl : `${window.location.origin}/#/menu`);

  const [qrUrl, setQrUrl] = useState(initialUrl);
  const [tableNo, setTableNo] = useState("");
  const posterRef = useRef(null);

  const fullUrl = tableNo.trim() ? `${qrUrl}${qrUrl.includes("?") ? "&" : "?"}table=${encodeURIComponent(tableNo.trim())}` : qrUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Menu link copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    const svgElement = posterRef.current?.querySelector("svg");
    if (!svgElement) {
      toast.error("Could not locate QR code element.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 60;
      canvas.height = img.height + 60;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 30, 30);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = tableNo.trim()
        ? `wow-burger-qr-${tableNo.trim().replace(/\s+/g, "-").toLowerCase()}.png`
        : "wow-burger-qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR Code PNG image downloaded!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="qr-standee-container">
      {/* Controls Bar (Hidden during print) */}
      <div className="qr-controls-bar no-print">
        {isLocalHost && (
          <div className="qr-notice-banner">
            <i className="fas fa-info-circle"></i>
            <span>
              <strong>Mobile Scan Tip:</strong> Since you are running locally on <code>localhost</code>, mobile phones cannot open <code>localhost</code>. We set the default QR target to your live Render website URL (<code>/#/menu</code>)!
            </span>
          </div>
        )}

        <div className="qr-control-field">
          <label>QR Target Menu URL:</label>
          <input
            type="url"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://wow-burger-ui.onrender.com/#/menu"
          />
          <div className="qr-preset-buttons">
            <button
              type="button"
              className="qr-preset-btn"
              onClick={() => setQrUrl("https://wow-burger-ui.onrender.com/#/menu")}
            >
              Use Render Site URL (/#/menu)
            </button>
            <button
              type="button"
              className="qr-preset-btn"
              onClick={() => setQrUrl(`${window.location.origin}/#/menu`)}
            >
              Use Current Domain
            </button>
          </div>
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
          <button type="button" className="qr-btn qr-btn-gold" onClick={handleDownloadPng}>
            <i className="fas fa-download"></i> Download PNG
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
