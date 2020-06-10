class tempHistoryChart {
    constructor(sensors, weather,date) {
        this.sensorLabels = [];
        this.tempData = [];
        this.humidityData = [];
        this.weatherTempData = [];
        this.weatherHumData = [];
        this.date = date

        for (let k in sensors) {
            this.sensorLabels.push(sensors[k][2].timestamp);
            this.tempData.push(sensors[k][1].temp);
            this.humidityData.push(sensors[k][1].humidity);
        }

        for (let k in weather) {
            this.weatherTempData.push(Math.round(weather[k][0].main.temp));
            this.weatherHumData.push(Math.round(weather[k][0].main.humidity));
        }
    }
}

module.exports = tempHistoryChart;
