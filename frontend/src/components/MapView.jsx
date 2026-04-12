import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function MapView({ lat, lng, markers, onMarkerClick, className = '' }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapKey) return;
    const initMap = async () => {
      try {
        setOptions({ apiKey: mapKey, version: "weekly", libraries: ['places'] });
        const { Map } = await importLibrary("maps");
        const m = new Map(mapRef.current, {
          center: { lat: lat || 13.0827, lng: lng || 80.2707 },
          zoom: 12,
          styles: [ /* Optional: premium dark map styles could go here */ ],
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMap(m);
      } catch (e) {
        console.error("Map initialization failed", e);
      }
    };
    initMap();
  }, [lat, lng, mapKey]);

  useEffect(() => {
    if (!map || !markers) return;
    const currentMarkers = [];
    
    const addMarkers = async () => {
      const { Marker } = await google.maps.importLibrary("marker");
      markers.forEach(doc => {
        if (doc.clinic_lat && doc.clinic_lng) {
          const marker = new Marker({
            position: { lat: doc.clinic_lat, lng: doc.clinic_lng },
            map,
            animation: google.maps.Animation.DROP,
            title: doc.full_name
          });
          marker.addListener('click', () => {
            if (onMarkerClick) onMarkerClick(doc);
          });
          currentMarkers.push(marker);
        }
      });
    }
    addMarkers();

    return () => {
      currentMarkers.forEach(m => m.setMap(null));
    };
  }, [map, markers, onMarkerClick]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm ${className}`}>
      {mapKey ? (
         <div ref={mapRef} className="w-full h-full" />
      ) : (
         <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8f9fb] text-[#9ca3af] gap-3">
            <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm">Map unavailable — API key not configured</p>
         </div>
      )}
    </div>
  );
}
