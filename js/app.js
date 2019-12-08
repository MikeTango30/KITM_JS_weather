'use strict';
import moment from "moment/moment";

import(moment());
    console.log(moment().format('2015-12-20'));
(function () {
    const PLACES_URL = 'https://api.meteo.lt/v1/places';
    const URL_SEPARATOR = '/';
    const FORECAST_URL_ENDING = 'forecasts/long-term';
    const DEFAULT_PLACE = 'kaunas';
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    //classes
    // const weekday = 'weekday';
    // const row = 'row';
    // const justifyContentStart = 'justify-content-start';
    // const col = 'col';
    // const date = 'date';

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
    const degreeSymbol = '<i class="wi wi-degrees"></i>';

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

    //wind icons. {} degree placeholder
    // "wi wi-wind wi-from-{0}-deg"

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

    //Data and manipulation
    async function getData(place) {
        let response = await fetch(PLACES_URL + URL_SEPARATOR + place + URL_SEPARATOR + FORECAST_URL_ENDING);

        return await response.json();
    }

    async function filterDataByDate(data, date) {
        return data['forecastTimestamps'].filter(item => new Date(item['forecastTimeUtc']).getDate() === date);
    }

    async function getMinTemp(dayData) {
        return Math.round(Math.min(dayData
            .map(data => data['airTemperature'])
            .sort((a, b) => a - b)[0]));
    }

    async function getMaxTemp(dayData) {
        return Math.round(Math.min(dayData
            .map(data => data['airTemperature'])
            .sort((a, b) => b - a)[0]));
    }

    async function createHtmlWeekdays(minMaxTempByDate, hourTime, today=false, focused=false) {
        const weekdays = document.querySelector('.weekdays');
        const divWeekday = document.createElement('div');
        divWeekday.classList.add('weekday');
        today ? divWeekday.classList.add('today') : divWeekday.classList.add('other-day');
        if (focused) {
            divWeekday.classList.add('focused')
        }
        //first row of weekday
        const divRowDate = document.createElement('div');
        divRowDate.classList.add('row', 'justify-content-start');
        const divDate = document.createElement('div');
        divDate.classList.add('col', 'date');
        const spanDate = document.createElement('span');

        divDate.textContent = WEEKDAYS[hourTime.getDay()] + ' ';
        spanDate.textContent = minMaxTempByDate.date;

        divDate.append(spanDate);
        divRowDate.append(divDate);
        divWeekday.append(divRowDate);

        //second row of weekday
        const divRowIconTemp = document.createElement('div');
        divRowIconTemp.classList.add('row');
        const divColIconTemp = document.createElement('div');
        divColIconTemp.classList.add('col', 'icon-temp');
        const divRowLine = document.createElement('div');
        divRowLine.classList.add('row', 'line');
        const divColIcon = document.createElement('div');
        divColIcon.classList.add('col-6', 'icon');

        divColIcon.innerHTML = weatherIcons.day.lightRain; //hardcoded

        divRowLine.append(divColIcon);

        const divColTemp = document.createElement('div');
        divColTemp.classList.add('col-6', 'temp');
        const divRowMaxTemp = document.createElement('div');
        divRowMaxTemp.classList.add('row');
        const divColMaxTemp = document.createElement('div');
        divColMaxTemp.classList.add('col', 'max-temp');

        divColMaxTemp.innerHTML = minMaxTempByDate.maxTemperature + degreeSymbol;

        divRowMaxTemp.append(divColMaxTemp);
        divColTemp.append(divRowMaxTemp);

        const divRowMinTemp = document.createElement('div');
        divRowMinTemp.classList.add('row');
        const divColMinTemp = document.createElement('div');
        divColMinTemp.classList.add('col', 'min-temp');

        divColMinTemp.innerHTML = minMaxTempByDate.minTemperature + degreeSymbol;

        divRowMinTemp.append(divColMinTemp);
        divColTemp.append(divRowMinTemp);

        divRowLine.append(divColTemp);
        divColIconTemp.append(divRowLine);
        divRowIconTemp.append(divColIconTemp);
        divWeekday.append(divRowIconTemp);

        weekdays.append(divWeekday);
    }

    async function createHtmlHourly(dayData) {
        // code - vietovės kodas.
        // name - vietovės pavadinimas.
        // coordinates - vietovės koordinatės (WGS 84 dešimtainiais laipsniais).
        // airTemperature - oro temperatūra, °C.
        // windSpeed - vėjo greitis, m/s.
        // windDirection - vėjo kryptis, °. Reikšmės: 0 - iš šiaurės, 180 - iš pietų ir t. t.
        // cloudCover - debesuotumas, %. Reikšmės: 100 - debesuota, 0 - giedra.
        // totalPrecipitation - kritulių kiekis, mm.
        const hours = document.querySelector('.hours');
        const divHour = document.createElement('div');
        divHour.classList.add('hour');
        const divRowTime = document.createElement('div');
        divRowTime.classList.add('row');
        divRowTime.textCotcntent = dayData['forecastTimeUtc'].ge;

    }

    (async function showData() {
        const data = await getData(DEFAULT_PLACE);

        //initial date
        let initialTime = new Date(data['forecastTimestamps'][0]['forecastTimeUtc']);
        let year = initialTime.getFullYear();
        let month = initialTime.getMonth();
        let day = initialTime.getDate();

        let minMaxTempByDate = {};
        let dayData = null;
        let dayTime = null;

        for (let hour of data['forecastTimestamps']) {
            if (!dayTime) {
                let hourTime = new Date(hour['forecastTimeUtc'])
                dayTime = hourTime.getDate();
                dayData = await filterDataByDate(data, dayTime);

                minMaxTempByDate.date = dayTime;
                minMaxTempByDate.minTemperature = await getMinTemp(dayData);
                minMaxTempByDate.maxTemperature = await getMaxTemp(dayData);
                await createHtmlWeekdays(minMaxTempByDate, hourTime); //TODO pass params for today & focused classes

            }
            //check for next day
            dayTime = new Date(hour['forecastTimeUtc']).getDate();
            if (year + month + dayTime > year + month + day) {
                day = dayTime;
                dayTime = null;
                dayData = null;
            }
        }

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
    //                 const headerCity = document.querySelector('.city');    const DEFAULT_PLACE = 'kaunas';

    // code - vietovės kodas.
    // name - vietovės pavadinimas.
    // coordinates - vietovės koordinatės (WGS 84 dešimtainiais laipsniais).
    // airTemperature - oro temperatūra, °C.
    // windSpeed - vėjo greitis, m/s.
    // windDirection - vėjo kryptis, °. Reikšmės: 0 - iš šiaurės, 180 - iš pietų ir t. t.
    // cloudCover - debesuotumas, %. Reikšmės: 100 - debesuota, 0 - giedra.
    // totalPrecipitation - kritulių kiekis, mm.

    //                 headerCity.innerText = placesDataPart.name;
    //                 let response = await fetch(PLACES_URL + URL_SEPARATOR + place + URL_SEPARATOR + FORECAST_URL_ENDING);
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