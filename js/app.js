'use strict';


(function () {
    const PLACES_URL = 'https://api.meteo.lt/v1/places';
    const URL_SEPARATOR = '/';
    const FORECAST_URL_ENDING = '/forecasts/long-term';
    const DEFAULT_PLACE = 'kaunas';

    // code - vietovės kodas.
    // name - vietovės pavadinimas.
    // coordinates - vietovės koordinatės (WGS 84 dešimtainiais laipsniais).
    // airTemperature - oro temperatūra, °C.
    // windSpeed - vėjo greitis, m/s.
    // windDirection - vėjo kryptis, °. Reikšmės: 0 - iš šiaurės, 180 - iš pietų ir t. t.
    // cloudCover - debesuotumas, %. Reikšmės: 100 - debesuota, 0 - giedra.
    // totalPrecipitation - kritulių kiekis, mm.


    // classes according to conditionCode - oro sąlygos, kodas:
    const conClear = 'clear';
    const conIsolatedClouds = 'isolated-clouds';
    const conScatteredClouds = 'scattered-clouds';
    const conOvercast = 'overcast';
    const conLightRain = 'light-rain';
    const conModerateRain = 'moderate-rain';
    const conHeavyRain = 'heavy-rain';
    const conSleet = 'sleet';
    const conLightSnow = 'light-snow';
    const conModerateSnow = 'moderate-snow';
    const conHeavySnow = 'heavy-snow';
    const conFog = 'fog';
    const conNa = 'na';

    let weatherIcons = {
        day:
            {
                clear: '<i class="wi wi-day-sunny"></i>',
                isolatedClouds: '<i class="wi wi-day-sunny"></i>',
                scatteredClouds: '<i class="wi wi-day-cloudy"></i>',
                overcast: '<i class="wi wi-cloudy"></i>',
                lightRain: '<i class="wi wi-day-sprinkle"></i>',
                moderateRain: '<i class="wi wi-day-showers"></i>',
                heavyRain: '<i class="wi wi-day-rain"></i>',
                sleet: '<i class="wi wi-day-sleet"></i>',
                lightSnow: '<i class="wi wi-day-snow"></i>',
                moderateSnow: '<i class="wi wi-day-snow-wind"></i>',
                heavySnow: '<i class="wi wi-day-snow-thunderstorm"></i>',
                fog: '<i class="wi wi-day-fog"></i>',
                na: '<i class="wi wi-na"></i>'
            },
        night:
            {
                clear: '<i class="wi wi-night-clear"></i>',
                isolatedClouds: '<i class="wi wi-night-alt-partly-cloudy"></i>',
                scatteredClouds: '<i class="wi wi-night-alt-cloudy"></i>',
                overcast: '<i class="wi wi-cloudy"></i>',
                lightRain: '<i class="wi wi-night-alt-sprinkle"></i>',
                moderateRain: '<i class="wi wi-night-alt-showers"></i>',
                heavyRain: '<i class="wi wi-night-alt-rain"></i>',
                sleet: '<i class="wi wi-night-alt-sleet"></i>',
                lightSnow: '<i class="wi wi-night-alt-snow"></i>',
                moderateSnow: '<i class="wi wi-night-alt-snow-wind"></i>',
                heavySnow: '<i class="wi wi-night-alt-snow-thunderstorm"></i>',
                fog: '<i class="wi wi-night-alt-fog"></i>',
                na: '<i class="wi wi-na"></i>'
            }
    };
    // "wi wi-wind wi-from-0-deg"

    // Toggle active day
    const weekdays = document.querySelectorAll('.weekday');
    for (let weekday of weekdays) {
        weekday.addEventListener('click', function () {
            const days = document.querySelectorAll('.weekday');
            document.querySelector('.focused').querySelector('.weather-info').classList.add('d-none');
            document.querySelector('.focused').querySelector('.icon-temp').classList.remove('col-5');
            document.querySelector('.focused').querySelector('.icon-temp').classList.add('col');
            document.querySelector('.focused').querySelector('.line').classList.remove('line-separator-right');
            for (let day of days) {
                day.classList.remove('focused');
            }
            weekday.classList.add('focused');
            document.querySelector('.focused').querySelector('.line').classList.add('line-separator-right');
            document.querySelector('.focused').querySelector('.weather-info').classList.remove('d-none');
            document.querySelector('.focused').querySelector('.weather-info').classList.add('col-7');
            document.querySelector('.focused').querySelector('.icon-temp').classList.remove('col');
            document.querySelector('.focused').querySelector('.icon-temp').classList.add('col-5');
        })
    }

    // current coords
    let locationCoordinates = {};
    navigator.geolocation.getCurrentPosition(function (position) {
        locationCoordinates.latitude = position.coords.latitude;
        locationCoordinates.longitude = position.coords.longitude;
    });

    async function getData(place) {
        let response = await fetch(PLACES_URL + URL_SEPARATOR + place + FORECAST_URL_ENDING);

        return await response.json();
    }

    function aggregateDataByDay(data) {
        for (let item of data) {

        }
    }

    (async function showData() {
        let dayWeather = {
            forecastTimeUtc: null,
            airTemperature: null,
            // windSpeed: null,
            // windGust: null,
            // windDirection: null,
            // cloudCover:null,
            // seaLevelPressure:null,
            // totalPrecipitation:null,
            // conditionCode:null,
    };

        const data = await getData(DEFAULT_PLACE);
        let date = new Date(data['forecastTimestamps'][0]['forecastTimeUtc']).getDate();
        let dayData = data['forecastTimestamps'].filter(item => new Date(item['forecastTimeUtc']).getDate() === date);
        let dayAverages = {};
        for (let hour of dayData) {
            dayAverages.airTemperature = await dayData.reduce((sum, current) => sum + current['airTemperature'], 0) / dayData.length;
            dayAverages.
        }
        console.log(dayAverages)
        // const tempAvg = await temp.reduce((sum, temp) => sum + temp['airTemperature'], 0) / temp.length;
        //console.log(tempAvg);
        // let i = 0;

        // for (let hour of data['forecastTimestamps']) {
        //     if (new Date(hour['forecastTimeUtc']).getDate() === day) {
        //         dayWeather.forecastTimeUtc = hour['forecastTimeUtc'];
        //         dayWeather.airTemperature += hour['airTemperature'];
        //         i++;
        //     } else if (new Date(hour['forecastTimeUtc']).getDate() != day) {
        //         temp.push(dayWeather);
        //     }
        //     day = new Date(hour['forecastTimeUtc']).getDate();
        // }
        // console.log(dayWeather.airTemperature/i
        // ) //vidutine
    })()

    //find city
    // (async function findPlace(searchQuery=null) {
    //     if (!searchQuery) {
    //         searchQuery = 'kaunas';
    //     }
    //     let response = await fetch(PLACES_URL);
    //     let placesData = await response.json();
    //     for (let placesDataPart of placesData) {
    //         if(searchQuery) {
    //             if (placesDataPart.code.toLowerCase() === searchQuery || placesDataPart.name.toLowerCase() === searchQuery) {
    //                 let place = placesDataPart.code;
    //                 const headerCity = document.querySelector('.city');
    //                 headerCity.innerText = placesDataPart.name;
    //                 let response = await fetch(PLACES_URL + URL_SEPARATOR + place + FORECAST_URL_ENDING);
    //                 let forecast = await response.json();
    //
    //                for(let tempHour of forecast['forecastTimestamps']) {
    //                     console.log(tempHour)
    //                 }
    //             }
    //         }
    //     }
    // })()

}());