class Wave extends Attack{
    
    setup(){
        this.maxAttacks = Math.min(Math.floor(1*this.difficulty), 3);
        this.speed = 0;
    }

    canAttack(){
        
        return(
            isBetween(this.distanceToPlayer, 90, 110) &&
            isBetween(this.futureDistanceToPlayer, 100, 120)
        );
    }

    canContinueCombo(){
        
        return(
            isBetween(this.distanceToPlayer, 90, 120) &&
            this.combo.numAttacks < this.maxAttacks
        );
    }

    delayAttack(){
        super.delayAttack();
        for(let i = 0; i < 2*PI; i += PI/40){
            let myBullet = this.shootBullet(i, 1, 0, false);
            if(myBullet) {
                myBullet.acceleration = 200;
                myBullet.timeAlive = 2;
            }
        }
        this.finishAttack();
    }
}

class SoldierWave extends Wave{
    
    canAttack(){
        return(
            this.distanceToPlayer > 80
        );
    }

    canAttack(){
        return(
            this.distanceToPlayer > 70
        );
    }
}