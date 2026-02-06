'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  height?: string;
  zoom?: number;
  readonly?: boolean;
}

export default function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  height = '400px',
  zoom = 13,
  readonly = false,
}: MapPickerProps) {
  // Ensure latitude and longitude are numbers
  const safeLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude)) || -6.2088;
  const safeLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude)) || 106.8456;
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isInitialLoad = useRef(true);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || !mapContainer.current) return;

    try {
      // Create icon inside useEffect (client-side only)
      const defaultIcon = L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Initialize map
      if (!map.current) {
        map.current = L.map(mapContainer.current, {
          doubleClickZoom: false, // Disable double click zoom
          scrollWheelZoom: true,
          zoomControl: true,
        }).setView(
          [safeLat, safeLng],
          zoom
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // Add click handler jika tidak readonly
        if (!readonly) {
          map.current.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            onLocationChange(
              parseFloat(lat.toFixed(7)),
              parseFloat(lng.toFixed(7))
            );
          });
        }
      }

      // Update marker
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }

      marker.current = L.marker([safeLat, safeLng], { icon: defaultIcon })
        .addTo(map.current!)
        .bindPopup(
          `<div style="font-size: 12px;">
            <p><strong>Koordinat</strong></p>
            <p>Latitude: ${safeLat.toFixed(7)}</p>
            <p>Longitude: ${safeLng.toFixed(7)}</p>
            ${
              !readonly
                ? '<p style="margin-top: 8px; color: #666;"><em>Klik map untuk mengubah lokasi</em></p>'
                : ''
            }
          </div>`,
          { maxWidth: 250 }
        );

      // Only center map on initial load, not on subsequent updates
      if (isInitialLoad.current && map.current) {
        map.current.setView([safeLat, safeLng], zoom);
        isInitialLoad.current = false;
      }
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    // Cleanup
    return () => {
      // Don't destroy map on unmount, just keep it
    };
  }, [isClient, safeLat, safeLng, zoom, readonly, onLocationChange]);

  // Don't render map container on server
  if (!isClient) {
    return (
      <div
        style={{
          height,
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#999' }}>Loading map...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}
    />
  );
}
