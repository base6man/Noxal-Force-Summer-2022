class ClocksmithBot extends Bot{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 4;
        this.dashAttackSpeed = 15;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.normalMinDistance = 0;
        this.normalMaxDistance = 0;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.minimumDistanceToDodge = 25 * this.dodgePower;
        // Only for short dash attack
        
        this.normalLookAheadTime = 0.7;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []


        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 1.5, 0)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 2)],
            [new ShortDashAttack(this, 1, 1)]
        ]));
        
        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(0);
    }
}