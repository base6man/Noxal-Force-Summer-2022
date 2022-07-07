class HealthBar{
    constructor(parent, maxHealth, offset = new Vector(5, 4)){
        this.parent = parent;
        this.offset = offset;

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.previousHealth;

        this.shouldDisplay = false;
        this.displayingPreviousValue = true;

        this.index = scene.otherImages.length;
        scene.otherImages.push(this);

        this.healthTileWidth = 1;
        this.healthTileHeight = 2;
        this.spaceBetweenTiles = 1;

        this.displayTime = 2;
        this.switchTime = 0.8;

        this.totalWidth = this.maxHealth * (this.healthTileWidth + this.spaceBetweenTiles) + this.spaceBetweenTiles;
        this.totalHeight = this.healthTileHeight + 2 * this.spaceBetweenTiles;

        this.healthCanvas = new Canvas(null, this.totalWidth, this.totalHeight);
        this.previousHealthCanvas = new Canvas(null, this.totalWidth, this.totalHeight);
    }

    updateImage(){
        if(this.shouldDisplay) {
            if(this.displayingPreviousValue) this.healthCanvas.draw(this.position.x, this.position.y);
            else{ this.previousHealthCanvas.draw(this.position.x, this.position.y); }
        }
    }

    display(newHealth){
        this.shouldDisplay = true;
        this.previousHealth = this.health;
        this.health = newHealth;

        this.canSwitch = true;
        this.displayingPreviousValue = true;

        this.updateCanvas(this.healthCanvas, this.health);
        this.updateCanvas(this.previousHealthCanvas, this.previousHealth);

        time.stopFunctions(this, 'stopDisplay');
        time.stopFunctions(this, 'stopSwitching');
        time.stopFunctions(this, 'switchToNew');
        
        time.delayedFunction(this, 'stopDisplay', this.displayTime);
        time.delayedFunction(this, 'stopSwitching', this.switchTime);
        time.delayedFunction(this, 'switchToNew', 0.25);
    }

    updateCanvas(image, health){

        image.addBox(0, 0, this.totalWidth, this.totalHeight, 255);

        for(let i = 0; i < health; i++){
            image.addBox(
                this.spaceBetweenTiles + i * (this.healthTileWidth + this.spaceBetweenTiles), 
                this.spaceBetweenTiles, 
                this.healthTileWidth, 
                this.healthTileHeight, 
                'green'
            );
        }
    }

    stopDisplay(){
        this.shouldDisplay = false;
    }

    stopSwitching(){
        this.canSwitch = false;
    }

    switchToNew(){
        this.displayingPreviousValue = false;
        if(this.shouldDisplay) time.delayedFunction(this, 'switchToPrevious', 0.25);
    }

    switchToPrevious(){
        this.displayingPreviousValue = true;
        if(this.canSwitch) time.delayedFunction(this, 'switchToNew', 0.25);
    }

    get position(){
        return this.parent.position.add(this.offset);
    }

    delete(){
        
        scene.otherImages.splice(this.index, 1);
        time.stopFunctions(this, null);

        for(let i = this.index; i < scene.otherImages.length; i++){
          scene.otherImages[i].moveDownOneIndex();
        }

        for(let i in scene.otherImages){
            console.assert(scene.otherImages[i].index == i);
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}