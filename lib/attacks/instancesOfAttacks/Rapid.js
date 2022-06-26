class Rapid extends Attack{

    setup(){
        this.shootTime = 0.1;
        this.speed = this.boss.shootSpeed;
        this.delay = 0.3 / this.boss.agressiveness;
    }

    canAttack(){
        return (
            isBetween(this.distanceToPlayer, 85, 90) &&
            this.comboCounter < 3 &&
            super.canAttack()
        );
    }

    canContinueCombo(){
        return (
            isBetween(this.distanceToPlayer, 70, 110) &&
            super.canContinueCombo()
        )
    }

    // Not for outside use, use attack instead
    delayAttack(){
        super.delayAttack();
        
        let angle = this.futureAngleToPlayer;

        let angleInit = angle + -0.1 * this.difficulty;
        let angleChange = 0.1 + 0.1 / this.difficulty;
        let numShots = Math.min(Math.floor(3 * this.difficulty), 7);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i+this.delay, [angleChange*i+angleInit, 200]);
        }
        time.delayedFunction(this, 'finishAttack', this.shootTime*numShots + this.delay);
    }
}