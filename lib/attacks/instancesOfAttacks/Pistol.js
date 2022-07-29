class Pistol extends Attack{

    setup(){
        this.velocityCurve = 0.8;
        this.agression = 0.5;
        this.bulletSpeed = 100;
    }

    canAttack(){
        
        return (
            isBetween(this.distanceToPlayer, 50, 75) &&
            isBetween(this.futureDistanceToPlayer, 50, 75)
        );
    }

    canContinueCombo(){
        
        return (
            isBetween(this.distanceToPlayer, 45, 90)
        );
    }

    attack(){
        super.attack();
    }

    get shootAngle(){
        
        let velocityCurve = this.velocityCurve * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);

        let bulletVector = this.vectorToPlayer;
        bulletVector.magnitude = 1;

        let playerVelocity = this.target.velocity.copy();
        playerVelocity.magnitude = velocityCurve;

        bulletVector = bulletVector.add(playerVelocity);

        return bulletVector.angle;
    }

    delayAttack(){
        this.shootBullet(this.shootAngle, this.bulletSpeed);
        this.finishAttack();
    }
}

class BluePistol extends Pistol{

    canAttack(){
        return this.boss.tooCloseToGhost || this.boss.tooCloseToPlayer;
    }

    canContinueCombo(){
        return this.boss.tooCloseToGhost || this.boss.tooCloseToPlayer;
    }

    delayAttack(){
        let tempTarget = this.target;
        if(this.boss.ghost){
            let distanceToGhost = this.boss.ghost.position.subtract(this.boss.position).magnitude;
            if(distanceToGhost < this.distanceToPlayer) this.target = this.boss.ghost;
        }
        
        let myBullet = this.shootBullet(this.shootAngle, this.bulletSpeed, 0, '', false);
        myBullet.makeBlueBullet();
        this.finishAttack();

        this.target = tempTarget;
    }
}

class BouncePistol extends Pistol{
    setup(){
        super.setup();
        this.bulletSpeed = 140;
    }

    canAttack(){
        return isBetween(this.distanceToPlayer, 90, 110);
    }

    canContinueCombo(){
        return this.distanceToPlayer > 75;
    }
    
    delayAttack(){
        let myBullet = this.shootBullet(this.shootAngle, this.bulletSpeed, 0, 'bounce', false);
        if(myBullet)
            myBullet.bounceAcceleration = 1.1;
        this.finishAttack();
    }
}