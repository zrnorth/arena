// Loads assets

var loadState = {
  preload: function() {
    var loadingLabel = game.add.text(80, 150, 'Loading...', {
      font: '10px Courier',
      fill: '#ffffff'
    });
    // Load game assets
    game.load.tilemap('init', 'assets/tilemaps/init.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('gameTiles', 'assets/images/dungeon_sheet.png');
    game.load.spritesheet('knight', 'assets/images/knightanim.png', 16, 16, 18, 8, 16); 
    game.load.spritesheet('pickups', 'assets/images/pickups.png', 16, 16);

    // todo remove below
    game.load.image('player', 'assets/images/player.png');
    game.load.image('win', 'assets/images/win.png');
  },
  create: function() {
    this.scale.pageAlignHorizontally = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('menu');
  }
};
