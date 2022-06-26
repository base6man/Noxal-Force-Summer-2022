class Homing extends Attack{

    setup(){
        this.agression = 0.5;
        this.maxAttacks = Math.floor(3*this.agression);
    }

    canAttack(){
        return (
            this.distanceToPlayer > 110 && 
            super.canAttack()
        );
    }

    canContinueCombo(){
        return (
            this.distanceToPlayer > 95 && 
            this.combo.numAttacks < this.maxAttacks && 
            super.canContinueCombo()
        );
    }

    delayAttack(){
        console.log(this.combo.numAttacks);
        let myBullet = this.shootBullet(this.angleToPlayer + PI, 100);
        if(myBullet){
            myBullet.homing = 300;
            myBullet.timeHoming = 1;
        }

        this.finishAttack();
    }
}