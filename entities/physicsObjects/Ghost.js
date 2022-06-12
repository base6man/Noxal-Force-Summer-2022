class Ghost extends PhysicsObject{
    constructor(startingPosition, startingVelocity){
        super(startingPosition.x, startingPosition.y, startingVelocity.x, startingVelocity.y);
        this.speed = 400;
        this.speedLoss = 3;
        this.friction = 10;
        
        this.knockbackSpeed = 80;
        this.knockbackTime = 0.2;
        this.knockedback;

        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'ghost';
        
        this.image = playerImages.idle[1];
    }

    update(){
        if(!this.knockedback) this.velocity = this.updateVelocity();
        super.update();
        if(this.speed >= 0) this.speed *= 1 - (this.speedLoss * time.deltaTime);
    }

    updateImage(){
        this.image.draw(this.position.x, this.position.y);
    }

    updateVelocity(){
        let input = new Vector(0, 0);
        if(KeyReader.i){ input.y++ }
        if(KeyReader.k){ input.y-- }
        if(KeyReader.l){ input.x++ }
        if(KeyReader.j){ input.x-- }
        
        input.magnitude = this.speed;

        let newVelocity = new Vector(0, 0);
        let frictionEffect = time.deltaTime * this.friction;

        newVelocity = this.velocity.addWithFriction(input, frictionEffect);
        return newVelocity;
    }

    delete(){
        this.collider.delete();
    }

    endKnockback(){
        this.knockedback = false;
    }

    onTriggerCollision(other){
        if (other.collider.layer == 'blueBullet'){

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed;
            this.velocity = knockbackVector;
            
            this.knockedback = true;
            time.delayedFunction(this, 'endKnockback', this.knockbackTime);
        }
    }
}