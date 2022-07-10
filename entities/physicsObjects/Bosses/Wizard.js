class Wizard extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        // runSpeed is in a getter
        this.dashAttackSpeed = 20;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.speed = this.runSpeed;
        this.normalFriction = 4;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 20 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 60 * (this.dodgePower + 4)/5;

        this.dodgeDist = 60 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;

        this.normalMinDistance = 100 / this.dodgePower;
        this.normalMaxDistance = 120 / this.dodgePower;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;
        
        this.knockbackSpeed = 50;
        this.knockbackTime = 0.5;
        
        this.normalLookAheadTime = 0.8;
        this.lookAheadTime = this.normalLookAheadTime;

        this.myBots = [];

        this.botCooldown = 10 / this.agressiveness;

        let leftEnd =  new Vector(this.arenaLeft,  this.arenaCenter.y);
        let rightEnd = new Vector(this.arenaRight, this.arenaCenter.y);
        this.createBots(leftEnd, rightEnd, 20);

    }

    createBots(startVector, endVector, numBots){
        let distanceTraveled = endVector.subtract(startVector);
        for(let i = 0; i < numBots; i++){
            let position = startVector.add(distanceTraveled.multiply(i / numBots));
            
            let bot = new WizardBot(this.arenaCenter, this.arenaSize, this.difficulty);
            bot.position = position;
            
            bot.parent = this;
            bot.setIndex();
            
            this.myBots.push(bot);

        }
    }

    get runSpeed(){
        return 0;
    }
}