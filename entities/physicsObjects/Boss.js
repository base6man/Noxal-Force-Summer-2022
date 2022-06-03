class Boss extends PhysicsObject{
    /**
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     */
    constructor(x, y, agressiveness = 1, speed = 1, moveWhileShooting = 0){
        super(x, y, 1, -1);
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'boss';
        this.name = 'boss';

        this.runSpeed = 9;
        this.normalMinDistance = 50;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.shootSpeed = this.runSpeed * moveWhileShooting;
        this.strafeSpeed = 12;

        this.speedMult = 8 * speed;
        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;
        this.clockwise = true;
        
        this.dodgeDist = 70;
        this.dodgeTime = 0.2;
        this.dodgeSpeed = this.dodgeDist / this.dodgeTime / this.speedMult;
        this.dodging = false;

        this.invincible = false;
        this.health = 3;
        this.invinTime = 0.2;

        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;
        this.knockedback = false;

        this.arenaRight = 150;
        this.arenaTop = 80;
        this.arenaLeft = -150;
        this.arenaBottom = -80;

        this.image = playerImages.idle[0];

        this.target = scene.player;
        this.isAttacking = true;
        this.attackName = null;
        this.comboCounter = 0;
        this.attackList = [];
        this.agressiveness = agressiveness;

        this.quote = '';
        this.targetQuote = '';
        this.previousQuotes = [];
        this.quoteSpeed = 0.05;  // Time in between letters
        this.quoteList = 
        [
            [
                new Quote(this, 'Hello!', [], 1),
                new Quote(this, "Let's start with the basics.", [], 2),
                new Quote(this, 'Use the WASD keys to move.', [], 3),
                new Quote(this, 'Press SPACE to dash.', [], 4),
                new Quote(this, 'Dashing into me will deal damage.', [], 5),
                new Quote(this, "Though that's not something we want, is it?", [], 6),
                new Quote(this, "You can control your ghost with the IJKL keys.", [], 7),
                new Quote(this, 'It will allow you to teleport somewhere else!', [], 8)
            ],
            [
                {quote: 'Nothing much is happening in battle right now.', canExcecute: function(){ return true; }}, // Look, I'm tired
            ]
        ]
        time.delayedFunction(this, 'decideNextQuote', 1);

        // Used on each attack to remember the bullets shot
        // Cleared upon a new attack
        this.currentBullets = [];

        time.delayedFunction(this, 'decideNextAttack', 1, ['idle']);

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
                {firstAttack: 'any', restrictions: ['dodge'], nextAttack: 'dodge', windup: 0.1, agression: -1}
            ],
            [
                {firstAttack: 'homing', nextAttack: 'homing', agression: 1.5, windup: 0.6},
                {firstAttack: 'strafe', nextAttack: 'strafe', agression: 1.5},
                {firstAttack: 'pistol', nextAttack: 'pistol', windup: 0.6, agression: 0.5},
                {firstAttack: 'pistol', nextAttack: 'rapid', windup: 0.2, agression: 1.5},
                {firstAttack: 'quad', nextAttack: 'fastDiagonal', parent: 'diagonal', agression: 1.5},
                {firstAttack: 'diagonal', nextAttack: 'fastQuad', parent: 'quad', agression: 1.5},
                {firstAttack: 'any', restrictions: ['laser'], nextAttack: 'laser', agression: 3}
            ],
            [
                {firstAttack: 'idle', nextAttack: 'homing'},
                {firstAttack: 'idle', nextAttack: 'strafe'},
                {firstAttack: 'idle', nextAttack: 'pistol'},
                {firstAttack: 'idle', nextAttack: 'quad', agression: 1.5},
                {firstAttack: 'idle', nextAttack: 'diagonal', agression: 1.5},
                {firstAttack: 'idle', nextAttack: 'rapid', windup: 0.5, agression: 2},
                {firstAttack: 'idle', nextAttack: 'wave', agression: 3}
            ]
        ]
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

                if(keepItem) finalList[i].push(this.comboList[i][j]);
            }
            finalList.push([]);
        }

        for(let i in finalList){
            if(finalList[i].length == 0) finalList.splice(i, 1);
        }

        this.comboList = finalList;
        console.log(this.comboList, attackList);
    }

    update(){
        if(!this.knockedback) this.velocity = this.updateVelocity(); 
        this.teleportThroughWalls();
        super.update();
        for(let i in this.currentBullets){
            // Get the bullets the same relative to the boss
            this.currentBullets[i].position = this.currentBullets[i].position.add(this.velocity.multiply(time.deltaTime));
        }
    }

    updateImage(){
        this.image.draw(this.position.x, this.position.y);
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
        console.assert(!time.isWaiting(this, 'decideNextAttack'), time.waitingFunctions(), this.attackList);
        this.returnToRunSpeed();
        this.currentBullets = [];

        let startingAttack = false;
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];
                
                let restricted = false;
                if(combo.restrictions){
                    for(let r in combo.restrictions){
                        if(combo.restrictions[r] == previousAttackName) restricted = true; 
                    }
                }

                let parent;
                if(combo.parent) parent = combo.parent; 
                else{ parent = combo.nextAttack; }

                if(
                    (combo.firstAttack == previousAttackName || combo.firstAttack == 'any') && 
                    this[parent + 'CanExcecute']() && !startingAttack && !restricted
                ){
                    let temp = combo;
                    this.comboList[i].splice(j, 1);
                    this.comboList[i].push(temp);

                    startingAttack = true;
                    this.isAttacking = true;
                    this.attackName = new RegExp('(' + parent + ')');
                    this.attackList.push(parent);
                    if(combo.agression) this.incrementCombo(combo.agression);
                    else{ this.incrementCombo(1); }

                    if(combo.windup){ time.delayedFunction(this, 'delay_' + combo.nextAttack, combo.windup/this.agressiveness); }
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

    dodgeCanExcecute(){
        return this.distanceToPlayer < 50;
    }

    delay_dodge() { this.dodge(); }
    dodge(decideAttack = true){
        if(this.distanceToPlayer < 65){
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

    returnToRunSpeed(){
        // For a delayed time function; will probably use a lot
        // Also returns lots of other variables to their normal state
        this.speed = this.runSpeed;
        this.friction = this.normalFriction;
        this.maxDistance = this.normalMaxDistance;
        this.minDistance = this.normalMinDistance;
    }

    shootBullet(angle, speed, offset = 0, canDodgeOut = true){
        
        if(this.distanceToPlayer < 35 && canDodgeOut){ 
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

        let myBullet = new Bullet(bulletImage[0], startingPosition, bulletVelocity);

        return myBullet;
        // Returns the bullet so someone can add homing
    }

    rapidCanExcecute(){
        let previousAttack = this.attackList[this.attackList.length - 1];
        return (
            this.distanceToPlayer.between(85, 90) && 
            this.comboCounter < 3 && previousAttack != 'rapid'
        );
    }

    delay_rapid(){ this.rapid(); }
    rapid(){
        let angle = this.futureAngleToPlayer;
        this.speed = this.shootSpeed;

        let angleInit = -0.2;
        let angleChange = 0.2;

        let shootTime = 0.1;
        let delay = 0.3;
        let numShots = 4;

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay, [angle + angleChange*i+angleInit, 200]);
        }
        time.delayedFunction(this, 'rapidFinish', shootTime*numShots + delay + this.dodgeTime);
    }

    rapidFinish(){
        this.decideNextAttack('rapid');
    }

    diagonalCanExcecute(){
        let previousAttack = this.attackList[this.attackList.length - 1];
        return (
            (this.futureAngleToPlayer % PI/2).between(PI/4 - 0.4, PI/4 + 0.4) &&
            this.distanceToPlayer.between(60, 85) &&
            this.comboCounter < 4 && previousAttack != 'diagonal'
        );
    }

    diagonal(){ this.quad(PI/4), false, 'diagonal'; }
    fastDiagonal(){ this.quad(PI/4, true, 'diagonal'); }
    fastQuad(){ this.quad(0, true, 'quad'); }

    quadCanExcecute(){
        let previousAttack = this.attackList[this.attackList.length - 1];
        return (
            (this.futureAngleToPlayer % PI/2).between(0.4, PI/2 - 0.4) &&
            this.distanceToPlayer.between(60, 85) &&
            this.comboCounter < 4 && previousAttack != 'quad'
        );
    }

    delay_quad(){ this.quad(); }
    quad(angleInit = 0, isFast = false, name = 'quad'){
        this.speed = this.shootSpeed;

        let angleChange = PI/2;

        let shootTime, delay;
        if(isFast){
            shootTime = 0.08;
            delay = 0;
        }
        else{
            shootTime = 0.12;
            delay = 0.12;
        }
        let numShots = 4;

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
        let previousAttack = this.attackList[this.attackList.length - 1];
        return (
            (this.position.magnitude > 120 || this.target.position.magnitude > 120) && 
            this.comboCounter < 6.5 &&
            this.distanceToPlayer.between(80, 110) &&
            previousAttack != 'laser'
        );
    }

    delay_laser(){ this.laser(); }
    laser(){
        this.speed = this.shootSpeed/2;

        let delay = 0.5;
        let shootTime = 0.04;
        let laserDuration = 2;
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
        return(
            this.distanceToPlayer.between(90, 110) &&
            this.futureDistanceToPlayer.between(80, 100) &&
            this.comboCounter < 6.5
        );
    }

    delay_wave(){ this.wave(); }
    wave(){
        let delay = 1;
        this.speed = 0;
        time.delayedFunction(this, 'waveFinish', delay);
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

        let numShots = 4;
        let shootTime = 0.4;
        let delay = 0.2;

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
        let twoAttacksAgo = this.attackList[this.attackList.length - 3];
        return this.distanceToPlayer > 110 && this.comboCounter < 4 && twoAttacksAgo != 'homing';
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
        if(this.quote == this.targetQuote && this.targetQuote != ''){
            time.delayedFunction(this, 'endQuote', 1);
            time.delayedFunction(this, 'decideNextQuote', 2);
        }
        else{
            this.quote += this.targetQuote.charAt(this.quote.length);
            time.delayedFunction(this, 'updateQuote', this.quoteSpeed);
        }
    }

    endQuote(){
        this.quote = '';
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
        if(decideAttack){ this.decideNextAttack('knockback'); }
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'playerAttack'){

            if(!this.invincible){
                this.health -= 1;
                this.invincible = true;
                time.delayedFunction(this, 'endInvincibility', this.invinTime);
                if(this.health <= 0){
                    scene.gameOver = true;
                }
                    
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