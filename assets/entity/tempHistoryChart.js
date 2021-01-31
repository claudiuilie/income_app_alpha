class tempHistoryChart {
    constructor(sensors,date) {
        this.sensorLabels = [];
        this.tempData = [];
        this.humidityData = [];
        this.soilMoistureData = [];
        this.date = date
        
        for (let k in sensors) {            
            this.sensorLabels.push(new Date(sensors[k].modified).toLocaleTimeString());
            this.tempData.push(sensors[k].temperature);
            this.humidityData.push(sensors[k].humidity);
            this.soilMoistureData.push(sensors[k].soil_moisture);

        }
    }
}

module.exports = tempHistoryChart;
