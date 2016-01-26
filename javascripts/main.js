function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1; //sets scaleBy to 1 if it is 0 or null ("falsey")
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
    //if (this.isDone()) this.elapsedTime = 0;
};

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};



function Camera(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = 1920;
    this.maxY = 1080;
}

Camera.SPEED = 256;

Camera.prototype.move = function(delta, dirx, diry) {
    this.x += dirx * Camera.SPEED;
    this.y += diry * Camera.SPEED;

    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.x, this.maxY));
};

Camera.prototype.update = function() {
    var dirx = 0;
    var diry = 0;
    if (Key.isDown(Key.LEFT)) dirx = -1;
    if (Key.isDown(Key.RIGHT)) dirx = 1;
    if (Key.isDown(Key.UP)) diry = -1;
    if (Key.isDown(Key.DOWN)) diry = 1;

    this.move(dirx, diry);
}

Camera.prototype.draw = function(ctx) {
    var tsize = 600;
    var startCol = Math.floor(this.x / tsize);
    var endCol = startCol + (this.width / tsize);
    var startRow = Math.floor(this.y / tsize);
    var endRow = startRow + (this.height / tsize);
    var offsetX = -this.x + startCol * tsize;
    var offsetY = -this.y + startRow * tsize;

    for (var c = startCol; c <= endCol; c++) {
        for (var r = startRow; r <= endRow; r++) {
            var tile = new Animation("./img/test.png", startCol, startRow, 300, 300, 1, 1, false, false);
            var x = (c - startCol) * tsize + offsetX;
            var y = (c - startRow) * tsize + offsetY;
            if (tile !== 0) {
                this.ctx.drawImage(
                    "./img/test.png",
                    (tile - 1) * tsize,
                    0,
                    tsize,
                    tsize,
                    Math.round(x),
                    Math.round(y),
                    300,
                    300

                )
            }
        }
    }
}

function Background(game) {
    //first param tells the entity to attach this call to the background object
    Entity.call(this, game, 0, 400);
    this.radius = 200;
    this.bg = ASSET_MANAGER.getAsset("./img/test.png")
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
};

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "#173A15";
    ctx.drawImage(this.bg, 0, 0);
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
};


//swiped off stack overflow
var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    }
};

window.addEventListener('keyup', function(event) { Key.onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeyDown(event); }, false);

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/snake.png");
ASSET_MANAGER.queueDownload("./img/snake_rev.png");
ASSET_MANAGER.queueDownload("./img/bg.png");

ASSET_MANAGER.queueDownload("./img/test.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var cam = new Camera();
    //var unicorn = new Unicorn(gameEngine);
    //var snake = new Snake(gameEngine);
    //gameEngine.addEntity(bg);
    gameEngine.addEntity(cam);
    //gameEngine.addEntity(unicorn);
    //gameEngine.addEntity(snake);

    gameEngine.init(ctx);
    gameEngine.start();
});
