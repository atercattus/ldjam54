class Game {
    app;

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
        let gradient = PIXI.Sprite.from('assets/gradient.png');
        gradient.anchor.set(0.5);
        gradient.x = pos.x;
        gradient.y = pos.y;
        this.app.stage.addChild(gradient);

        let gradBorders = new PIXI.Graphics();
        gradBorders.beginFill(0);
        gradBorders.drawRect(0, 0, gradient.x - half, window.innerHeight);
        gradBorders.drawRect(gradient.x + half, 0, window.innerWidth, window.innerHeight);
        gradBorders.drawRect(0, 0, window.innerWidth, gradient.y - half);
        gradBorders.drawRect(0, gradient.y + half, window.innerWidth, window.innerHeight);

        parent.addChild(gradBorders);
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
game.app.stage.addChild(containerMap);

let map = new Map(topSprite, wallSprite, groundSprite, [gold1Sprite, gold2Sprite, gold3Sprite]);
map.build(containerMap);

containerMap.x = (window.innerWidth - containerMap.width) / 2;
containerMap.y = (window.innerHeight - containerMap.height) / 2;

let player = new Player(new Pos(map.map.start.x, map.map.start.y), map, containerMap);

//let thing = new Thing(new Pos(10, 30), map, cir2);
let thing = new Thing(new Pos(13, 6), map, containerMap);

game.buildFogOfWar(
    new Pos(
        map.idx2X(map.map.start.x) + containerMap.x,
        map.idx2Y(map.map.start.y) + containerMap.y,
    ),
    game.app.stage
);

document.addEventListener('keydown', (key) => {
    switch (key.code) {
        case "ArrowLeft":
            player.moveBy(-1, 0);
            break;
        case "ArrowRight":
            player.moveBy(1, 0);
            break;
        case "ArrowUp":
            player.moveBy(0, -1);
            break;
        case "ArrowDown":
            player.moveBy(0, 1);
            break;
    }
});

game.app.ticker.add(() => {
    const delta = game.app.ticker.elapsedMS / 1000;
    player.update(delta);
    map.update(delta);
});
