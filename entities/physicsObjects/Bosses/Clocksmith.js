class Clocksmith extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        // runSpeed is in a getter
        this.dashAttackSpeed = 20;

        this.difficulty =     difficulty;
        this.agressiveness =  1 + (this.difficulty-1)/4;
        this.attackPower =    1 + (this.difficulty-1)/5;
        this.shootSpeed =     this.runSpeed;
        this.localSpeedMult = 1 + (this.difficulty-1)/3;
        this.dodgePower =     1 + (this.difficulty-1)/8;
        this.botCooldown =    8 / (1 + (this.difficulty-1)/5);

        this.speed = this.runSpeed;
        this.normalFriction = 4;
        this.friction = this.normalFriction;

        this.wasBotLastFrame;
        this.timeOfBotChange = time.runTime;
        
        this.minimumDistanceToDodge = 20 * this.dodgePower;
        
        this.health = 3;

        this.normalMinDistance = Math.max(100 / this.dodgePower, 60);
        this.normalMaxDistance = Math.max(120 / this.dodgePower, 100);
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;
        
        this.knockbackSpeed = 50;
        this.knockbackTime = 0.5;
        
        this.normalLookAheadTime = 0.8;
        this.lookAheadTime = this.normalLookAheadTime;

        this.myBots = [];


        this.createBotsCircle(arenaSize.y/2, 2*PI, 6, PI/6);

    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 0.5, 0)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }
    
    createAnimations(){
        let listOfAnimations = [];

        let botAnimation = {
            parent: this,
            name: 'bot',
            animation: new Animator('bot', bossImages.bot, 1),
            get canRun(){
                return this.parent.isBot;
            }
        }
        listOfAnimations.push(botAnimation);

        
        let idleAnimation = {
            parent: this,
            name: 'idle',
            animation: new Animator('idle', clocksmithImages.normal, 0.8),
            get canRun(){
                return true;
            }
        }
        listOfAnimations.push(idleAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    get runSpeed(){
        if(this.isBot) return 2;
        return 7;
    }

    get isBot(){
        if(this.distanceToPlayer > this.minDistance) return true;
        return false;
    }

    update(){
        super.update();

        if(this.isBot != this.botLastFrame){
            this.timeOfBotChange = time.runTime;
            this.botLastFrame = this.isBot;
        }
    }

    createBotsCircle(distance, angleChange, numBots, offset = 0, startingVelocity = new Vector(0, 0)){
        numBots = Math.floor(numBots);
        let startAngle = this.angleToPlayer - angleChange/2 + offset;

        for(let i = 0; i < numBots; i++){
            let angle = startAngle + i*angleChange/numBots;
            
            let botPosition = new Vector(distance, 0);
            botPosition.angle = angle;
            botPosition = botPosition.add(this.position);

            if(botPosition.insideOf(new Vector(this.arenaRight, this.arenaTop), new Vector(this.arenaLeft, this.arenaBottom))){
                let bot = new ClocksmithBot(this.arenaCenter, this.arenaSize, this.difficulty);
    
                bot.position = botPosition;
                bot.velocity = startingVelocity;
    
                bot.parent = this;
                bot.setIndex();
    
                this.myBots.push(bot);
            }
            
        }

        time.delayedFunction(this, 'createBotsCircle', this.botCooldown, [30, PI, 2*this.attackPower]);
    }

    killBoss(){
        super.killBoss();
        time.stopFunctions(this, 'createBotsCircle');
    }
    
    endKnockback(){
        super.endKnockback();
        this.healthBar.stopDisplay();
        this.teleportAway();

        time.stopFunctions(this, 'createBotsCircle')
        this.createBotsCircle(20, 2*PI, 3*this.attackPower);
    }

    teleportAway(){
        this.position = this.arenaCenter;

        let newVector = new Vector(1, 0);
        newVector.magnitude = this.arenaSize.y/2 - 25;
        newVector.angle = this.angleToPlayer + PI;

        this.position = this.arenaCenter.add(newVector);
    }
}