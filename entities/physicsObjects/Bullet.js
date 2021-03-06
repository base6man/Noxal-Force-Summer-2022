class Bullet extends PhysicsObject{

    constructor(colliderRadius, startingPosition, startingVelocity = new Vector(0, 0), canWhoosh = false){

        super(startingPosition, startingVelocity);
        this.acceleration = 0;
        this.homing = 0;
        this.target = scene.player;

        this.colliderRadiusTheyGaveMe = colliderRadius;

        this.melee = false;
        this.isShield = false;

        this.collider = new CircleCollider(this, 0, 0, colliderRadius);
        this.collider.layer = 'enemyAttack';
        this.collider.isTrigger = true;

        this.timeAlive = 4;
        this.timeHoming = Infinity;
        this.isFirstFrame = true;
        this.isStillAlive = true;

        this.index = parseInt(scene.bullets.length);
        scene.bullets.push(this);

        this.startTime = time.runTime;
        
        if(canWhoosh){
            this.whoosh = whoosh;
            this.whoosh.play();
            time.delayedFunction(this, 'stopWhoosh', 0.5);
        }

        this.canBeStill = true;
        this.createAnimationManager();
    }

    createAnimationManager(){
        
        let listOfAnimations = [];

        let shieldAnimation = {
            parent: this,
            name: 'shield',
            animation: new Animator('shield', attackImages.shield, 0.3),
            get canRun(){
                return !this.parent.diagonal && this.parent.isShield;
            }
        }
        listOfAnimations.push(shieldAnimation);

        let diagonalShieldAnimation = {
            parent: this,
            name: 'diagonalShield',
            animation: new Animator('diagonalShield', attackImages.shieldDiagonal, 0.3),
            get canRun(){
                return this.parent.diagonal && this.parent.isShield;
            }
        }
        listOfAnimations.push(diagonalShieldAnimation);

        let dissapateAnimation = {
            parent: this,
            name: 'dissapate',
            animation: new Animator('dissapate', attackImages.dissapate, 0.1),
            get canRun(){
                return !this.parent.isStillAlive;
            }
        }
        listOfAnimations.push(dissapateAnimation);

        let stillAnimation = {
            parent: this,
            name: 'still',
            animation: new Animator('stillAttack', attackImages.still, 0.3),
            get canRun(){
                return this.parent.velocity.magnitude < 30 && this.parent.canBeStill;
            }
        }
        listOfAnimations.push(stillAnimation);

        let normalAnimation = {
            parent: this,
            name: 'normal',
            animation: new Animator('attack', attackImages.normal, 0.3),
            get canRun(){
                return !this.parent.diagonal;
            }
        }
        listOfAnimations.push(normalAnimation);
        
        let diagonalAnimation = {
            parent: this,
            name: 'diagonal',
            animation: new Animator('diagonal', attackImages.diagonal, 0.3),
            get canRun(){
                return this.parent.diagonal;
            }
        }
        listOfAnimations.push(diagonalAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    stopWhoosh(){
        this.whoosh.stop();
    }

    makeBlueBullet(){
        this.collider.layer = 'blueBullet';
        this.collider.radius = this.colliderRadiusTheyGaveMe + 2;
        this.isShield = true;
        this.melee = true;
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

    get canBeStill(){
        return this.true_canBeStill && !this.melee;
    }

    set canBeStill(_canBeStill){
        this.true_canBeStill = _canBeStill;
    }

    get acceleration(){
        return this.myAcceleration;
    }

    get timeSinceBirth(){
        return time.runTime - this.startTime;
    }

    set acceleration(_acceleration){
        this.myAcceleration = this.velocity.copy();
        this.myAcceleration.magnitude = _acceleration;
    }

    get isPlayerAttack(){
        return this.collider.layer == 'playerAttack';
    }

    get direction(){
        if(this.trueRotation) return this.trueRotation;
        if(this.rotationTarget) return this.rotationTarget.direction;
        return this.velocity.direction;
    }

    get diagonal(){
        if(this.trueRotation) return false;
        if(this.rotationTarget) return this.rotationTarget.diagonal;
        return this.velocity.diagonal;
    }

    updateImage(){
        if(this.animationManager){
            this.animationManager.update();
            this.animationManager.draw(this.position.x, this.position.y, this.direction);
        }
        else{
            this.image.draw(this.position.x, this.position.y);
        }
    }

    onTriggerCollision(other){
        if((other.collider.layer == 'player' || other.collider.layer == 'boss') && !other.phaseThrough){
            if(!this.melee){ this.dissapate(); }
        }
    }

    endHoming(){
        this.acceleration = this.homing;
        this.homing = 0;
    }

    dissapate(){
        this.isStillAlive = false;
        if(this.whoosh) this.whoosh.stop();
        
        this.collider.delete();
        time.stopFunctions(this, null);
        time.delayedFunction(this, 'finishDissapate', 0.2);
    }

    finishDissapate(){
        scene.bullets.splice(this.index, 1);

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

class BounceBullet extends Bullet{
    constructor(colliderRadius, startingPosition, startingVelocity, canWhoosh){
        super(colliderRadius, startingPosition, startingVelocity, canWhoosh);

        let colliderLength = (colliderRadius - 2) * 2;
        this.otherCollider = new BoxCollider(this, 0, 0, colliderLength, colliderLength);
        this.otherCollider.layer = 'boss';

        this.melee = true;

        this.maxBounces = 2;
        this.numBounces = 0;
        this.bounceAcceleration = 1;
    }

    onColliderCollision(other){
        if(other.collider.layer == 'wall'){

            let vectorToPlayer = this.target.position.subtract(this.position);
            this.velocity.angle = vectorToPlayer.angle;
            this.velocity.magnitude *= this.bounceAcceleration;

            this.numBounces++;
            if(this.numBounces > this.maxBounces)
                this.dissapate();
        }
    }
}