// src/scripts/config.js
const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  // Pakai OpenStreetMap (no API key needed) untuk simplicity
  MAP_TILE_LAYERS: {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  }
};

export default CONFIG;