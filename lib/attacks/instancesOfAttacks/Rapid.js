class Rapid extends Attack{

    setup(){
        this.shootTime = 0.1;
        this.speed = this.boss.shootSpeed;
        this.delay = 0.3 / this.boss.agressiveness;
        this.numShots = 3;
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
        super.delayAttack();
        
        let angle = this.futureAngleToPlayer;

        let angleInit = angle + -0.1 * this.difficulty;
        let angleChange = (0.1 + 0.1 / this.difficulty) * angleChangeMultiplier;
        let numShots = Math.min(Math.floor(this.numShots * this.difficulty), 7);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i+this.delay, [angleChange*i+angleInit, 200]);
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
        
        return (
            isBetween(this.distanceToPlayer, 60, 90)
        );
    }

    canContinueCombo(){
        return (
            isBetween(this.distanceToPlayer, 50, 110)
        )
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