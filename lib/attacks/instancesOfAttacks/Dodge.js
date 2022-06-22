class Dodge extends Attack{

    constructor(parent, difficulty, delay){
        super(parent, difficulty, delay);

        this.dodgeTime =   this.boss.dodgeTime;
        this.speed =       this.boss.dodgeSpeed;
        this.maxDistance = this.boss.distanceToDodge;
        this.minDistance = this.boss.minimumDistanceToDodge;

        this.isDodge = true;
    }

    canAttack(strictness = 1){
        return (
            isBetween(this.boss.distanceToPlayer, this.minDistance * strictness, this.maxDistance * strictness) && 
            super.canAttack()
        );
    }

    attack(){
        super.attack();
    }

    delayAttack(){
        console.assert(!time.isWaiting(this, 'delayAttack'));
        super.delayAttack();
        
        if(this.boss.distanceToPlayer < this.maxDistance * 1.3){

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

    finishAttack(){
        super.finishAttack();
    }
}