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
            if(scene.player.position.insideOf(new Vector(-240, -120), new Vector(240, 120)) && !this.hasBeenInRoom){

                // Change boss type here
                this.boss = new Guard(new Vector(0, 0), new Vector(400, 240), difficulty);
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