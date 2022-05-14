class PhysicsObject{
    /**
     * 
     * @param {Number} x Starting X Position
     * @param {Number} y Starting Y Position
     * @param {Number} vx Starting X Velocity
     * @param {Number} vy Starting Y Velocity
     */
    constructor(x, y, vx = 0, vy = 0){
        this.position = new Vector(x, y);
        this.velocity = new Vector(vx, vy);
    }

    update(){
        this.position = this.position.add(this.velocity.multiply(time.deltaTime));
    }
}