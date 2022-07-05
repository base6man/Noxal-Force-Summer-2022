class Dodge extends Attack{

    setup(){
        this.dodgeTime =   this.boss.dodgeTime;
        this.speed =       this.boss.dodgeSpeed;
        this.maxDistance = this.boss.distanceToDodge;
        this.minDistance = this.boss.minimumDistanceToDodge;

        this.isDodge = true;
        this.difficulty = this.boss.dodgePower;

        this.windupSpeed = this.boss.runSpeed;
    }

    canAttack(strictness = 1){
        
        return (
            isBetween(this.distanceToPlayer, this.minDistance * strictness, this.maxDistance / strictness)
        );
    }

    canContinueCombo(){
        
        return this.canAttack(0.5);
    }

    delayAttack(){
        super.delayAttack();
        
        if(this.distanceToPlayer < this.maxDistance * 1.3){

            this.boss.minDistance = this.boss.normalMaxDistance;
            this.boss.maxDistance = Infinity;

            this.boss.velocity = this.boss.vectorToPlayer.multiply(-1);
            this.boss.speed = this.speed;
            time.delayedFunction(this, 'finishAttack', this.dodgeTime);
        }
        else{
            this.finishAttack();
        }
    }
}

class ShootDodge extends Dodge{
    delayAttack(){
        console.log('Dodge!');
        super.delayAttack();
        this.shootBullet(this.boss.velocity.angle + PI, 120);
    }
}