class Homing extends Attack{

    setup(){
        this.agression = 0.5;
        this.maxAttacks = Math.min(Math.floor(3*this.difficulty), 5);
        this.minDelay = 0.1;
    }

    canAttack(){
        
        return (
            this.distanceToPlayer > 110
        );
    }

    canContinueCombo(){
        
        return (
            this.distanceToPlayer > 95 && 
            this.combo.numAttacks < this.maxAttacks
        );
    }

    delayAttack(){
        let myBullet = this.shootBullet(this.angleToPlayer + PI, 100);
        if(myBullet){
            myBullet.homing = 250;
            myBullet.timeHoming = 1;
        }

        this.finishAttack();
    }
}