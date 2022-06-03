class FloorTile{
    /**
     * 
     * @param {Object} image The object's image
     * @param {Number} minX The minimum X value, -infinity by default
     * @param {Number} minY The minimum Y value, -infinity by default
     * @param {Number} maxX The maximum X value, infinity by default
     * @param {Number} maxY The maximum Y value, infinity by default
     */

    constructor(image, minX=-Infinity, minY=-Infinity, maxX=Infinity, maxY=Infinity){
        if(image){
            this.image = image;
            this.width = this.image.width;
            this.height = this.image.height;
        }

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        this.name = 'floor';
    }

    update(){
        // Nothing!!!
    }

    updateImage(){
        let pixelWidth = this.width * pixelSize;
        let pixelHeight = this.height * pixelSize;

        let startX = Math.max(scene.mainCamera.leftEdge,   this.minX);
        let startY = Math.max(scene.mainCamera.bottomEdge, this.minY);
        let endX =   Math.min(scene.mainCamera.rightEdge,  this.maxX);
        let endY =   Math.min(scene.mainCamera.topEdge,    this.maxY);

        startX -= startX % pixelWidth;
        startY -= startY % pixelHeight;
        endX -=   endX %   pixelWidth;
        endY -=   endY %   pixelHeight;

        for(let x = startX; x <= endX; x += pixelWidth){
            for(let y = startY; y <= endY; y += pixelHeight){
                this.image.draw(x, y);
            }
        }
    }
}