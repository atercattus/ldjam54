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

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        document.body.appendChild(this.app.view);

        this.app.renderer.view.style.position = 'absolute';
        this.app.renderer.view.style.display = 'block';

        //this.app.stage.sortableChildren = true; // for zIndex
    }

    buildFogOfWar(pos, parent) {
        const half = 256 * SCALE; // half of texture size
        this.fowGradient = PIXI.Sprite.from('assets/gradient.png');
        this.fowGradient.anchor.set(0.5);
        this.fowGradient.x = pos.x;
        this.fowGradient.y = pos.y;
        this.fowGradient.scale.set(SCALE);
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

    buildMuteButton(parent) {
        const tex = PIXI.Texture.from('assets/ui.png');

        const btn = new PIXI.AnimatedSprite([
            new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(48, 32, 32, 32)),
            new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(48 + 32, 32, 32, 32)),
        ]);
        btn.scale.set(SCALE);
        btn.anchor.set(1, 0);
        btn.x = window.innerWidth - 10;
        btn.y = 10;

        btn.interactive = true;
        btn.cursor = 'pointer';
        btn.on('click', () => {
            const muted = PIXI.sound.toggleMuteAll();
            btn.gotoAndStop(muted ? 1 : 0);
        });

        parent.addChild(btn);
    }
}

const game = new Game();
game.initApplication();

const SCALE = 2;

let menuTheme;
let soundInGameTheme;

let containerMap = new PIXI.Container();
containerMap.sortableChildren = true; // for zIndex
containerMap.scale.set(SCALE);
game.app.stage.addChild(containerMap);

let player;
let playerPosFunc = function () {
    return player ? player.logicPos : new Pos(0, 0);
};

let map = new Map(containerMap, playerPosFunc);
map.build(containerMap);

const chestText = new PIXI.Text('LOL KEK [cheburek]', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xff1010,
    align: 'center',
});
chestText.zIndex = 2;
chestText.x = window.innerWidth / 2;
chestText.y = window.innerHeight * 0.99;
chestText.anchor.set(0.5, 1);
chestText.visible = true;

const playerViewDistance = 6;
player = new Player(
    new Pos(map.mapInfo.start.x, map.mapInfo.start.y),
    map,
    containerMap,
    playerViewDistance,
);

containerMap.x = (window.innerWidth / 2) - player.image.x * SCALE;
containerMap.y = (window.innerHeight / 2) - player.image.y * SCALE;

game.buildFogOfWar(
    new Pos(
        map.idx2X(map.mapInfo.start.x) * SCALE + containerMap.x,
        map.idx2Y(map.mapInfo.start.y) * SCALE + containerMap.y,
    ),
    game.app.stage
);

const scoreText = new PIXI.Text('Score0', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xff1010,
    align: 'left',
});
scoreText.zIndex = 2;
game.app.stage.addChild(scoreText);
player.setScoreText();

game.app.stage.addChild(chestText);

game.buildMuteButton(game.app.stage);

let playerDidStep = false;

menuTheme = PIXI.sound.Sound.from({url: 'assets/menuTheme.mp3', preload: true,});
menuTheme.volume = 0.5;
menuTheme.loop = true;

soundInGameTheme = PIXI.sound.Sound.from({url: 'assets/gameTheme.mp3', preload: true,});
soundInGameTheme.volume = 0.5;
soundInGameTheme.loop = true;
setTimeout(() => {
    soundInGameTheme.play();
}, 500);

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
        case "Space":
            player.minigameSpaceAction();

            if (player.isInChestCell()) {
                player.isMoveDisabled = true;
                chestText.text = `You collected ${player.goldChest} gold out of ${map.goldTotal}. Press [F5] to try again :)`;
            }
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
    map.update(delta, playerDidStep);

    playerDidStep = false;
});
