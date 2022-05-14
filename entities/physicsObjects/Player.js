class Player extends PhysicsObject{

    /**
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     */

    constructor(x, y){

        super(x, y);
        this.collider = new BoxCollider(this, 0, 0, 5, 5);
        this.collider.layer = 'player';

        this.speedMult = 70;

        this.canDash = true;
        this.runSpeed = 1;
        this.dashSpeed = 4;
        this.stopDashSpeed = 0.3;
        this.dashTime = 0.2;
        this.stopDashTime = 0.1;
        this.dashCooldownTime = 0.5;

        this.canAttack = true;
        this.attackDuration = 0.15;
        this.attackCooldownTime = 0.5;
        this.attackObject;

        this.friction = 10;
        this.speed = this.runSpeed;
        this.direction = 'right';

        this.health = 3;
        this.knockbackSpeed = 15;
        this.invincible = false;
        this.invincibilityTime = 1;
        this.knockbackTime = 0;
        this.knockedback = false;

        this.createAnimations();
    }

    createAnimations(){
        let listOfAnimations = [];

        let idleAnimation = {
            name: 'idle',
            animation: new Animator('idle', playerImages.idle, 0.8),
            get canRun(){
                return player.velocity.sqrMagnitude < 1;
            }
        }
        listOfAnimations.push(idleAnimation);

        let runningAnimation = {
            name: 'running',
            animation: new Animator('running', playerImages.running, 0.3),
            get canRun(){
                return player.velocity.sqrMagnitude > 1 && !player.diagonal;
            }
        }
        listOfAnimations.push(runningAnimation);

        let diagonalAnimation = {
            name: 'diagonal',
            animation: new Animator('diagonal', playerImages.diagonal, 0.3),
            get canRun(){
                return player.velocity.sqrMagnitude > 1 && player.diagonal;
            }
        }
        listOfAnimations.push(diagonalAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    update(){
        if(!this.knockedback){ this.velocity = this.updateVelocity(); }

        this.direction = this.findDirection().direction;
        this.diagonal = this.findDirection().diagonal;

        this.dash();
        this.attack();
        super.update();
        
        this.animationManager.update();
    }

    dash(){
        if(KeyReader.space && this.canDash){
            this.speed = this.dashSpeed;
            this.velocity.magnitude = this.dashSpeed * this.speedMult;
            this.canDash = false;
            time.delayedFunction(this, 'stopDash', this.dashTime);
            time.delayedFunction(this, 'dashCooldown', this.dashCooldownTime);
        }
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

    attack(){
        if(KeyReader.j && this.canAttack){
            // Offset done later
            this.attackObject = new Bullet(bulletImage[0], this.position);
            this.attackObject.melee = true;

            this.attackObject.collider.layer = 'playerAttack';
            this.attackObject.collider.isTrigger = true;

            this.canAttack = false;
            time.delayedFunction(this, 'endAttack', this.attackDuration);
            time.delayedFunction(this, 'attackCooldown', this.attackCooldownTime);
        }

        if(this.attackObject){
            this.offset = this.velocity.copy();
            this.offset.magnitude = 7;
            this.attackObject.position = this.position.add(this.offset);
        }
    }

    endAttack(){
        this.attackObject.dissapate();
        this.attackObject = null;
    }

    attackCooldown(){
        this.canAttack = true;
    }

    updateImage(){
        this.animationManager.draw(this.position.x, this.position.y, this.direction);
    }

    updateVelocity(){
        let input = new Vector(0, 0);
        if(KeyReader.w){ input.y++ }
        if(KeyReader.s){ input.y-- }
        if(KeyReader.d){ input.x++ }
        if(KeyReader.a){ input.x-- }
        input.magnitude = this.speed;

        let newVelocity = new Vector(0, 0);
        let frictionEffect = time.deltaTime * this.friction;

        newVelocity = this.velocity.addWithFriction(input, frictionEffect);
        return newVelocity;
    }

    findDirection(){
        let theta = Math.atan2(this.velocity.y, this.velocity.x);
        console.assert(theta >= -Math.PI && theta <= Math.PI, theta);

        if(theta >= Math.PI/8 && theta < Math.PI*3/8){
            return {direction: 'up', diagonal: true};
        }
        else if (theta >= Math.PI*3/8 && theta < Math.PI*5/8){
            return {direction: 'up', diagonal: false};
        }
        else if (theta >= Math.PI*5/8 && theta < Math.PI*7/8){
            return {direction: 'left', diagonal: true};
        }
        else if (theta >= -Math.PI*1/8 && theta < Math.PI*1/8){
            return {direction: 'right', diagonal: false};
        }
        else if (theta >= -Math.PI*3/8 && theta < -Math.PI*1/8){
            return {direction: 'right', diagonal: true};
        }
        else if (theta >= -Math.PI*5/8 && theta < -Math.PI*3/8){
            return {direction: 'down', diagonal: false};
        }
        else if (theta >= -Math.PI*7/8 && theta < -Math.PI*5/8){
            return {direction: 'down', diagonal: true};
        }
        else{
            return {direction: 'left', diagonal: false};
        }

    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(){
        this.knockedback = false;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'enemyAttack'){

            if(!this.invincible){
                this.health -= 1;
                this.invincible = true;
                this.knockedBack = true;
                time.delayedFunction(this, 'endInvincibility', this.invincibilityTime);
                time.delayedFunction(this, 'endKnockback', this.knockbackTime);
            }

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;

            this.velocity = knockbackVector;
        }
    }
}