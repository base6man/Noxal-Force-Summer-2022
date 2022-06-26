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
    constructor(parent, delay = 0, destination){
        this.boss = parent;
        this.attackManager = this.boss.attackManager;
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

        this.delay = delay;
        this.destination = destination;

        this.setup();
    }

    setup(){
        // Do nothing!
    }

    getCombo(combo){
        this.combo = combo;
        /*
        for(let i of this.attackManager.comboList){
            for(let j of i){
                for(let k of j.attacks){
                    for(let l of k){
                        if(l == this) return j;
                    }
                }
            }
        }*/
    }

    update(){

        if(this.followBoss){
            let changeInPosition = this.boss.position.subtract(this.previousBossPosition);
            for(let i of this.bullets){
                i.position = i.position.add(changeInPosition);
            }
        }
        this.previousBossPosition = this.boss.position.copy();
    }

    canAttack(){
        return !this.isAttacking;
    }

    canContinueCombo(){
        return !this.isAttacking;
    }

    attack(){
        this.isAttacking = true;
        //this.attackManager.incrementComboCounter(this.agression);

        if(this.delay == 0) this.delayAttack();
        else{ 
            time.delayedFunction(this, 'delayAttack', this.delay); 
        }
    }

    delayAttack(){
        this.boss.speed = this.speed;
    }

    finishAttack(){
        this.isAttacking = false;
        this.boss.returnToRunSpeed();
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
        return myBullet;
        // Returns the bullet so someone can add homing
    }

    stop(){
        time.stopFunctions(this, 'delayAttack');
        time.stopFunctions(this, 'finishAttack');
        time.stopFunctions(this, 'shootBullet');
        this.isAttacking = false;
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

    /*
    get comboCounter(){
        return this.attackManager.comboCounter;
    }
    */

    get lookAheadTime(){
        return this.boss.lookAheadTime;
    }

    set lookAheadTime(_lookAheadTime){
        this.boss.lookAheadTime = _lookAheadTime;
    }
}