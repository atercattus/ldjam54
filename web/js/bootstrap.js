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

// map textures
let texture = PIXI.Texture.from('assets/tiles.png');
let topSprite = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 0, 64, 32));
let wallSprite = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 64, 64, 32));
let groundSprite = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(64 * 2, 0, 64, 32));

// gold textures
let goldTex = PIXI.Texture.from('assets/gold.png');
let gold1Sprite = new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(0, 0, 64, 64));
let gold2Sprite = new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(64, 0, 64, 64));
let gold3Sprite = new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(64, 64, 64, 64));

let containerMap = new PIXI.Container();
containerMap.sortableChildren = true; // for zIndex
game.app.stage.addChild(containerMap);

let player;
let playerPosFunc = function () {
    return player ? player.getCellCoords() : new Pos(0, 0);
};

let map = new Map(topSprite, wallSprite, groundSprite, [gold1Sprite, gold2Sprite, gold3Sprite], containerMap, playerPosFunc);
map.build(containerMap);

containerMap.x = (window.innerWidth - containerMap.width) / 2;
containerMap.y = (window.innerHeight - containerMap.height) / 2;

const playerViewDistance = 6;
player = new Player(
    new Pos(map.map.start.x, map.map.start.y),
    map,
    containerMap,
    playerViewDistance,
);

game.buildFogOfWar(
    new Pos(
        map.idx2X(map.map.start.x) + containerMap.x,
        map.idx2Y(map.map.start.y) + containerMap.y,
    ),
    game.app.stage
);

let playerDidStep = false;

document.addEventListener('keydown', (key) => {
    let did = false;

    switch (key.code) {
        case "ArrowLeft":
            did = player.moveBy(-1, 0);
            break;
        case "ArrowRight":
            did = player.moveBy(1, 0);
            break;
        case "ArrowUp":
            did = player.moveBy(0, -1);
            break;
        case "ArrowDown":
            did = player.moveBy(0, 1);
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
