const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.2;

let timer = 60;
let timerId;

function determineWinner({player, enemy, timerId}) {
  clearTimeout(timerId);
  document.querySelector("#displayText").style.display = "flex";
  if (player.health === enemy.health) {
    document.querySelector("#displayText").innerHTML = "Draw";
  } else if (player.health > enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player1 Win";
  } else if (player.health < enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player2 Win";
  }
}

function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector('#timer').innerHTML = timer;
  }
  if (timer === 0) {
    determineWinner({player, enemy, timerId});
  }
}
decreaseTimer();

/////////////////////////////////////////////////////////////////////////////////////////////////////

class Sprite {
  constructor({position, velocity, color, offset}) {
	  this.position = position;
	  this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position : {
        x : 0,
        y : 0,
      },
      offset,
      width : 100,
      height : 50,
    };
    this.color = color
    this.isAttacking = false;
    this.health = 100;
  }

  attack() {
    if (!this.isAttacking)
      this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }

  draw() {
	  c.fillStyle = this.color;
  	c.fillRect(this.position.x, this.position.y, this.width, this.height);

    // atack box
    c.fillStyle = "blue";
    c.fillRect(
      this.attackBox.position.x,
      this.attackBox.position.y,
      this.attackBox.width,
      this.attackBox.height
    );
  }

  update() {
	  this.draw();
    this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y - this.attackBox.offset.y;

    this.position.x += this.velocity.x;
	  this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      this.velocity.y = 0;
    } else this.velocity.y += gravity;
  }
}

const player = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color : "green",
  offset : {
    x : 0,
    y : 0,
  }
});

const enemy = new Sprite({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color : "red",
  offset : {
    x : 50,
    y : 0,
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("keydown", (event) => {
  // Player Key
  switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      break;
    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
    case "w":
      player.velocity.y = -7;
      break;
  }

  // Enemy Key
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastKey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = "ArrowLeft";
      break;
    case "ArrowUp":
      enemy.velocity.y = -7;
      break;
  }

  console.log(event.key);
});

window.addEventListener("keyup", (event) => {
  // Player Key
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      break;
    case " ":
      player.attack();
      break;
  }

   // Enemy Key
   switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
    case "ArrowUp":
      break;
    case "ArrowDown":
      enemy.isAttacking = true;
  }
  console.log(event.key);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////

const keys = {
  a : {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  }
};

function rectangularCollision({rectangle1, rectangle2}) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

function animate() {
    window.requestAnimationFrame(animate);

    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    // move
    player.velocity.x = 0;
    if (keys.a.pressed && player.lastKey === "a") {
      player.velocity.x = -1;
    } else if (keys.d.pressed && player.lastKey === "d") {
      player.velocity.x = 1;
    }

    enemy.velocity.x = 0;
    if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
      enemy.velocity.x = -1;
    } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
      enemy.velocity.x = 1;
    }

    // attack
    if (
      rectangularCollision({rectangle1 : player, rectangle2: enemy}) &&
      player.isAttacking
    ) {
      player.isAttacking = false;
      enemy.health -= 20;
      document.querySelector("#enemyHealth").style.width = enemy.health + "%";
      console.log("player attack");
    }

    if (
      rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
      enemy.isAttacking
    ) {
      enemy.isAttacking = false;
      player.health -= 20;
      document.querySelector("#playerHealth").style.width = player.health + "%";
      console.log("enemy attack");
    }    

    // game end
    if (enemy.health <= 0 || player.health <= 0) {
      determineWinner({ player, enemy, timerId });
    }
}

animate();