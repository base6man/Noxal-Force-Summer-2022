class RandFloorTile extends FloorTile{
    constructor(images, minX=-Infinity, minY=-Infinity, maxX=Infinity, maxY=Infinity){
        super(null, minX, minY, maxX, maxY);

        this.images = images;
        this.width = this.images[0].width;
        this.height = this.images[0].height;
        
        this.seed = [];
        for(let i = 0; i < 1000; i++){
            this.seed.push(Math.random());
        }
    }

    updateImage(){

        let startX = Math.max(mainCamera.leftEdge - this.width,    this.minX);
        let startY = Math.max(mainCamera.bottomEdge - this.height, this.minY);
        let endX =   Math.min(mainCamera.rightEdge + this.width,   this.maxX);
        let endY =   Math.min(mainCamera.topEdge + this.height,    this.maxY);

        startX -= startX % this.width;
        startY -= startY % this.height;
        endX -=   endX %   this.width;
        endY -=   endY %   this.height;

        for(let x = startX; x <= endX; x += this.width){
            for(let y = startY; y <= endY; y += this.height){

                // Here is the random number generator
                // I used the most random thing I could think of:
                // seed[10*x*seed[y]] + seed[10*y*seed[x]]
                // The rest is all just fluff
                let a = Math.abs(Math.ceil(this.seed[Math.abs(x % 1000)]*y*10) % 1000);
                let b = Math.abs(Math.ceil(this.seed[Math.abs(y % 1000)]*x*10) % 1000);

                let index = Math.floor(
                    (this.seed[a] + 
                    this.seed[b])
                    * this.images.length / 2
                );
                this.images[index].draw(x, y);
            }
        }
    }
}