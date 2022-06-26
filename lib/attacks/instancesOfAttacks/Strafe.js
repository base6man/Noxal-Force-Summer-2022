class Strafe extends Attack{

    setup(){
        this.shootTime = 0.4 / this.boss.localSpeedMult;
        this.delay = 0.2 / this.agressiveness;

        if(this.boss.strafeSpeed) this.speed = this.boss.strafeSpeed;
        else{ this.speed = this.boss.runSpeed; }

        this.maxDistanceFromCenter = this.boss.arenaSize.magnitude * 0.4;
    }

    canAttack(){
        return (
            this.boss.position.magnitude   < this.maxDistanceFromCenter && 
            this.target.position.magnitude < this.maxDistanceFromCenter &&
            isBetween(this.distanceToPlayer, 50, 70) && 
            super.canAttack()
        );
    }

    canContinueCombo(){
        return (
            this.boss.position.magnitude        < this.maxDistanceFromCenter * 1.5 && 
            this.boss.target.position.magnitude < this.maxDistanceFromCenter * 1.5 &&
            isBetween(this.boss.distanceToPlayer, 25, 75) && 
            super.canContinueCombo()
        );
    }

    delayAttack(){
        super.delayAttack();

        this.boss.minDistance = 0;
        this.boss.friction = 10;
        this.boss.clockwise = !this.boss.clockwise;

        let numShots = Math.min(Math.floor(3 * this.difficulty), 6);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i + this.delay);
        }
        time.delayedFunction(this, 'finishAttack', this.shootTime * numShots + this.delay);
    }

    shootBullet(){
        let myBullet = super.shootBullet(0, 0);
        if(myBullet){
            myBullet.homing = 150;
            myBullet.timeAlive = 2;
        }
    }
}