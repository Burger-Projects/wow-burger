import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [40.758, -73.9855];
const DEFAULT_ZOOM = 13;

function ClickToPin({ onPin }) {
  useMapEvents({
    click(e) {
      onPin(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPin({ lat, lng, version }) {
  const map = useMap();
  useEffect(() => {
    if (!version || lat == null || lng == null) return;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    map.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [version, lat, lng, map]);
  return null;
}

/**
 * Click the map to drop/move a branch pin. Drag the marker to fine-tune.
 */
const BranchPinMap = ({ latitude, longitude, onPin, mapKey, flyVersion = 0 }) => {
  const hasPin =
    latitude != null &&
    longitude != null &&
    latitude !== "" &&
    longitude !== "" &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude));

  const lat = hasPin ? Number(latitude) : DEFAULT_CENTER[0];
  const lng = hasPin ? Number(longitude) : DEFAULT_CENTER[1];

  return (
    <div className="admin-pin-map">
      <MapContainer
        key={mapKey || "new"}
        center={[lat, lng]}
        zoom={hasPin ? 15 : DEFAULT_ZOOM}
        scrollWheelZoom
        className="admin-pin-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPin onPin={onPin} />
        <FlyToPin lat={lat} lng={lng} version={flyVersion} />
        {hasPin && (
          <Marker
            position={[lat, lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();
                onPin(pos.lat, pos.lng);
              },
            }}
          />
        )}
      </MapContainer>
      <p className="admin-pin-hint">
        {hasPin
          ? "Pin placed — click elsewhere or drag the marker to adjust."
          : "Click the map to drop a pin for this branch."}
      </p>
    </div>
  );
};

export default BranchPinMap;
