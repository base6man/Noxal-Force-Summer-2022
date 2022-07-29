class Samurai extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 7;
        this.dashAttackSpeed = 25;
        this.sidestepSpeed = 30;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/5;
        this.dodgePower =     1 + (this.difficulty-1)/4;

        this.normalMinDistance = 50;
        this.normalMaxDistance = 120;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 3;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 50 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 80 * (this.dodgePower + 4)/5;

        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.25;
        
        this.health = 3;
        
        this.knockbackSpeed = 40;
        this.knockbackTime = 0.1;
        
        this.normalLookAheadTime = 0.6;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('bluePistol',
        [
            [new BluePistol(this, 0.4, 0)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new SamuraiDashAttack(this, 0.5, 0)]
        ]));

        comboList.push(new Combo('homing',
        [
            [new Homing(this, 1.2, 0)]
        ]));

        comboList.push(new Combo('bounceShot',
        [
            [new BouncePistol(this, 1.2)]
        ]));

        let shieldSpread = new Combo('shieldSpread',
        [
            [new ShieldSpread(this, 0.5)],
            [new BouncePistol(this, 0.6), new SamuraiDashAttack(this, 0.2, 1), new FreeWave(this, 1.8)]
        ]);
        comboList.push(shieldSpread);
        this.attackManager.firstCombo = shieldSpread;

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }
}