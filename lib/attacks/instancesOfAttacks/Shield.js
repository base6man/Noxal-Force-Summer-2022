class Shield extends Attack{
    
    setup(){
        this.myBullet;
        this.shieldSpeed = 3;
        this.shieldPosition;

        this.isInUse = false;
    }

    // I can update these later, it won't break anything
    canAttack(){
        return !this.isInUse;
    }

    canExtendCombo(){
        return !this.isInUse;
    }

    update(){
        super.update();
        if(this.isInUse){

            this.shieldPosition = this.findShieldPosition();
    
            this.offset = new Vector(15, 0);
            this.offset.angle = this.shieldPosition;
    
            this.myBullet.position = this.boss.position.add(this.offset);
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

        return shieldPosition % (2*PI);
    }

    get idealShieldPosition(){
        return this.angleToPlayer + this.shieldOffset;
    }

    get shieldOffset(){
        return this.boss.shieldIsOffset * PI;
    }

    delayAttack(){
        if(this.myBullet) this.myBullet.dissapate();

        this.myBullet = this.shootBullet(0, 0);
        this.myBullet.makeBlueBullet();
        this.myBullet.timeAlive = Infinity;
        this.myBullet.rotationTarget = this;
        
        this.shieldPosition = this.angleToPlayer;
        this.offset = new Vector(15, 0);
        this.offset.angle = this.shieldPosition;

        this.myBullet.position = this.boss.position.add(this.offset);

        this.isInUse = true;

        this.finishAttack();
    }

    finishAttack(){
        super.finishAttack();
        this.isUpdating = true;
    }

    get direction(){
        return this.offset.direction;
    }

    get diagonal(){
        return this.offset.diagonal;
    }
}