class Artisan extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        this.runSpeed = 9;
        this.dashAttackSpeed = 15;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.normalMinDistance = 70;
        this.normalMaxDistance = 160;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 4;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 20 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 40 * (this.dodgePower + 4)/5;

        this.dodgeDist = 60 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.3;
        
        this.normalLookAheadTime = 0.8;
        this.lookAheadTime = this.normalLookAheadTime;

        this.myBots = [];

        this.createBots(arenaSize.y/2, -PI/4, PI*5/4, 8);
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []


        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }

    createBots(distance, startAngle, finalAngle, numBots){
        for(let i = startAngle; i < finalAngle; i += (finalAngle-startAngle) / numBots){
            let newBoss = new ArtisanBot(this.arenaCenter, this.arenaSize, this.difficulty);

            let newBossPosition = new Vector(distance, 0);
            newBossPosition.angle = i;
            newBoss.position = newBossPosition.add(this.position);

            newBoss.parent = this;
            newBoss.setIndex();

            this.myBots.push(newBoss);
        }
    }
}