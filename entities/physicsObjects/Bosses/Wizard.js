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

        this.focusCameraOnThis = false;

        this.myBots = [];
        this.botCooldown = 10 / this.agressiveness;
        this.botSpawnTime;

        this.decideToCreateNewBots();

        this.position = new Vector(this.arenaCenter.x - 8, 0.3*this.arenaCenter.y + 0.7*this.arenaTop);

        this.createWalls();

    }

    decideToCreateNewBots(){
        if(this.distanceToPlayer < 90){
            let velocity = new Vector(1.5, 0);
            velocity.angle = this.angleToPlayer;
            this.createBotsCircle(this.distanceToPlayer/2, PI, 6, 0, velocity);
        }
        else{
            let distanceBetweenBots = 30;
            let numBotsHorizontal = Math.floor((this.arenaRight - this.arenaLeft) / distanceBetweenBots);
            let numBotsVertical = Math.floor((this.arenaTop - this.arenaBottom) / distanceBetweenBots);

            let leftTop =     new Vector(this.arenaLeft + 5,  this.arenaTop - 5);
            let rightTop =    new Vector(this.arenaRight - 5, this.arenaTop - 5);
            let leftBottom =  new Vector(this.arenaLeft + 5,  this.arenaBottom + 5);
            let rightBottom = new Vector(this.arenaRight - 5, this.arenaBottom + 5);

            if(this.angleToPlayer < 1/4*PI || this.angleToPlayer > 7/4*PI){
                this.createBotsLine(leftTop, leftBottom, numBotsHorizontal, new Vector(2, 0));
            }
            else if(this.angleToPlayer < 3/4*PI){
                this.createBotsLine(rightBottom, leftBottom, numBotsVertical, new Vector(0, 2));
            }
            else if(this.angleToPlayer > 5/4*PI){
                this.createBotsLine(rightTop, leftTop, numBotsHorizontal, new Vector(0, -2));
            }
            else{
                this.createBotsLine(rightTop, rightBottom, numBotsVertical, new Vector(-2, 0));
            }

            console.log(this.angleToPlayer);
        }
    }

    createBotsLine(startVector, endVector, numBots, startingVelocity){
        let distanceTraveled = endVector.subtract(startVector);
        for(let i = 0; i < numBots; i++){
            let position = startVector.add(distanceTraveled.multiply(i / numBots));
            
            let bot = new WizardBot(this.arenaCenter, this.arenaSize, this.difficulty);
            bot.position = position;
            bot.velocity = startingVelocity;
            
            bot.parent = this;
            bot.setIndex();
            
            this.myBots.push(bot);

            this.botSpawnTime = time.runTime;
        }
        console.log('Line!');

        time.delayedFunction(this, 'decideToCreateNewBots', this.botCooldown);
    }

    createBotsCircle(distance, angleChange, numBots, offset = 0, startingVelocity){
        let startAngle = this.angleToPlayer - angleChange/2 + offset;

        for(let i = 0; i < numBots; i++){
            let angle = startAngle + i*angleChange/numBots;
            
            let bot = new WizardBot(this.arenaCenter, this.arenaSize, this.difficulty);

            let botPosition = new Vector(distance, 0);
            botPosition.angle = angle;
            bot.position = botPosition.add(this.position);
            bot.velocity = startingVelocity;

            bot.parent = this;
            bot.setIndex();

            this.myBots.push(bot);

            console.log(bot.position, bot.velocity);
        }
        
        time.delayedFunction(this, 'decideToCreateNewBots', this.botCooldown);
    }

    get timeSinceThisLastSpawnedBots(){
        return time.runTime - this.botSpawnTime;
    }

    get runSpeed(){
        return 0;
    }

    createWalls(){
        let delay = 0.01;
        let fullDelay = 0;

        for(let i = 0; i < this.arenaSize.x; i+=8){
            fullDelay += delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaLeft+i, this.arenaTop)]);
        }
        for(let i = 0; i < this.arenaSize.y; i+=8){
            fullDelay += delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaRight, this.arenaTop-i)]);
        }
        for(let i = 0; i < this.arenaSize.x; i+=8){
            fullDelay += delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaRight-i, this.arenaBottom)]);
        }
        for(let i = 0; i < this.arenaSize.y; i+=8){
            fullDelay += delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaLeft, this.arenaBottom+i)]);
        }
    }

    createWallBullet(position){
        let myBullet = new Bullet(bulletImage[0], position, new Vector(0, 0));
        myBullet.timeAlive = Infinity;
        myBullet.melee = true;
    }
}