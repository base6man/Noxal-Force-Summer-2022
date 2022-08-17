class GuardBot extends Guard{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        
        this.runSpeed = 4;
        this.difficultyMultiplier = 0.85;

        this.isMainBoss = false;

        this.health = 1;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =     0.5 + (this.difficulty-1)/5;
        this.attackPower =       0.3 + (this.difficulty-1)/8;
    }

    // Bot properties
    /*
    createAnimations(){
        let listOfAnimations = [];

        let botAnimation = {
            parent: this,
            name: 'bot',
            animation: new Animator('bot', bossImages.bot, 1),
            get canRun(){
                return true;
            }
        }
        listOfAnimations.push(botAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }
    */
    setIndex(){
        this.index = this.parent.myBots.length;
    }
}