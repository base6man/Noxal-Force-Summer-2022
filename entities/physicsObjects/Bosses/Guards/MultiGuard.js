class MultiGuard extends Guard{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        
        this.difficultyMultiplier = 0.85;

        this.maxBots = 2 + this.difficulty/4;
        this.botClockwise = false;

        this.runSpeed = 4;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =     1 + (this.difficulty-1)/3;
        this.attackPower =       1 + (this.difficulty-1)/6;
    }

    createAttackManager(){
        super.createAttackManager();
        this.attackManager.startAttacking();
    }

    update(){
        super.update();
        if(this.myBots.length < this.maxBots && time.waitingFunctions(this, 'createBot').length == 0){
            time.delayedFunction(this, 'createBot', 1.0)
        }
        
    }

    createBot(){
        let botVelocity;
        let myVelocity = this.velocity.copy();
        if(this.botClockwise){
            botVelocity = new Vector(myVelocity.y, -1*myVelocity.x);
            this.botClockwise = false;
        }
        else{
            botVelocity = new Vector(-1*myVelocity.y, myVelocity.x);
            this.botClockwise = true;
        }
        botVelocity.magnitude = this.speed;

        let bot = new GuardBot(this.arenaCenter, this.arenaSize);
        bot.position = this.position.add(botVelocity.divide(60));
        bot.velocity = botVelocity;
        
        bot.parent = this;
        bot.setIndex();

        this.myBots.push(bot);

        console.log('Hello!');
    }

    updateVelocity(){
        console.log(this.knockedBack);
        return super.updateVelocity();
    }
}