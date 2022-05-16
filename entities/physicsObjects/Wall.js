class Wall extends PhysicsObject{
    constructor(x, y, width, height){
        super(x, y);
        this.width = width;
        this.height = height;

        this.collider = new BoxCollider(this, 0, 0, width, height);
        this.collider.static = true;

        this.canvas = new Canvas(null, this.width, this.height);

        this.index = walls.length;
        walls.push(this);
    }

    updateImage(){
        this.canvas.draw(this.position.x, this.position.y);
    }
}