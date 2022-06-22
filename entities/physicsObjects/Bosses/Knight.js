class Knight extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 3;
        this.dashAttackSpeed = 20;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        this.normalMinDistance = 70;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.distanceToShield = 70 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 40 * (this.dodgePower + 4)/5;
        this.dodgeDist = 40 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;

        this.shieldPosition = -PI;
        this.timeForShieldToMakeFullCircle = 0.5;
        this.shieldOffset = 0;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;

        this.restrictedAttacks = [];

        this.comboList = 
        [
            [
                {firstAttack: 'any', nextAttack: 'dodge', agression: 0.25}
            ],
            [
                {firstAttack: 'any', nextAttack: 'circleShield', windup: 0.1, agression: 0.5}

            ],
            [
                {firstAttack: 'idle', nextAttack: 'dashAttack', windup: 0.8},
            ]
        ];
    }
    
    createAnimations(){
        let listOfAnimations = [];


        let attackAnimation = {
            parent: this, 
            name: 'attack',
            animation: new Animator('attack', bossImages.attack, 0.3),
            get canRun(){
                return this.parent.isAttacking && this.parent.previousAttacks[this.parent.previousAttacks.length - 1] != 'dodge';
            }
        }
        listOfAnimations.push(attackAnimation);

        
        let idleAnimation = {
            parent: this,
            name: 'idle',
            animation: new Animator('idle', bossImages.idle, 0.8),
            get canRun(){
                return !this.parent.isAttacking;
            }
        }
        listOfAnimations.push(idleAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    update(){
        super.update();
        this.updateShieldBullet();
        console.log(this.isTouchingWall);
    }

    get idealShieldPosition(){
        return this.angleToPlayer + this.shieldOffset;
    }

    offsetShield(timeOfOffset){
        this.shieldOffset = PI;
        time.delayedFunction(this, 'endShieldOffset', timeOfOffset);
    }

    endShieldOffset(){
        this.shieldOffset = 0;
    }

    updateShieldBullet(){
        let moveSpeed = 2*PI * time.deltaTime / this.timeForShieldToMakeFullCircle;

        let lowerValue = this.idealShieldPosition;

        // Go up, then down, so it winds up lower
        while(lowerValue < this.shieldPosition) lowerValue += 2*PI;
        while(lowerValue > this.shieldPosition) lowerValue -= 2*PI;

        if(Math.abs(this.shieldPosition - this.angleToPlayer) < moveSpeed || Math.abs(this.shieldPosition + 2*PI - this.angleToPlayer) < moveSpeed) {
            this.shieldPosition = this.idealShieldPosition; 
        }
        else if(this.shieldPosition - lowerValue < PI) {
            this.shieldPosition -= moveSpeed;
        }
        else{ 
            this.shieldPosition += moveSpeed;
        }

        this.shieldPosition = this.shieldPosition % (2*PI);

        let offset = new Vector(10, 0);
        offset.angle = this.shieldPosition;

        let myBullet = new Bullet(bulletImage[0], this.position.add(offset));
        myBullet.timeAlive = 0;
        myBullet.makeBlueBullet();
    }

    updateImage(){
        super.updateImage();
    }

    dashAttack(){
        super.dashAttack();
        this.offsetShield(this.distanceToPlayer / this.speed);
    }
}