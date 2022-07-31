class Player extends PhysicsObject{

    /**
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     */

    constructor(x, y){

        super(new Vector(x, y));
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'player';
        this.name = 'player';

        this.speedMult = 70;

        this.canDash = true;
        this.runSpeed = 1;
        this.dashSpeed = 5;
        this.stopDashSpeed = 0.3;
        this.endTeleportSpeed = 4.5;

        this.dashTime = 0.2;
        this.stopDashTime = 0.1;
        this.dashCooldownTime = 0.5;

        this.phaseThrough = false;
        this.teleportIFrames = 0.2;
        this.dashIFrames = 0.2;

        this.canAttack = true;
        this.attackObject;
        this.attackCooldownTime = 0.25;

        this.friction = 10;
        this.speed = this.runSpeed;

        this.health = 3;
        this.healthBar = new HealthBar(this, this.health);

        this.knockbackSpeed = 10;
        this.invincible = false;
        this.knockbackTime = 0.05;
        this.knockedback = false;

        this.teleporting = false;
        this.ghost;

        this.createAnimations();
    }

    createAnimations(){
        let listOfAnimations = [];

        let idleAnimation = {
            parent: this,
            name: 'idle',
            animation: new Animator('idle', playerImages.idle, 0.8),
            get canRun(){
                return this.parent.velocity.sqrMagnitude < 1;
            }
        }
        listOfAnimations.push(idleAnimation);

        let runningAnimation = {
            parent: this,
            name: 'running',
            animation: new Animator('running', playerImages.running, 0.3),
            get canRun(){
                return this.parent.velocity.sqrMagnitude > 1 && !this.parent.diagonal;
            }
        }
        listOfAnimations.push(runningAnimation);

        let diagonalAnimation = {
            parent: this,
            name: 'diagonal',
            animation: new Animator('diagonal', playerImages.diagonal, 0.3),
            get canRun(){
                return this.parent.velocity.sqrMagnitude > 1 && this.parent.diagonal;
            }
        }
        listOfAnimations.push(diagonalAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    update(){
        if(!this.knockedback){ this.velocity = this.updateVelocity(); }

        this.dash();
        this.teleport();
        this.update_attack();
        this.heal();

        super.update();
        if(this.ghost) this.ghost.update();
        
    }
    
    updateImage(){
        if(this.ghost) this.ghost.updateImage();

        this.animationManager.update();
        this.animationManager.draw(this.position.x, this.position.y, this.direction);
    }

    dash(){
        if((KeyReader.space || gamepadAPI.buttonPressed('RT') || gamepadAPI.buttonPressed('A')) && this.canDash){
            this.speed = this.dashSpeed;
            this.velocity.magnitude = this.dashSpeed * this.speedMult;
            this.canDash = false;
            this.phaseThrough = true;
            
            time.delayedFunction(this, 'stopInvincible', this.dashIFrames);
            time.delayedFunction(this, 'attack', this.dashTime-0.2, [0.15]);
            time.delayedFunction(this, 'stopDash', this.dashTime);
            time.delayedFunction(this, 'dashCooldown', this.dashCooldownTime);
        }
    }

    stopInvincible(){
        this.phaseThrough = false;
    }

    stopDash(){
        this.speed = this.stopDashSpeed;
        this.velocity.magnitude = this.stopDashSpeed * this.speedMult;
        time.delayedFunction(this, 'endDash', this.stopDashTime);
    }

    endDash(){
        this.speed = this.runSpeed;
    }

    dashCooldown(){
        this.canDash = true;
    }

    set speed(newSpeed){
        this._speed = newSpeed * this.speedMult;
    }

    get speed(){
        return this._speed;
    }
    
    teleport(){
        if(!this.teleporting && this.ghostKeysPressed()){
            this.teleporting = true;
            this.ghost = new Ghost(this.position, this.velocity);
        }
        else if (this.teleporting && !this.ghostKeysPressed()){
            this.teleporting = false;

            this.position = this.ghost.position;
            this.velocity = this.ghost.velocity.copy();
            this.velocity.magnitude = this.endTeleportSpeed * this.speedMult;

            this.ghost.delete();
            this.ghost = null;
            this.attack(0.15);

            this.phaseThrough = true;
            time.delayedFunction(this, 'stopInvincible', this.teleportIFrames);
        }
    }

    ghostKeysPressed(){
        return (
            KeyReader.j  || KeyReader.k || KeyReader.l || KeyReader.i || 
            Math.abs(gamepadAPI.axesStatus[2]) > 0.1 || Math.abs(gamepadAPI.axesStatus[3]) > 0.1
        );
    }

    updateVelocity(){
        let frictionEffect = time.deltaTime * this.friction;
        let newVelocity = this.velocity.addWithFriction(this.input, frictionEffect);
        return newVelocity;
    }

    get input(){
        let input= new Vector(0, 0);
        if(gamepadAPI.connected) input = new Vector(gamepadAPI.axesStatus[0], -gamepadAPI.axesStatus[1]);

        if(KeyReader.w) input.y++
        if(KeyReader.s) input.y--
        if(KeyReader.d) input.x++
        if(KeyReader.a) input.x--

        // Put between 1 and -1 bounds
        input.x = Math.max(Math.min(input.x, 1), -1);
        input.y = Math.max(Math.min(input.y, 1), -1);

        let inputMagnitude = Math.min(input.magnitude, 1);

        input.magnitude = this.speed * inputMagnitude;
        return input;
    }

    heal(){
        // Nothing for now
    }

    attack(duration){
        if(this.canAttack){

            // Offset done later
            this.attackObject = new Bullet(7.5, this.position, new Vector(0, 0), true);
            this.attackObject.melee = true;
            this.attackObject.rotationTarget = this;
        
            this.attackObject.collider.layer = 'playerAttack';
            this.attackObject.collider.isTrigger = true;
        
            this.canAttack = false;
            time.delayedFunction(this, 'endAttack', duration);
            time.delayedFunction(this, 'attackCooldown', this.attackCooldownTime);

            scene.mainCamera.createShake(0.5);
        }
    }

    update_attack(){
        if(this.attackObject){
            this.offset = this.velocity.copy();
            this.offset.magnitude = 7;
            this.attackObject.position = this.position.add(this.offset);
        }
    }

    endAttack(){
        this.attackObject.dissapate();
    }

    endAttackAnimation(){
        this.attackObject = null;
        // Time doesn't really matter, it just needs to be long enough
        time.delayedFunction(this, 'endAttackAnimation', 0.5);
    }

    attackCooldown(){
        this.canAttack = true;
    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(){
        this.knockedback = false;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'enemyAttack' && !this.phaseThrough){


            if(!this.invincible){
                
                this.health -= 1;

                if(this.health <= 0){
                    scene.gameOver = true;
                }
                else{
                    scene.mainCamera.createShake(3);
                    scene.mainCamera.freezeTarget = this;
                    time.hitStop(0.1);

                    this.healthBar.display(this.health);

                    this.invincible = true;
                    this.knockedback = true;
    
                    time.delayedFunction(this, 'endInvincibility', this.healthBar.displayTime);
                    time.delayedFunction(this, 'endKnockback', this.knockbackTime);
                }
            }
            else{
                scene.mainCamera.createShake();
            }

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;

            this.velocity = knockbackVector;

        }
        else if (other.collider.layer == 'blueBullet'){
            scene.mainCamera.createShake();

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed * this.speedMult * 1/3;
            this.velocity = knockbackVector;
            
            this.knockedback = true;
            this.endKnockback();    // delay of zero
        }
    }
}