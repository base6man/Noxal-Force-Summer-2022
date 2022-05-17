let player; 
let mainCamera;
let boss;
let bullets = [];
let walls = [];
let colliders = [];
let floor;

let bulletImage;
let floorImages;
let playerRunning, playerIdle, playerDiagonal;
let playerImages = {}
let pixelSize = 8;

let time;
let isFirstFrame = true;
let globalTimescale = 1;
let steps = 10;
let collisionSteps = 3;


let layerMap = [
  {a: 'default', b: 'default'},
  {a: 'player', b: 'enemyAttack'},
  {a: 'player', b: 'default'},
  {a: 'boss', b: 'playerAttack'},
  {a: 'boss', b: 'default'},
  {a: 'boss', b: 'player'}
]

let gameOver = false;


Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};

function includesKeyword(array, keyword){
  for(i in array){
    if(keyword.test(array[i])) {return true; }
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
  ]

  bulletImage = [
    loadImage("images/bullet(0).png"),
    loadImage("images/bullet(1).png"),
    loadImage("images/bullet(3).png"),
    loadImage("images/bullet(2).png")
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
  
  time = new Time();

  player = new Player(-100, 0);
  boss = new Boss(100, 0);
  
  mainCamera = new MainCamera(0, 0, width,height);
  floor = new RandFloorTile(floorImage, -150, -80, 150, 80);

  new Wall(0, 180, 1000, 200);
  new Wall(250, 0, 200, 1000);
  new Wall(0, -180, 1000, 200);
  new Wall(-250, 0, 200, 1000);
}

// Start draws all images
// Do not move this to setup
function start(){
  for(let i in walls){ walls[i].canvas.setup();}
  for(let i in floorImage){     floorImage[i].setup();           }
  for(let i in bulletImage){    bulletImage[i].setup();          }
  for(let i in playerIdle){     playerIdle[i].setup();           }
  for(let i in playerRunning){  playerRunning[i].setup();        }
  for(let i in playerDiagonal){ playerDiagonal[i].setup();       }
}

function draw() {
  if(gameOver){
    let winlose;
    if(player.health <= 0){
      winlose = 'lose.';
    }
    else if (boss.health <= 0){
      winlose = 'win!';
    }

    textAlign(CENTER, CENTER);
    textSize(80);
    text('You ' + winlose, width/2, height/2);
    console.log('You ' + winlose);
    noLoop();
  }
  else{
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
    
    // Has to be in this order
    // I hate it; I would make it in a different order, but that can't happen
    background(220);
    floor.updateImage();
    for(let i in walls){ walls[i].updateImage(); }
    player.updateImage();
    boss.updateImage();
    for(let i in bullets){ bullets[i].updateImage(); }
  }
}

function drawImage(x, y, img, rotation = 'right', name = null){

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


    // Adjust for image rotation
    let x4, y4;
    switch(rotation){
    case 'down':
      rotate(PI/2);
      x4 = y3+pixelSize;
      y4 = -x3 - (img.width+pixelSize);
      break;
    case 'left':
      rotate(PI);
      x4 = -x3 - (img.width+pixelSize);
      y4 = -y3 - (img.height+pixelSize);
      break;
    case 'up':
      rotate(3*PI/2);
      x4 = -y3 - (img.height+pixelSize);
      y4 = x3+pixelSize;
      break;
    case 'right':
      x4 = x3+pixelSize;
      y4 = y3+pixelSize;
      break;
    default:
      console.log('Image rotation has reached an impossible state.');
    }
    
    // Adjust to a pixel perfect camera
    x5 = x4 - (x4 % pixelSize);
    y5 = y4 - (y4 % pixelSize);

    image(img, x5, y5);
    if(name && rotation != 'right'){
      console.log(name, x5, y5, mainCamera.position);
    }
    pop();
  }
}
