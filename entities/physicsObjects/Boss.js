class Boss extends PhysicsObject{
    /**
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     */
    constructor(x, y, agressiveness = 1, speed = 1){
        super(x, y, 1, -1);
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'boss';
        this.name = 'boss';

        this.dodgeSpeed = 60;
        this.dodgeTime = 0.2;
        this.dodging = false;

        this.runSpeed = 9;
        this.normalMinDistance = 50;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.strafeSpeed = 12;

        this.speedMult = 5 * speed;
        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;
        this.clockwise = true;

        this.invincible = false;
        this.health = 3;
        this.invinTime = 1;

        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;
        this.knockedback = false;

        this.arenaRight = 150;
        this.arenaTop = 80;
        this.arenaLeft = -150;
        this.arenaBottom = -80;

        this.image = playerImages.idle[0];

        this.target = player;
        this.isAttacking = true;
        this.attackName = null;
        this.comboCounter = 0;
        this.agressiveness = agressiveness;

        // Used on each attack to remember the bullets shot
        // Cleared upon a new attack
        this.currentBullets = [];

        time.delayedFunction(this, 'decideNextAttack', 1, ['none']);

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
        this.comboList = [
            [
                {firstAttack: 'any', restrictions: ['dodge'], nextAttack: 'dodge', windup: 0.2, agression: -1}
            ],
            [
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
                {firstAttack: 'idle', nextAttack: 'rapid', windup: 0.5, agression: 2}
            ]
        ]
    }

    update(){
        if(!this.knockedback){ this.velocity = this.updateVelocity(); }
        this.teleportThroughWalls();
        super.update();
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
        }
        if(this.position.y >= this.arenaTop - this.collider.height / 2){
            this.position.y = this.arenaBottom + this.collider.height / 2 + 1;
        }
        if(this.position.x <= this.arenaLeft + this.collider.width / 2){
            this.position.x = this.arenaRight - this.collider.width / 2 - 1;
        }
        if(this.position.y <= this.arenaBottom + this.collider.height / 2){
            this.position.y = this.arenaTop - this.collider.width / 2 - 1;
        }
    }

    decideNextAttack(previousAttackName){
        console.assert(!time.isWaiting(this, 'decideNextAttack'), time.waitingFunctions());
        this.returnToRunSpeed();

        let startingAttack = false;
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];
                
                let restricted = false;
                if(combo.restrictions){
                    for(let r in combo.restrictions){
                        if(combo.restrictions[r] == previousAttackName){ restricted = true; }
                    }
                }

                let parent;
                if(combo.parent){ parent = combo.parent; }
                else{ parent = combo.nextAttack; }

                if(
                    (combo.firstAttack == previousAttackName || combo.firstAttack == 'any') && 
                    this[parent + 'CanExcecute']() && !startingAttack && !restricted
                ){
                    let temp = combo;
                    this.comboList[i].splice(j, 1);
                    this.comboList[i].push(temp);

                    startingAttack = true;
                    this.currentBullets = [];
                    this.isAttacking = true;
                    this.attackName = new RegExp('(' + parent + ')');
                    if(combo.agression){ this.comboCounter += combo.agression; }
                    else{ this.comboCounter++ }

                    if(combo.windup){ time.delayedFunction(this, combo.nextAttack, combo.windup); }
                    else{ this[combo.nextAttack](); }
                }
            }
        }

        if(!startingAttack){
            time.delayedFunction(this, 'decideNextAttack', this.comboCounter/2, ['idle']);
            this.isAttacking = false;
            this.comboCounter /= 2;
            this.attackName = null;
        }
    }

    get comboCounter(){
        return this.trueComboCounter / this.agressiveness;
    }

    set comboCounter(_comboCounter){
        this.trueComboCounter = _comboCounter;
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
        
        // I don't really care about this line, but I am setting the magnitude here.
        // I can't set it to zero zero, unfortunately
        let bulletVelocity = new Vector(speed, 0);
        bulletVelocity.angle = angle;

        let offsetVector = new Vector(offset, 0);
        offsetVector.angle = angle;
        let startingPosition = this.position.add(offsetVector);

        let myBullet = new Bullet(bulletImage[0], startingPosition, bulletVelocity);
        this.currentBullets.push(myBullet);

        if(this.distanceToPlayer < 35 && canDodgeOut){ 
            this.dodge(false);
            time.stopFunctionsWithKeyword(this, /(shootBullet)/); 
        }

        return myBullet;
        // Returns the bullet so someone can add homing
    }

    rapidCanExcecute(){
        return (
            this.distanceToPlayer.between(85, 90) && 
            this.comboCounter < 3
        );
    }

    rapid(){
        let angle = this.futureAngleToPlayer;
        this.speed = 0;

        let angleInit = -0.2;
        let angleChange = 0.2;

        let shootTime = 0.1;
        let delay = 0.5;
        let numShots = 4;

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay, [angle + angleChange*i+angleInit, 200]);
        }
        time.delayedFunction(this, 'finishRapid', shootTime*numShots + delay + this.dodgeTime);
    }

    finishRapid(){
        this.decideNextAttack('rapid');
    }

    diagonalCanExcecute(){
        return (
            (this.angleToPlayer % PI/2).between(PI/4 - 0.1, PI/4 + 0.1) &&
            this.distanceToPlayer.between(60, 80) &&
            this.comboCounter < 4
        );
    }

    diagonal(){ this.quad(PI/4); }
    fastDiagonal(){ this.quad(PI/4, true); }
    fastQuad(){ this.quad(0, true); }

    quadCanExcecute(){
        return (
            !(this.angleToPlayer % PI/2).between(0.1, PI/2 - 0.1) &&
            this.distanceToPlayer.between(60, 80) &&
            this.comboCounter < 4
        );
    }

    quad(angleInit = 0, isFast = false){
        this.speed = 0;

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
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay, [angleChange*i+angleInit, 0.001, 5]);
        }
        time.delayedFunction(this, 'quadFinish', shootTime*numShots + delay);
    }

    quadFinish(){
        for(let i in this.currentBullets){
            this.currentBullets[i].velocity.magnitude = 150;
        }
        this.decideNextAttack('quad');
    }

    laserCanExcecute(){
        return (
            (this.position.magnitude > 120 || this.target.position.magnitude > 120) && 
            this.comboCounter < 6.5 &&
            this.distanceToPlayer.between(80, 110)
        );
    }

    laser(){
        this.speed = 0;

        let delay = 0.5;
        let shootTime = 0.02;
        let laserDuration = 2;
        let numShots = Math.floor(laserDuration / shootTime);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'laser_shootBullet', shootTime*i+delay);
        }
        time.delayedFunction(this, 'laserFinish', laserDuration);
    }

    laser_shootBullet(){

        let bulletVelocity = new Vector(1, 0);
        bulletVelocity.angle = this.angleToPlayer;
        
        let velocityVector = this.target.velocity.copy();
        velocityVector.magnitude = 0.05 * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);
        bulletVelocity = bulletVelocity.add(velocityVector);

        this.shootBullet(bulletVelocity.angle, 160);
    }

    laserFinish(){
        this.decideNextAttack('laser');
    }

    strafeCanExcecute(){
        return (
            this.position.magnitude < 60 && 
            this.target.position.magnitude < 60 &&
            this.distanceToPlayer.between(50, 75) && 
            this.comboCounter < 4);
    }

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
        myBullet.homing = 1.5;
        myBullet.timeAlive = 2;
    }

    strafeFinish(){
        this.decideNextAttack('strafe');
    }

    pistolCanExcecute(){
        return (
            this.distanceToPlayer.between(80, 100) && 
            this.futureDistanceToPlayer.between(80, 100) &&
            this.comboCounter < 5
        );
    }

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
        return this.distanceToPlayer > 110 && this.comboCounter < 6;
    }

    homing(){
        let bulletVector = this.vectorToPlayer.multiply(-1);

        let myBullet = this.shootBullet(bulletVector, 100);
        myBullet.homing = 2;
        myBullet.timeHoming = 3;
        
        this.decideNextAttack('homing');
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
                    gameOver = true;
                }
                    
                let knockbackVector = this.position.subtract(this.target.position);
                knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;

                this.velocity = knockbackVector;
                
                this.knockedBack = true;

                if(this.attackName){ 
                    let myList = time.stopFunctionsWithKeyword(this, this.attackName); 
                    console.assert(myList.length > 0, time.waitFunc);
                }
                time.delayedFunction(this, 'endKnockback', this.knockbackTime, [this.attackName]);

                time.stopFunctionsWithKeyword(this, /(shootBullet)/);
            }

        }
    }
}