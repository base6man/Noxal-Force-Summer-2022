class Strafe extends Attack{
    
    constructor(parent, difficulty, delay){
        super(parent, difficulty, delay);
        
        this.agressiveness = this.boss.agressiveness;
        this.shootTime = 0.4 / this.boss.localSpeedMult;
        this.delay = 0.2 / this.agressiveness;

        if(this.boss.strafeSpeed) this.speed = this.boss.strafeSpeed;
        else{ this.speed = this.boss.runSpeed; }

        this.maxDistanceFromCenter = this.boss.arenaSize.magnitude * 0.4;
    }

    canAttack(){
        return (
            this.boss.position.magnitude        < this.maxDistanceFromCenter && 
            this.boss.target.position.magnitude < this.maxDistanceFromCenter &&
            isBetween(this.boss.distanceToPlayer, 50, 100) && 
            this.parent.comboCounter < 4
        );
    }

    attack(){
        console.log(this);
        super.attack();
    }

    delayAttack(){
        super.delayAttack();

        this.boss.speed = this.speed;
        this.boss.minDistance = 0;
        this.boss.friction = 10;
        this.boss.clockwise = !this.boss.clockwise;

        let numShots = Math.min(Math.floor(3 * this.difficulty), 6);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', this.shootTime*i + this.delay);
        }
        time.delayedFunction(this, 'finishAttack', this.shootTime * numShots + this.delay);
    }

    shootBullet(){
        let myBullet = super.shootBullet(0, 0);
        if(myBullet){
            myBullet.homing = 1;
            myBullet.timeAlive = 2;
        }
    }

    finishAttack(){
        super.finishAttack();
    }
}