class Soldier extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 8;
        this.dashAttackSpeed = 40;
        this.sidestepSpeed = 25;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localspeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.normalMinDistance = 0;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;
        
        this.speedMult = 8; // * this.localspeedMult;
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

        this.criticalTime = 1;
        
        this.attackList = [
            {name: 'dodge', difficulty: 0},
            {name: 'sidestep', difficulty: 0},
            {name: 'dashAttack', difficulty: 1},
            {name: 'pistol', difficulty: 1}
        ];

        this.comboList = 
        [
            [
                {firstAttack: 'any', nextAttack: 'dodge', windup: 0.1, agression: 0.25}
            ],
            [
                {firstAttack: 'dashAttack', nextAttack: 'dashAttack', windup: 0.2},
                {firstAttack: 'dashAttack', nextAttack: 'littleHit'},
                {firstAttack: 'littleHit', nextAttack: 'littleHit'},
                {firstAttack: 'pistol', nextAttack: 'dashAttack', windup: 0.1}
            ],
            [
                {firstAttack: 'idle', nextAttack: 'dashAttack', windup: 0.3},
                {firstAttack: 'idle', nextAttack: 'littleHit', windup: 0.1},
                {firstAttack: 'idle', nextAttack: 'pistol'},
                {firstAttack: 'any', nextAttack: 'sidestep', agression: 0.25}
            ]
        ];
        console.log(this);
    }

    createAnimations(){
        let listOfAnimations = [];


        let attackAnimation = {
            name: 'attack',
            animation: new Animator('attack', bossImages.attack, 0.3),
            get canRun(){
                return scene.bossManager.boss.isAttacking && scene.bossManager.boss.previousAttacks[scene.bossManager.boss.previousAttacks.length - 1] != 'dodge';
            }
        }
        listOfAnimations.push(attackAnimation);

        
        let idleAnimation = {
            name: 'idle',
            animation: new Animator('idle', bossImages.idle, 0.8),
            get canRun(){
                return !scene.bossManager.boss.isAttacking;
            }
        }
        listOfAnimations.push(idleAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    update(){
        super.update();
        this.seeIfIShouldReverseDirections(this.criticalTime);
    }

    updateImage(){
        super.updateImage();
    }

    seeIfIShouldReverseDirections(criticalTime){
        let futurePosition = this.position.add(this.velocity.multiply(criticalTime));
        if(
            !this.attackName && !this.isDodging &&
            (futurePosition.x > this.arenaRight ||
            futurePosition.x < this.arenaLeft ||
            futurePosition.y > this.arenaTop ||
            futurePosition.y < this.arenaBottom)
            ){
                console.log('Switching!');
                this.clockwise = !this.clockwise;
            }
    }

    sidestepCanExcecute(){
        let xAttacksAgo = this.previousAttacks[this.previousAttacks.length - Math.floor(this.dodgePower)];
        return (
            this.distanceToPlayer < this.distanceToSidestep &&
            this.distanceToPlayer > this.minimumDistanceToDodge &&
            xAttacksAgo != 'sidestep'
            );
    }

    delay_sidestep(){ this.sidestep(); }
    sidestep(){
        this.dodging = true;

        this.speed = this.sidestepSpeed;
        this.velocity = this.vectorToPlayer;
        this.velocity.magnitude = this.speed;

        if(this.clockwise){ this.velocity.angle -= PI/4; }
        else{ this.velocity.angle += PI/4; }

        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.friction = 8;

        let sidestepTime = 0.6;
        
        this.seeIfIShouldReverseDirections(sidestepTime);
        time.delayedFunction(this, 'endDodge', sidestepTime);
    }

    littleHitCanExcecute(){
        return this.distanceToPlayer < this.minimumDistanceToDodge;
    }

    delay_littleHit(){ this.littleHit(); }
    littleHit(){ this.dashAttack(false); }

    dashAttackCanExcecute(){
        return this.distanceToPlayer < 100 && this.comboCounter < 6;
    }

    delay_dashAttack(){ this.dashAttack(); }
    dashAttack(lookAhead = true){
        this.speed = this.dashAttackSpeed;
        let dashTime = this.distanceToPlayer / this.speed;

        this.minDistance = 0;
        this.maxDistance = 0;
        this.friction = 0;
        
        if(lookAhead) this.velocity = this.futureVectorToPlayer;
        else{ this.velocity = this.vectorToPlayer; }
        this.velocity.magnitude = this.speed;

        time.delayedFunction(this, 'dashAttackFinish', dashTime);
    }

    dashAttackFinish(){
        let myBullet = this.shootBullet(this.velocity.angle, 10, 8, false);
        if(myBullet) {
            myBullet.timeAlive = 0.1;
            myBullet.melee = true;
        }
        this.decideNextAttack('dashAttack');
    }
    
    pistolCanExcecute(){
        return this.distanceToPlayer > 100 && this.comboCounter < 5;
    }
}