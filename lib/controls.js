// Since its a keyboard game there is a set velocity in any given direction.
var GAME_VELOCITY = 175;
var FACINGS = {
  'left': 1,
  'right': 2,
  'up': 3,
  'down': 4,
}

// this takes in a playerState object and a list of pressed buttons, and outputs a new playerState object.
// Note that it's impossible to change the player's position with a button press, only the facing and velocity.
var handle = function(buttonsPressed, playerState) {
  // Reset player state to what it would be with no buttons pressed.
  playerState.velocity.x = playerState.velocity.y = 0;

  buttonsPressed.forEach(function(buttonCode) {
    var button = String.fromCharCode(buttonCode);
    console.log("Button pressed: " + button);

    // Left
    if (button === 'A') {
      playerState.velocity.x -= GAME_VELOCITY;
    }
    // Right
    if (button === 'D') {
      playerState.velocity.x += GAME_VELOCITY;
    }
    // Up
    if (button === 'W') {
      playerState.velocity.y -= GAME_VELOCITY;
    }
    // Down
    if (button === 'S') {
      playerState.velocity.y += GAME_VELOCITY;
    }
  });

  // Check new facing based on velocity.
  // L/R (x-axis) have precedence!
  if (playerState.velocity.x < 0) {
    playerState.facing = FACINGS['left'];
  }
  else if (playerState.velocity.x > 0) {
    playerState.facing = FACINGS['right'];
  }
  else if (playerState.velocity.y < 0) {
    playerState.facing = FACINGS['up'];
  }
  else if (playerState.velocity.y > 0) {
    playerState.facing = FACINGS['down'];
  }
  // else don't change the facing. 
  
  console.log("Player state: " + JSON.stringify(playerState));
  return playerState;
};

module.exports = {
  GAME_VELOCITY: GAME_VELOCITY,
  FACINGS: FACINGS,
  handle: handle
}
