class Wall extends PhysicsObject{
    /**
     * 
     * @param {Vector} firstCorner One corner of the rectangle, representing 2 edges
     * @param {Vector} secondCorner The opposite corner, representing the other 2 edges
     */
    constructor(firstCorner, secondCorner){
        let x = (firstCorner.x + secondCorner.x)/2;
        let y = (firstCorner.y + secondCorner.y)/2;
        super(x, y);

        this.width = Math.abs(secondCorner.x - firstCorner.x);
        this.height = Math.abs(secondCorner.y - firstCorner.y);

        this.collider = new BoxCollider(this, 0, 0, this.width, this.height);
        this.collider.static = true;

        this.canvas = new Canvas(null, this.width, this.height);
        this.canvas.name = 'wall';

        this.index = scene.walls.length;
        scene.walls.push(this);
    }

    updateImage(){
        this.canvas.draw(this.position.x, this.position.y);
    }
}