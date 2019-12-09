'use strict';

(function () {
    const PLACES_URL = 'https://api.meteo.lt/v1/places';
    const URL_SEPARATOR = '/';
    const FORECAST_URL_ENDING = 'forecasts/long-term';
    const DEFAULT_PLACE = 'kaunas';

    let dateTimeFormatWeekday = new Intl.DateTimeFormat('en-Us', {weekday: 'short'});
    let dateTimeFormatHour = new Intl.DateTimeFormat('lt', {hour: 'numeric'});

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

    async function createHtmlWeekdays(minMaxTempByDate, conditionCode, hourTime, today=false, focused=false) {
        const weekdays = document.querySelector('.weekdays');
        const divWeekday = document.createElement('div');
        divWeekday.classList.add('weekday');
        today ? divWeekday.classList.add('today', 'focused') : divWeekday.classList.add('other-day');
        if (focused) {
            divWeekday.classList.add('focused')
        }
        //first row of weekday
        const divRowDate = document.createElement('div');
        divRowDate.classList.add('row', 'justify-content-start');
        const divDate = document.createElement('div');
        divDate.classList.add('col');
        today ? divDate.classList.add('today', 'date') : divDate.classList.add('date');
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

        divColIcon.innerHTML = await getWeatherIcon(conditionCode, true);

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
        divWeatherInfo.textContent = conditionCode.replace('-', ' ');
        divWeatherInfo.setAttribute('style', 'text-transform: capitalize');
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
        let temperatureDiff = Math.round(absoluteTemperatures.max) - Math.round(absoluteTemperatures.min);

        return availableSpace/temperatureDiff;
    }

    async function checkHourForNewDate(time, todayFirstHour=false) {
        const divRowWeekday = document.createElement('div');
        divRowWeekday.classList.add('row', 'hour-weekday');
        if (time.getHours() === 0) {
            divRowWeekday.textContent = dateTimeFormatWeekday.format(time);
        }

        if (todayFirstHour) {
            divRowWeekday.textContent = 'Today';
        }

        return divRowWeekday;
    }

    async function createHtmlHourly(hour, absoluteTemperatures, todayFirstHour=false) {
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
        let positionCompensator = 0;
        if (absoluteTemperatures.min < 0) {
            positionCompensator = (-1) * Math.round(absoluteTemperatures.min);
        }
        let divIconCelsiusPosition = step * (Math.round(hour['airTemperature']) + positionCompensator);
        divIconCelsius.setAttribute('style', 'bottom: ' + divIconCelsiusPosition + 'px');

        const divRowIcon = document.createElement('div');
        divRowIcon.classList.add('row');
        //Hourly Icon
        let hourTime = new Date(hour['forecastTimeUtc']).getHours();
        let timeOfDay = !(hourTime > 21 && hourTime < 6);
        divRowIcon.innerHTML = await getWeatherIcon(hour['conditionCode'], timeOfDay);

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

        let time = new Date(hour['forecastTimeUtc']);
        let newDayName = todayFirstHour ? await checkHourForNewDate(time, true) : await checkHourForNewDate(time);

        divHour.append(divRowTime, newDayName, divIconCelsius, divRowIconRainfallWind);

        hours.append(divHour);
    }

    //generate data and weather content
    async function showData(place=DEFAULT_PLACE, name=DEFAULT_PLACE) {
        const data = await getData(place);
        const headerCity = document.querySelector('.city');
        headerCity.textContent = name.toUpperCase();

        //initial date
        let initialTime = new Date(data['forecastTimestamps'][0]['forecastTimeUtc']);
        let year = initialTime.getFullYear();
        let month = initialTime.getMonth();
        let day = initialTime.getDate();
        let firstHour = initialTime.getHours();
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
                let conditionCode = hour['conditionCode'];

                await createHtmlWeekdays(minMaxTempByDate, conditionCode, hourTime, firstDay);
                firstDay = false;
            }
            if (new Date(hour['forecastTimeUtc']).getHours() === firstHour) {
                await createHtmlHourly(hour, absoluteTemperatures, true);
                firstHour = null;
            } else {
                await createHtmlHourly(hour, absoluteTemperatures);
            }

            //check if next day
            dayTime = new Date(hour['forecastTimeUtc']).getDate();
            if (year + month + dayTime > year + month + day) {
                day = dayTime;
                dayTime = null;
                dayData = null;
            }
        }
        addWeekdayEventListeners();

    }

    // Toggle active day
    function addWeekdayEventListeners() {
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

                const day = weekday.querySelector('.date').textContent;

                const hourOfDate = document.querySelectorAll('.hour-weekday');
                for(let hour of hourOfDate) {
                    if (hour.textContent === day.split(' ', 1).toString()){
                        hour.scrollIntoView({behavior: "smooth", block: "end", inline: "start"});
                    }
                }
            })
        }
    }

    //TODO search
    //find city
    async function findPlace(searchQuery=null) {
        const headerCity = document.querySelector('.city');
        let response = await fetch(PLACES_URL);
        let placesData = await response.json();
        for (let placesDataPart of placesData) {
            if(searchQuery) {
                if (placesDataPart.code.toLowerCase() === searchQuery || placesDataPart.name.toLowerCase() === searchQuery) {
                    let place = placesDataPart.code;
                    let name = placesDataPart.name;
                    await showData(place, name);
                }
            }
        }
    }

    (async function() {
        await showData();
    })();

// TODO: fix search
        const searchInput = document.querySelector('.search-city');
        const searchResults = document.querySelector('.search-results');

        searchInput.addEventListener('input', async e => {
            let target = e.target;
            let searchQuery = target.value;
            const weekdays = document.querySelector('.weekdays');
            const hours = document.querySelector('.hours');
            weekdays.innerHTML = null;
            hours.innerHTML = null;
            await findPlace(searchQuery);
        });
}());