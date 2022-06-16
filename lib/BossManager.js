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
                this.boss = new Soldier(new Vector(0, 0), new Vector(400, 240), difficulty);
                this.boss.position = new Vector(50, 50);
                this.boss.myWall = new Wall(new Vector(-20, 120), new Vector(20, 1000));
                let otherWall = new Wall(new Vector(-20, -120), new Vector(20, -1000));

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
        if(this.boss.myWall) this.boss.myWall.delete();
        this.boss = null;
    }
}