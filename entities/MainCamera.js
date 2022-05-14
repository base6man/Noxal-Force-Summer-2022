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

        this.position = new Vector(x, y);
        this.width = width/pixelSize;
        this.height = height/pixelSize;
        this.zoom = 0.5;

        this.offset;
        this.offsetMagnitude = 10;
        this.speed = 1;

        this.freezX = true;
        this.freezY = true;

        this.pixelPosition = this.position.multiply(pixelSize);
    }

    update(){
        this.offset = this.setOffset();
        this.offset.magnitude = this.offsetMagnitude;

        let myPos = this.position;
        let targetPos = player.position.add(this.offset);

        this.position = myPos.lerp(targetPos, this.speed * time.deltaTime);
        this.pixelPosition = this.position.multiply(pixelSize);

        if(this.freezX){ this.position.x = this.startX; }
        if(this.freezY){ this.position.y = this.startY; }
    }

    setOffset(){
        if(player.direction == 'right'){
            if(player.diagonal == true) { return new Vector(1, -1); }
            else{ return new Vector(1, 0); }
        }
        else if(player.direction == 'up'){
            if(player.diagonal == true) { return new Vector(1, 1); }
            else{ return new Vector(0, 1); }
        }
        else if(player.direction == 'left'){
            if(player.diagonal == true) { return new Vector(-1, 1); }
            else{ return new Vector(-1, 0); }
        }
        else if(player.direction == 'down'){
            if(player.diagonal == true) { return new Vector(-1, -1); }
            else{ return new Vector(0, -1); }
        }
    }

    get topEdge(){
        return this.position.y + this.height / this.zoom / 2;
    }
    get leftEdge(){
        return this.position.x - this.width / this.zoom / 2;
    }
    get rightEdge(){
        return this.position.x + this.width / this.zoom / 2;
    }
    get bottomEdge(){
        return this.position.y - this.height / this.zoom / 2;
    }
}