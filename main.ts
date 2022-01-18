function logValue(key: string, value: number) {
    if (SERIAL_LOGGING) {
        serial.writeValue(key, value)
    }
}

class CorrectionMap {
    private maxKeys: number;
    private maxEntities: number;
    private map: number[][]; // angle index & values count
    private angleList: number[];
    /**
     * @keys        max number of different angles
     * @entities    max number of all records
     */
    constructor(keys: number, entities: number) {
        this.maxKeys = keys; //unused right now
        this.maxEntities = entities;
        this.reset();
    }
    private isNewAngle(angle: number) {
        return (this.angleList.indexOf(angle) < 0)
    }
    /**
     * Adds angle to history
     */
    addAngle(angle: number) {
        if (this.isNewAngle(angle)) {
            this.map[angle] = [];
            this.map[angle][0] = 0;
            this.angleList.push(angle);
        }
        this.map[angle][0] = this.map[angle][0] + 1;
    }
    private xxx(item: number[], index: number) {

    }
    /**
     * Removes angle from history
     */
    removeAngle(angle: number) {
        console.log("removeAngle(" + angle + ")")
        if (this.isNewAngle(angle)) {
            console.log("remAngle> new angle - this should not happen")
            return false;
        }

        console.log("remAngle(" + angle + ")> subtrackt angle");
        this.map[angle][0] = this.map[angle][0] - 1;
        try {
            if (this.map[angle][0] == 0) {
                console.log("remAngle> final cleanup");
                //this.map.splice(angle-1, 1)
                /*this.map.forEach(function (value: number[], index: number) {
                    tmp = NaN;
                    if ( (!! this.map[index]) && this.map[index][0] !== NaN) {
                        tmp = this.map[index][0]
                    }
                    console.log("check> [" + index + "]:" + (isNaN(tmp) ? "" : tmp))
                })*/
            }
        } catch (error) {
            console.log(error)
        }
        return true;
    }
    /**
     * Deletes all records of given angle
     */
    removeAngleHistory(angle: number) {
        this.map[angle][0] = 0;
    }
    /**
     * Deletes all records collected
     */
    reset() {
        this.map = [];
        this.angleList = [];
    }
    getAll() {
        return this.map;
    }
    /**
     * Returns list of collected angles
     */
    getKnownAngles() {
        return this.angleList;
    }
}

class CompassHistory {
    private maxEntries: number;
    private compassTick: number;
    private callibrationTime: number;
    private history: number[];
    private correction: CorrectionMap;
    /**
     * @max compass calibration history length
     * @tick how long wait before repeating reading from compass [ms]
     */
    constructor(max: number, tick: number) {
        this.history = [];
        this.maxEntries = max;
        this.compassTick = tick;
        this.callibrationTime = max * tick;
        this.correction = new CorrectionMap(10, 20);
    }
    /**
     * Adds angle to history tracking
     */
    append(angle: number) {
        logValue("c", angle)
        if (this.history.length == this.maxEntries) {
            this.correction.removeAngle(this.history[0]);
            this.history.splice(0, this.history.length - this.maxEntries + 1);
        }
        this.history.push(angle);
        this.correction.addAngle(angle);
    }
    /**
     * Returns angle with correction
     * @dec number of decimal places
     */
    getDelta(dec: number) {
        if (this.getLength() < 1) return -100;
        let sum = 0;
        this.history.forEach(function (e) {
            sum += e;
        });
        let delta2 = Math.round((sum * Math.pow(10, dec)) / this.getLength()) / Math.pow(10, dec);
        logValue("d", delta2)
        return delta2;
    }
    fullCalibration() {
        this.reset()
        for (let j = 0; j < this.maxEntries; j++) {
            this.append(input.compassHeading())
            basic.pause(this.compassTick)
        }
    }
    getFromRow() {
        if (this.history.length > 0) {
            return this.history.slice(0, 1);
        }
        return -100;
    }
    getLength() {
        return this.history.length;
    }
    reset() {
        this.history = [];
        this.correction.reset();
    }
    getHistory() {
        return this.history
    }
    getCorrection() {
        return this.correction.getAll();
    }
    getKnownAngles() {
        return this.correction.getKnownAngles();
    }
}

class DrivingSection {
    private key: number
    private leftWheelSpd: number
    private rightWheelSpd: number
    private drivingTime: number
    constructor(key: number, left: number, right: number, time: number) {
        this.key = key;
        this.leftWheelSpd = left;
        this.rightWheelSpd = right;
        this.drivingTime = time;
    }
    getKey() {
        return this.key
    }
    getLeftWheelSpd() {
        return this.leftWheelSpd
    }
    getRightWheelSpd() {
        return this.rightWheelSpd
    }
    getDrivingTime() {
        return this.drivingTime
    }
}

class ShenandoahCar {
    
    /* Driving Mode */
    
    private LEFT_HALF_SPD = 50
    private RIGHT_HALF_SPD = 46
    private LEFT_QUARTER_SPD = 10
    private RIGHT_QUARTER_SPD = 8
    private D100_HS_TIME = 950
    private D050_HS_TIME = 550
    private D020_HS_TIME = 290
    private D010_HS_TIME = 225
    private D010_QT_TIME = 450
    private D005_QT_TIME = 225

    private directDriveSections = [{}]
    private clockwiseSections = [{}]
    private anticlockwiseSections = [{}]
    
    /* Rotation */

    private LEFT_ROTATION_SPD_MAX = 50
    private RIGHT_ROTATION_SPD_MAX = -46
    private A90_MS_CLOCK = 840
    private A45_MS_CLOCK = 475
    private A90_MS_ANTI = 750
    private A45_MS_ANTI = 460

    private initDrivingSections() {
        let tmpArray  = []
        tmpArray[100] = new DrivingSection(100, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D100_HS_TIME)
        tmpArray[50]  = new DrivingSection( 50, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D050_HS_TIME)
        tmpArray[20]  = new DrivingSection( 20, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D020_HS_TIME)
        tmpArray[10]  = new DrivingSection( 10, this.LEFT_QUARTER_SPD, this.RIGHT_QUARTER_SPD, this.D010_QT_TIME)
        tmpArray[5]   = new DrivingSection(  5, this.LEFT_QUARTER_SPD, this.RIGHT_QUARTER_SPD, this.D005_QT_TIME)        
        this.directDriveSections = tmpArray.sort((first, second) => 0 - (first.getKey() > second.getKey() ? 1 : -1))

        tmpArray = []
        tmpArray[90] = new DrivingSection(90, this.LEFT_ROTATION_SPD_MAX, this.RIGHT_ROTATION_SPD_MAX, this.A90_MS_CLOCK)
        tmpArray[45] = new DrivingSection(45, this.LEFT_ROTATION_SPD_MAX, this.RIGHT_ROTATION_SPD_MAX, this.A45_MS_CLOCK)
        this.clockwiseSections = tmpArray.sort((first, second) => 0 - (first.getKey() > second.getKey() ? 1 : -1))

        tmpArray = []
        tmpArray[90] = new DrivingSection(90, -1 * this.LEFT_ROTATION_SPD_MAX, -1 * this.RIGHT_ROTATION_SPD_MAX, this.A90_MS_ANTI)
        tmpArray[45] = new DrivingSection(45, -1 * this.LEFT_ROTATION_SPD_MAX, -1 * this.RIGHT_ROTATION_SPD_MAX, this.A45_MS_ANTI)
        this.anticlockwiseSections = tmpArray.sort((first, second) => 0 - (first.getKey() > second.getKey() ? 1 : -1))
    }

    constructor() {
        RingbitCar.init_wheel(AnalogPin.P1, AnalogPin.P2)
        this.initDrivingSections()
    }

    /**
     * Travels the given distance
     * @distance in [mm]
     */
    drive(distance: number) {
        console.log(this.directDriveSections)
        let rest = distance
        
        this.directDriveSections.forEach(function (section: DrivingSection, key: number){
            rest = this.driveSection(rest, section)
        })
    }

    /**
     * Rotates by a given angle
     * @angle in [deg] (right now there are supported only multiples of 45°)
     */
    turn(angle: number) {        
        /*if (angle == 90) {
            RingbitCar.freestyle(50, -46)
            basic.pause(840)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == -90) {
            RingbitCar.freestyle(-50, 46)
            basic.pause(750)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == 45) {
            RingbitCar.freestyle(50, -46)
            basic.pause(475)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == -45) {
            RingbitCar.freestyle(-50, 46)
            basic.pause(460)
            RingbitCar.brake()
            basic.pause(200)
        } else {
            basic.showIcon(IconNames.No)
        }*/
        let rest = 0
        let sections = [{}]
        if (angle == 0) {return}
        if (angle > 0) {
            sections = this.clockwiseSections
            rest = angle
        } else {
            sections = this.anticlockwiseSections
            rest = -1 * angle
        }
        sections.forEach(function (section: DrivingSection, key: number) {
            rest = this.driveSection(rest, section)
        })
    }
    private driveSection(distance: number, section: DrivingSection) {
        let numSections = Math.floor(distance / section.getKey())
        let rest = distance % section.getKey()
        console.log("[" + section.getKey() + "]: " + numSections + " (" + rest + ")")

        for (let i = 0; i < numSections; i++) {
            RingbitCar.freestyle(section.getLeftWheelSpd(), section.getRightWheelSpd())
            basic.pause(section.getDrivingTime())
            RingbitCar.brake()
            basic.pause(200)
        }
        return rest
    }
}

let car = new ShenandoahCar()
let SERIAL_LOGGING = true;
/*
input.onButtonPressed(Button.A, function () {
    basic.showString("P")
    basic.pause(1000)
    basic.showString("R")
    car.drive(170)
    basic.clearScreen()
})
*/
/*
input.onButtonPressed(Button.A, function () {
    basic.showString("A")
    basic.pause(1000)
    basic.showString("R")
    car.turn(45)
    basic.clearScreen()
})

input.onButtonPressed(Button.B, function () {
    RingbitCar.brake()
})
*/
/*
input.onButtonPressed(Button.A, function () {
    car.drive(50)
    car.drive(135)
    car.drive(50)
})

input.onButtonPressed(Button.B, function () {
    car.drive(50)
    car.drive(-135)
    car.drive(50)
})
*/