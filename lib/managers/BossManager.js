class BossManager{
    constructor(){
        this.bosses = [];

        this.hasBeenInRoom = false;
        this.nameOfBoss = 'multiGuard'
    }

    update(){
        for(let i in this.bosses) this.bosses[i].update();

        if(scene.player.position.insideOf(new Vector(-200, -120), new Vector(200, 120)) && !this.hasBeenInRoom){

            
            // Change boss type here
            this.bosses.push(this.bossToCreate());
            this.bosses[0].myWall = new Wall(new Vector(-20, 120), new Vector(20, 1000));

            let otherWall = new Wall(new Vector(-20, -120), new Vector(20, -1000));

            this.hasBeenInRoom = true;
        }
    }

    bossToCreate(){
        switch(this.nameOfBoss){
            case 'guard':       return new Guard();
            case 'multiGuard':  return new MultiGuard();
            case 'soldier':     return new Soldier();
            case 'clocksmith':  return new Clocksmith();
            case 'knight':      return new Knight();
            case 'samurai':     return new Samurai();
            default: throw error;
        }
    }

    updateImage(){
        for(let i in this.bosses) this.bosses[i].updateImage();
    }

    killBoss(index){
        if(this.bosses[index].myWall) this.bosses[index].myWall.delete();
        this.bosses.splice(index, 1);

        for(let i = index; i < this.bosses.length; i++){
            this.bosses[i].moveDownOneIndex();
        }

        if(this.bosses.length == 0){
            for(let i = scene.bullets.length-1; i >= 0; i--) {
                if(!scene.bullets[i].isPlayerAttack) scene.bullets[i].dissapate();
            }
        }
    }
}