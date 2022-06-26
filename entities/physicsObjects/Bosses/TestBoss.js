class TestBoss extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 5;
        this.strafeSpeed = 15;

        this.difficulty =        difficulty;
        this.agressiveness =     difficulty;
        this.attackPower =       1 + (this.difficulty-1)/3;
        this.shootSpeed =        this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult =    1 + (this.difficulty-1)/6;
        this.dodgePower =        1 + (this.difficulty-1)/3;
        this.timeBetweenCombos = Math.max(0, 1 - this.difficulty/10);
        
        this.normalMinDistance = 50;
        this.normalMaxDistance = 90;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.distanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.dodgeDist = 100 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;

        this.restrictedAttacks = [];

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

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);

        let dodge = new Combo(
        [
            [new Dodge(this)]
        ]);

        let rapid = new Combo(
        [
            [new Rapid(this)],
            [new Strafe(this, 0.5), new Laser(this, 0.3), new Rapid(this, 0.5)]
        ]);

        let pistol = new Combo(
        [
            [new Pistol(this, 0.4, 0)]
        ]);

        let quadCombo = new Combo(
        [
            [new Quad(this, 0, 1), new Diagonal(this, 0, 2)],
            [new FastDiagonal(this, 0.1, 2)],
            [new FastQuad(this, 0.1, 1)]
        ]);

        let homing = new Combo(
        [
            [new Homing(this, 0.4)],
            [new Homing(this, 0.2, 1)]
        ]);

        let waveLaser = new Combo(
        [
            [new Wave(this), new Laser(this, 0, 99)],
            [new Wave(this, 1), new Laser(this)]
        ])

        this.attackManager.addComboList(
        [
            [dodge],
            [rapid, pistol, quadCombo, homing, waveLaser]
        ]);
    }

    update(){
        super.update();
    }

    updateImage(){
        super.updateImage();
    }
}