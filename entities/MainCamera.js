class MainCamera{
    /**
     * 
     * @param {Number} x Starting x position
     * @param {Number} y Starting y position
     * @param {Number} width display width, in pixels
     * @param {Number} height display height, in pixels
     */
    constructor(x, y, width, height){
        this.startPos = new Vector(x, y);

        this.targets = [scene.player];
        this.position = this.averageTargetPosition;
        this.width = width/pixelSize;
        this.height = height/pixelSize;
        this.zoom = 1;

        this.offset;
        this.offsetMagnitude = 30;
        this.speed = 2;

        this.freezX;
        this.freezY;

        this.name = 'mainCamera';

        this.shakeVector = new Vector(0, 0);
        this.shakeMagnitude = 1;
    }

    update(){
        this.updateShake();
        if(scene.bossManager.boss){
            let position = this.startPos;
            this.targets = [scene.player, scene.bossManager.boss, {position}];
        }
        else{
            this.targets = [scene.player];
        }

        if(this.targets.length == 1){
            this.offset = this.setOffset();
            this.offset.magnitude = this.offsetMagnitude * this.targets[0].velocity.magnitude / this.targets[0].speed;
        }
        else{
            this.offset = new Vector(0, 0);
        }

        // Calculations before freezing axes
        let myPos = this.position;
        let targetPos = this.averageTargetPosition.add(this.offset);
        
        //targetPos.x = targetPos.x * (1-this.freezX) + this.startX*this.freezX;
        //targetPos.y = targetPos.y * (1-this.freezY) + this.startY*this.freezY;

        this.position = myPos.lerp(targetPos, this.speed * time.deltaTime);
        
        // Calculations after freezing
        this.position = this.position.add(this.shakeVector);
    }

    get pixelPosition(){
        return this.position.multiply(pixelSize);
    }

    setOffset(){
        if(this.targets[0].direction == 'right'){
            if(this.targets[0].diagonal == true) { return new Vector(1, -1); }
            else{ return new Vector(1, 0); }
        }
        else if(this.targets[0].direction == 'up'){
            if(this.targets[0].diagonal == true) { return new Vector(1, 1); }
            else{ return new Vector(0, 1); }
        }
        else if(this.targets[0].direction == 'left'){
            if(this.targets[0].diagonal == true) { return new Vector(-1, 1); }
            else{ return new Vector(-1, 0); }
        }
        else if(this.targets[0].direction == 'down'){
            if(this.targets[0].diagonal == true) { return new Vector(-1, -1); }
            else{ return new Vector(0, -1); }
        }
    }

    get averageTargetPosition(){
        let sumOfPositions = new Vector(0, 0);
        for(let i in this.targets){
            sumOfPositions = sumOfPositions.add(this.targets[i].position);
        }

        let averageTarget = sumOfPositions.divide(this.targets.length);
        return averageTarget;
    }

    updateShake(){
        this.shakeVector.magnitude = (1 - 10*time.deltaTime) * this.shakeVector.magnitude;
        this.shakeVector.angle = random(0, 2*Math.PI);
    }

    createShake(magnitude = 1){
        this.shakeVector = new Vector(this.shakeVector.magnitude + magnitude*this.shakeMagnitude, 0);
    }

    get topEdge(){
        return this.position.y + height / this.zoom / 2 / pixelSize;
    }
    get leftEdge(){
        return this.position.x - width / this.zoom / 2 / pixelSize;
    }
    get rightEdge(){
        return this.position.x + (width / this.zoom / 2 - (width - this.width*pixelSize)) / pixelSize;
    }
    get bottomEdge(){
        return this.position.y - (height / this.zoom / 2 + (height - this.height*pixelSize)) / pixelSize;
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