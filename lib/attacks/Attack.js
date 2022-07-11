// Not an instance of an attack. This script is just some filler variables.
// The real scripting should appear on the attack made.
// There should be some default attacks, I'll make them soon.

class Attack{
    /**
     * 
     * @param {AttackManager} parent // The parent boss, from which variables are taken
     * @param {Number} delay 
     * @param {Number} destination
     */
    constructor(parent, delay = 0, destination, differentComboDestination = null){
        this.boss = parent;
        this.parent = this.boss.attackManager;
        this.target = this.boss.target;
        this.agressiveness = this.boss.agressiveness;
        this.difficulty = this.boss.attackPower;

        this.isAttacking = false;

        this.isDodge;
        this.agression = 1;
        this.speed = this.boss.runSpeed;

        this.previousBossPosition = this.boss.position.copy();
        this.followBoss = true;
        this.bullets = [];
        this.bulletReference = [];
        this.isUpdating = true;

        this.delay = delay / this.agressiveness;
        this.minDelay = 0;
        this.maxParentDelay = 1;

        this.destination = destination;
        this.differentComboDestination = differentComboDestination;

        this.setup();

        this.lookAheadTime = 1;
    }

    setup(){
        // Do nothing!
    }

    getCombo(combo){
        this.combo = combo;
    }

    update(){
        if(this.isUpdating){
            if(this.followBoss){
                let changeInPosition = this.boss.position.subtract(this.previousBossPosition);
                for(let i of this.bullets){
                    i.position = i.position.add(changeInPosition);
                }
            }
            this.previousBossPosition = this.boss.position.copy();
        }
    }

    attack(){
        if(this.windupSpeed) this.boss.speed = this.windupSpeed;
        else{                this.boss.speed = this.speed;      }
        


        let parentDelay = this.parent.attackDelay;

        if(parentDelay > this.maxParentDelay){
            this.parent.waitForSeconds(parentDelay);
            return;
        }
        
        let newDelay = Math.max(this.delay + parentDelay, this.minDelay);

        this.isUpdating = true;
        this.isAttacking = true;
        
        this.parent.incrementComboCounter(this.agression);
        this.parent.decrementComboCounter(parentDelay);

        if(newDelay == 0) this.delayAttack();
        else{ 
            let timeUntilAttackAnimation = Math.max(newDelay - 0.5, 0);
            time.delayedFunction(this, 'attackAnimation', timeUntilAttackAnimation);
            time.delayedFunction(this, 'delayAttack', newDelay);
        }
    }

    attackAnimation(){
        this.boss.attackAnimation = true;
    }

    delayAttack(){
        // Do nothing!
    }

    finishAttack(){
        this.stop();
        this.boss.finishAttack();
    }

    shootBullet(angle, speed, offset = 0, canDodgeOut = true){
        console.assert(isNumber(angle) && isNumber(speed), angle, speed);
        
        /*
        if(this.dodgeCanExcecute(0.6) && canDodgeOut){ 
            this.dodge(false);
            time.stopFunctionsWithKeyword(this, /(shootBullet)/);
            return;
        }*/

        // I don't really care about this line, but I am setting the magnitude here.
        // I can't set it to zero zero, unfortunately
        let bulletVelocity = new Vector(speed, 0);
        bulletVelocity.angle = angle;

        let offsetVector = new Vector(offset, 0);
        offsetVector.angle = angle;
        let startingPosition = this.boss.position.add(offsetVector);

        let myBullet;
        myBullet = new Bullet(bulletImage[0], startingPosition, bulletVelocity);

        scene.mainCamera.createShake(0.1);
        this.bulletReference.push(myBullet);
        return myBullet;
        // Returns the bullet so someone can add homing
    }

    kill(){
        this.stop();
        for(let i of this.bulletReference) {
            if(i.isStillAlive) i.dissapate();
        }
    }

    stop(){
        time.stopFunctions(this, 'delayAttack');
        time.stopFunctions(this, 'finishAttack');
        time.stopFunctions(this, 'shootBullet');
        time.stopFunctions(this, 'attackAnimation');
        this.isAttacking = false;
        this.isUpdating = false;
    }

    get distanceToPlayer(){
        return this.vectorToPlayer.magnitude;
    }

    get futureDistanceToPlayer(){
        return this.futureVectorToPlayer.magnitude;
    }

    get vectorToPlayer(){
        return this.target.position.subtract(this.boss.position);
    }

    get futureVectorToPlayer(){
        return this.target.position.subtract(this.boss.position).add(this.target.velocity.multiply(this.lookAheadTime));
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
    
    get comboCounter(){
        return this.parent.comboCounter;
    }
}