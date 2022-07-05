class DashAttack extends Attack{

    setup(){
        this.friction = this.boss.difficulty;

        this.windupSpeed = this.boss.shootSpeed;
        this.speed = this.boss.dashAttackSpeed / this.boss.localSpeedMult;
        this.lookAheadTime = 0.5;
    }

    canAttack(){
        return true;//isBetween(this.futureDistanceToPlayer, 80, 100);
    }

    canContinueCombo(){
        return isBetween(this.distanceToPlayer, 70, 110);
    }

    delayAttack(){
        super.delayAttack();

        this.boss.minDistance = 0;
        this.boss.maxDistance = 0;
        this.boss.friction = this.friction;
        
        this.lookAheadTime = this.distanceToPlayer / 200;
        this.boss.velocity = this.futureVectorToPlayer;

        this.boss.speed = this.speed;
        this.boss.velocity.magnitude = this.boss.speed;
        
        let dashTime = this.distanceToPlayer / this.boss.speed;

        time.delayedFunction(this, 'finishAttack', dashTime);
    }

    update(){
        super.update();
        if(this.isAttacking && this.distanceToPlayer < 15) this.finishAttack();
    }

    finishAttack(){
        super.finishAttack();

        let myBullet = this.shootBullet(this.boss.velocity.angle, 10, 8, false);
        if(myBullet) {
            myBullet.timeAlive = 0.1;
            myBullet.melee = true;
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
}

class LongDashAttack extends DashAttack{
    canAttack(){
        return this.distanceToPlayer > 110;
    }

    canContinueCombo(){
        return this.distanceToPlayer > 90;
    }
}