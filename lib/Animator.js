class Animator{
    /**
     * 
     * @param {Array} canvases An array of the canvases in the animation
     * @param {Number} timeBetweenFrames You better understand this one, I made it long
     */
    constructor(name, canvases, timeBetweenFrames, canRotate = true){
        
        this.name = name;
        this.canvases = canvases;
        this.index = 0;

        this.canRotate = canRotate;

        this.timeBetweenFrames = timeBetweenFrames;
        this.running = false;
    }

    incrementCanvas(){
        if(this.index == this.canvases.length - 1){
            this.running = false;
        }
        if(this.running){
            this.index = (this.index + 1) % this.canvases.length;
            time.delayedFunction(this, "incrementCanvas", this.timeBetweenFrames);
        }
    }

    get currentImage(){
        return this.canvases[this.index];
    }


    run() { 
        if(!this.running){
            this.running = true;
            this.index = (this.index + 1) % this.canvases.length;
            time.delayedFunction(this, "incrementCanvas", this.timeBetweenFrames);
        }
    }

    stop() { 
        this.running = false; 
        time.stopFunctions(this, "incrementCanvas");
    }

    toString(){
        return 'entities.' + this.name + '[' + this.index  + ']';
    }
}