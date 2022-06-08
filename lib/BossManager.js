class BossManager{
    constructor(){
        this.boss;

        this.hasBeenInRoom = false;
    }

    update(){
        if(this.boss){
            this.boss.update();
        }
        else{
            if(scene.player.position.insideOf(new Vector(-150, -80), new Vector(150, 80)) && !this.hasBeenInRoom){
                this.boss = new Boss(new Vector(0, 0), new Vector(300, 160), difficulty);
                this.boss.position = new Vector(50, 50);
                this.boss.myWall = new Wall(new Vector(-20, 80), new Vector(20, 1000));
                let otherWall = new Wall(new Vector(-20, -80), new Vector(20, -1000));

                this.hasBeenInRoom = true;
            }
        }
    }

    updateImage(){
        if(this.boss){
            this.boss.updateImage();
        }
    }

    killBoss(){
        this.boss = null;
    }
}