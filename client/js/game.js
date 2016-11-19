var game = new Phaser.Game(16*16, 16*16, Phaser.AUTO, 'gameDiv'); // 16px tiles, 32x32

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('connect', connectState);
game.state.add('play', playState);
game.state.add('end', endState);

game.state.start('load');
