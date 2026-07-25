import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

function FitBounds({ branches, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!branches?.length) return;

    const selected = branches.find((b) => b.id === selectedId);
    if (selected) {
      map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 14), {
        animate: true,
      });
      return;
    }

    if (branches.length === 1) {
      map.setView([branches[0].latitude, branches[0].longitude], 14);
      return;
    }

    const bounds = L.latLngBounds(
      branches.map((b) => [b.latitude, b.longitude]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [branches, selectedId, map]);

  return null;
}

const BranchMap = ({ branches, selectedId, onSelect }) => {
  if (!branches?.length) return null;

  const centerBranch =
    branches.find((b) => b.id === selectedId) ||
    branches.find((b) => b.is_primary) ||
    branches[0];

  return (
    <div className="contact-map">
      <MapContainer
        center={[centerBranch.latitude, centerBranch.longitude]}
        zoom={14}
        scrollWheelZoom={false}
        className="contact-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds branches={branches} selectedId={selectedId} />
        {branches.map((branch) => (
          <Marker
            key={branch.id}
            position={[branch.latitude, branch.longitude]}
            eventHandlers={{
              click: () => onSelect?.(branch.id),
            }}
          >
            <Popup>
              <strong>{branch.name}</strong>
              <br />
              {branch.address}
              {branch.city ? (
                <>
                  <br />
                  {branch.city}
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BranchMap;
