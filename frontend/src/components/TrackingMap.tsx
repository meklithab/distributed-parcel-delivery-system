import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface TrackingMapProps {
    pickup?: { lat: number, lng: number };
    dropoff?: { lat: number, lng: number };
    courier?: { lat: number, lng: number };
}

// Helper to auto-center map when markers move
function RecenterMap({ coords }: { coords: { lat: number, lng: number }[] }) {
    const map = useMap();
    React.useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [coords, map]);
    return null;
}

export default function TrackingMap({ pickup, dropoff, courier }: TrackingMapProps) {
    const coords = [pickup, dropoff, courier].filter(Boolean) as { lat: number, lng: number }[];
    const center = pickup || { lat: 9.0, lng: 38.74 };

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border shadow-inner bg-gray-100">
            <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]}>
                        <Popup>Pickup Point</Popup>
                    </Marker>
                )}

                {dropoff && (
                    <Marker position={[dropoff.lat, dropoff.lng]}>
                        <Popup>Dropoff Point</Popup>
                    </Marker>
                )}

                {courier && (
                    <Marker position={[courier.lat, courier.lng]}>
                        <Popup>🚚 Courier Position</Popup>
                    </Marker>
                )}

                <RecenterMap coords={coords} />
            </MapContainer>
        </div>
    );
}
