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
    
    /* Rotation */

    private LEFT_ROTATION_SPD_MAX = 50
    private RIGHT_ROTATION_SPD_MAX = -46
    private A090_MS_TIME = 850
    private A045_MS_TIME = 1000

    private initDrivingSections() {
        let tmpArray  = []
        tmpArray[100] = new DrivingSection(100, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D100_HS_TIME)
        tmpArray[50]  = new DrivingSection( 50, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D050_HS_TIME)
        tmpArray[20]  = new DrivingSection( 20, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D020_HS_TIME)
        tmpArray[10]  = new DrivingSection( 10, this.LEFT_QUARTER_SPD, this.RIGHT_QUARTER_SPD, this.D010_QT_TIME)
        tmpArray[5]   = new DrivingSection(  5, this.LEFT_QUARTER_SPD, this.RIGHT_QUARTER_SPD, this.D005_QT_TIME)
        /*tmpArray = [
            { key: 100, left: this.LEFT_HALF_SPD, right: this.RIGHT_HALF_SPD, time: this.D100_HS_TIME },
            { key: 50, left: this.LEFT_HALF_SPD, right: this.RIGHT_HALF_SPD, time: this.D050_HS_TIME },
            { key: 20, left: this.LEFT_HALF_SPD, right: this.RIGHT_HALF_SPD, time: this.D020_HS_TIME },
            { key: 10, left: this.LEFT_HALF_SPD, right: this.RIGHT_HALF_SPD, time: this.D010_HS_TIME }
        ]*/
        this.directDriveSections = tmpArray.sort((first, second) => 0 - (first.getKey() > second.getKey() ? 1 : -1))
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

    /**
     * Rotates by a given angle
     * @angle in [deg] right now only supported angles {-45,45,-90,90}
     */
    turn(angle: number) {        
        if (angle == 90) {
            RingbitCar.freestyle(50, -46)
            basic.pause(840)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == -90) {
            RingbitCar.freestyle(-50, 46)
            basic.pause(840)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == 45) {
            RingbitCar.freestyle(50, -46)
            basic.pause(475)
            RingbitCar.brake()
            basic.pause(200)
        } else if (angle == -45) {
            RingbitCar.freestyle(-50, 46)
            basic.pause(475)
            RingbitCar.brake()
            basic.pause(200)
        } else {
            basic.showIcon(IconNames.No)
        }
    }

    private turnSection(angle:number) {

    }
}

let car = new ShenandoahCar()
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

input.onButtonPressed(Button.A, function () {
    car.drive(50)
    RingbitCar.freestyle(-50, 46)
    basic.pause(470)
    RingbitCar.brake()
    car.drive(50)
})

input.onButtonPressed(Button.B, function () {
    car.drive(50)
    RingbitCar.freestyle(-50, 46)
    basic.pause(460)
    RingbitCar.brake()
    car.drive(50)
})
