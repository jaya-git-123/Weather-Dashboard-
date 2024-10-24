import React, { useState, useEffect, useRef } from 'react';
import '../components/Weather.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

const API_KEY = '2fad74992ca6310d7e48065623594c3c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function WeatherDashboard() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const fetchWeather = async () => {
    try {
      const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeather(data);
      setError('');
      updateMap(data.coord.lon, data.coord.lat);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
    }
  };
  const fetchForecast = async () => {
    try {
      const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
      if (!response.ok) throw new Error('Forecast not available');
      const data = await response.json();
      setForecast(data.list.filter((_, index) => index % 8 === 0)); // Get data for every 24 hours
      setError('');
    } catch (err) {
      setError('Failed to fetch forecast data. Please try again.');
      setForecast(null);
    }
  };
  useEffect(() => {
    if (city) {
      fetchWeather();
      fetchForecast();
    }
  }, [city]);
  useEffect(() => {
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
      }
    };
  }, []);
  const updateMap = (lon, lat) => {
    if (mapInstance.current) {
      mapInstance.current.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: 10,
        duration: 1000,
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const searchCity = e.target.elements.cityInput.value;
    setCity(searchCity);
  };
  return (
    <div className="weather-dashboard">
      <h1>Weather Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="cityInput"
          placeholder="Enter city name"
          aria-label="Enter city name"
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="current-weather">
          <h2>Current Weather in {weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Feels like: {weather.main.feels_like}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p>{weather.weather[0].description}</p>
        </div>
      )}
      {forecast && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt={day.weather[0].description}
                />
                <p>{day.main.temp}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="weather-map">
        <h2>Weather Map</h2>
        <div ref={mapRef} className="map-container"></div>
      </div>
    </div>
  );
}

// finished..
