class Laser extends Attack{

    setup(){
        this.minDistanceFromCenter = this.boss.arenaSize.magnitude * 0.5;
        this.speed = this.boss.shootSpeed / 2;
    }

    canAttack(){
        return (
            (this.boss.position.magnitude > this.minDistanceFromCenter || 
            this.target.position.magnitude > this.minDistanceFromCenter) && 
            isBetween(this.distanceToPlayer, 80, 110) &&
            super.canAttack()
        );
    }

    canContinueCombo(){
        return (
            isBetween(this.distanceToPlayer, 50, 110) &&
            super.canContinueCombo()
        );
    }

    delayAttack(delay = 1, duration = 2){

        delay = delay/this.agressiveness;
        let shootTime = 0.04;
        let numShots = Math.floor(duration / shootTime);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay);
        }
        time.delayedFunction(this, 'finishAttack', duration + delay);
    }

    shootBullet(){
        let bulletVelocity = new Vector(1, 0);
        bulletVelocity.angle = this.angleToPlayer;
        
        let velocityVector = this.target.velocity.copy();
        velocityVector.magnitude = 0.05 * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);
        bulletVelocity = bulletVelocity.add(velocityVector);

        let myBullet = super.shootBullet(bulletVelocity.angle, 160);
        if(myBullet){
            myBullet.image = bulletImage[2];
            myBullet.timeAlive = 3;
        }
    }
}

class FastLaser extends Laser{
    delayAttack(){
        super.delayAttack(0, 2);
    }
}

class ShortLaser extends Laser{
    delayAttack(){
        super.delayAttack(0.2, 1);
    }
}