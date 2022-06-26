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
        console.assert(isNumber(this.velocity.x) && isNumber(this.velocity.y) && isNumber(this.position.x) && isNumber(this.position.y), this.position, this.velocity);
        this.position.x += this.velocity.x * time.deltaTime;
        this.position.y += this.velocity.y * time.deltaTime;
    }
}