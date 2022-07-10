class Bot extends Boss{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);

        this.health = 1;
        this.isMainBoss = false;
        this.parent;
    }

    setIndex(){
        this.index = this.parent.myBots.length;
    }
    
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
}