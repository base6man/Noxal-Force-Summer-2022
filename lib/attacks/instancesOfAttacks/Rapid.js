class Rapid extends Attack{

    setup(){
        this.bulletSpeed = 200;
        this.shootTime = 0.1;
        this.speed = this.boss.shootSpeed;
        this.delay = 0.3 / this.boss.agressiveness;
        this.numShots = 3;

        this.maxShots = 7;
    }

    canAttack(){
        
        return (
            isBetween(this.distanceToPlayer, 85, 90)
        );
    }

    canContinueCombo(){
        return (
            isBetween(this.distanceToPlayer, 70, 110)
        )
    }

    // Not for outside use, use attack instead
    delayAttack(angleChangeMultiplier = 1){
        
        let angle = this.futureAngleToPlayer;

        let angleInit = angle + -0.1 * this.difficulty;
        let angleChange = (0.1 + 0.1 / this.difficulty) * angleChangeMultiplier;
        let numShots = Math.min(Math.floor(this.numShots * this.difficulty), this.maxShots);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i+this.delay, [angleChange*i+angleInit, this.bulletSpeed]);
        }
        time.delayedFunction(this, 'finishAttack', this.shootTime*numShots + this.delay);
    }
}

class SoldierRapid extends Rapid{

    setup(){
        super.setup();

        this.speedMult = 0.25 + 0.75*this.boss.shootSpeed;

        this.windupSpeed = 18 * this.speedMult;
        this.speed = 24 * this.speedMult;
        this.numShots = 2;
    }

    canAttack(){
        
        return (isBetween(this.distanceToPlayer, 60, 90));
    }

    canContinueCombo(){
        return (isBetween(this.distanceToPlayer, 50, 110));
    }

    attack(){
        super.attack();

        this.boss.maxDistance = 0;
        this.boss.minDisatnce = 0;
        this.boss.velocity = this.futureVectorToPlayer;
        this.boss.velocity.magnitude = this.windupSpeed;
    }

    delayAttack(){
        super.delayAttack(1);
        super.delayAttack(-1);
    }
}

class ShieldSpread extends SoldierRapid{

    setup(){
        super.setup();
        this.bulletSpeed = 100;

        this.speed = 0;
        this.windupSpeed = this.boss.shootSpeed;

        this.shootTime = 0.04;
        this.delay = 0;

        this.maxShots = 3;
        this.numShots = 3;
    }

    canAttack(){
        return (isBetween(this.distanceToPlayer, 50, 70));
    }

    canContinueCombo(){
        return (isBetween(this.distanceToPlayer, 40, 80));
    }
    
    shootBullet(angle, speed, offset, className, canCutShort){
        let myBullet = super.shootBullet(angle, speed, offset, className, false);
        if(myBullet) myBullet.makeBlueBullet();
    }
}