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

        this.position = this.averageTargetPosition;
        this.width = width/pixelSize;
        this.height = height/pixelSize;

        this.offset;
        this.offsetMagnitude = 60;
        this.speed = 2;

        this.freezX;
        this.freezY;
        this.isFrozen = false;

        this.name = 'mainCamera';

        this.shakeVector = new Vector(0, 0);
        this.shakeMagnitude = 1;
        this.updateShake();
    }

    update(){
        if(this.isFrozen) return;

        if(this.targets.length == 1){
            // The only one is the player
            this.offset = this.setOffset();
            this.offset.magnitude = this.offsetMagnitude * scene.player.velocity.magnitude / scene.player.speed;
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

    updateImage(){
        // Nothing!
    }

    get pixelPosition(){
        return this.position.multiply(pixelSize);
    }

    setOffset(){
        if(scene.player.direction == 'right'){
            if(scene.player.diagonal == true) { return new Vector(1, -1); }
            else{ return new Vector(1, 0); }
        }
        else if(scene.player.direction == 'up'){
            if(scene.player.diagonal == true) { return new Vector(1, 1); }
            else{ return new Vector(0, 1); }
        }
        else if(scene.player.direction == 'left'){
            if(scene.player.diagonal == true) { return new Vector(-1, 1); }
            else{ return new Vector(-1, 0); }
        }
        else if(scene.player.direction == 'down'){
            if(scene.player.diagonal == true) { return new Vector(-1, -1); }
            else{ return new Vector(0, -1); }
        }
    }

    get targets(){
        let targetList = [];

        for(let i of scene.referenceBosses){
            if(i.focusCameraOnThis) targetList.push(i.position);
        }

        if(scene.referenceBosses.length > 0)
            targetList.push(this.startPos);

        targetList.push(scene.player.position);

        return targetList;
    }

    get averageTargetPosition(){
        let sumOfPositions = new Vector(0, 0);
        for(let i of this.targets){
            sumOfPositions = sumOfPositions.add(i);
        }

        let averageTarget = sumOfPositions.divide(this.targets.length);
        return averageTarget;
    }

    updateShake(){
        this.shakeVector.magnitude = (1 - 90*time.deltaTime) * this.shakeVector.magnitude;
        this.shakeVector.angle = random(0, 2*PI);
        time.delayedFunction(this, 'updateShake', 1/30);
    }

    createShake(magnitude = 1){
        this.shakeVector = new Vector(this.shakeVector.magnitude + magnitude*this.shakeMagnitude, 0);
        this.shakeVector.angle = random(0, 2*PI);
    }

    freeze(){
        this.isFrozen = true;
    }

    unfreeze(){
        this.isFrozen = false;
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