class Guard extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 5;
        this.strafeSpeed = 12;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localspeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        this.normalMinDistance = 50;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speedMult = 8 * this.localspeedMult;
        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;

        this.distanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;

        this.attackList = [
            {name: 'dodge', difficulty: 0},
            {name: 'circleShield', difficulty: 0, maxDifficulty: 0},
            {name: 'homing', difficulty: 1},
            {name: 'pistol', difficulty: 1},
            {name: 'rapid', difficulty: 1},
            {name: 'quad', difficulty: 1},
            {name: 'diagonal', difficulty: 1},
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

    circleShieldCanExcecute(){
        return true;
    }

    circleShield(){
        let numShots = 8;
        let delay = 0;
        let shootTime = 0.05;
        let angleInit = 0;
        let angleChange = PI/4;

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'circleShield_shootBullet', shootTime*i+delay, [angleChange*i+angleInit, 0.00001, 15]);
        }
    }

    circleShield_shootBullet(angle, speed, offset){
        let myBullet = this.shootBullet(angle, speed, offset, false);
        if(myBullet) {
            this.currentBullets.push(myBullet);
            myBullet.timeAlive = Infinity;
            myBullet.melee = true;
            myBullet.makeBlueBullet();
        }
    }

    rapidCanExcecute(){
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 1];
        return (
            this.distanceToPlayer.between(85, 90) && 
            this.comboCounter < 3 && previousAttack != 'rapid'
        );
    }

    delay_rapid(){ this.rapid(); }
    rapid(){
        let angle = this.futureAngleToPlayer;
        this.speed = this.shootSpeed;

        let angleInit = -0.1 * this.attackPower;
        let angleChange = 0.1 + 0.1 / this.attackPower;

        let shootTime = 0.1;
        let delay = 0.3/this.agressiveness;
        let numShots = Math.min(Math.floor(3 * this.attackPower), 7);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay, [angle + angleChange*i+angleInit, 200]);
        }
        time.delayedFunction(this, 'rapidFinish', shootTime*numShots + delay + this.dodgeTime);
    }

    rapidFinish(){
        this.decideNextAttack('rapid');
    }

    quadCanExcecute(){
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 2];
        return (
            (this.futureAngleToPlayer % PI/2).between(0.4, PI/2 - 0.4) &&
            this.distanceToPlayer.between(60, 110) &&
            this.comboCounter < 4 && previousAttack != 'quad'
        );
    }

    diagonalCanExcecute(){
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 2];
        return (
            (this.futureAngleToPlayer % PI/2).between(PI/4 - 0.4, PI/4 + 0.4) &&
            this.distanceToPlayer.between(60, 110) &&
            this.comboCounter < 4 && previousAttack != 'diagonal'
        );
    }

    eightWayCanExcecute(){
        return this.quadCanExcecute() || this.diagonalCanExcecute();
    }
    eightWay(){
        this.quad(0, true, 'eightWay', PI/4)
    }

    diagonal(){ this.quad(PI/4), false, 'diagonal'; }
    fastDiagonal(){ this.quad(PI/4, true, 'diagonal'); }
    fastQuad(){ this.quad(0, true, 'quad'); }

    delay_quad(){ this.quad(); }
    quad(angleInit = 0, isFast = false, name = 'quad', angleChange = PI/2){
        this.speed = this.shootSpeed;

        let shootTime, delay;
        if(isFast){
            shootTime = 0.08/this.attackPower;
            delay = 0;
        }
        else{
            shootTime = 0.12/this.attackPower;
            delay = 0.12/this.agressiveness;
        }

        // Because it should go in exactly one circle
        let numShots = 2*PI / angleChange;
        console.assert(Math.floor(numShots) == numShots, angleChange, numShots);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'quad_shootBullet', shootTime*i+delay, [angleChange*i+angleInit, 0.001, 5]);
        }
        time.delayedFunction(this, 'quadFinish', shootTime*numShots + delay, [name]);
        time.delayedFunction(this, 'quadSendOut', shootTime*numShots + delay);
    }

    quad_shootBullet(angle, speed, offset){
        let myBullet = this.shootBullet(angle, speed, offset)
        if(myBullet) this.currentBullets.push(myBullet);
    }

    quadSendOut(){
        for(let i in this.currentBullets){
            this.currentBullets[i].velocity.magnitude = 150;
        }
        this.currentBullets = [];
    }

    quadFinish(name){
        this.decideNextAttack(name);
    }

    laserCanExcecute(){
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 1];
        return (
            (this.position.magnitude > 120 || this.target.position.magnitude > 120) && 
            this.comboCounter < 6.5 &&
            this.distanceToPlayer.between(80, 110) &&
            previousAttack != 'laser'
        );
    }

    shortLaser(){ this.laser(0.2, 1); }
    fastLaser(){ this.laser(0, 2); }
    delay_laser(){ this.laser(); }
    laser(delay = 1, duration = 2){
        this.speed = this.shootSpeed/2;

        delay = delay/this.agressiveness;
        let shootTime = 0.04;
        let laserDuration = duration;
        let numShots = Math.floor(laserDuration / shootTime);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'laser_shootBullet', shootTime*i+delay);
        }
        time.delayedFunction(this, 'laserFinish', laserDuration + delay);
    }

    laser_shootBullet(){

        let bulletVelocity = new Vector(1, 0);
        bulletVelocity.angle = this.angleToPlayer;
        
        let velocityVector = this.target.velocity.copy();
        velocityVector.magnitude = 0.05 * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);
        bulletVelocity = bulletVelocity.add(velocityVector);

        let myBullet = this.shootBullet(bulletVelocity.angle, 160);
        if(myBullet){
            myBullet.image = bulletImage[2];
            myBullet.timeAlive = 2;
        }
    }

    laserFinish(){
        this.decideNextAttack('laser');
    }

    waveCanExcecute(){
        let xAttacksAgo = this.previousAttacks[this.previousAttacks.length - Math.floor(1*this.attackPower)];
        return(
            this.distanceToPlayer.between(90, 110) &&
            this.futureDistanceToPlayer.between(80, 100) &&
            this.comboCounter < 6.5 && 
            xAttacksAgo != 'wave'
        );
    }

    fastWave(){ this.wave(1.2); }
    delay_wave(){ this.wave(); }
    wave(delay = 1.8){
        this.speed = 0;
        let trueDelay = delay/this.agressiveness;
        time.delayedFunction(this, 'waveFinish', trueDelay);
    }

    waveFinish(){
        for(let i = 0; i < 2*PI; i += 0.12){
            let myBullet = this.shootBullet(i, 1, 0, false);
            if(myBullet) {
                myBullet.image = bulletImage[2];
                myBullet.acceleration = 200;
                myBullet.timeAlive = 2;
            }
        }
        this.decideNextAttack('wave');
    }

    strafeCanExcecute(){
        return (
            this.position.magnitude < 60 && 
            this.target.position.magnitude < 60 &&
            this.distanceToPlayer.between(50, 75) && 
            this.comboCounter < 4);
    }

    delay_strafe(){ this.strafe(); }
    strafe(){
        this.speed = this.strafeSpeed;
        this.minDistance = 0;
        this.maxDistance = 150;
        this.friction = 10;
        this.clockwise = !this.clockwise;

        let numShots = Math.min(Math.floor(3 * this.attackPower), 6);
        let shootTime = 0.4 / this.localspeedMult;
        let delay = 0.2 / this.agressiveness;

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'strafe_shootBullet', shootTime*i+delay);
        }
        time.delayedFunction(this, 'strafeFinish', shootTime*numShots + delay);
    }

    strafe_shootBullet(){
        let myBullet = this.shootBullet(0, 0);
        if(myBullet){
            myBullet.homing = 1;
            myBullet.timeAlive = 2;
        }
    }

    strafeFinish(){
        this.decideNextAttack('strafe');
    }

    homingCanExcecute(){
        let xAttacksAgo = this.previousAttacks[this.previousAttacks.length - Math.min(Math.floor(2*this.attackPower), 5)];
        return this.distanceToPlayer > 110 && this.comboCounter < 4 && xAttacksAgo != 'homing';
    }

    delay_homing(){ this.homing(); }
    homing(){
        let myBullet = this.shootBullet(this.angleToPlayer + PI, 100);
        if(myBullet){
            myBullet.homing = 2;
            myBullet.timeHoming = 1;
        }
        
        this.decideNextAttack('homing');
    }
}