class RandFloorTile extends FloorTile{
    constructor(images, minX=-Infinity, minY=-Infinity, maxX=Infinity, maxY=Infinity){
        super(null, minX, minY, maxX, maxY);

        this.images = images;
        this.width = this.images[0].width;
        this.height = this.images[0].height;
        
        this.seed = [];
        for(let i = 0; i < 100; i++){
            this.seed.push(Math.random());
        }
    }

    updateImage(){
        let count = 0;

        for(let x = this.startX; x <= this.endX; x += this.width){
            for(let y = this.startY; y <= this.endY; y += this.height){

                // Here is the random number generator
                // I used the most random thing I could think of:
                // seed[10*x*seed[y]] + seed[10*y*seed[x]]
                // The rest is all just fluff
                let a = Math.abs(Math.ceil(this.seed[Math.abs(x % 100)]*y*10) % 100);
                let b = Math.abs(Math.ceil(this.seed[Math.abs(y % 100)]*x*10) % 100);

                let index = Math.floor(
                    (this.seed[a] + 
                    this.seed[b])
                    * this.images.length / 2
                );
                this.images[index].draw(x, y);
                count++;
            }
        }

        //console.log('Number of floor tiles: ' + count, this.startX, this.startY, this.endX, this.endY, scene.mainCamera.leftEdge, scene.mainCamera.topEdge, scene.mainCamera.rightEdge, scene.mainCamera.bottomEdge);
    }

    get startX(){
        let temp = Math.max(scene.mainCamera.leftEdge - this.width, this.minX);
        temp -= temp % this.width;
        return temp;
    }

    get startY(){
        let temp = Math.max(scene.mainCamera.bottomEdge - this.height, this.minY);
        temp -= temp % this.width;
        return temp;
    }

    get endX(){
        let temp = Math.min(scene.mainCamera.rightEdge + this.width, this.maxX);
        temp -= temp % this.width;
        return temp;
    }

    get endY(){
        let temp = Math.min(scene.mainCamera.topEdge + this.height, this.maxY);
        temp -= temp % this.width;
        return temp;
    }
}