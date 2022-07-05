class Sidestep extends Attack{
    
    setup(){
        this.speed = this.boss.sidestepSpeed;
        this.windupSpeed = this.boss.runSpeed;

        this.minDistance = this.boss.distanceToDodge;
        this.maxDistance = this.minDistance * 1.5;

        this.isDodge = true;
        this.dodgeTime = this.boss.dodgeTime;
    }

    canAttack(strictness = 1){
        return (
            isBetween(this.distanceToPlayer, this.minDistance * strictness, this.maxDistance / strictness) &&
            this.combo.numAttacks < 2
        );
    }

    canContinueCombo(){
        return this.canAttack(0.5);
    }

    delayAttack(){
        this.boss.speed = this.speed;

        this.boss.minDistance = 0;
        this.boss.maxDistance = Infinity;
        
        if(this.boss.clockwise) this.boss.velocity.angle = this.vectorToPlayer.angle - PI/2;
        else{                   this.boss.velocity.angle = this.vectorToPlayer.angle + PI/2;}
        this.boss.velocity.magnitude = this.boss.speed;
        
        time.delayedFunction(this, 'finishAttack', this.dodgeTime);
    }
}