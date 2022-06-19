class Knight extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 3;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localspeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        this.normalMinDistance = 70;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speedMult *= this.localspeedMult;
        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.distanceToShield = 70 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 40 * (this.dodgePower + 4)/5;
        this.dodgeDist = 40 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;

        this.shieldBulletPosition = -PI;
        this.timeForShieldToMakeFullCircle = 0.5;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;

        this.attackList = [
            {name: 'dodge', difficulty: 0},
            {name: 'circleShield', difficulty: 0}
        ];

        this.comboList = 
        [
            [
                {firstAttack: 'any', nextAttack: 'dodge', agression: 0.25},
                {firstAttack: 'any', nextAttack: 'circleShield', windup: 0.1, agression: 0.5}
            ],
            [

            ],
            [

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
    }

    updateShieldBullet(){
        let moveSpeed = 2*PI * time.deltaTime / this.timeForShieldToMakeFullCircle;

        let lowerValue = this.angleToPlayer;
        if(lowerValue < 0) lowerValue += 2*PI;
        console.assert(lowerValue + 2*PI > this.shieldBulletPosition, lowerValue, this.shieldBulletPosition);
        if(lowerValue > this.shieldBulletPosition) lowerValue -= 2*PI;

        if(Math.abs(this.shieldBulletPosition - this.angleToPlayer) < moveSpeed || Math.abs(this.shieldBulletPosition + 2*PI - this.angleToPlayer) < moveSpeed) {
            this.shieldBulletPosition = this.angleToPlayer; 
        }
        else if(this.shieldBulletPosition - lowerValue < PI) {
            this.shieldBulletPosition -= moveSpeed;
        }
        else{ 
            this.shieldBulletPosition += moveSpeed;
        }

        this.shieldBulletPosition = this.shieldBulletPosition % (2*PI);

        let offset = new Vector(15, 0);
        offset.angle = this.shieldBulletPosition;

        let myBullet = new Bullet(bulletImage[0], this.position.add(offset));
        myBullet.timeAlive = 0;
        myBullet.makeBlueBullet();
    }

    updateImage(){
        super.updateImage();
    }
}