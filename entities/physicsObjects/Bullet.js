class Bullet extends PhysicsObject{

    constructor(image, startingPosition, startingVelocity = new Vector(0, 0)){

        super(startingPosition.x, startingPosition.y, startingVelocity.x, startingVelocity.y);
        this.acceleration = new Vector(0, 0);
        this.homing = 0;

        this.image = image;
        this.image.name = 'bullet';

        this.collider = new BoxCollider(this, 0, 0, 12, 12);
        this.collider.layer = 'enemyAttack';
        this.collider.isTrigger = true;
        // This should really be a circle collider, but I'll deal with that later.
        // Perhaps I make some box bullets too. I don't know how that would work, though
        // Laser and wave need their own type of bullet: line bullet?

        this.timeAlive = 4;
        this.timeHoming = Infinity;
        this.isFirstFrame = true;

        this.index = bullets.length;
        bullets.push(this);

        this.startTime = time.runTime;
    }

    update(){
        if(this.isFirstFrame){
            time.delayedFunction(this, 'dissapate', this.timeAlive);
            if(this.homing != 0 && this.timeHoming < this.timeAlive){ 
                time.delayedFunction(this, 'endHoming', this.timeHoming); 
            }
            this.isFirstFrame = false;
        }
        super.update();
        this.velocity = this.velocity.add(this.acceleration.multiply(time.deltaTime));

        let vectorToPlayer = player.position.subtract(this.position);
        this.velocity = this.velocity.add(vectorToPlayer.multiply(this.homing * time.deltaTime));
    }

    updateImage(){
        this.image.draw(this.position.x, this.position.y);
    }

    onTriggerCollision(other){
        if(other.collider.layer == 'player' || other.collider.layer == 'boss'){
            if(!this.melee){ this.dissapate(); }
        }
    }

    endHoming(){
        this.homing = 0;
    }

    dissapate(){
        
        bullets.splice(this.index, 1);
        this.collider.delete();
        for(let i = this.index; i < bullets.length; i++){
            bullets[i].moveDownOneIndex();
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
} 