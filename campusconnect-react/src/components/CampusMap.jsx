import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite doesn't resolve Leaflet's default marker image paths automatically —
// point them at the bundled assets once, up front.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const CAMPUS_LAYOUT = [
  { id: 'gate', name: 'Main Gate', badge: 'Entrance', latOff: -0.0028, lngOff: -0.0012, description: 'Main entrance and security checkpoint of the campus.' },
  { id: 'admin', name: 'Administration Building', badge: 'Offices', latOff: -0.0012, lngOff: -0.0003, description: 'Admissions, registrar office, student affairs, and central administration.' },
  { id: 'library', name: 'Library', badge: 'Academic', latOff: 0.0007, lngOff: -0.0018, description: 'Central library with study spaces, digital archives, and academic resources.' },
  { id: 'lab', name: 'Computer Lab', badge: 'Tech & Dev', latOff: 0.0018, lngOff: 0.0007, description: 'High-tech computer lab with programming and development setups.' },
  { id: 'auditorium', name: 'Auditorium', badge: 'Events', latOff: -0.0004, lngOff: 0.0027, description: 'Main campus auditorium for events, seminars, conferences, and cultural fests.' },
  { id: 'canteen', name: 'Canteen', badge: 'Dining', latOff: 0.0011, lngOff: 0.0032, description: 'Campus cafeteria offering meals, snacks, beverages, and student social spaces.' },
  { id: 'hostel', name: 'Hostel', badge: 'Residence', latOff: 0.0036, lngOff: -0.0008, description: 'Student residential campus and living quarters.' },
  { id: 'sports', name: 'Sports Ground', badge: 'Athletics', latOff: 0.0031, lngOff: 0.0042, description: 'Outdoor sports complex for football, cricket, track and field athletics.' },
]

const CHIPS = [
  { id: 'user', label: '📍 My Current Location', live: true },
  { id: 'all', label: 'All Campus Locations' },
  ...CAMPUS_LAYOUT.map((l) => ({ id: l.id, label: l.name })),
]

export default function CampusMap() {
  const mapElRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const markerGroupRef = useRef(null)
  const userMarkerRef = useRef(null)
  const userCircleRef = useRef(null)
  const activeChipRef = useRef('all')
  const chipRefs = useRef({})

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return

    let defaultCenter = [23.1539, 72.5446]
    const map = L.map(mapElRef.current, {
      center: defaultCenter,
      zoom: 16,
      scrollWheelZoom: false,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map)

    const userIcon = L.divIcon({
      className: 'user-location-custom-icon',
      html: '<div class="user-location-marker"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })

    const markerGroup = L.featureGroup()
    markerGroupRef.current = markerGroup

    function renderCampusMarkers(centerCoords) {
      Object.values(markersRef.current).forEach((m) => map.removeLayer(m.marker))
      markersRef.current = {}
      markerGroup.clearLayers()

      CAMPUS_LAYOUT.forEach((loc) => {
        const coords = [centerCoords[0] + loc.latOff, centerCoords[1] + loc.lngOff]
        const marker = L.marker(coords).addTo(map)
        marker.bindPopup(`
          <div>
            <span class="map-popup-badge">${loc.badge}</span>
            <h4 class="map-popup-title">${loc.name}</h4>
            <p class="map-popup-desc">${loc.description}</p>
          </div>
        `)
        markersRef.current[loc.id] = { marker, coords, data: loc }
        markerGroup.addLayer(marker)
      })

      if (userMarkerRef.current) markerGroup.addLayer(userMarkerRef.current)
    }

    renderCampusMarkers(defaultCenter)
    map.fitBounds(markerGroup.getBounds().pad(0.12))

    function updateUserLocation(shouldPan) {
      if (!navigator.geolocation) {
        if (shouldPan) alert('Geolocation is not supported by your browser.')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude]
          const accuracy = position.coords.accuracy

          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
          if (userCircleRef.current) map.removeLayer(userCircleRef.current)

          userCircleRef.current = L.circle(userCoords, {
            radius: Math.min(accuracy, 250),
            color: '#0070f3',
            fillColor: '#0070f3',
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(map)

          userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(map)
          userMarkerRef.current.bindPopup(`
            <div>
              <span class="map-popup-badge" style="background:#0070f3;">Live Location</span>
              <h4 class="map-popup-title">📍 Your Current Location</h4>
              <p class="map-popup-desc">You are currently at this location.</p>
              <p style="margin:5px 0 0; font-size:11px; color:#777;">Lat: ${userCoords[0].toFixed(5)}, Lng: ${userCoords[1].toFixed(5)}</p>
            </div>
          `)

          renderCampusMarkers(userCoords)

          if (shouldPan) {
            map.flyTo(userCoords, 16, { animate: true, duration: 1.2 })
            setTimeout(() => userMarkerRef.current && userMarkerRef.current.openPopup(), 700)
          }
        },
        (error) => {
          console.warn('Geolocation access:', error.message)
          if (shouldPan) alert('Could not retrieve your location. Please allow location permissions in your browser.')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }

    updateUserLocation(true)

    // expose a small controller on the ref so the chip buttons (regular React
    // event handlers) can drive the imperative Leaflet map.
    mapRef.current.__controller = {
      focusAll: () => {
        map.fitBounds(markerGroup.getBounds().pad(0.12), { animate: true })
        map.closePopup()
      },
      focusUser: () => updateUserLocation(true),
      focusLocation: (id) => {
        const target = markersRef.current[id]
        if (!target) return
        map.flyTo(target.coords, 17, { animate: true, duration: 1.2 })
        setTimeout(() => target.marker.openPopup(), 600)
      },
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  function handleChip(id) {
    activeChipRef.current = id
    Object.entries(chipRefs.current).forEach(([chipId, el]) => {
      if (el) el.classList.toggle('active', chipId === id)
    })
    const controller = mapRef.current && mapRef.current.__controller
    if (!controller) return
    if (id === 'user') controller.focusUser()
    else if (id === 'all') controller.focusAll()
    else controller.focusLocation(id)
  }

  return (
    <section className="campus-map-section" id="campus-map">
      <h2>Explore Your Campus</h2>
      <p className="map-description">Find important campus locations and navigate your way around.</p>

      <div className="map-chips-container" id="mapChips">
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            ref={(el) => { chipRefs.current[chip.id] = el }}
            type="button"
            className={`map-chip${chip.live ? ' live-loc-chip' : ''}${chip.id === 'all' ? ' active' : ''}`}
            onClick={() => handleChip(chip.id)}
          >
            {chip.live && <span className="live-dot" />} {chip.label}
          </button>
        ))}
      </div>

      <div ref={mapElRef} id="campusMap" className="campus-map-container" aria-label="Interactive Campus Map" />
    </section>
  )
}
