class Pistol extends Attack{

    setup(){
        this.velocityCurve = 0.8;
        this.agression = 0.5;
    }

    canAttack(){
        
        return (
            isBetween(this.distanceToPlayer, 50, 75) &&
            isBetween(this.futureDistanceToPlayer, 50, 75)
        );
    }

    canContinueCombo(){
        
        return (
            isBetween(this.distanceToPlayer, 30, 90)
        );
    }

    attack(){
        super.attack();
    }

    delayAttack(blueBullet = false){
        super.delayAttack();
        
        let velocityCurve = this.velocityCurve * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);

        let bulletVector = this.vectorToPlayer;
        bulletVector.magnitude = 1;

        let playerVelocity = this.target.velocity.copy();
        playerVelocity.magnitude = velocityCurve;

        bulletVector = bulletVector.add(playerVelocity);

        let myBullet = this.shootBullet(bulletVector.angle, 100);
        if(blueBullet && myBullet) myBullet.makeBlueBullet();

        this.finishAttack();
    }

    finishAttack(){
        super.finishAttack();
    }
}

class BluePistol extends Pistol{
    delayAttack(){
        super.delayAttack(true);
    }
}