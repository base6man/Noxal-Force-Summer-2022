class Wall extends PhysicsObject{
    /**
     * 
     * @param {Vector} firstCorner One corner of the rectangle, representing 2 edges
     * @param {Vector} secondCorner The opposite corner, representing the other 2 edges
     */
    constructor(firstCorner, secondCorner){
        let x = (firstCorner.x + secondCorner.x)/2;
        let y = (firstCorner.y + secondCorner.y)/2;
        super(new Vector(x, y));

        this.width = Math.abs(secondCorner.x - firstCorner.x);
        this.height = Math.abs(secondCorner.y - firstCorner.y);

        this.collider = new BoxCollider(this, 0, 0, this.width, this.height);
        this.collider.static = true;

        this.canvas = new Canvas(null, this.width, this.height);
        this.canvas.name = 'wall';
        if(!isFirstFrame) this.canvas.setup();

        this.index = scene.walls.length;
        scene.walls.push(this);
    }

    updateImage(){
        this.canvas.draw(this.position.x, this.position.y);
    }

    delete(){
        scene.walls.splice(this.index, 1);
        this.collider.delete();
        time.stopFunctions(this, null);
        for(let i = this.index; i < scene.walls.length; i++){
          scene.walls[i].moveDownOneIndex();
        }

        for(let i in scene.walls){
            console.assert(scene.walls[i].index == i);
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}