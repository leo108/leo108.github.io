window.requestAnimationFrame(function () {
  var maxValue = 4;
  var game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  game.move = function (direction) {
    var self = this;
    if (this.over || this.won) return;
    var cell, tile;
    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;
    this.prepareTiles();
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);
        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next      = self.grid.cellContent(positions.next);
          if (next && !next.mergedFrom && next.value === tile.value) {
            var merged = new Tile(positions.next, tile.value + next.value);
            merged.mergedFrom = [tile, next];
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);
            tile.updatePosition(positions.next);
            self.score += merged.value;
            if (merged.value > maxValue) {
              maxValue = merged.value;
            }
            if (merged.value === 4096) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }
          if (!self.positionsEqual(cell, tile)) {
            moved = true; 
          }
        }
      });
    });
    if (moved) {
      this.addRandomTile();
      if (!this.movesAvailable()) {
        this.over = true; 
      }
      this.actuate();
    }
  };
  game.inputManager.events["move"] = [];
  game.inputManager.on("move", game.move.bind(game));
  game.actuator.addTile = function (tile) {
    var self = this;
    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    positionClass = this.positionClass(position);
    var classes = ["tile", "tile-" + tile.value, positionClass];
    this.applyClasses(wrapper, classes);
    inner.classList.add("tile-inner");
    switch (tile.value) {
    case 2:
      inner.textContent = "斗者";
      break;
    case 4:
      inner.textContent = "斗师";
      break;
    case 8:
      inner.textContent = "大斗师";
      break;
    case 16:
      inner.textContent = "斗灵";
      break;
    case 32:
      inner.textContent = "斗王";
      break;
    case 64:
      inner.textContent = "斗皇";
      break;
    case 128:
      inner.textContent = "斗宗";
      break;
    case 256:
      inner.textContent = "斗尊";
      break;
    case 512:
      inner.textContent = "半圣";
      break;
    case 1024:
      inner.textContent = "斗圣";
      break;
    case 2048:
      inner.textContent = "斗帝";
      break;
    case 4096:
      inner.textContent = "逗你玩";
      break;
    }
    if (tile.previousPosition) {
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes);
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }
    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
    };
    game.actuator.message = function (won) {
      var type    = won ? "game-won" : "game-over";
      var message = "你挂鸟";
      if(maxValue == 4096){
        message = "你真够无聊的，嗯";
      }
      this.messageContainer.classList.add(type);
      this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    game.restart = function () {
      maxValue = 4;
      this.actuator.restart();
      this.setup();
    };
    game.restart();
});

