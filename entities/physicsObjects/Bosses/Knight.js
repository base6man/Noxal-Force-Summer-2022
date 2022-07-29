class Knight extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 3;
        this.dashAttackSpeed = 18;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        this.normalMinDistance = 80;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.minimumDistanceToDodge = 40 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 70 * (this.dodgePower + 4)/5;
        this.dodgeDist = 40 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('dodge',
        [
            [new Dodge(this, 0.2)]
        ]));

        comboList.push(new Combo('shield',
        [
            [new Shield(this)]
        ]));

        comboList.push(new Combo('shieldSpread',
        [
            [new ShieldSpread(this, 0.8)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 0.15)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }
}