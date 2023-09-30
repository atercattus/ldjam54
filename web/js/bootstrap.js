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
        this.app.renderer.backgroundColor = 0;//0x84CCFF;

        document.body.appendChild(this.app.view);

        this.app.renderer.view.style.position = 'absolute';
        this.app.renderer.view.style.display = 'block';

        this.app.stage.sortableChildren = true; // для работы zIndex
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

let cir = new PIXI.Graphics();
cir.beginFill(0xffffff);
cir.drawCircle(0, 0, 12);
containerMap.addChild(cir);
let player = new Player(new Pos(map.map.start.x, map.map.start.y), map, cir);


let cir2 = new PIXI.Graphics();
cir2.beginFill(0xff0033);
cir2.drawCircle(0, 0, 12);
containerMap.addChild(cir2);
let thing = new Thing(new Pos(5, 15), map, cir2);

// gradient filler
let gradient = PIXI.Sprite.from('assets/gradient.png');
gradient.anchor.set(0.5);
//gradient.scale.x = 0.7;
//gradient.scale.y = 0.7;
gradient.x = cir.x + containerMap.x; //window.innerWidth / 2;
gradient.y = cir.y + containerMap.y; //window.innerHeight / 2;
game.app.stage.addChild(gradient);

let gradBorders = new PIXI.Graphics();
gradBorders.beginFill(0);
gradBorders.drawRect(0, 0, gradient.x - 256, window.innerHeight);
gradBorders.drawRect(gradient.x + 256, 0, window.innerWidth, window.innerHeight);
gradBorders.drawRect(0, 0, window.innerWidth, gradient.y - 256);
gradBorders.drawRect(0, gradient.y + 256, window.innerWidth, window.innerHeight);

game.app.stage.addChild(gradBorders);


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
