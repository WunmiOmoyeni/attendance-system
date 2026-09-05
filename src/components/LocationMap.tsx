
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationMapProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
};

function LocationMarker({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude
      ? L.latLng(latitude, longitude)
      : null
  );

  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      setPosition(event.latlng);
      onLocationChange(lat, lng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      setPosition(L.latLng(latitude, longitude));
    }
  }, [latitude, longitude]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={true}
      className="h-[400px] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
      />
    </MapContainer>
  );
}

