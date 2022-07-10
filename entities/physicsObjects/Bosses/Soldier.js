class Soldier extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 2;
        this.dashAttackSpeed = 25;
        this.sidestepSpeed = 15;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.normalMinDistance = 0;
        this.normalMaxDistance = 100;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 3;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 20 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 40 * (this.dodgePower + 4)/5;

        this.dodgeDist = 60 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;
        
        this.knockbackSpeed = 30;
        this.knockbackTime = 0.3;
        
        this.normalLookAheadTime = 0.4;
        this.lookAheadTime = this.normalLookAheadTime;
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        
        comboList.push(new Combo('dodge',
        [
            [new ShootDodge(this, 0.1)]
        ]));

        let sidestep = new Combo('sidestep',
        [
            [new Sidestep(this, 0.4)],
            [new Sidestep(this, 0, 1)]
        ]);
        comboList.push(sidestep);
        this.attackManager.firstCombo = sidestep;

        comboList.push(new Combo('dashAttack',
        [
            [new FakeDashAttack(this, 0.8)],
            [new ShortDashAttack(this, 0.3, 1), new ShootDodge(this, 0.1), new Sidestep(this, 0.1), new Rapid(this, 0.5)]
        ]));

        comboList.push(new Combo('pistol', 
        [
            [new Pistol(this, 0.5, 0), new FakeDashAttack(this, 0.6, 1, 'dashAttack')]
        ]));

        comboList.push(new Combo('wave',
        [
            [new SoldierWave(this, 1.8)],
            [new SoldierRapid(this, 1)],
            [new LongDashAttack(this, 0.8, 1, 'dashAttack')]
        ]));

        comboList.push(new Combo('rapid',
        [
            [new SoldierRapid(this, 0.8)],
            [new SoldierWave(this, 1.5)]
        ]))
        
        
        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }
}