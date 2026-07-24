import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div
    style={{
      minHeight: "50vh",
      display: "grid",
      placeItems: "center",
      gap: "12px",
      color: "#0d0d0d",
      fontFamily: "Roboto, sans-serif",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: "3px solid #eee",
        borderTopColor: "#ffc107",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <p>{message}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;
