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

    private directDriveSections = [{}]
    
    /* Rotation */

    private LEFT_ROTATION_SPD_MAX = 50
    private RIGHT_ROTATION_SPD_MAX = -45

    private initDrivingSections() {
        let tmpArray = []
        tmpArray[100] = new DrivingSection(100, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D100_HS_TIME)
        tmpArray[50]  = new DrivingSection( 50, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D050_HS_TIME)
        tmpArray[20]  = new DrivingSection( 20, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D020_HS_TIME)
        tmpArray[10]  = new DrivingSection( 10, this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD, this.D010_HS_TIME)
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

    driveSection(distance: number, section: DrivingSection) { 
        let numSections = Math.floor(distance / section.getKey())
        let rest = distance % section.getKey()
        console.log("[" + section.getKey() + "]: " + numSections + " (" + rest + ")")

        for (let i = 0; i < numSections; i++) {
            RingbitCar.freestyle(section.getLeftWheelSpd(), section.getRightWheelSpd())
            basic.pause(section.getDrivingTime())
            RingbitCar.brake()
        }
        return rest
    }

    /**
     * Rotates by a given angle
     * @angle in [deg]
     */
    turn(angle: number) {

    }

}

let car = new ShenandoahCar()

input.onButtonPressed(Button.A, function () {
    basic.showString("P")
    basic.pause(1000)
    basic.showString("R")
    car.drive(170)
    basic.clearScreen()
})

input.onButtonPressed(Button.B, function () {
    RingbitCar.brake()
})