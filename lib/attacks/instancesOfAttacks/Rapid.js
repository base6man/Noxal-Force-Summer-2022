class Rapid extends Attack{

    constructor(parent, difficulty, delay){
        super(parent, difficulty, delay);
        
        this.shootTime = 0.1;
        this.delay = 0.3 / this.boss.agressiveness;
    }

    canAttack(){
        return (
            isBetween(this.boss.distanceToPlayer, 85, 90) &&
            this.parent.comboCounter < 3 &&
            super.canAttack()
        );
    }

    attack(){
        super.attack();
    }

    // Not for outside use, use attack instead
    delayAttack(){
        console.assert(!time.isWaiting(this, 'delayAttack'));
        super.delayAttack();
        
        let angle = this.boss.futureAngleToPlayer;
        this.boss.speed = this.boss.shootSpeed;

        let angleInit = angle + -0.1 * this.difficulty;
        let angleChange = 0.1 + 0.1 / this.difficulty;
        let numShots = Math.min(Math.floor(3 * this.difficulty), 7);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i+this.delay, [angleChange*i+angleInit, 200]);
        }
        time.delayedFunction(this, 'finishAttack', this.shootTime*numShots + this.delay);
    }

    finishAttack(){
        super.finishAttack();
    }
}