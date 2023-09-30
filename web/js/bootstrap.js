class Game {
    app;

    fowGradient;
    fowBorders;

    constructor() {
    }

    initApplication() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true,
            autoResize: true,
            resolution: (window.devicePixelRatio || 1),
        });
        this.app.renderer.backgroundColor = 0;

        document.body.appendChild(this.app.view);

        this.app.renderer.view.style.position = 'absolute';
        this.app.renderer.view.style.display = 'block';

        //this.app.stage.sortableChildren = true; // for zIndex
    }

    buildFogOfWar(pos, parent) {
        const half = 256; // half of texture size
        this.fowGradient = PIXI.Sprite.from('assets/gradient.png');
        this.fowGradient.anchor.set(0.5);
        this.fowGradient.x = pos.x;
        this.fowGradient.y = pos.y;
        this.app.stage.addChild(this.fowGradient);

        this.fowBorders = new PIXI.Graphics();
        this.fowBorders.beginFill(0);
        this.fowBorders.drawRect(0, 0, this.fowGradient.x - half, window.innerHeight);
        this.fowBorders.drawRect(this.fowGradient.x + half, 0, window.innerWidth, window.innerHeight);
        this.fowBorders.drawRect(0, 0, window.innerWidth, this.fowGradient.y - half);
        this.fowBorders.drawRect(0, this.fowGradient.y + half, window.innerWidth, window.innerHeight);

        parent.addChild(this.fowBorders);
    }

    toggleFogOfWar() {
        const show = !this.fowGradient.visible;
        this.fowGradient.visible = show;
        this.fowBorders.visible = show;
        return show;
    }
}

const game = new Game();
game.initApplication();

let containerMap = new PIXI.Container();
containerMap.sortableChildren = true; // for zIndex
game.app.stage.addChild(containerMap);

let player;
let playerPosFunc = function () {
    return player ? player.logicPos : new Pos(0, 0);
};

let map = new Map(containerMap, playerPosFunc);
map.build(containerMap);

const playerViewDistance = 6;
player = new Player(
    new Pos(map.map.start.x, map.map.start.y),
    map,
    containerMap,
    playerViewDistance,
);

containerMap.x = (window.innerWidth / 2) - player.image.x;
containerMap.y = (window.innerHeight / 2) - player.image.y;

game.buildFogOfWar(
    new Pos(
        map.idx2X(map.map.start.x) + containerMap.x,
        map.idx2Y(map.map.start.y) + containerMap.y,
    ),
    game.app.stage
);

const scoreText = new PIXI.Text('Score0', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xff1010,
    align: 'center',
});
scoreText.zIndex = 2;
game.app.stage.addChild(scoreText);
player.setScoreText();


let playerDidStep = false;

document.addEventListener('keydown', (key) => {
    let did = false;

    switch (key.code) {
        case "ArrowLeft":
            did = player.moveByCell(-1, 0);
            break;
        case "ArrowRight":
            did = player.moveByCell(1, 0);
            break;
        case "ArrowUp":
            did = player.moveByCell(0, -1);
            break;
        case "ArrowDown":
            did = player.moveByCell(0, 1);
            break;
        case "KeyF":
            const mode = game.toggleFogOfWar();
            console.log(`fog of war is ${mode ? 'on' : 'off'}`);
            break;
        case "KeyG":
            map.showThingsAlways = !map.showThingsAlways;
            console.log(`show things is ${map.showThingsAlways ? 'on' : 'off'}`);
            break;
        default:
            console.log(key.code);
    }

    if (did) {
        playerDidStep = true;
    }
});

game.app.ticker.add(() => {
    const delta = game.app.ticker.elapsedMS / 1000;
    player.update(delta);
    //things.update(delta, playerDidStep);
    map.update(delta, playerDidStep);

    playerDidStep = false;
});
