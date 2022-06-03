class MainCamera{
    /**
     * 
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     * @param {Number} width display width, in pixels
     * @param {Number} height display height, in pixels
     */
    constructor(x, y, width, height){
        this.startX = x;
        this.startY = y;

        this.target = scene.player;

        this.position = new Vector(this.target.position.x, this.target.position.y);
        this.width = width/pixelSize;
        this.height = height/pixelSize;
        this.zoom = 1;

        this.offset;
        this.offsetMagnitude = 0;
        this.speed = 1;

        this.freezX;
        this.freezY;

        this.name = 'mainCamera';
    }

    update(){
        if(this.target.position.insideOf(new Vector(-150, -90), new Vector(150, 90))){
            this.freezX = true;
            this.freezY = true;
        }
        else{
            this.freezX = false;
            this.freezY = false;
        }

        this.offset = this.setOffset();
        this.offset.magnitude = this.offsetMagnitude;

        let myPos = this.position;
        let targetPos = this.target.position.add(this.offset);

        this.position = myPos.lerp(targetPos, this.speed * time.deltaTime);

        if(this.freezX){ this.position.x = this.startX; }
        if(this.freezY){ this.position.y = this.startY; }
    }

    get pixelPosition(){
        return this.position.multiply(pixelSize);
    }

    setOffset(){
        if(this.target.direction == 'right'){
            if(this.target.diagonal == true) { return new Vector(1, -1); }
            else{ return new Vector(1, 0); }
        }
        else if(this.target.direction == 'up'){
            if(this.target.diagonal == true) { return new Vector(1, 1); }
            else{ return new Vector(0, 1); }
        }
        else if(this.target.direction == 'left'){
            if(this.target.diagonal == true) { return new Vector(-1, 1); }
            else{ return new Vector(-1, 0); }
        }
        else if(this.target.direction == 'down'){
            if(this.target.diagonal == true) { return new Vector(-1, -1); }
            else{ return new Vector(0, -1); }
        }
    }

    get topEdge(){
        return this.position.y + height / 2 / pixelSize;
    }
    get leftEdge(){
        return this.position.x - width / 2 / pixelSize;
    }
    get rightEdge(){
        return this.position.x + (width / 2 - (width - this.width*pixelSize)) / pixelSize;
    }
    get bottomEdge(){
        return this.position.y - (height / 2 + (height - this.height*pixelSize)) / pixelSize;
    }

    isOffScreen(image, x, y){
        return !(
            x < this.width*pixelSize + image.width/4 && 
            x > -image.width/4*pixelSize && 
            y < this.height*pixelSize + image.height/4 && 
            y > -image.height/4*pixelSize
        );
    }
}