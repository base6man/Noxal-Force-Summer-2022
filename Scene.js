class Scene{
    constructor(){
        this.player; 
        this.mainCamera;
        this.bossManager;
        this.bullets = [];
        this.walls = [];
        this.colliders = [];
        this.floor;

        this.isFirstFrame = true;

        this.frameRateList = [];

        this.textBoxHeight = 20;
        this.quote = '';
        
        this.gameOver = false;
    }

    // Setup initializes variables that require operations
    setup() {
        
        this.player = new Player(0, -250);
        this.bossManager = new BossManager();
        
        this.mainCamera = new MainCamera(0, 0, width, height);
        this.floor = new RandFloorTile(floorImage);
    
        //new Wall(0, 180, 500, 200);
        //new Wall(250, 0, 200, 560);
        //new Wall(0, -180, 500, 200);
        //new Wall(-250, 0, 200, 560);

        new Wall(new Vector(-1000, -120),    new Vector(-20, -1000));
        new Wall(new Vector(1000, -120),    new Vector(20, -1000));
        new Wall(new Vector(200, -1000),   new Vector(1000, 1000));
        new Wall(new Vector(-20, 1000), new Vector(-1000, 120));
        new Wall(new Vector(20, 1000), new Vector(1000, 120));
        new Wall(new Vector(-1000, -1000), new Vector(-200, 1000));
    }

    start(){
        for(let i in this.walls){ this.walls[i].canvas.setup(); }
    }

    update() {
        
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
            this.bossManager.update();
            for(let i in this.bullets){ this.bullets[i].update(); }
        
            for(let stepNum = 0; stepNum < collisionSteps; stepNum++){
                for(let i in this.colliders){ this.colliders[i].update(parseInt(i)+1); }
            }
        }
        let end = new Date();
        
        return end-start;
    }

    updateImage(){
        let start = new Date();
        // Has to be in this order
        // I hate it; I would make it in a different order, but that can't happen

        this.floor.updateImage();
        for(let i in this.walls){ this.walls[i].updateImage(); }
        this.player.updateImage();
        this.bossManager.updateImage();
        for(let i in this.bullets){ this.bullets[i].updateImage(); }

        let end = new Date();
        return end-start;
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

        /*
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
            text(this.quote, pixelSize*4, height - this.textBoxHeight/2*pixelSize);
        }
        pop();
        */
        let end = new Date();
        return end-start;
    }

    checkForGameOver(){
        if(this.player.position.y > 130) this.gameOver = true;
        if(this.gameOver){
            let winlose = new Transition([]);
            if(this.player.health <= 0){
                winlose.addQuote('You lose.');
            }
            else{
                winlose.addQuote('You win!');
                winlose.addQuote('Increasing difficulty...');
                difficulty++;
            }
            killScene(winlose);
        }
    }
}