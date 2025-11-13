import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapPicker.css';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition = { lat, lng };
      setPosition(newPosition);
      onLocationSelect(newPosition);
    },
  });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]}>
      <Popup>
        <div>
          <strong>Meeting Point</strong>
          <br />
          <small>Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}</small>
        </div>
      </Popup>
    </Marker>
  );
}

const MapPicker = ({ onLocationSelect, initialLocation, initialCoordinates }) => {
  const [locationName, setLocationName] = useState(initialLocation?.name || '');
  const [coordinates, setCoordinates] = useState(
    initialCoordinates || initialLocation?.coordinates || null
  );

  // Default center (University of newcastle coordinates - adjust as needed)
  const defaultCenter = [-32.8928, 151.7044];
  const [mapCenter, setMapCenter] = useState(
    coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter
  );

  useEffect(() => {
    if (initialLocation) {
      setLocationName(initialLocation.name || '');
      if (initialLocation.coordinates) {
        setCoordinates(initialLocation.coordinates);
        setMapCenter([initialLocation.coordinates.lat, initialLocation.coordinates.lng]);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    if (initialCoordinates) {
      setCoordinates(initialCoordinates);
      setMapCenter([initialCoordinates.lat, initialCoordinates.lng]);
    }
  }, [initialCoordinates]);

  const handleLocationSelect = (selectedCoordinates) => {
    setCoordinates(selectedCoordinates);
    if (onLocationSelect) {
      onLocationSelect({
        name: locationName || 'Selected Location',
        coordinates: selectedCoordinates
      });
    }
  };

  const handleLocationNameChange = (e) => {
    const name = e.target.value;
    setLocationName(name);
    if (onLocationSelect && coordinates) {
      onLocationSelect({
        name,
        coordinates
      });
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoordinates = { lat: latitude, lng: longitude };
          setCoordinates(newCoordinates);
          setMapCenter([latitude, longitude]);
          handleLocationSelect(newCoordinates);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please click on the map to select a location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="map-picker-container">
      <div className="map-picker-header">
        <label>Meeting Location *</label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="btn-get-location"
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} /> Use My Location
        </button>
      </div>

      <div className="location-name-input">
        <input
          type="text"
          value={locationName}
          onChange={handleLocationNameChange}
          placeholder="Enter location name or address (e.g., Student Union Building)"
          className="location-input"
        />
      </div>

      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={coordinates ? 15 : 13}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={handleLocationSelect}
            initialPosition={coordinates}
          />
        </MapContainer>
      </div>

      {coordinates && (
        <div className="coordinates-display">
          <small>
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </small>
        </div>
      )}

      <small className="map-hint">
        Click on the map to select a meeting point, or use your current location
      </small>
    </div>
  );
};

export default MapPicker;

