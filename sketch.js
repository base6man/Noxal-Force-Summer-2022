let scene, transition;
let skipIntro = true;

let bulletImage;
let floorImages;
let playerRunning, playerIdle, playerDiagonal;
let playerImages = {}
let bossIdle, bossAttack;
let bossImages = {}
let allImages;

let time;
let isFirstFrame = true;
let globalTimescale = 0.9;
let steps = 3;
let collisionSteps = 5;

let pixelSize = 5;

let difficulty = 7;

let songs;
let currentSong;

let layerMap = [
  {a: 'default', b: 'default'},
  {a: 'player',  b: 'enemyAttack'},
  {a: 'player',  b: 'default'},
  {a: 'player',  b: 'blueBullet'},
  {a: 'boss',    b: 'playerAttack'},
  {a: 'boss',    b: 'default'},
  {a: 'boss',    b: 'player'},
  {a: 'ghost',   b: 'default'},
  {a: 'ghost',   b: 'blueBullet'}
]

let imageTime;

Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};

Number.prototype.betweenInclusive = function(a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this >= min && this <= max;
}

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
    loadImage("images/bullet(clear).png"),
    loadImage("images/bullet(blue).png")
  ]

  bossIdle = [
    loadImage("images/bossImages/bossIdle(0).png")
  ]
  bossAttack = [
    loadImage("images/bossImages/bossAttack(0).png")
  ]

  songs = {
    intro: loadSound("sounds/fieldTheme.wav"),
    fight: loadSound("sounds/onTheTrain.wav")
  }

}

function setup(){
  time = new Time();
  createCanvas(windowWidth, windowHeight - 4);

  allImages = [playerRunning, playerIdle, playerDiagonal, floorImage, bulletImage, bossIdle, bossAttack];
  for(let i in allImages){
    for(let j in allImages[i]){
      allImages[i][j] = new Canvas(allImages[i][j]);
    }
  }

  playerImages = {
    idle: playerIdle,
    running: playerRunning,
    diagonal: playerDiagonal
  }

  bossImages = {
    idle: bossIdle,
    attack:bossAttack
  }
  
  if(skipIntro){
    createScene();
  }
  else{
    transition = new Transition([
      'Welcome to Noxal Force!', 
      'This is a game about escaping a castle.', 
      'Once the thriving center of a great kingdom, \nMortimor Keep has fallen to ruin.', 
      'The Tower Gardens are long collapsed, \nnow crawling with spikeroot.',
      'Our once famous dining hall may still exist, \nbut nobody has seen it in years.',
      'The secret vault still stands, \nbut its treasure is rumored to be gone.',
      'Indeed, the Seven Walls have nothing left to protect.',
      'So go.',
      'Escape.',
      'There is nothing for you here.'
    ]);
  }

  getAudioContext().suspend();
}

function createScene(){
  scene = new Scene();
  scene.setup();

  updateSong();
}

function updateSong(){
  let oldSong = currentSong;
  if(difficulty == 0) currentSong = songs.intro;
  else{ currentSong = songs.fight; }

  if(!currentSong.isPlaying()){
    if(oldSong) oldSong.stop();
    currentSong.loop();
    console.log('playing song!');
  }

  console.log('current song: ' + currentSong);
}

function killScene(newTransition = new Transition([])){
  scene = null;
  time.stopFunctionsWithinScene();
  transition = newTransition;
}

// Start draws all images
// Do not move this to setup
function start(){
  for(let i in allImages){
    for(let j in allImages[i]){
      allImages[i][j].setup();
    }
  }
}

function draw(){

  let startTime = new Date();
  imageTime = 0;
  imageCount = 0;

  background(0);

  if(isFirstFrame){
    start();
    isFirstFrame = false;
  }
  
  if(scene){
    scene.update();
    scene.updateImage();
    scene.updateExtras();
    scene.checkForGameOver();
  }
  else{
    for(let stepNum = 0; stepNum < steps; stepNum++) 
      time.update();
    if(transition) transition.update();
  }

  let endTime = new Date();
  //console.log('time drawing images: ' + imageTime, 'time otherwise: ' + (endTime-startTime-imageTime));
  //console.log(imageCount);
}

function drawImage(x, y, img, rotation = 'right', name = null){
  imageCount++;
  // Push and pop so other images aren't distorted by adjustments to this one
  {
    push();

    // Map so that 1 unit is 1 pixel
    x0 = x * pixelSize;
    y0 = y * pixelSize;
    
    // Reverse the y axis.
    y1 = -y0;

    // Center the image on via the camera
    x2 = x0 + (width/2 - scene.mainCamera.pixelPosition.x - img.width/2);
    y2 = y1 + (height/2 - (-scene.mainCamera.pixelPosition.y) - img.height/2);

    // Scale it to the camera's zoom
    let scaleValue = scene.mainCamera.zoom;
    scale(scaleValue);

    // p5 scaling goes toward the top left hand corner of the screen, not the middle
    // Adjust for this
    x3 = x2 + width/2 * (1/scaleValue - 1);
    y3 = y2 + height/2 * (1/scaleValue - 1);

    // After this we get some weird rotation stuff
    if(scene.mainCamera.isOffScreen(img, x3, y3)) {
      pop();
      return;
    }

    // Adjust for image rotation
    let x4, y4;
    switch(rotation){
    case 'down':
      rotate(PI/2);
      x4 = y3;
      y4 = -x3-img.width;
      break;
    case 'left':
      rotate(PI);
      x4 = -x3-img.width;
      y4 = -y3-img.height;
      break;
    case 'up':
      rotate(3*PI/2);
      x4 = -y3-img.height;
      y4 = x3;
      break;
    case 'right':
      x4 = x3;
      y4 = y3;
      break;
    default:
      console.log('Image rotation has reached an impossible state.');
    }
    
    // Adjust to a pixel perfect camera
    x5 = x4 - (x4 % pixelSize);
    y5 = y4 - (y4 % pixelSize);
    
    let startTime = new Date();
    drawImageForRealThisTime(img, x5, y5);
    let endTime = new Date();
    imageTime += endTime - startTime;

    pop();
  }
}

// For debug purposes, so I know that drawImage isn't taking any time
function drawImageForRealThisTime(img, x5, y5){
  image(img, x5, y5);
}

function keyPressed(){
  userStartAudio();
}
