class Scene{
    constructor(){
        this.player; 
        this.mainCamera;
        this.boss;
        this.bullets = [];
        this.walls = [];
        this.colliders = [];
        this.floor;

        this.isFirstFrame = true;

        this.frameRateList = [];

        this.textBoxHeight = 20;
        
        this.gameOver = false;
    }

    // Setup initializes variables that require operations
    setup() {
        
        this.player = new Player(0, 0);
        this.boss = new Boss(100, 0, 1, 0.6);
        this.boss.setAttacks(['dodge']);
        
        this.mainCamera = new MainCamera(0, -this.textBoxHeight/2, width, height - this.textBoxHeight*pixelSize);
        this.floor = new RandFloorTile(floorImage);
    
        //new Wall(0, 180, 500, 200);
        //new Wall(250, 0, 200, 560);
        //new Wall(0, -180, 500, 200);
        //new Wall(-250, 0, 200, 560);

        new Wall(new Vector(-1000, 80),    new Vector(-10, 1000));
        new Wall(new Vector(1000, 80),    new Vector(10, 1000));
        new Wall(new Vector(150, -1000),   new Vector(1000, 1000));
        new Wall(new Vector(-1000, -1000), new Vector(1000, -80));
        new Wall(new Vector(-1000, -1000), new Vector(-150, 1000));
    }

    start(){
        for(let i in this.walls){ this.walls[i].canvas.setup(); }
    }

    update() {
        if(this.gameOver){
            let winlose;
            if(this.player.health <= 0){
                winlose = 'lose.';
            }
            else if (this.boss.health <= 0){
                winlose = 'win!';
            }
        
            textAlign(CENTER, CENTER);
            textSize(80);
            text('You ' + winlose, width/2, height/2);
            noLoop();   // Should be replaced with a thing that makes it stop running
        }
        else{
            if(this.isFirstFrame){
                this.start();
                this.isFirstFrame = false;
            }
        
            let start = new Date();
            for(let stepNum = 0; stepNum < steps; stepNum++){
                time.update();
                this.mainCamera.update();
                
                this.floor.update();
                this.player.update();
                this.boss.update();
                for(let i in this.bullets){ this.bullets[i].update(); }
            
                for(let stepNum = 0; stepNum < collisionSteps; stepNum++){
                    for(let i in this.colliders){ this.colliders[i].update(parseInt(i)+1); }
                }
            }
            let end = new Date();
            //console.log('Time in update: ' + (end-start));
        }
    }

    updateImage(){
        let start = new Date();
        // Has to be in this order
        // I hate it; I would make it in a different order, but that can't happen

        this.floor.updateImage();
        let floorTime = new Date() - start;

        for(let i in this.walls){ this.walls[i].updateImage(); }
        let wallTime = new Date() - floorTime - start;

        this.player.updateImage();
        let playerTime = new Date() - wallTime - start;

        this.boss.updateImage();
        let bossTime = new Date() - playerTime - start;

        for(let i in this.bullets){ this.bullets[i].updateImage(); }
        let bulletTime = new Date() - bossTime - start;

        let end = new Date();
        //console.log('Total: ' + (end-start), 'Floor: ' + floorTime, 'Wall: ' + wallTime, 'Player: ' + playerTime, 'Boss: ' + bossTime, 'Bullets: ' + bulletTime);
    }

    updateExtras(){
        let start = new Date();
        push();
        {
            stroke('white');
            strokeWeight(2);
            this.frameRateList.push(time.frameRate);
            for(let i in this.frameRateList){
                point(this.frameRateList.length - i, this.frameRateList[i]);
            }
            line(0, 60, 250, 60);

            if(this.frameRateList.length > 250){
                this.frameRateList.splice(0, 1);
            }
        }
        pop();

        push();
        {
            fill('grey');
            stroke('black');
            strokeWeight(5);
            rect(0, height - this.textBoxHeight*pixelSize, width, this.textBoxHeight*pixelSize);

            fill('black');
            strokeWeight(3);
            textAlign(LEFT, CENTER);
            textSize((this.textBoxHeight - 4)*pixelSize);
            text(this.boss.quote, pixelSize*4, height - this.textBoxHeight/2*pixelSize);
        }
        pop();
        let end = new Date();
        //console.log('Time in update extras: ' + (end-start));
    }
}