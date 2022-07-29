let scene, transition;
let skipIntro = true;

let attackImage, diagonalAttackImage, stillAttackImage, attackDissapateImage, diagonalDissapateImage, shieldAttackImage, shieldDiagonalImage;
let floorImages;
let playerRunning, playerIdle, playerDiagonal;
let guardIdle, guardAttack, botImage;
let clocksmithImage, clocksmithSwitch, clocksmithReverseSwitch;
let allImages;

let bossImages = {}
let playerImages = {}
let clocksmithImages = {}

let lagMultiplier = 1;
let time;
let isFirstFrame = true;
let globalTimescale = 0.9/lagMultiplier;
let steps = 3;
let collisionSteps = 5;

let pixelSize = 5;

let difficulty = 2;

let songs;
let currentSong;
let songVolume = 0.0; // 0.8

let whoosh;

var gamepadAPI = {
  controller: {},
  connected: false,
  connect: function(evt) {
    gamepadAPI.controller = evt.gamepad;
    gamepadAPI.connected = true;
    userStartAudio();
  },
  disconnect: function(evt) {
    gamepadAPI.connected = false;
    delete gamepadAPI.controller;
  },
  update: function() {
    // clear the buttons cache
    gamepadAPI.buttonsCache = [];
    // move the buttons status from the previous frame to the cache
    for(var k=0; k<gamepadAPI.buttonsStatus.length; k++) {
      gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    }
    // clear the buttons status
    gamepadAPI.buttonsStatus = [];
    // get the gamepad object
    var c = gamepadAPI.controller || {};
    c = navigator.getGamepads()[c.index];
  
    // loop through buttons and push the pressed ones to the array
    var pressed = [];
    if(c.buttons) {
      for(var b=0,t=c.buttons.length; b<t; b++) {
        if(c.buttons[b].pressed) {
          pressed.push(gamepadAPI.buttons[b]);
        }
      }
    }
    // loop through axes and push their values to the array
    var axes = [];
    if(c.axes) {
      for(var a=0,x=c.axes.length; a<x; a++) {
        axes.push(c.axes[a].toFixed(2));
      }
    }
    // assign received values
    gamepadAPI.axesStatus = axes;
    gamepadAPI.buttonsStatus = pressed;
    gamepadAPI.controller = c;
    // return buttons for debugging purposes
    return pressed;
  },
  buttonPressed: function(button, hold) {
    var newPress = false;
    // loop through pressed buttons
    for(var i=0,s=gamepadAPI.buttonsStatus.length; i<s; i++) {
      // if we found the button we're looking for...
      if(gamepadAPI.buttonsStatus[i] == button) {
        // set the boolean variable to true
        newPress = true;
        // if we want to check the single press
        if(!hold) {
          // loop through the cached states from the previous frame
          for(var j=0,p=gamepadAPI.buttonsCache.length; j<p; j++) {
            // if the button was already pressed, ignore new press
            if(gamepadAPI.buttonsCache[j] == button) {
              newPress = false;
            }
          }
        }
      }
    }
    return newPress;
  },
  buttons: [
    'A', 'B', 'X', 'Y',
    'LB', 'RB', 'LT', 'RT',
    'Start', 'Options', 
    'L3', 'R3',
    'Dpad_Up', 'Dpad_Down', 'Dpad_Left', 'Dpad_Right'
  ],
  buttonsCache: [],
  buttonsStatus: [],
  axesStatus: []
};

window.addEventListener("gamepadconnected", gamepadAPI.connect);
window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);

let layerMap = [
  {a: 'player',  b: 'enemyAttack'},
  {a: 'player',  b: 'wall'},
  {a: 'player',  b: 'blueBullet'},
  {a: 'boss',    b: 'playerAttack'},
  {a: 'boss',    b: 'wall'},
  {a: 'boss',    b: 'player'},
  {a: 'ghost',   b: 'wall'},
  {a: 'ghost',   b: 'blueBullet'}
]

function isBetween(num, a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return num > min && num < max;
};

function isBetweenInclusive(num, a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return num >= min && num <= max;
}

function includesKeyword(array, keyword){
  for(i in array){
    if(keyword.test(array[i])) {return true; }
  }
  return false;
}

function isNumber(num){
  return (num > 0 || num <= 0) && typeof num == 'number';
}

function isRealNumber(num){
  return typeof num == 'number' && (num < 0 || num >= 0) && (num != Infinity || num != -Infinity);
}

const varToString = varObj => Object.keys(varObj)[0];

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

  attackImage = [
    loadImage("images/attackImages/newAttack.png")
  ]
  diagonalAttackImage = [
    loadImage("images/attackImages/newDiagonal.png")
  ]
  stillAttackImage = [
    loadImage("images/attackImages/stillAttack.png")
  ]
  attackDissapateImage = [
    loadImage("images/attackImages/attackDissapate(0).png"),
    loadImage("images/attackImages/attackDissapate(1).png")
  ]
  shieldAttackImage = [
    loadImage("images/attackImages/shieldAttack.png")
  ]
  shieldDiagonalImage = [
    loadImage("images/attackImages/shieldDiagonal.png")
  ]

  guardIdle = [
    loadImage("images/bossImages/guardIdle(0).png")
  ]
  guardAttack = [
    loadImage("images/bossImages/guardAttack(0).png")
  ]

  clocksmithImage = [
    loadImage("images/bossImages/clocksmith(0).png")
  ]
  clocksmithSwitch = [
    loadImage("images/bossImages/clocksmithSwitch(0).png"),
    loadImage("images/bossImages/clocksmithSwitch(1).png")
  ]
  clocksmithReverseSwitch = [
    loadImage("images/bossImages/clocksmithSwitch(1).png"),
    loadImage("images/bossImages/clocksmithSwitch(0).png")
  ]
  botImage = [
    loadImage("images/bossImages/bot(0).png")
  ]

  songs = [
    { name: 'guard',      song: loadSound("sounds/onTheTrain.wav") },
    { name: 'soldier',    song: loadSound("sounds/factoryTheme.wav") },
    { name: 'clocksmith', song: loadSound("sounds/bellsAndWhistles.wav") }
  ]

  whoosh = loadSound("sounds/whoosh.wav");
  whoosh.setVolume(0.6);
}

function setup(){
  time = new Time();
  createCanvas(windowWidth, windowHeight - 4);

  allImages = [
    playerRunning, playerIdle, playerDiagonal, 
    floorImage, 
    attackImage, diagonalAttackImage, stillAttackImage, attackDissapateImage, shieldAttackImage, shieldDiagonalImage,
    guardIdle, guardAttack, 
    clocksmithImage, clocksmithSwitch, clocksmithReverseSwitch,
    botImage
  ];
  for(let i in allImages){
    for(let j in allImages[i]){
      allImages[i][j] = new Canvas(allImages[i][j]);
    }
  }

  attackImages = {
    normal: attackImage,
    diagonal: diagonalAttackImage,
    still: stillAttackImage,
    dissapate: attackDissapateImage,
    shield: shieldAttackImage,
    shieldDiagonal: shieldDiagonalImage
  }

  playerImages = {
    idle: playerIdle,
    running: playerRunning,
    diagonal: playerDiagonal
  }

  bossImages = {
    guardIdle: guardIdle,
    guardAttack: guardAttack,
    bot: botImage
  }

  clocksmithImages = {
    
    normal: clocksmithImage,
    switch: clocksmithSwitch,
    reverseSwitch: clocksmithReverseSwitch
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
  for(let i of songs){
    if(i.name == scene.bossManager.nameOfBoss){
      currentSong = i.song;
    }
  }

  if(!currentSong.isPlaying()){
    if(oldSong) oldSong.stop();
    currentSong.loop();
    currentSong.setVolume(songVolume);
  }
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

  if(gamepadAPI.connected){
    gamepadAPI.update();
  }

  for(lagCount = 0; lagCount < lagMultiplier; lagCount++){

    let startTime = new Date();
    imageCount = 0;
    let imageTime;
    let updateTime;
  
    background(0);
  
    if(isFirstFrame){
      start();
      isFirstFrame = false;
    }
    
    if(scene){
      updateTime = scene.update();
      imageTime = scene.updateImage();
      scene.updateExtras();
      scene.checkForGameOver();
    }
    else{
      for(let stepNum = 0; stepNum < steps; stepNum++) 
        time.update();
      if(transition) transition.update();
    }
  
    let endTime = new Date();
    if(endTime - startTime > 100) console.log(updateTime, imageTime);
  }
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

    // After this we get some weird rotation stuff
    if(scene.mainCamera.isOffScreen(img, x2, y2)) {
      pop();
      return;
    }

    // Adjust for image rotation
    let x4, y4;
    switch(rotation){
    case 'down':
      rotate(PI/2);
      x4 = y2;
      y4 = -x2-img.width;
      break;
    case 'left':
      rotate(PI);
      x4 = -x2-img.width;
      y4 = -y2-img.height;
      break;
    case 'up':
      rotate(3*PI/2);
      x4 = -y2-img.height;
      y4 = x2;
      break;
    case 'right':
      x4 = x2;
      y4 = y2;
      break;
    default:
      console.log('Image rotation has reached an impossible state.');
    }
    
    // Adjust to a pixel perfect camera
    x5 = x4 - (x4 % pixelSize);
    y5 = y4 - (y4 % pixelSize);
    
    let startTime = new Date();
    image(img, x5, y5);
    let endTime = new Date();

    pop();
  }
}

function keyPressed(){
  userStartAudio();
}
