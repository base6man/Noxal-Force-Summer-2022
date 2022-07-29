class Ghost extends PhysicsObject{
    constructor(startingPosition, startingVelocity){
        super(startingPosition, startingVelocity);

        this.speed = this.calculateSpeed(0);
        this.speedLoss = 3;
        this.friction = 10;
        
        this.knockbackSpeed = 80;
        this.knockbackTime = 0.2;
        this.knockedback;

        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'ghost';
        
        this.image = playerImages.idle[1];

        this.startTime = time.runTime;
    }

    update(){
        if(!this.knockedback) this.velocity = this.updateVelocity();
        super.update();
        this.speed = this.calculateSpeed(time.runTime - this.startTime - 0.3);
    }

    updateImage(){
        this.image.draw(this.position.x, this.position.y);
    }

    updateVelocity(){
        let frictionEffect = time.deltaTime * this.friction;
        let newVelocity = this.velocity.addWithFriction(this.input, frictionEffect);
        return newVelocity;
    }

    get input(){
        let input= new Vector(0, 0);
        if(gamepadAPI.connected) input = new Vector(gamepadAPI.axesStatus[2], -gamepadAPI.axesStatus[3]);

        if(KeyReader.i) input.y++
        if(KeyReader.k) input.y--
        if(KeyReader.l) input.x++
        if(KeyReader.j) input.x--

        // Put between 1 and -1 bounds
        input.x = Math.max(Math.min(input.x, 1), -1);
        input.y = Math.max(Math.min(input.y, 1), -1);

        let inputMagnitude = Math.min(input.magnitude, 1);

        input.magnitude = this.speed * inputMagnitude;
        return input;
    }

    delete(){
        this.collider.delete();
    }

    endKnockback(){
        this.knockedback = false;
    }

    /*
    onTriggerCollision(other){
        if (other.collider.layer == 'blueBullet'){

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed;
            this.velocity = knockbackVector;
            
            this.knockedback = true;
            time.delayedFunction(this, 'endKnockback', this.knockbackTime);
        }
    }
    */

    calculateSpeed(x){
        return (240 / (1 + Math.exp(20*x))) + 45;
    }

    // Only for people trying to track the ghost as if it were the player
    // Do not use these variables
    get speedMult(){ return 1; }
    get runSpeed(){ return 150;}
}