class Boss extends PhysicsObject{
    /**
     * @param {Vector} arenaCenter Starting position, also center of arena. Can change starting position later by editing position
     * @param {Vector} arenaSize Size of the arena, in a vector
     */
    constructor(arenaCenter, arenaSize, difficulty){
        // Starts at the velocity (1, -1). May need to make this more versatile
        super(arenaCenter.x, arenaCenter.y, 1, -1);
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'boss';
        this.name = 'boss';

        this.runSpeed = 5;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localspeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-2)/3;

        this.normalMinDistance = 50;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.strafeSpeed = 12;

        this.speedMult = 8 * this.localspeedMult;
        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;
        this.clockwise = true;
        
        this.distanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        this.dodgeSpeed = this.dodgeDist / this.dodgeTime / this.speedMult;
        this.dodging = false;

        this.invincible = false;
        this.health = 3;
        this.invinTime = 0.2;

        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;
        this.knockedback = false;

        this.arenaRight = arenaCenter.x + arenaSize.x/2;
        this.arenaTop = arenaCenter.y + arenaSize.y/2;
        this.arenaLeft = arenaCenter.x - arenaSize.x/2;
        this.arenaBottom = arenaCenter.y - arenaSize.y/2;

        this.target = scene.player;
        this.isAttacking = false;
        this.attackName = null;
        this.comboCounter = 0;
        this.previousAttacks = [];
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

        this.myWall;

        this.targetQuote = '';
        this.previousQuotes = [];
        this.quoteSpeed = 0.05;  // Time in between letters
        this.quoteList = 
        [
            [
                new Quote(this, 'Hello!', [{name: 'difficultyIs', param: [0]}], 1),
                new Quote(this, "Let's start with the basics.", [{name: 'difficultyIs', param: [0]}], 2),
                new Quote(this, 'Use the WASD keys to move.', [{name: 'difficultyIs', param: [0]}], 3),
                new Quote(this, 'Press SPACE to dash.', [{name: 'difficultyIs', param: [0]}], 4),
                new Quote(this, 'Dashing into me will deal damage.', [{name: 'difficultyIs', param: [0]}], 5),
                new Quote(this, "Though that's not something we want, is it?", [{name: 'difficultyIs', param: [0]}], 6),
                new Quote(this, "You can control your ghost with the IJKL keys.", [{name: 'difficultyIs', param: [0]}], 7),
                new Quote(this, 'It will allow you to teleport somewhere else!', [{name: 'difficultyIs', param: [0]}], 8)
            ],
            [
                {quote: 'No quote', canExcecute: function(){ return true; }}, // Easy way when he doesn't have anything to say
            ]
        ]
        time.delayedFunction(this, 'decideNextQuote', 1);

        // Used on each attack to remember the bullets shot
        // Cleared upon a new attack
        this.currentBullets = [];

        if(difficulty == 0) this.decideNextAttack('idle');
        else{ time.delayedFunction(this, 'decideNextAttack', 2/this.agressiveness, ['idle']); }
        

        // First attack is the attack you combo from
        // Next attack is the attack you combo to
        // windup is the time between the attacks
        // can excecute calls a function I'll define elsewhere determining if you should do the attack
        // Only does combos of 2 right now, no dedicated 3 attack combos
        // But it can chain multiple 2 attack combos together, so that's fine
        // I'll just add a combo counter telling it where to end
        // Yeah
        // Don't worry about the length of the line, otherwise it would have to be like 6 lines
        // For each combo
        //
        // Earlier combos listed get precedence
        // This is important, because pistol to pistol is objectively superior to any to pistol
        // The boss should never do any to pistol after a pistol move
        //
        // When a combo is done, it is moved to the end of the little list it's in
        // they never move big lists
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
        
        this.balanceAttacks();
        this.createAnimations();
    }

    setAttacks(attackList){
        let finalList = [[]];
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];
                let keepItem = false;
                for(let k in attackList){
                    if(combo.nextAttack == attackList[k] || combo.parent == attackList[k]){
                        keepItem = true;
                    }
                }

                if(keepItem) finalList[i].push(combo);
            }
            finalList.push([]);
        }

        for(let i = finalList.length-1; i >= 0; i--){
            if(finalList[i].length == 0) finalList.splice(i, 1);
        }

        this.comboList = finalList;
    }

    balanceAttacks(){
        let finalList = [[]];
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];

                let attack;
                if(combo.parent) attack = combo.parent;
                else{ attack = combo.nextAttack; }

                let keepItem = false;
                for(let i in this.attackList){
                    let myAttack = this.attackList[i];
                    if(myAttack.name == attack && 
                        myAttack.difficulty <= this.difficulty &&
                        (myAttack.maxDifficulty >= this.difficulty || typeof myAttack.maxDifficulty == 'undefined')
                    ){ 
                        keepItem = true;
                    }
                }

                if(keepItem) finalList[i].push(combo);
            }
            finalList.push([]);
        }

        for(let i = finalList.length-1; i >= 0; i--){
            if(finalList[i].length == 0) finalList.splice(i, 1);
        }

        this.comboList = finalList;
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
        let initialPosition = this.position.copy();

        if(!this.knockedback) this.velocity = this.updateVelocity(); 
        this.teleportThroughWalls();
        super.update();
        for(let i in this.currentBullets){
            // Get the bullets the same relative to the boss
            this.currentBullets[i].position = this.currentBullets[i].position.add(this.position).subtract(initialPosition);
        }
    }

    updateImage(){
        this.animationManager.update();
        this.animationManager.draw(this.position.x, this.position.y, this.direction);
    }

    updateVelocity(){

        let frictionEffect = time.deltaTime * this.friction;
        let movementVector;

        if(this.distanceToPlayer < this.minDistance){
            movementVector = this.vectorToPlayer.multiply(-1);
        }
        else if (this.distanceToPlayer < this.maxDistance){
            if(this.clockwise){
                movementVector = new Vector(this.vectorToPlayer.y, -this.vectorToPlayer.x);
            }
            else{
                movementVector = new Vector(-this.vectorToPlayer.y, this.vectorToPlayer.x);
            }
        }
        else{
            movementVector = this.vectorToPlayer;
        }

        movementVector.magnitude = this.speed;

        let newVelocity = this.velocity.addWithFriction(movementVector, frictionEffect);
        return newVelocity;
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

    decideNextAttack(previousAttackName){
        console.assert(!time.isWaiting(this, 'decideNextAttack'), time.waitingFunctions(), this.previousAttacks);
        this.returnToRunSpeed();
        this.currentBullets = [];

        let startingAttack = false;
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];

                let parent;
                if(combo.parent) parent = combo.parent; 
                else{ parent = combo.nextAttack; }

                if(
                    (combo.firstAttack == previousAttackName || combo.firstAttack == 'any') && 
                    this[parent + 'CanExcecute']() && !startingAttack
                ){
                    let temp = combo;
                    this.comboList[i].splice(j, 1);
                    this.comboList[i].push(temp);

                    startingAttack = true;
                    this.isAttacking = true;
                    this.attackName = new RegExp('(' + parent + ')');
                    this.previousAttacks.push(parent);
                    if(combo.agression) this.incrementCombo(combo.agression);
                    else{ this.incrementCombo(1); }

                    if(combo.windup){ 
                        let trueWindup;
                        if(parent == 'dodge') trueWindup = combo.windup / this.dodgePower;
                        else{ trueWindup = combo.windup / this.agressiveness; }
                        time.delayedFunction(this, 'delay_' + combo.nextAttack, trueWindup); 
                    }
                    else{ this[combo.nextAttack](); }
                }
            }
        }

        if(!startingAttack){
            time.delayedFunction(this, 'decideNextAttack', this.comboCounter/2, ['idle']);
            this.isAttacking = false;
            this.comboCounter = this.comboCounter / 2;
            this.attackName = null;
        }
    }

    get comboCounter(){
        return this.trueComboCounter;
    }

    // Isn't affected by agression, does exactly what it professes to
    set comboCounter(_comboCounter){
        this.trueComboCounter = _comboCounter;
    }

    // Changing the boss' agression fiddles with this function, and makes it more or less effective
    incrementCombo(comboAdd){
        this.trueComboCounter += comboAdd / this.agressiveness;
    }

    get distanceToPlayer(){
        return this.position.subtract(this.target.position).magnitude;
    }

    get futureDistanceToPlayer(){
        return this.position.subtract(this.target.position).add(this.target.velocity).magnitude;
    }

    get vectorToPlayer(){
        return this.target.position.subtract(this.position);
    }

    get futureVectorToPlayer(){
        return this.target.position.subtract(this.position).add(this.target.velocity);
    }

    get angleToPlayer(){
        let vector = this.vectorToPlayer;
        return Math.atan2(vector.y, vector.x);
    }

    get futureAngleToPlayer(){
        let vector = this.futureVectorToPlayer;
        return Math.atan2(vector.y, vector.x);
    }

    get futurePlayerPosition(){
        return this.target.position.add(this.target.velocity);
    }

    get speed(){
        return this.maxSpeed;
    }

    set speed(_speed){
        this.maxSpeed = _speed * this.speedMult;
        this.velocity.magnitude = this.speed;
    }

    shootBullet(angle, speed, offset = 0, canDodgeOut = true){
        
        if(this.dodgeCanExcecute(0.6) && canDodgeOut){ 
            this.dodge(false);
            time.stopFunctionsWithKeyword(this, /(shootBullet)/);
            return;
        }

        // I don't really care about this line, but I am setting the magnitude here.
        // I can't set it to zero zero, unfortunately
        let bulletVelocity = new Vector(speed, 0);
        bulletVelocity.angle = angle;

        let offsetVector = new Vector(offset, 0);
        offsetVector.angle = angle;
        let startingPosition = this.position.add(offsetVector);

        let myBullet;
        myBullet = new Bullet(bulletImage[0], startingPosition, bulletVelocity);

        return myBullet;
        // Returns the bullet so someone can add homing
    }

    dodgeCanExcecute(strictness = 1){
        let xAttacksAgo = this.previousAttacks[this.previousAttacks.length - Math.floor(this.dodgePower)];
        return (
            this.distanceToPlayer < this.distanceToDodge * strictness &&
            (xAttacksAgo != 'dodge' || difficulty == 0)
        );
    }

    delay_dodge() { this.dodge(); }
    dodge(decideAttack = true){
        if(this.distanceToPlayer < this.distanceToDodge * 1.3){
            this.dodging = true;

            this.speed = this.dodgeSpeed;
            this.velocity = this.vectorToPlayer.multiply(-1);
            this.velocity.magnitude = this.speed;

            if(decideAttack){
                //let myBullet = this.shootBullet(this.vectorToPlayer.angle, 15, 0, false);
                //myBullet.timeAlive = 0.2;
            }

            time.delayedFunction(this, 'endDodge', this.dodgeTime, [decideAttack]);
        }
        else{
            this.decideNextAttack('idle');
        }
    }

    endDodge(decideAttack = true){
        this.dodging = false;
        this.speed = this.runSpeed;
        if(decideAttack){ this.decideNextAttack('dodge'); }
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

    returnToRunSpeed(){
        // For a delayed time function; will probably use a lot
        // Also returns lots of other variables to their normal state
        this.speed = this.runSpeed;
        this.friction = this.normalFriction;
        this.maxDistance = this.normalMaxDistance;
        this.minDistance = this.normalMinDistance;
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
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 1];
        return (
            (this.futureAngleToPlayer % PI/2).between(0.4, PI/2 - 0.4) &&
            this.distanceToPlayer.between(60, 110) &&
            this.comboCounter < 4 && previousAttack != 'quad'
        );
    }

    diagonalCanExcecute(){
        let previousAttack = this.previousAttacks[this.previousAttacks.length - 1];
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

    pistolCanExcecute(){
        return (
            this.distanceToPlayer.between(50, 75) && 
            this.futureDistanceToPlayer.between(50, 75) &&
            this.comboCounter < 5
        );
    }

    delay_pistol(){ this.pistol(); }
    pistol(){
        let velocityCurve = 0.8 * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);

        let bulletVector = this.vectorToPlayer;
        bulletVector.magnitude = 1;

        let playerVelocity = this.target.velocity.copy();
        playerVelocity.magnitude = velocityCurve;

        bulletVector = bulletVector.add(playerVelocity);

        this.shootBullet(bulletVector.angle, 100);
        // The list garbage is done in bulletScript
        // I'll add more parameters there, here will always just be this

        this.decideNextAttack('pistol');
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

    updateQuote(){
        if(scene.quote == this.targetQuote && this.targetQuote != ''){
            time.delayedFunction(this, 'endQuote', 1);
            time.delayedFunction(this, 'decideNextQuote', 2);
        }
        else{
            scene.quote += this.targetQuote.charAt(scene.quote.length);
            time.delayedFunction(this, 'updateQuote', this.quoteSpeed);
        }
    }

    endQuote(){
        scene.quote = '';
        this.targetQuote = '';
    }

    decideNextQuote(){
        let hasChosenQuote = false;
        for(let i in this.quoteList){
            for(let j in this.quoteList[i]){
                let myQuote = this.quoteList[i][j];

                if(myQuote.canExcecute() && !hasChosenQuote){
                    hasChosenQuote = true;
                    this.previousQuotes.push(myQuote.quote);
                    this.targetQuote = myQuote.quote;

                    let tempQuote = myQuote;
                    this.quoteList[i].splice(j, 1);
                    this.quoteList[i].push(tempQuote);
                }
            }
        }
        
        if(!hasChosenQuote) time.delayedFunction(this, 'decideNextQuote', 2);
        else{ time.delayedFunction(this, 'updateQuote', this.quoteSpeed); }
    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(decideAttack = true){
        this.knockedback = false;
        this.velocity.magnitude = this.speed;
        if(decideAttack){ this.decideNextAttack('idle'); }
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'playerAttack'){

            if(!this.invincible){
                this.health -= 1;
                this.invincible = true;
                time.delayedFunction(this, 'endInvincibility', this.invinTime);
                if(this.health <= 0){
                    this.killBoss();
                    scene.bossManager.killBoss();
                }
                else{
                    let knockbackVector = this.position.subtract(this.target.position);
                    knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;
    
                    this.velocity = knockbackVector;
                    
                    this.knockedBack = true;
    
                    time.stopFunctionsWithKeyword(this, /(delay)/);
                    time.stopFunctionsWithKeyword(this, /(Finish)/);
                    time.delayedFunction(this, 'endKnockback', this.knockbackTime, [this.attackName]);
    
                    time.stopFunctionsWithKeyword(this, /(shootBullet)/);
                }
            }

        }
    }

    killBoss(){
        time.stopFunctionsWithKeyword(this, /(delay)/);
        time.stopFunctionsWithKeyword(this, /(Finish)/);
        time.stopFunctionsWithKeyword(this, /(shootBullet)/);
        time.stopFunctions(this, 'decideNextAttack');
        this.collider.delete();
    }
}