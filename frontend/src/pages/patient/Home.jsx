import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import DoctorCard from '../../components/DoctorCard';
import { Loader } from '@googlemaps/js-api-loader';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  
  const [lat, setLat] = useState(13.0827); // default Chennai
  const [lng, setLng] = useState(80.2707);

  useEffect(() => {
    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => {
          console.warn("Geolocation denied or failed, using default (Chennai).");
        }
      );
    }
  }, []);

  useEffect(() => {
    // Load map
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly"
        });
        const { Map } = await loader.importLibrary("maps");
        const m = new Map(mapRef.current, {
          center: { lat, lng },
          zoom: 12,
        });
        setMap(m);
      } catch (err) {
        console.error("Map loading error", err);
      }
    };
    initMap();
  }, [lat, lng]);

  useEffect(() => {
    // Fetch doctors
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/doctors/search`, {
          params: { lat, lng, radius_km: 20 }
        });
        setDoctors(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [lat, lng]);

  // Add markers when map and doctors are ready
  useEffect(() => {
    if (!map || !doctors.length) return;
    
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
        const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
        loader.importLibrary("maps").then(() => {
            doctors.forEach(doc => {
              if (doc.clinic_lat && doc.clinic_lng) {
                new google.maps.Marker({
                  position: { lat: doc.clinic_lat, lng: doc.clinic_lng },
                  map: map,
                  title: doc.full_name
                });
              }
            });
        });
    });
  }, [map, doctors]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      <div className="w-full md:w-1/2 p-4 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Find Doctors near you</h1>
        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <div>
            {doctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
            {doctors.length === 0 && <p>No doctors found.</p>}
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-200">
        <div ref={mapRef} className="w-full h-full border-l border-gray-300"></div>
      </div>
    </div>
  );
}
