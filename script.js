// Initialize Map
const map = L.map("map").setView([13.3409, 74.7421], 13);

// Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Search Elements
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const placesList = document.getElementById("placesList");

// Custom cafe icon
const cafeIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/415/415733.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

// Search City + Load Cafes
searchBtn.addEventListener("click", async () => {
  const city = searchBox.value.trim();
  if (!city) return alert("Enter a city name");

  // Geocode city
  const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.length) return alert("City not found!");

  const { lat, lon } = geoData[0];
  map.setView([lat, lon], 14);

  // Clear old data
  placesList.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  // Fetch cafes from Overpass API
  const query = `
    [out:json];
    node["amenity"="cafe"](around:5000,${lat},${lon});
    out;
  `;
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const cafeRes = await fetch(overpassUrl, {
    method: "POST",
    body: query
  });
  const cafeData = await cafeRes.json();

  if (!cafeData.elements.length) {
    placesList.innerHTML = "<li>No cafes found</li>";
    return;
  }

  cafeData.elements.forEach(cafe => {
    const name = cafe.tags.name || "Unnamed Cafe";
    const marker = L.marker([cafe.lat, cafe.lon], { icon: cafeIcon }).addTo(map);
    marker.bindPopup(`<b>${name}</b>`);

    addPlaceToList(name, cafe.lat, cafe.lon, marker);
    markers.push(marker);
  });
});

let markers = [];

// Add cafe to sidebar list
function addPlaceToList(name, lat, lon, marker) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${name}</strong><span>📍 Tap to view on map</span>`;
  
  li.addEventListener("click", () => {
    map.setView([lat, lon], 18);
    marker.openPopup();
    marker.setBouncingOptions({ bounceHeight: 15, bounceSpeed: 60 }).bounce();
  });

  placesList.appendChild(li);
}
