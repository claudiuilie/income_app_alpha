class DateAndTime {
    constructor(){
        this.date = new Date();
    }

    getYear() {
        return this.date.getFullYear();
    }

    getMonth() {
        return this.date.getMonth()+1;
    }

    getDay() {
        return this.date.getDate();
    }

    getHours() {
        return this.date.getHours();
    }

    getTimestamp() {
        return this.date.toLocaleTimeString();
    }

    getCurrentDate() {
        return `${this.getYear()}-${this.getMonth()}-${this.getDay()}`
    }

    getLocalDateString() {
        return this.date.toLocaleDateString();
    }

    revertCurrentDate() {
        return `${this.getMonth()}/${this.getDay()}/${this.getYear()}`
    }
}

module.exports = DateAndTime;