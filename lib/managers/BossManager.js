class BossManager{
    constructor(){
        this.bosses = [];

        this.hasBeenInRoom = false;
        this.nameOfBoss = 'guard'
    }

    update(){
        for(let i in this.bosses) this.bosses[i].update();

        if(scene.player.position.insideOf(new Vector(-200, -120), new Vector(200, 120)) && !this.hasBeenInRoom){

            
            // Change boss type here
            this.bosses.push(new Clocksmith(new Vector(0, 0), new Vector(400, 240), difficulty));
            

            this.bosses[0].myWall = new Wall(new Vector(-20, 120), new Vector(20, 1000));
            let otherWall = new Wall(new Vector(-20, -120), new Vector(20, -1000));

            this.hasBeenInRoom = true;
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
    }
}