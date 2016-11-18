var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('connect', connectState);
game.state.add('play', playState);
game.state.add('end', endState);

game.state.start('load');
