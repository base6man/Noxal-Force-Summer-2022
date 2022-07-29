class Boss extends PhysicsObject{
    /**
     * @param {Vector} arenaCenter Starting position, also center of arena. Can change starting position later by editing position
     * @param {Vector} arenaSize Size of the arena, in a vector
     */
     constructor(arenaCenter, arenaSize){
        
        super(arenaCenter);
        this.collider = new BoxCollider(this, 0, 0, 7, 7);
        this.collider.layer = 'boss';
        this.name = 'boss';

        this.speedMult = 8;
        this.clockwise = true;
        
        this.minimumDistanceToShield = 0;
        this.distanceToShield;
        this.minimumDistanceToDodge = 0;
        this.distanceToDodge;

        this.dodgeDist;
        this.dodgeTime;
        this.dodging = false;

        this.invincible = true;
        this.health = 3;

        this.knockbackSpeed;
        this.knockbackTime;
        this.knockedback = false;

        this.arenaRight = arenaCenter.x + arenaSize.x/2;
        this.arenaTop = arenaCenter.y + arenaSize.y/2;
        this.arenaLeft = arenaCenter.x - arenaSize.x/2;
        this.arenaBottom = arenaCenter.y - arenaSize.y/2;

        this.arenaCenter = arenaCenter.copy();
        this.arenaSize = arenaSize.copy();

        this.target = scene.player;

        this.myWall;
        this.index = scene.bossManager.bosses.length;

        this.repelForce = 20;

        this.myBots = [];
        this.isMainBoss = true;
        scene.referenceBosses.push(this);
        this.focusCameraOnThis = true;

        this.isAllowedToSwitch = true;
        this.timeBetweenSwitching = 0.1;
        this.criticalTime = 0.6;
        this.isTouchingWall = false;

        this.normalLookAheadTime;
        this.lookAheadTime;

        this.createAnimations();

        this.isFirstFrame = true;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        this.attackManager.addComboList([]);
    }
    
    createAnimations(){
        let listOfAnimations = [];


        let attackAnimation = {
            parent: this, 
            name: 'attack',
            animation: new Animator('attack', bossImages.guardAttack, 0.3),
            get canRun(){
                return this.parent.attackAnimation && !this.parent.isDodging;
            }
        }
        listOfAnimations.push(attackAnimation);

        
        let idleAnimation = {
            parent: this,
            name: 'idle',
            animation: new Animator('idle', bossImages.guardIdle, 0.8),
            get canRun(){
                return true;
            }
        }
        listOfAnimations.push(idleAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    update(){

        if(this.isFirstFrame){
            this.createAttackManager();
            this.attackManager.balanceAttacks();
            this.healthBar = new HealthBar(this, this.health);

            this.isFirstFrame = false;
            this.endInvincibility();
        }

        if(!this.knockedback) this.velocity = this.updateVelocity(); 
        this.attackManager.update();
        super.update();
        
        this.seeIfIShouldReverseDirections(this.criticalTime);

        for(let i of this.myBots) i.update();

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
        
        movementVector.magnitude = 1;

        for(let i of scene.referenceBosses){
            if(i != this){
                let repelVector = this.position.subtract(i.position).invert().multiply(this.repelForce);
                movementVector = movementVector.add(repelVector);
            }
        }
        let tempVector = movementVector.copy();

        movementVector.magnitude = this.speed;

        let newVelocity = this.velocity.addWithFriction(movementVector, frictionEffect);
        console.assert(newVelocity.isVector(), movementVector, frictionEffect, tempVector);
        return newVelocity;
    }

    seeIfIShouldReverseDirections(criticalTime){
        let futurePosition = this.position.add(this.velocity.multiply(criticalTime));
        if(
            !this.isAttacking &&
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

        for(let i of this.myBots) i.updateImage();
        
        // Right now, I'm also using this as a lateUpdate function because I'm too lazy to actually code one
        // If this comes back to bite me, hopefully I can find this comment
        // No late update stuff now (phew)
    }

    finishAttack(){
        // For a delayed time function; will probably use a lot
        // Also returns lots of other variables to their normal state
        this.returnToRunSpeed();
    }
    
    returnToRunSpeed(){
        this.speed = this.runSpeed;
        this.friction = this.normalFriction;
        this.maxDistance = this.normalMaxDistance;
        this.minDistance = this.normalMinDistance;
        this.lookAheadTime = this.normalLookAheadTime;
        this.attackAnimation = false;
    }

    get ghost(){
        return this.target.ghost;
    }

    get tooCloseToGhost(){
        if(!this.ghost) return false;
        return this.ghost.position.subtract(this.position).magnitude < this.distanceToDodge;
    }

    get tooCloseToPlayer(){
        return this.distanceToPlayer < this.distanceToDodge && this.distanceToPlayer > this.minimumDistanceToDodge;
    }

    get direction(){
        return this.vectorToPlayer.direction;
    }

    get diagonal(){
        return this.vectorToPlayer.diagonal;
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

    get isAttacking(){
        if(!this.attackManager) return false;
        return this.attackManager.isAttacking;
    }

    get shieldIsOffset(){
        if(!this.attackManager.currentAttack) return false;
        return this.attackManager.currentAttack.melee;
    }

    get isDodging(){
        if(!this.attackManager || !this.attackManager.currentAttack) return false;
        return this.attackManager.currentAttack.isDodge;
    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(){
        this.knockedback = false;
        this.velocity.magnitude = this.speed;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'playerAttack'){


            if(!this.invincible){

                this.health -= 1;
                
                if(this.isMainBoss){
                    scene.mainCamera.createShake(1.5);
                    time.hitStop(0.08);
                }
                else{
                    scene.mainCamera.createShake();
                }

                if(this.health <= 0){
                    this.killBoss();
                    if(this.isMainBoss) scene.bossManager.killBoss(this.index);
                }
                else{

                    this.invincible = true;
                    time.delayedFunction(this, 'endInvincibility', this.healthBar.switchTime);

                    let knockbackVector = this.position.subtract(this.target.position);
                    knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;
    
                    this.velocity = knockbackVector;
                    
                    this.knockedBack = true;
                    time.delayedFunction(this, 'endKnockback', this.knockbackTime);

                    this.finishAttack();
                    this.attackManager.waitForSeconds(1/this.agressiveness);
                    
                    this.healthBar.display(this.health);
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

    killBoss(hasKilledMainBoss = false){
        this.attackManager.kill();

        this.healthBar.delete();
        this.collider.delete();

        scene.referenceBosses.splice(scene.referenceBosses.indexOf(this), 1);

        if(!this.isMainBoss && !hasKilledMainBoss){
            this.parent.killChildBoss(this.index);
        }
        else if (this.isMainBoss){
            for(let i = scene.bullets.length-1; i >= 0; i--) {
                if(!scene.bullets[i].isPlayerAttack) scene.bullets[i].dissapate();
            }
            for(let i of this.myBots) i.killBoss(true);
        }
    }

    killChildBoss(index){

        this.myBots.splice(index, 1);

        for(let i in this.myBots){
            this.myBots[i].index = i;
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}