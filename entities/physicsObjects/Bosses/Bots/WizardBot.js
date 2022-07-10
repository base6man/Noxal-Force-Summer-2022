class WizardBot extends Bot{
    
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 2;
        this.dashAttackSpeed = 8;

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
        
        // Only for short dash attack
        this.minimumDistanceToDodge = 15 * this.dodgePower;

        this.speed = this.runSpeed;
        this.normalFriction = 3;
        this.friction = this.normalFriction;
        
        this.normalLookAheadTime = 0.7;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('shield',
        [
            [new Shield(this)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 1)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }

    update(){
        super.update();
    }
}