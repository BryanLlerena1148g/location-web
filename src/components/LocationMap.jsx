import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Box, CircularProgress, Alert } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Iconos personalizados para diferentes estados
const createCustomIcon = (color, isSelected = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? 16 : 12}px;
        height: ${isSelected ? 16 : 12}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
      </style>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

const MapController = ({ locations, selectedLocation }) => {
  const map = useMap()

  useEffect(() => {
    if (locations.length > 0) {
      if (selectedLocation) {
        // Centrar en la ubicación seleccionada
        map.setView([selectedLocation.latitude, selectedLocation.longitude], 15)
      } else {
        // Ajustar vista para mostrar todas las ubicaciones
        const bounds = L.latLngBounds(
          locations.map(loc => [loc.latitude, loc.longitude])
        )
        
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] })
        }
      }
    }
  }, [locations, selectedLocation, map])

  return null
}

const LocationMap = ({ locations, selectedLocation, loading, onLocationSelect }) => {
  const mapRef = useRef()
  
  // Coordenadas por defecto (Lima, Perú)
  const defaultCenter = [-12.0464, -77.0428]
  const defaultZoom = 10

  const getMarkerColor = (location) => {
    const now = new Date()
    const locationTime = new Date(location.created_at || location.timestamp)
    const hoursAgo = (now - locationTime) / (1000 * 60 * 60)
    
    if (hoursAgo < 1) return '#4caf50' // Verde - muy reciente
    if (hoursAgo < 6) return '#ff9800' // Naranja - reciente  
    if (hoursAgo < 24) return '#f44336' // Rojo - viejo
    return '#9e9e9e' // Gris - muy viejo
  }

  const formatLocationInfo = (location) => {
    const timestamp = new Date(location.created_at || location.timestamp)
    return {
      machine: location.machine_name,
      user: location.user_name,
      time: timestamp.toLocaleString(),
      source: location.location_source,
      city: location.city,
      country: location.country,
      accuracy: location.accuracy ? `${location.accuracy}m` : 'N/A'
    }
  }

  if (loading) {
    return (
      <Box className="map-container">
        <div className="loading-overlay">
          <CircularProgress size={60} />
        </div>
      </Box>
    )
  }

  return (
    <Box className="map-container">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController locations={locations} selectedLocation={selectedLocation} />
        
        {locations.map((location, index) => {
          const isSelected = selectedLocation && selectedLocation.id === location.id
          const info = formatLocationInfo(location)
          const color = getMarkerColor(location)
          
          return (
            <Marker
              key={`${location.id}-${index}`}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon(color, isSelected)}
              eventHandlers={{
                click: () => onLocationSelect(location)
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                    📱 {info.machine}
                  </h3>
                  
                  <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    <p><strong>👤 Usuario:</strong> {info.user || 'N/A'}</p>
                    <p><strong>🕒 Hora:</strong> {info.time}</p>
                    <p><strong>📍 Ubicación:</strong> {info.city}, {info.country}</p>
                    <p><strong>🎯 Precisión:</strong> {info.accuracy}</p>
                    <p><strong>📡 Fuente:</strong> {info.source}</p>
                    <p><strong>🌐 Coordenadas:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {locations.length === 0 && !loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
          zIndex={1000}
        >
          <Alert severity="info">
            No hay ubicaciones para mostrar. Selecciona una máquina o ajusta los filtros.
          </Alert>
        </Box>
      )}
    </Box>
  )
}

export default LocationMap