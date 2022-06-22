class Soldier extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 0;
        this.dashAttackSpeed = 30;
        this.sidestepSpeed = 15;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.normalMinDistance = 0;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 3;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 20 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 40 * (this.dodgePower + 4)/5;
        this.distanceToSidestep = 80 * (this.dodgePower + 4)/5;

        this.dodgeDist = 60 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;
        
        this.knockbackSpeed = 30;
        this.knockbackTime = 0.3;
        
        this.normalLookAheadTime = 0.4;
        this.lookAheadTime = this.normalLookAheadTime;
        
        this.restrictedAttacks = [
            {name: 'wave', difficulty: 3},
            {name: 'rapid', difficulty: 2}
        ];

        this.comboList = 
        [
            [
                {firstAttack: 'any', nextAttack: 'dodge', windup: 0.1, agression: 0.25}
            ],
            [
                {firstAttack: 'dashAttack', nextAttack: 'dashAttack', windup: 0.5},
                {firstAttack: 'dashAttack', nextAttack: 'shortDashAttack', windup: 0.5},
                {firstAttack: 'shortDashAttack', nextAttack: 'shortDashAttack', windup: 0.5},
                {firstAttack: 'pistol', nextAttack: 'dashAttack', windup: 0.4},
                {firstAttack: 'pistol', nextAttack: 'wave', agression: 3, windup: 0.5},
                {firstAttack: 'wave', nextAttack: 'freeDashAttack'},
                {firstAttack: 'rapid', nextAttack: 'freeDashAttack'}
            ],
            [
                {firstAttack: 'idle', nextAttack: 'dashAttack', windup: 0.8},
                {firstAttack: 'idle', nextAttack: 'shortDashAttack', windup: 0.5},
                {firstAttack: 'idle', nextAttack: 'pistol', windup: 0.3},
                {firstAttack: 'idle', nextAttack: 'rapid'},
                {firstAttack: 'any', nextAttack: 'sidestep', agression: 0.25}
            ]
        ];
        console.log(this);
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
    }

    updateImage(){
        super.updateImage();
    }

    pistolCanExcecute(){
        let lastAttack = this.previousAttacks[this.previousAttacks.length - 1];
        return isBetween(this.distanceToPlayer, 90, 110) || this.distanceToPlayer > 140 && this.comboCounter < 5 && lastAttack != 'pistol';
    }

    rapidCanExcecute(){
        return isBetween(this.distanceToPlayer, 110, 140) && this.comboCounter < 4;
    }

    rapid(){
        super.rapid(0.05, 0.1)
    }

    waveCanExcecute(){
        return this.distanceToPlayer > 100;
    }
}