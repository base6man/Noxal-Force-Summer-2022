class Teleport extends Attack{
    setup(){
        this.distanceFromCenter = this.boss.arenaSize.y/2;
        this.isDodge = true;
        this.arenaCenter = this.boss.arenaCenter
    }

    canAttack(){
        return this.boss.isTouchingWall && this.distanceToPlayer < this.boss.maxDistance;
    }

    canContinueCombo(){
        return this.boss.isTouchingWall;
    }

    delayAttack(){

        this.boss.position = this.arenaCenter;

        let newVector = new Vector(1, 0);
        newVector.magnitude = this.distanceFromCenter;
        newVector.angle = this.angleToPlayer + PI;

        this.boss.position = this.arenaCenter.add(newVector);

        console.log('teleported!', this.boss.position, this.boss.velocity)
        this.finishAttack();
    }
}