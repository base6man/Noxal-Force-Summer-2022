class Wave extends Attack{
    
    setup(){
        this.maxAttacks = Math.floor(1*this.agression);
        this.speed = 0;
    }

    canAttack(){
        return(
            isBetween(this.distanceToPlayer, 90, 110) &&
            isBetween(this.futureDistanceToPlayer, 100, 120) &&
            super.canAttack()
        );
    }

    canContinueCombo(){
        return(
            isBetween(this.distanceToPlayer, 90, 120) &&
            this.combo.numAttacks < this.maxAttacks &&
            super.canContinueCombo()
        );
    }

    delayAttack(delay = 1.8){
        super.delayAttack();
        let trueDelay = delay/this.agressiveness;
        time.delayedFunction(this, 'finishAttack', trueDelay);
    }

    finishAttack(){
        super.finishAttack();
        for(let i = 0; i < 2*PI; i += PI/40){
            let myBullet = this.shootBullet(i, 1, 0, false);
            if(myBullet) {
                myBullet.image = bulletImage[2];
                myBullet.acceleration = 200;
                myBullet.timeAlive = 2;
            }
        }
    }
}

class FastWave extends Wave{
    delayAttack(){
        super.delayAttack(0.2);
    }
}