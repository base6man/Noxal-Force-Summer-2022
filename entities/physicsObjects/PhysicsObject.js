class PhysicsObject{
    /**
     * @param {Vector} startingPosition
     * @param {Vector} startingVelocity
     */
    constructor(startingPosition, startingVelocity = new Vector(0, 0)){
        this.position = startingPosition.copy();
        this.velocity = startingVelocity.copy();
    }

    update(){
        this.position.x += this.velocity.x * time.deltaTime;
        this.position.y += this.velocity.y * time.deltaTime;
    }
}