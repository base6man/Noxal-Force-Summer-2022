class Guard extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 5;

        this.difficulty =        difficulty;
        this.agressiveness =     1 + (this.difficulty-1)/1;
        this.attackPower =       1 + (this.difficulty-1)/5;
        this.shootSpeed =        this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult =    1 + (this.difficulty-1)/6;
        this.dodgePower =        1 + (this.difficulty-1)/3;
        this.maxComboCounter =   4;
        
        this.normalMinDistance = 70;
        this.normalMaxDistance = 110;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 2;
        this.friction = this.normalFriction;

        this.distanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.restrictedAttacks = [];

    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        
        comboList.push(new Combo('dodge',
        [
            [new Dodge(this, 0.1)]
        ]));

        comboList.push(new Combo('rapid',
        [
            [new Rapid(this, 0.4)],
            [new Strafe(this, 0.8, 0, 'strafe'), new Laser(this, 1), new Rapid(this, 0.6, 1)]
        ]));

        comboList.push(new Combo('quad',
        [
            [new Quad(this, 1, 1), new Diagonal(this, 1, 2)],
            [new FastDiagonal(this, 0.5, 2)],
            [new FastQuad(this, 0.5, 1)]
        ]));

        comboList.push(new Combo('homing',
        [
            [new Homing(this, 1.2)],
            [new Homing(this, 0.5, 1), new Strafe(this, 0.6, 0, 'strafe')]
        ]));

        comboList.push(new Combo('strafe',
        [
            [new Strafe(this, 0.8, 0), new Pistol(this, 0.6, 0, 'pistol')]
        ]));

        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('wave',
        [
            [new Wave(this, 1.8, 1)],
            [new Wave(this, 1.2, 1), new Laser(this, 0.6)]
        ]));

        comboList.push(new Combo('laser',
        [
            [new Laser(this, 0.8)]
        ]));

        comboList.push(new Combo('eightWay',
        [
            [new EightWay(this, 0.6)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }

    update(){
        super.update();
        this.teleportThroughWalls();
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
}