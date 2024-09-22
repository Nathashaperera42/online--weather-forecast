const apiKey = 'f0fdcfda4f8d42af873140609241209';
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const cityInput = document.getElementById("city-input");
const dateInput = document.getElementById("date-input");
const historyButton = document.getElementById("history-button");

let map, marker;


window.onload = function () {
    map = L.map('map').setView([20, 0], 2); 
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
};



searchButton.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeatherData(city);
        updateMap(city); 
        
        
    } else {
        alert("Please enter a city or country name");
    }
});


locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByLocation(latitude, longitude);
            updateMapByLocation(latitude, longitude); 
            
        }, (error) => {
            alert('Unable to retrieve location. Please check your permissions or try again.');
            console.error('Geolocation error:', error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

historyButton.addEventListener('click', () => {
    const city = cityInput.value;
    const selectedDate = dateInput.value;

    if (city && selectedDate) {
        fetchWeatherHistory(city, selectedDate);
        updateMap(city); 
        
    } else {
        alert("Please enter a city and select a date.");
    }
});

function fetchWeatherData(city) {
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            const { lat, lon } = data.location; 
            
            updateMapByLocation(lat, lon); 
            
        })
        .catch(error => console.error('Error fetching weather data:', error));

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4`)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast data:', error));
}
function fetchWeatherDataByLocation(lat, lon) {
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => console.error('Error fetching weather data by location:', error));

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=4`)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast data by location:', error));
}


function fetchWeatherHistory(city, date) {
    fetch(`https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${date}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherHistory(data);
            const { lat, lon } = data.location; 
            updateMapByLocation(lat, lon); 
        })
        .catch(error => console.error('Error fetching weather history:', error));
}


function displayCurrentWeather(data) {
    const currentWeather = data.current;
    const location = data.location;

    document.getElementById('current-city').textContent = `${location.name}, ${location.region}, ${location.country} (${location.localtime})`;
    document.getElementById('current-temperature').textContent = `Temperature: ${currentWeather.temp_c}°C`;
    document.getElementById('current-wind').textContent = `Wind: ${currentWeather.wind_kph} KPH`;
    document.getElementById('current-humidity').textContent = `Humidity: ${currentWeather.humidity}%`;
    document.getElementById('weather-icon').src = currentWeather.condition.icon;
    document.getElementById('weather-description').textContent = currentWeather.condition.text;
}

function displayWeatherHistory(data) {
    const historyWeatherDiv = document.getElementById('history-weather');
    historyWeatherDiv.innerHTML = ''; 

    const historyWeather = data.forecast.forecastday[0];

    const historyDiv = document.createElement('div');
    historyDiv.classList.add('history-weather');

    historyDiv.innerHTML = `
        <h2 id="history-city">${data.location.name}, ${data.location.region}, ${data.location.country} (${historyWeather.date})</h2>
        <p id="history-temperature">Temperature: ${historyWeather.day.avgtemp_c}°C</p>
        <p id="history-wind">Wind: ${historyWeather.day.maxwind_kph} KPH</p>
        <p id="history-humidity">Humidity: ${historyWeather.day.avghumidity}%</p>
        <div class="history-icon">
            <img id="history-icon" src="${historyWeather.day.condition.icon}" alt="Weather Icon">
            <p id="history-description">${historyWeather.day.condition.text}</p>
        </div>
    `;
    
    historyWeatherDiv.appendChild(historyDiv);
}

function updateMap(city) {
    fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                updateMapByLocation(lat, lon);
            } else {
                alert('City not found on the map');
            }
        })
        .catch(error => console.error('Error fetching city location:', error));
}


function updateMapByLocation(lat, lon) {
    if (marker) {
        map.removeLayer(marker); 
    }
    
    map.setView([lat, lon], 10); 
    marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>Location:</b> ${lat}, ${lon}`).openPopup();
}


function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    data.forecast.forecastday.forEach(forecast => {
        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add('forecast-day');
        forecastDiv.innerHTML = `
            <h4>${forecast.date}</h4>
            <p>Temp: ${forecast.day.avgtemp_c}°C</p>
            <p>Wind: ${forecast.day.maxwind_kph} KPH</p>
            <img src="${forecast.day.condition.icon}" alt="Weather Icon">
            <p>${forecast.day.condition.text}</p>
        `;
        forecastContainer.appendChild(forecastDiv);
    });
}
