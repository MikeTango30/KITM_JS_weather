'use strict';

// let date = new Date(2015, 12, 12, 23, 23, 12);
// let options = { hour: 'numeric' }
// console.log(date.toLocaleDateString('lt', options));
(function () {
    const PLACES_URL = 'https://api.meteo.lt/v1/places';
    const URL_SEPARATOR = '/';
    const FORECAST_URL_ENDING = 'forecasts/long-term';
    const DEFAULT_PLACE = 'kaunas';

    let dateTimeFormatWeekday = new Intl.DateTimeFormat('en-Us', {weekday: 'short'});
    let dateTimeFormatHour = new Intl.DateTimeFormat('lt', {hour: 'numeric'});



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
                fog: '<i class="wi wi-day-fog"></i>'
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
                fog: '<i class="wi wi-night-alt-fog"></i>'
            },
        other:
            {
                na: '<i class="wi wi-na"></i>',
                degreeSymbol:'<i class="wi wi-degrees"></i>',
                raindropSymbol: '<i class="wi wi-raindrops"></i>'
            }
    };

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
        if (today) {
            divWeekday.classList.add('today', 'focused');
        }
        today ? divWeekday.classList.add('today') : divWeekday.classList.add('other-day');
        if (focused) {
            divWeekday.classList.add('focused')
        }
        //first row of weekday
        const divRowDate = document.createElement('div');
        divRowDate.classList.add('row', 'justify-content-start');
        const divDate = document.createElement('div');
        divDate.classList.add('col');
        today ? divDate.classList.add('today') : divDate.classList.add('date')
        divDate.textContent = 'Today';
        if (!today) {
            const spanDate = document.createElement('span');
            divDate.textContent = dateTimeFormatWeekday.format(hourTime) + ' ';
            spanDate.textContent = minMaxTempByDate.date;
            divDate.append(spanDate);
        }
        divRowDate.append(divDate);
        divWeekday.append(divRowDate);

        //second row of weekday
        const divRowIconTemp = document.createElement('div');
        divRowIconTemp.classList.add('row');
        const divColIconTemp = document.createElement('div');
        divColIconTemp.classList.add('icon-temp');
        today ? divColIconTemp.classList.add('col-5') : divColIconTemp.classList.add('col');
        const divRowLine = document.createElement('div');
        divRowLine.classList.add('row', 'line');
        if (today) {
            divRowLine.classList.add('line-separator-right');
        }
        const divColIcon = document.createElement('div');
        divColIcon.classList.add('col-6', 'icon');

        divColIcon.innerHTML = weatherIcons.day.lightRain; //TODO filter corect icon

        divRowLine.append(divColIcon);

        const divColTemp = document.createElement('div');
        divColTemp.classList.add('col-6', 'temp');
        const divRowMaxTemp = document.createElement('div');
        divRowMaxTemp.classList.add('row');
        const divColMaxTemp = document.createElement('div');
        divColMaxTemp.classList.add('col', 'max-temp');

        divColMaxTemp.innerHTML = minMaxTempByDate.maxTemperature + weatherIcons.other.degreeSymbol;

        divRowMaxTemp.append(divColMaxTemp);
        divColTemp.append(divRowMaxTemp);

        const divRowMinTemp = document.createElement('div');
        divRowMinTemp.classList.add('row');
        const divColMinTemp = document.createElement('div');
        divColMinTemp.classList.add('col', 'min-temp');

        divColMinTemp.innerHTML = minMaxTempByDate.minTemperature + weatherIcons.other.degreeSymbol;

        divRowMinTemp.append(divColMinTemp);
        divColTemp.append(divRowMinTemp);

        divRowLine.append(divColTemp);
        divColIconTemp.append(divRowLine);
        divRowIconTemp.append(divColIconTemp);

        const divWeatherInfo = document.createElement('div');
        divWeatherInfo.classList.add('col-7', 'weather-info');
        if (!today) {
            divWeatherInfo.classList.add('d-none');
        }
        divWeatherInfo.textContent = 'Cloudy with a chance of Meatballs'; //TODO text?
        divRowIconTemp.append(divWeatherInfo);
        divWeekday.append(divRowIconTemp);

        weekdays.append(divWeekday);
    }

    // switch weather icon
    async function getWeatherIcon(conditionCode, day = false) {
        let timeOfDay = day ? weatherIcons.day : weatherIcons.night;
        switch (conditionCode) {
            case (conClear):
                return timeOfDay.clear;
            case (conIsolatedClouds):
                return timeOfDay.isolatedClouds;
            case (conScatteredClouds):
                return timeOfDay.scatteredClouds;
            case (conOvercast):
                return timeOfDay.overcast;
            case (conLightRain):
                return timeOfDay.lightRain;
            case (conModerateRain):
                return timeOfDay.moderateRain;
            case (conHeavyRain):
                return timeOfDay.heavyRain;
            case (conSleet):
                return timeOfDay.sleet;
            case (conLightSnow):
                return timeOfDay.lightSnow;
            case (conModerateSnow):
                return timeOfDay.moderateSnow;
            case (conHeavySnow):
                return timeOfDay.heavySnow;
            case (conFog):
                return timeOfDay.fog;
            default:
                return weatherIcons.other.na;
        }
    }

    async function getWind(degrees){
        return "<i class=\"wi wi-wind from-" + degrees + "-deg\"></i>"
    }

    async function getIconCelsiusPositionStep(absoluteTemperatures) {
        let availableSpace = 140;
        let temperatureDiff = absoluteTemperatures.max - absoluteTemperatures.min;

        return availableSpace/temperatureDiff;
    }

    async function createHtmlHourly(hour, absoluteTemperatures) {
        const hours = document.querySelector('.hours');
        const divHour = document.createElement('div');
        divHour.classList.add('hour');

        const divRowTime = document.createElement('div');
        divRowTime.classList.add('row');
        divRowTime.textContent = dateTimeFormatHour.format(new Date(hour['forecastTimeUtc'])) + ':00';

        const divIconCelsius = document.createElement('div');
        divIconCelsius.classList.add('row', 'icon-celsius');
        //Hourly Icon & Celsius position
        let step = await getIconCelsiusPositionStep(absoluteTemperatures);
        let divIconCelsiusPosition = step * hour['airTemperature'];
        divIconCelsius.setAttribute('style', 'bottom: ' + divIconCelsiusPosition + 'px');

        const divRowIcon = document.createElement('div');
        divRowIcon.classList.add('row');
        //Hourly Icon
        let hourTime = new Date(hour['forecastTimeUtc']).getHours();
        let timeOfDay = !(hourTime > 21 && hourTime < 6);
        divRowIcon.innerHTML = await getWeatherIcon(hour['conditionCode'], timeOfDay);

        let time = new Date(hour['forecastTimeUtc']);
        async function checkHourForNewDate(time) {
            const divRowWeekday = document.createElement('div');
            divRowWeekday.classList.add('row', 'hour-weekday');
            if (time.getHours() === 0) {
                divRowWeekday.textContent = dateTimeFormatWeekday.format(time);
            }

            return divRowWeekday;
        }

        const divRowDegree = document.createElement('div');
        divRowDegree.classList.add('row');
        divRowDegree.innerHTML = Math.round(hour['airTemperature']) + weatherIcons.other.degreeSymbol;

        divIconCelsius.append(divRowIcon, divRowDegree);

        const divRowIconRainfallWind = document.createElement('div');
        divRowIconRainfallWind.classList.add('row', 'icon-rainfall-wind');
        const divRowRainfall = document.createElement('div');
        divRowRainfall.classList.add('row');
        divRowRainfall.innerHTML = weatherIcons.other.raindropSymbol;
        const divRowPrecipitation = document.createElement('div');
        divRowPrecipitation.classList.add('row');
        divRowPrecipitation.textContent = hour['totalPrecipitation'] + ' mm';
        const divRowWind = document.createElement('div');
        divRowWind.classList.add('row');
        divRowWind.innerHTML = await getWind(hour['windDirection']);
        const divRowWindSpeed = document.createElement('div');
        divRowWindSpeed.classList.add('row');
        divRowWindSpeed.textContent =  hour['windSpeed'] + 'm/s';

        divRowIconRainfallWind.append(divRowRainfall, divRowPrecipitation, divRowWind, divRowWindSpeed);

        divHour.append(divRowTime, await checkHourForNewDate(time), divIconCelsius, divRowIconRainfallWind);

        hours.append(divHour);
    }

    (async function showData() {
        const data = await getData(DEFAULT_PLACE);

        //initial date
        let initialTime = new Date(data['forecastTimestamps'][0]['forecastTimeUtc']);
        let year = initialTime.getFullYear();
        let month = initialTime.getMonth();
        let day = initialTime.getDate();
        let absoluteTemperatures = {};
        absoluteTemperatures.max = await getMaxTemp(data['forecastTimestamps']);
        absoluteTemperatures.min = await getMinTemp(data['forecastTimestamps']);

        let minMaxTempByDate = {};
        let dayData = null;
        let dayTime = null;
        let firstDay = true;
        for (let hour of data['forecastTimestamps']) {
            if (!dayTime) {
                let hourTime = new Date(hour['forecastTimeUtc']);
                dayTime = hourTime.getDate();
                dayData = await filterDataByDate(data, dayTime);

                minMaxTempByDate.date = dayTime;
                minMaxTempByDate.minTemperature = await getMinTemp(dayData);
                minMaxTempByDate.maxTemperature = await getMaxTemp(dayData);

                await createHtmlWeekdays(minMaxTempByDate, hourTime, firstDay);
                firstDay = false;
            }
            await createHtmlHourly(hour, absoluteTemperatures);

            //check if next day
            dayTime = new Date(hour['forecastTimeUtc']).getDate();
            if (year + month + dayTime > year + month + day) {
                day = dayTime;
                dayTime = null;
                dayData = null;
            }
        }
        addToggleActiveDayEvents();

    })();


    // Toggle active day
    function addToggleActiveDayEvents() {
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
    }
    //TODO change hourly data relative to focused weekday
    //TODO search
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