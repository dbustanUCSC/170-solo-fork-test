
title = "Space Odyssey";

description = ` Collect coins \n     and 
  dodge ships!`;

/**
 * @typedef {{
* pos: Vector,
* }} Player
*/

/**
* @type {Player}
*/
let player;
const G = {
 WIDTH: 100,
 HEIGHT: 150,
 PARTICLE_SPEED_MIN : 0.4,
 PARTICLE_SPEED_MAX: 0.9,
 ENGINE_PARTICLE_RANGE: 7,
 ENGINE_PARTICLE_SPEED_MIN: 1,
 ENGINE_PARTICLE_SPEED_MAX: 2,
 ENGINE_PARTICLE_SPEED_INCREASE: 0.08,
 ENEMY_MINIMUM_SPEED: 2,
 ENEMY_MAXIMUM_SPEED: 4,
 COIN_MINIMUM_SPEED: 1,
 COIN_MAXIMUM_SPEED: 2,
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 60
};

player = {
 pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
};


characters = [
  `
  ll
  rllc
  rlllllc
  ll
  `,
  `
   llp
  lllr
   llp
  `,
  `
  wYYW
  YyyY
  YyyY
  WYYW
  `
];

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} defaultparticles
 */

/**
 * @typedef {{
* angle: number,
* pos: Vector,
* length: number,
* }} tentacle
*/

/**
 * @typedef {{
* pos: Vector,
* speed: Number,
* }} enemy
*/

/**
 * @typedef {{
 * pos: Vector
 * speed: Number,
 * }} coin
 * 
 */

/**
 * @type {defaultparticles [] }
 * 
 */
let backgroundParticles, engineParticles;

// /**
//  * @type {enemy [] }
//  * 
//  */
// let enemies;

//we need something to control the speed of all of the particles
//perhaps a bool that will handle the states of the 
let lastTimeEnemySpawned;
let state1 = true;
let state2speed;
let lastTimeCoinSpawned;
let timeElapsedState2;
let timeElapsedState1;
let stateTwoInitializer;
let state1Initializer;
let timeInState1;
let timeInState2;

function resetGameState() {
  player.pos = vec(G.WIDTH * 0.5, G.HEIGHT * 0.5);
  coins = [];
  enemies = [];
  state1 = true;
  timeInState1 = 500;
  timeInState2 = 500;
  lastTimeCoinSpawned = 0;
  lastTimeEnemySpawned = 0;
  timeElapsedState1 = 0;
  state1Initializer = false;
  timeElapsedState2 = 0;
  stateTwoInitializer = false;
}


function initializeGame(){
  SetParticleProperties();
  resetGameState();
}

let coinDelayPeriod = 50;
let coins = [];

function coinCreation(){
  console.log(ticks);
  let currenttime = ticks;
  if (currenttime - lastTimeCoinSpawned > coinDelayPeriod){
    const newCoin = {
      pos: vec(G.WIDTH, rnd(0, G.HEIGHT)),
      speed: G.COIN_MINIMUM_SPEED, 
    }
    coins.push(newCoin);
    lastTimeCoinSpawned = currenttime;
  }
}

function coinSpawning(){
  for (let i = 0; i < coins.length; i++){
    coins[i].pos.x -= coins[i].speed;
    color("black");
    char("c", coins[i].pos);
  }
}


let enemyDelayPeriod = 20;
let enemies = [];
function EnemyCreation(){
  let currenttime = ticks;
  if (currenttime - lastTimeEnemySpawned > enemyDelayPeriod){
    lastTimeEnemySpawned = currenttime;

    const newEnemy = {
      pos: vec(G.WIDTH, rnd(0, G.HEIGHT)),
      speed: rnd(G.ENEMY_MINIMUM_SPEED, G.ENEMY_MAXIMUM_SPEED),
    }
    enemies.push(newEnemy);
  }
}

function EnemySpawning (){
  for (let i = 0; i < enemies.length; i++){
    enemies[i].pos.x -= enemies[i].speed;
    char("b", enemies[i].pos);
  }
}
function SetParticleProperties(){
  backgroundParticles = times(20, () =>{
    const posX = rnd(0, G.WIDTH);
    const posY = rnd(0, G.HEIGHT);
    return {
      pos: vec(posX, posY),
      speed: rnd(G.PARTICLE_SPEED_MIN, G.PARTICLE_SPEED_MAX),
    };
  });
}

function SetEngineParticleProperties(){
  engineParticles = times(10, () => {
    const offsetX = rnd (-G.ENGINE_PARTICLE_RANGE, G.ENGINE_PARTICLE_RANGE);
    const offsetY = rnd (-G.ENGINE_PARTICLE_RANGE, G.ENGINE_PARTICLE_RANGE);
    return {
      pos: vec(player.pos.x + offsetX, player.pos.y + offsetY),
      speed: rnd(G.ENGINE_PARTICLE_SPEED_MIN, G.ENGINE_PARTICLE_SPEED_MAX),
    }
  });
}

function CreateBackgroundParticles(extraSpeed) {
  backgroundParticles.forEach((s) =>{
    s.pos.x -= s.speed * extraSpeed;
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    color("light_yellow");
    box(s.pos, 1);
  });
}

//we can potentially change this function to hold 
function CreateEngineParticles() {
    engineParticles.forEach((e) => {
    e.speed += G.ENGINE_PARTICLE_SPEED_INCREASE;
    e.pos.x -= e.speed;
    color("red");
    box(e.pos, 1);
  });
}
let extraSpeed;



function update() {
  let currenttime = ticks;
  if (!ticks) {
    initializeGame();
  }
  if (state1){
    if (!state1Initializer){
      timeElapsedState1 = currenttime;
      state1Initializer = true;
    }
    //particles definition
    extraSpeed = 1;
    coinCreation();
    coinSpawning();
    CreateBackgroundParticles(extraSpeed);
    
    
    color("black");
    char("a", player.pos);
    handleCollision();
        player.pos.y += 0.5;
      
  
      if (input.isPressed){
        player.pos.y -= 1;
      } 
      color("red");

      if (currenttime - timeElapsedState1 > timeInState1){
        state1 = false;
        state1Initializer = false;
      }
      //box(player.pos, 4, 4);
  } else if (!state1) {
    if (!stateTwoInitializer){
      play("explosion");
      timeElapsedState2 = currenttime;
      SetEngineParticleProperties();
      stateTwoInitializer = true;
    }
    EnemyCreation();
    EnemySpawning();
    handleCollision()
    extraSpeed = 4;
    CreateBackgroundParticles(extraSpeed);
    CreateEngineParticles();
    color("black");
    char("a", player.pos);

    player.pos.y += 0.3;
      if (input.isPressed){
        player.pos.y -= 0.5;
      }
    if (currenttime - timeElapsedState2 > timeInState2){
      state1 = true;
      stateTwoInitializer = false;
    } 
      
      
  }

  
  
  //What should we start with first? perhaps putting the player in
  
}

function handleCollision(){
  const enemyinCollision = char("a", player.pos).isColliding.char.b;
  for (let i = 0; i < coins.length; i++) {
    if (player.pos.isInRect(coins[i].pos.x, coins[i].pos.y, 6, 6)) {
      play("coin");
      addScore(10);
      coins.splice(i, 1); // Remove the collected coin
    }
  }
  if (enemyinCollision){
    initializeGame();
    play("tone");
    end();
  }

  if(player.pos.y > G.HEIGHT || player.pos.y < 0){
    initializeGame();
    play("tone");
    end();
  }
  
}
