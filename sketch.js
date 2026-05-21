 // ============================================================
// Week 2 Example 1: Movement, Gravity, and Collision
// ============================================================

// ------------------------------------------------------------
// THE PLAYER OBJECT
// An object groups related data together in one place.
// Instead of separate variables (playerX, playerY, playerVX...),
// we store everything about the player in one object.
// ------------------------------------------------------------
let kirbybackground;
let kirby;

let platform1 = [
  {x: 600, y: 300, w: 100, h: 20},
  {x: 400, y: 200, w: 150, h: 20},
  {x: 250, y: 100, w: 100, h: 20}
]

let platform2 = [
  {x: 300, y: 300, w: 175, h: 20},
  {x: 650, y: 200, w: 100, h: 20},
]

let player = {
  x: 200, // horizontal position (centre of blob)
  y: 100, // vertical position (centre of blob)

  vx: 0, // horizontal velocity — how fast we're moving left/right
  vy: 0, // vertical velocity — how fast we're moving up/down

  r: 24, // radius of the blob shape

  // Movement tuning — change these to adjust how the game feels
  speed: 0.5,     // horizontal acceleration per frame
  maxSpeed: 4,    // maximum horizontal speed
  jumpForce: -12, // upward velocity applied when jumping (negative = upward)
  friction: 0.8,  // horizontal slowdown when no key is pressed (0–1, lower = more friction)

  onGround: false, // tracks whether the player is standing on something
};

// ------------------------------------------------------------
// PHYSICS CONSTANTS
// Defined outside the player object so they can be shared
// across multiple objects later (e.g. enemies)
// ------------------------------------------------------------
const GRAVITY = 0.6; // downward force added to vy every frame

// ------------------------------------------------------------
// NOISE BLOB ANIMATION
// We use p5's noise() function to make the blob edges wobble
// organically. blobT increases each frame to animate the wobble.
// ------------------------------------------------------------
let blobT = 0; // time input for noise — increases each frame

// Floor position — where the ground is
let floorY;

// ============================================================
// setup()
// Runs once at the very start of the sketch.
// Sets up the canvas and positions the player on the floor.
// ============================================================
function preload() {
  kirbybackground = loadImage("assets/images/kirbybackground.png");
  kirby = loadImage("assets/images/kirby.png");
}

function setup() {
  createCanvas(800, 450);
  floorY = height - 40;         // ground sits 40px from the bottom
  player.y = floorY - player.r; // start the player sitting on the floor
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// Each frame we clear the background, handle input,
// apply physics, and draw everything.
// ============================================================
function draw() {
  background(kirbybackground);


  drawFloor();
  drawPlatforms();
  handleInput();
  applyPhysics();
  drawPlayer();
  drawHUD();

  blobT += 0.015; // advance blob wobble animation each frame
}

// ------------------------------------------------------------
// handleInput()
// Checks which keys are held down this frame and updates
// the player's velocity accordingly.
// keyIsDown() returns true as long as the key is held —
// unlike keyPressed(), which only fires once per press.
// We check both arrow keys and WASD so either works.
// ------------------------------------------------------------
function handleInput() {
  // --- Horizontal movement ---
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // LEFT or A
    player.vx -= player.speed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // RIGHT or D
    player.vx += player.speed;
  }

  // --- Clamp horizontal speed ---
  // constrain(value, min, max) keeps a value within a range.
  // Without this, holding a key forever would accelerate infinitely.
  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  // --- Apply friction when no horizontal key is pressed ---
  // Multiplying by a value less than 1 gradually slows the player down.
  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  // --- Jump ---
  // The player can only jump when standing on the ground (onGround = true).
  // This prevents jumping again mid-air.
  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) { // UP or W
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

// ------------------------------------------------------------
// applyPhysics()
// Each frame we:
//   1. Add gravity to vertical velocity (vy)
//   2. Move the player by its velocity (vx, vy)
//   3. Check if it has landed on the floor
// ------------------------------------------------------------
function applyPhysics() {

// reset onGround
  player.onGround = false;



  // 1. Apply gravity — pulls the player down every frame
  player.vy += GRAVITY;

  // 2. Move player by its current velocity
  player.x += player.vx;
  player.y += player.vy;
  

  // platform 1 collision

  for (let p of platform1) {
    if (player.vy >0) {

      let playerBottom = player.y + player.r;

      if (playerBottom >= p.y &&
        playerBottom <= p.y + p.h &&
        player.x >= p.x &&
        player.x <= p.x + p.w
      ) {
          player.y = p.y - player.r; // snap to platform
          player.vy = 0;              // stop falling
          player.onGround = true;     // allow jumping again
        }

      }
    }

//platform 2 collision

  for (let p of platform2) {

    let playerBottom = player.y + player.r;

    if (
      playerBottom >= p.y &&
      playerBottom <= p.y + p.h &&
      player.x >= p.x &&
      player.x <= p.x + p.w
    ) {
        resetPlayer();
    }
  }
  

  // 3. Floor collision
  // If the bottom of the blob goes below the floor, push it back up.
  if (player.y + player.r >= floorY) {
    player.y = floorY - player.r; // snap to floor
    player.vy = 0;                // stop falling
    player.onGround = true;       // allow jumping again
  }
  // 4. Wall collision — keep player inside canvas
  player.x = constrain(player.x, player.r, width - player.r);
}


//function reset player
function resetPlayer() {
  player.x = 200;
  player.y = floorY - player.r;
  player.vx = 0;
  player.vy = 0;
}


function drawPlatforms () {
  fill(200, 100, 50);
  noStroke();
  for (let p of platform1) {
    rect(p.x, p.y, p.w, p.h);
  }

  fill(200, 50, 50);
  noStroke();
  for (let p of platform2) {
    rect(p.x, p.y, p.w, p.h);
  } 
}

function drawPlayer() {
  push(); // save current drawing settings

  imageMode(CENTER);
  image(kirby, player.x, player.y, player.r*2, player.r*2);

  pop(); // restore drawing settings
}

// ------------------------------------------------------------
// drawFloor()
// A simple rectangle across the bottom of the canvas.
// ------------------------------------------------------------
function drawFloor() {
  fill(40, 120, 110); // dark teal
  noStroke();
  rect(0, floorY, width, height - floorY);
}

// ------------------------------------------------------------
// drawHUD()
// HUD = Heads Up Display.
// Shows controls on screen so the player always knows
// how to interact without needing external instructions.
// ------------------------------------------------------------
function drawHUD() {
  fill(180);
  noStroke();
  textSize(13);
  textAlign(LEFT);
  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24); }