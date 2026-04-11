import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function MapView({ lat, lng, markers, onMarkerClick, className = '' }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapKey) return;
    const initMap = async () => {
      try {
        const loader = new Loader({ apiKey: mapKey, version: "weekly", libraries: ['places'] });
        const { Map } = await loader.importLibrary("maps");
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
    <div className={`relative rounded-xl overflow-hidden shadow-lg border border-white/20 ${className}`}>
      {mapKey ? (
         <div ref={mapRef} className="w-full h-full" />
      ) : (
         <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
            Google Maps API Key not configured
         </div>
      )}
    </div>
  );
}
