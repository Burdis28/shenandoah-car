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
    
    /* Rotation */

    private LEFT_ROTATION_SPD_MAX = 50
    private RIGHT_ROTATION_SPD_MAX = -45

    constructor() {
        RingbitCar.init_wheel(AnalogPin.P1, AnalogPin.P2)
    }

    /**
     * Travels the given distance
     * @distance in [mm]
     */
    drive(distance: number) {
        
    }

    /**
     * Rotates by a given angle
     * @angle in [deg]
     */
    turn(angle: number) {

    }

    private drive_100() {
        RingbitCar.freestyle(this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD)
        basic.pause(this.D100_HS_TIME)
        RingbitCar.brake()
    }
    private drive_50() {
        RingbitCar.freestyle(this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD)
        basic.pause(this.D050_HS_TIME)
        RingbitCar.brake()
    }
    private drive_20() {
        RingbitCar.freestyle(this.LEFT_HALF_SPD, this.RIGHT_HALF_SPD)
        basic.pause(this.D020_HS_TIME)
        RingbitCar.brake()
    }
    private drive_10() {
        RingbitCar.freestyle(this.LEFT_QUARTER_SPD, this.LEFT_QUARTER_SPD)
        basic.pause(this.D010_QT_TIME)
        RingbitCar.brake()
    }
}