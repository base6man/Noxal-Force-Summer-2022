let player, mainCamera;
let playerRunning, playerIdle, playerDiagonal;
let playerImages = {}
let pixelSize = 8;

let time;
let isFirstFrame = true;
let globalTimescale = 1;
let steps = 10;
let collisionSteps = 3;

let boss;
let bullets = [];
let bulletImage;

let floor;
let floorImages;

let walls = [];
let colliders = [];
let layerMap = [
  {a: 'default', b: 'default'},
  {a: 'player', b: 'enemyAttack'},
  {a: 'player', b: 'default'},
  {a: 'boss', b: 'playerAttack'},
  {a: 'boss', b: 'default'},
  {a: 'boss', b: 'player'}
]

Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};

Array.prototype.includesKeyword = function(keyword) {
  for(i in this){
    if(keyword.test(this[i])) {return true; }
  }
  return false;
}

// Preload initializes images and their relavant canvases
function preload() {
  playerRunning = [
    loadImage("images/playerImages/running 0.png"),
    loadImage("images/playerImages/running 1.png"),
    loadImage("images/playerImages/running 2.png")
  ]
  playerIdle = [
    loadImage("images/playerImages/idle 0.png"),
    loadImage("images/playerImages/idle 1.png"),
    loadImage("images/playerImages/idle 2.png")
  ]
  playerDiagonal = [
    loadImage("images/playerImages/diagonal 0.png"),
    loadImage("images/playerImages/diagonal 1.png"),
    loadImage("images/playerImages/diagonal 2.png")
  ]

  floorImage = [
    loadImage("images/floorImages/floorTile1.png")
    //loadImage("images/floorImages/floorTile2.png"),
    //loadImage("images/floorImages/floorTile3.png"),
    //loadImage("images/floorImages/floorTile4.png"),
    //loadImage("images/floorImages/floorTile5.png")
  ]

  bulletImage = [
    loadImage("images/bullet.png")
  ]
}

// Setup initializes variables that require operations
function setup() {

  for(let i in playerIdle){     playerIdle[i]     = new Canvas(playerIdle[i]);     }
  for(let i in playerRunning){  playerRunning[i]  = new Canvas(playerRunning[i]);  }
  for(let i in playerDiagonal){ playerDiagonal[i] = new Canvas(playerDiagonal[i]); }
  for(let i in floorImage){     floorImage[i]     = new Canvas(floorImage[i]);     }
  for(let i in bulletImage){    bulletImage[i]    = new Canvas(bulletImage[i]);    }

  playerImages = {
    idle: playerIdle,
    running: playerRunning,
    diagonal: playerDiagonal
  }

  createCanvas(windowWidth, windowHeight - 4);
  mainCamera = new MainCamera(0, 0, width,height);
  
  time = new Time();

  player = new Player(-100, 0);
  boss = new Boss(100, 0);
  floor = new RandFloorTile(floorImage);
  walls = [
    new Wall(0, 180, 1000, 200),
    new Wall(250, 0, 200, 1000),
    new Wall(0, -180, 1000, 200),
    new Wall(-250, 0, 200, 1000)
  ]

}

// Start draws all images
// Do not move this to setup
function start(){
  for(let i in playerIdle){     playerIdle[i].setup();     }
  for(let i in playerRunning){  playerRunning[i].setup();  }
  for(let i in playerDiagonal){ playerDiagonal[i].setup(); }
  for(let i in floorImage){     floorImage[i].setup();     }
  for(let i in bulletImage){    bulletImage[i].setup();    }
  for(let i in walls){          walls[i].canvas.setup();   }
}

function draw() {
  if(isFirstFrame){
    start();
    isFirstFrame = false;
  }

  for(let stepNum = 0; stepNum < steps; stepNum++){
    time.update();
    mainCamera.update();
  
    floor.update();
    player.update();
    boss.update();
    for(let i in bullets){ bullets[i].update(); }
  
    for(let steps = 0; steps < collisionSteps; steps++){
      for(let i in colliders){ colliders[i].update(parseInt(i)+1); }
    }
  }
  
  background(220);
  floor.updateImage();
  for(let i in walls){ walls[i].updateImage(); }
  player.updateImage();
  boss.updateImage();
  for(let i in bullets){ bullets[i].updateImage(); }
}

function drawImage(x, y, img){

  // Push and pop so other images aren't distorted by adjustments to this one
  {
    push();

    // Map so that 1 unit is 1 pixel
    x0 = x * pixelSize;
    y0 = y * pixelSize;
    
    // Reverse the y axis.
    y1 = -y0;

    // Center the image on via the camera
    x2 = x0 + (width/2 - mainCamera.pixelPosition.x - img.width/2);
    y2 = y1 + (height/2 - (-mainCamera.pixelPosition.y) - img.height/2);

    // Scale it to the camera's zoom
    let scaleValue = mainCamera.zoom;
    scale(scaleValue);

    // p5 scaling goes toward the top left hand corner of the screen, not the middle
    // Adjust for this
    x3 = x2 + width/2 * (1/scaleValue - 1)
    y3 = y2 + height/2 * (1/scaleValue - 1)

    // Adjust to a pixel perfect camera
    x4 = x3 - (x3 % pixelSize);
    y4 = y3 - (y3 % pixelSize);

    image(img, x4, y4);
    pop();
  }
}
