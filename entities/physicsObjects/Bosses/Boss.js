class Boss extends PhysicsObject{
    /**
     * @param {Vector} arenaCenter Starting position, also center of arena. Can change starting position later by editing position
     * @param {Vector} arenaSize Size of the arena, in a vector
     */
     constructor(arenaCenter, arenaSize){
        
        super(arenaCenter);
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'boss';
        this.name = 'boss';

        this.runSpeed;
        this.strafeSpeed;
        this.dashAttackSpeed;

        this.normalMinDistance;
        this.normalMaxDistance;
        this.minDistance;
        this.maxDistance;

        this.speedMult = 8;
        this.speed;
        this.normalFriction;
        this.friction;
        this.clockwise = true;
        
        this.minimumDistanceToShield = 0;
        this.distanceToShield;
        this.minimumDistanceToDodge = 0;
        this.distanceToDodge;

        this.dodgeDist;
        this.dodgeTime;
        this.dodging = false;

        this.invincible = false;
        this.health;
        this.invinTime = 0.2;

        this.knockbackSpeed;
        this.knockbackTime;
        this.knockedback = false;

        this.arenaRight = arenaCenter.x + arenaSize.x/2;
        this.arenaTop = arenaCenter.y + arenaSize.y/2;
        this.arenaLeft = arenaCenter.x - arenaSize.x/2;
        this.arenaBottom = arenaCenter.y - arenaSize.y/2;

        this.arenaCenter = arenaCenter.copy();
        this.arenaSize = arenaSize.copy();

        // Deal with this later
        this.target = scene.player;
        this.isAttacking = false;
        this.comboCounter = 0;
        this.restrictedAttacks;

        this.myWall;
        this.index = scene.bossManager.bosses.length;

        this.distanceToRepel = 80;
        this.repelForce = 1000;

        this.isAllowedToSwitch = true;
        this.timeBetweenSwitching = 0.1;
        this.criticalTime = 0.6;
        this.isTouchingWall = false;

        this.normalLookAheadTime;
        this.lookAheadTime;

        // Current bullets should be done in attack

        this.createAnimations();

        this.isFirstFrame = true;
    }

    createAttackManager(){
        this.attackManager = new AttackManager([[]]);
    }

    createAnimations(){
        this.animationManager = new AnimationManager([]);
    }

    update(){

        if(this.isFirstFrame){
            this.createAttackManager();
            this.attackManager.balanceAttacks();

            this.isFirstFrame = false;
        }

        if(!this.knockedback) this.velocity = this.updateVelocity(); 
        this.attackManager.update();
        super.update();

        for(let i in this.currentBullets){
            // Get the bullets the same relative to the boss
            this.currentBullets[i].position = this.currentBullets[i].position.add(this.position).subtract(this.positionLastFrame);
        }
        
        this.seeIfIShouldReverseDirections(this.criticalTime);

        this.positionLastFrame = this.position.copy();
    }

    updateVelocity(){

        let frictionEffect = time.deltaTime * this.friction;
        let movementVector;

        if(this.isTouchingWall){
            movementVector = this.position.subtract(this.arenaCenter).multiply(-1);
        }
        if(this.distanceToPlayer > this.maxDistance){
            movementVector = this.vectorToPlayer;
        }
        else if (this.distanceToPlayer > this.minDistance){
            if(this.clockwise){
                movementVector = new Vector(this.vectorToPlayer.y, -this.vectorToPlayer.x);
            }
            else{
                movementVector = new Vector(-this.vectorToPlayer.y, this.vectorToPlayer.x);
            }
        }
        else{
            movementVector = this.vectorToPlayer.multiply(-1);
        }
        
        movementVector.magnitude = this.speed;

        for(let i of scene.bossManager.bosses){
            if(i.position.subtract(this.position).magnitude < this.distanceToRepel && i != this){
                movementVector = movementVector.add(this.position.subtract(i.position)).multiply(this.repelForce);
            }
        }

        movementVector.magnitude = this.speed;

        let newVelocity = this.velocity.addWithFriction(movementVector, frictionEffect);
        return newVelocity;
    }

    seeIfIShouldReverseDirections(criticalTime){
        let futurePosition = this.position.add(this.velocity.multiply(criticalTime));
        if(
            !this.attackManager.isAttacking &&
            this.isAllowedToSwitch &&
            (futurePosition.x > this.arenaRight  - this.collider.width/2 ||
             futurePosition.x < this.arenaLeft   + this.collider.width/2 ||
             futurePosition.y > this.arenaTop    - this.collider.height/2 ||
             futurePosition.y < this.arenaBottom + this.collider.height/2)
            ){
                this.clockwise = !this.clockwise;
                this.isAllowedToSwitch = false;
                time.delayedFunction(this, 'canSwitchAgain', this.timeBetweenSwitching);
            }
    }

    canSwitchAgain(){
        this.isAllowedToSwitch = true;
    }

    updateImage(){
        this.animationManager.update();
        this.animationManager.draw(this.position.x, this.position.y, this.direction);
        
        // Right now, I'm also using this as a lateUpdate function because I'm too lazy to actually code one
        // If this comes back to bite me, hopefully I can find this comment
        // No late update stuff now (phew)
    }

    returnToRunSpeed(){
        // For a delayed time function; will probably use a lot
        // Also returns lots of other variables to their normal state
        this.speed = this.runSpeed;
        this.friction = this.normalFriction;
        this.maxDistance = this.normalMaxDistance;
        this.minDistance = this.normalMinDistance;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    get dodgeSpeed(){
        return this.dodgeDist / this.dodgeTime / this.speedMult / this.localSpeedMult;
    }

    get distanceToPlayer(){
        return this.vectorToPlayer.magnitude;
    }

    get futureDistanceToPlayer(){
        return this.futureVectorToPlayer.magnitude;
    }

    get vectorToPlayer(){
        return this.target.position.subtract(this.position);
    }

    get futureVectorToPlayer(){
        return this.target.position.subtract(this.position).add(this.target.velocity.multiply(this.lookAheadTime));
    }

    get angleToPlayer(){
        return this.vectorToPlayer.angle;
    }

    get futureAngleToPlayer(){
        return this.futureVectorToPlayer.angle;
    }

    get futurePlayerPosition(){
        return this.target.position.add(this.target.velocity);
    }

    get speed(){
        return this.maxSpeed;
    }

    set speed(_speed){
        console.assert(isNumber(_speed));
        this.maxSpeed = _speed * this.speedMult * this.localSpeedMult;
        this.velocity.magnitude = this.speed;
    }

    set trueSpeed(_speed){
        this.maxSpeed = _speed;
        this.velocity.magnitude = this.speed;
    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(){
        this.knockedback = false;
        this.velocity.magnitude = this.speed;
        this.attackManager.canAttack = true;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'playerAttack'){


            if(!this.invincible){
                scene.mainCamera.createShake();

                this.health -= 1;
                this.invincible = true;
                time.delayedFunction(this, 'endInvincibility', this.invinTime);
                if(this.health <= 0){
                    this.killBoss();
                    scene.bossManager.killBoss(this.index);
                }
                else{
                    let knockbackVector = this.position.subtract(this.target.position);
                    knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;
    
                    this.velocity = knockbackVector;
                    
                    this.knockedBack = true;
                    time.delayedFunction(this, 'endKnockback', this.knockbackTime);

                    this.attackManager.canAttack = false;
                    this.attackManager.stopCombo();
                }
            }

        }
    }

    onColliderCollision(other){
        if(other.collider.layer == 'wall'){
            this.isTouchingWall = true;
            time.stopFunctions(this, 'notTouchingWall');
            time.delayedFunction(this, 'notTouchingWall', 1);
        }
    }

    notTouchingWall(){
        this.isTouchingWall = false;
    }

    killBoss(){
        this.attackManager.canAttack = false;
        this.attackManager.stopCombo();

        this.collider.delete();
    }

    moveDownOneIndex(){
        this.index--;
    }
}