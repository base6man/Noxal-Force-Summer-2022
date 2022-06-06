class BossManager{
    constructor(){
        this.boss;
    }

    update(){
        if(this.boss){
            this.boss.update();
        }
        else{
            if(scene.player.position.insideOf(new Vector(-150, -80), new Vector(150, 80))){
                this.boss = new Boss(new Vector(0, 0), new Vector(300, 160), difficulty);
                this.boss.position = new Vector(50, 50);
            }
        }
    }

    updateImage(){
        if(this.boss){
            this.boss.updateImage();
        }
    }
}