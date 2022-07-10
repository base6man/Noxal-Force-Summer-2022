class Shield extends Attack{
    
    setup(){
        this.myBullet;
        this.shieldSpeed = 3;
        this.shieldPosition;
        this.shieldOffset = 0;

        this.canUpdateShield = false;
    }

    // I can update these later, it won't break anything
    canAttack(){
        return true;
    }

    canExtendCombo(){
        return true;
    }

    update(){
        super.update();
        if(this.canUpdateShield){

            this.shieldPosition = this.findShieldPosition();
    
            let offset = new Vector(10, 0);
            offset.angle = this.shieldPosition;
    
            this.myBullet.position = this.boss.position.add(offset);
        }
    }

    findShieldPosition(){
        let lowerValue = this.idealShieldPosition;
        let shieldSpeed = this.shieldSpeed * time.deltaTime;

        // Go up, then down, so it winds up lower
        while(lowerValue < this.shieldPosition) lowerValue += 2*PI;
        while(lowerValue > this.shieldPosition) lowerValue -= 2*PI;

        let shieldPosition = this.shieldPosition;

        if(Math.abs(this.shieldPosition - this.angleToPlayer) < shieldSpeed || Math.abs(this.shieldPosition + 2*PI - this.angleToPlayer) < shieldSpeed) {
            shieldPosition = this.idealShieldPosition; 
        }
        else if(this.shieldPosition - lowerValue < PI) {
            shieldPosition -= shieldSpeed;
        }
        else{ 
            shieldPosition += shieldSpeed;
        }

        console.log(shieldPosition % (2*PI));
        return shieldPosition % (2*PI);
    }

    get idealShieldPosition(){
        return this.angleToPlayer + this.shieldOffset;
    }

    offsetShield(timeOfOffset){
        this.shieldOffset = PI;
        time.delayedFunction(this, 'endShieldOffset', timeOfOffset);
    }

    delayAttack(){
        this.myBullet = this.shootBullet(0, 0);
        this.myBullet.makeBlueBullet();
        this.myBullet.timeAlive = Infinity;
        
        this.shieldPosition = this.angleToPlayer;
        this.canUpdateShield = true;

        this.finishAttack();
    }

    finishAttack(){
        super.finishAttack();
        this.isUpdating = true;
    }
}