class Bullet extends PhysicsObject{

    constructor(image, startingPosition, startingVelocity = new Vector(0, 0)){

        super(startingPosition, startingVelocity);
        this.acceleration = 0;
        this.homing = 0;
        this.target = scene.player;

        this.image = image;
        this.image.name = 'bullet';

        this.melee = false;

        this.collider = new CircleCollider(this, 0, 0, this.image.height/2 - 2);
        this.collider.layer = 'enemyAttack';
        this.collider.isTrigger = true;
        // This should really be a circle collider, but I'll deal with that later.
        // Perhaps I make some box bullets too. I don't know how that would work, though
        // Laser and wave need their own type of bullet: line bullet?

        this.timeAlive = 4;
        this.timeHoming = Infinity;
        this.isFirstFrame = true;

        this.index = parseInt(scene.bullets.length);
        scene.bullets.push(this);

        this.startTime = time.runTime;
        
    }

    makeBlueBullet(){
        this.collider.layer = 'blueBullet';
        this.image = bulletImage[3];
    }

    makeColliderGenerous(){
        this.collider.radius = this.image.height / 2;
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

        if(this.homing){
            let vectorToPlayer = this.target.position.subtract(this.position);
            vectorToPlayer.magnitude = 1;
            this.velocity = this.velocity.add(vectorToPlayer.multiply(this.homing * time.deltaTime));
        }
    }

    get acceleration(){
        return this.myAcceleration;
    }

    set acceleration(_acceleration){
        this.myAcceleration = this.velocity.copy();
        this.myAcceleration.magnitude = _acceleration;
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
        this.acceleration = this.homing;
        this.homing = 0;
    }

    dissapate(){
        
        scene.bullets.splice(this.index, 1);
        this.collider.delete();
        time.stopFunctions(this, null);
        for(let i = this.index; i < scene.bullets.length; i++){
          scene.bullets[i].moveDownOneIndex();
        }

        for(let i in scene.bullets){
            console.assert(scene.bullets[i].index == i);
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
} 