class DashAttack extends Attack{

    setup(){
        this.friction = this.boss.difficulty;

        this.windupSpeed = this.boss.shootSpeed;
        this.speed = this.boss.dashAttackSpeed / this.boss.localSpeedMult;
        this.lookAheadTime = 0.5;
    }

    canAttack(){
        return true;
    }

    canContinueCombo(){
        return isBetween(this.distanceToPlayer, 70, 110);
    }

    delayAttack(isFake = false){
        super.delayAttack();

        this.boss.minDistance = 0;
        this.boss.maxDistance = 0;
        this.boss.friction = this.friction;
        
        this.lookAheadTime = this.distanceToPlayer / 200;
        this.boss.velocity = this.futureVectorToPlayer;

        this.boss.speed = this.speed;
        this.boss.velocity.magnitude = this.boss.speed;
        
        let dashTime;
        if(isFake){
            dashTime = this.distanceToPlayer / this.boss.speed * 2/5;
        }
        else{
            dashTime = this.distanceToPlayer / this.boss.speed;
        }

        time.delayedFunction(this, 'finishAttack', dashTime);
    }

    update(){
        super.update();
        if(this.isAttacking && this.distanceToPlayer < 15) this.finishAttack();
    }

    finishAttack(isFake = false){
        super.finishAttack();

        let myBullet = this.shootBullet(this.boss.velocity.angle, 10, 8, false);
        if(myBullet) {
            if(isFake){
                myBullet.velocity.magnitude = 160;
                myBullet.homing = 150;
                myBullet.timeAlive = 0.5;
            }
            else{
                myBullet.timeAlive = 0.1;
                myBullet.melee = true;
            }
        }
    }
}

class ShortDashAttack extends DashAttack{

    setup(){
        super.setup();
        this.maxDistance = this.boss.minimumDistanceToDodge;
        this.maxAttacks = Math.min(Math.floor(2*this.difficulty), 4);
        this.maxParentDelay = 0.4;
    }

    canAttack(){
        return this.distanceToPlayer < this.maxDistance;
    }

    canContinueCombo(){
        return this.distanceToPlayer < 70 && this.combo.numAttacks < this.maxAttacks;
    }

    delayAttack(){
        if(this.distanceToPlayer < this.maxDistance * 2){
            super.delayAttack();
        }
        else{
            this.finishAttack();
        }
    }
}

class LongDashAttack extends DashAttack{
    canAttack(){
        return this.distanceToPlayer > 110;
    }

    canContinueCombo(){
        return this.distanceToPlayer > 90;
    }
}

class FakeDashAttack extends DashAttack{

    setup(){
        super.setup();
        
        this.isFake = false;
        if(Math.random() > 0.5) this.isFake = true;
        if(this.isFake){
            this.differentComboDestination = 'sidestep';
            this.destination = 1;
        }
    }

    delayAttack(){
        super.delayAttack(this.isFake);
    }

    finishAttack(){
        super.finishAttack(this.isFake);
    }
}