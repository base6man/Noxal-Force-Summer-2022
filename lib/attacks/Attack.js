// Not an instance of an attack. This script is just some filler variables.
// The real scripting should appear on the attack made.
// There should be some default attacks, I'll make them soon.

class Attack{
    /**
     * 
     * @param {AttackManager} parent // The parent boss, from which variables are taken
     * @param {Number} difficulty    // The difficulty of the attack, from either attackPower or dodgePower
     */
    constructor(parent, difficulty, delay){
        this.parent = parent;
        this.boss = parent.parent;

        this.isAttacking = false;
        this.difficulty = difficulty;

        this.isDodge = false;

        this.delay = delay;
    }

    canAttack(){
        return !this.isAttacking;
    }

    attack(){
        if(this.delay = 0) this.delayAttack();
        else{ time.delayedFunction(this, 'delayAttack', this.delay); }
        this.isAttacking = true;
    }

    delayAttack(){
        // Do nothing!
    }

    finishAttack(){
        this.isAttacking = false;
        this.boss.returnToRunSpeed();
    }

    shootBullet(angle, speed, offset = 0, canDodgeOut = true){
        
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
}