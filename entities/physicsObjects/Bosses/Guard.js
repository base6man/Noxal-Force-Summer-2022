class Guard extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 5;
        this.strafeSpeed = 12;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        this.normalMinDistance = 70;
        this.normalMaxDistance = 110;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;

        this.distanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.criticalTime = 0;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;

        this.restrictedAttacks = [
            {name: 'eightWay', difficulty: 3},
            {name: 'strafe', difficulty: 1},
            {name: 'laser', difficulty: 2},
            {name: 'wave', difficulty: 2}
        ];

        this.comboList = 
        [
            [
                {firstAttack: 'any', nextAttack: 'dodge', windup: 0.1, agression: 0.25},
                {firstAttack: 'any', nextAttack: 'circleShield'}
            ],
            [
                {firstAttack: 'homing', nextAttack: 'homing', agression: 1.5, windup: 0.6},
                {firstAttack: 'strafe', nextAttack: 'strafe', agression: 1.5},
                {firstAttack: 'pistol', nextAttack: 'pistol', windup: 0.6, agression: 0.5},
                {firstAttack: 'pistol', nextAttack: 'rapid', windup: 0.2, agression: 1.5},
                {firstAttack: 'quad', nextAttack: 'fastDiagonal', parent: 'diagonal', agression: 1.5},
                {firstAttack: 'diagonal', nextAttack: 'fastQuad', parent: 'quad', agression: 1.5},
                {firstAttack: 'wave', nextAttack: 'fastWave', parent: 'wave', agression: 3},
                {firstAttack: 'wave', nextAttack: 'fastLaser', parent: 'laser', agression: 3}
            ],
            [
                {firstAttack: 'idle', nextAttack: 'homing', agression: 0.75},
                {firstAttack: 'idle', nextAttack: 'strafe'},
                {firstAttack: 'idle', nextAttack: 'pistol', agression: 0.5},
                {firstAttack: 'idle', nextAttack: 'eightWay', agression: 2.5},
                {firstAttack: 'idle', nextAttack: 'quad'},
                {firstAttack: 'idle', nextAttack: 'diagonal'},
                {firstAttack: 'idle', nextAttack: 'rapid', windup: 0.5, agression: 2},
                {firstAttack: 'idle', nextAttack: 'shortLaser', parent: 'laser'},
                {firstAttack: 'idle', nextAttack: 'laser', agression: 3},
                {firstAttack: 'idle', nextAttack: 'wave', agression: 3}
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
        this.teleportThroughWalls();
        super.update();
    }

    updateImage(){
        super.updateImage();
    }

    teleportThroughWalls(){
        if(this.position.x >= this.arenaRight - this.collider.width / 2){
            this.position.x = this.arenaLeft + this.collider.width / 2 + 1;
            this.clockwise = !this.clockwise;
        }
        if(this.position.y >= this.arenaTop - this.collider.height / 2){
            this.position.y = this.arenaBottom + this.collider.height / 2 + 1;
            this.clockwise = !this.clockwise;
        }
        if(this.position.x <= this.arenaLeft + this.collider.width / 2){
            this.position.x = this.arenaRight - this.collider.width / 2 - 1;
            this.clockwise = !this.clockwise;
        }
        if(this.position.y <= this.arenaBottom + this.collider.height / 2){
            this.position.y = this.arenaTop - this.collider.width / 2 - 1;
            this.clockwise = !this.clockwise;
        }
    }
}