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

    showFogOfWar() {
        this.fowGradient.visible = true;
        this.fowBorders.visible = true;
    }

    hideFogOfWar() {
        this.fowGradient.visible = false;
        this.fowBorders.visible = false;
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

const chestBottomText = new PIXI.Text('LOL KEK [cheburek]', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xeeddaa,
    align: 'center',
});
chestBottomText.zIndex = 2;
chestBottomText.x = window.innerWidth / 2;
chestBottomText.y = window.innerHeight * 0.99;
chestBottomText.anchor.set(0.5, 1);
chestBottomText.visible = true;

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

let uiTex = PIXI.Texture.from('assets/ui.png');
let chestSprite = PIXI.Sprite.from(new PIXI.Texture(uiTex.baseTexture, new PIXI.Rectangle(0, 32 * 2, 48, 32)));
chestSprite.anchor.set(0, 0);
game.app.stage.addChild(chestSprite);

const textFromIcon = 20;

const scoreText = new PIXI.Text('Score0', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xdddddd,
    align: 'left',
});
scoreText.zIndex = 2;
scoreText.x = chestSprite.width + textFromIcon;
scoreText.y = chestSprite.y + chestSprite.height / 2;
scoreText.anchor.set(0, 0.5);


let backpackSprite = PIXI.Sprite.from(new PIXI.Texture(uiTex.baseTexture, new PIXI.Rectangle(0, 32 * 3, 48, 32)));
backpackSprite.anchor.set(0, 0);
backpackSprite.y = 40;
game.app.stage.addChild(backpackSprite);

const backpackText = new PIXI.Text('Score0', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xdddddd,
    align: 'left',
});
backpackText.zIndex = 2;
backpackText.x = backpackSprite.width + textFromIcon;
backpackText.y = backpackSprite.y + backpackSprite.height / 2;
backpackText.anchor.set(0, 0.5);

const backpackContainer = new PIXI.Container();
backpackContainer.x = 0;
backpackContainer.y = backpackText.y + backpackText.height;
backpackContainer.scale.set(SCALE);

game.app.stage.addChild(scoreText);
game.app.stage.addChild(backpackText);
game.app.stage.addChild(backpackContainer);
player.setScoreText();

game.app.stage.addChild(chestBottomText);

game.buildMuteButton(game.app.stage);

let playerDidStep = false;

menuTheme = PIXI.sound.Sound.from({url: 'assets/menuTheme.mp3', preload: true,});
menuTheme.volume = 0.5;
menuTheme.loop = true;

soundInGameTheme = PIXI.sound.Sound.from({url: 'assets/gameTheme.mp3', preload: true,});
soundInGameTheme.volume = 0.5;
soundInGameTheme.loop = true;

const logoSprite = PIXI.Sprite.from('assets/logo.png');
logoSprite.anchor.set(0.5);
logoSprite.x = window.innerWidth / 2;
logoSprite.y = window.innerHeight / 2;

const logoBg = new PIXI.Graphics();
logoBg.beginFill(0xffffff);
logoBg.drawRect(0, 0, 16, 16);
logoBg.scale.set(window.innerWidth / 16, window.innerHeight / 16);
game.app.stage.addChild(logoBg);
game.app.stage.addChild(logoSprite);
const logoText = new PIXI.Text('Collect as much gold as you can!\n\nClick to start', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0,
    align: 'center',
});
logoText.x = window.innerWidth / 2;
logoText.y = logoSprite.y + 256 / 2 + 10;
logoText.anchor.set(0.5, 0);
game.app.stage.addChild(logoText);


function startMenu() {
    logoSprite.visible = true;
    scoreText.visible = false;
    containerMap.visible = false;

    logoBg.interactive = true;
    logoBg.cursor = 'pointer';
    logoBg.on('click', () => {
        startGame();
    });

    setTimeout(() => {
        menuTheme.play();
    }, 500)
}

function startGame() {
    logoSprite.visible = false;
    logoBg.visible = false;
    logoText.visible = false;
    scoreText.visible = true;
    containerMap.visible = true;

    menuTheme.stop();
    soundInGameTheme.play();

    game.app.ticker.add(() => {
        const delta = game.app.ticker.elapsedMS / 1000;
        player.update(delta);
        map.update(delta, playerDidStep);

        playerDidStep = false;
    });

    const startedAt = new Date().getTime();
    let playerSteps = 0;

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
            // case "KeyF":
            //     const mode = game.toggleFogOfWar();
            //     console.log(`fog of war is ${mode ? 'on' : 'off'}`);
            //     break;
            // case "KeyG":
            //     map.showThingsAlways = !map.showThingsAlways;
            //     console.log(`show things is ${map.showThingsAlways ? 'on' : 'off'}`);
            //     break;
            case "Space":
                player.minigameSpaceAction();
                break;
            case "Enter":
                if (player.isInChestCell()) {
                    player.isMoveDisabled = true;
                    chestBottomText.text = `You collected ${player.goldChestValue} gold out of ${map.goldTotalValue}. Press [F5] to try again :)`;

                    const elapsed = (new Date().getTime()) - startedAt;
                    fetch(`https://ater.me/ldjam54stats?collected=${player.goldChestValue}_${map.goldTotalValue}&elap=${elapsed}&steps=${playerSteps}&dies=${player.dieCount}`);
                }
                break;
            default:
                //console.log(key.code);
                return;
        }

        key.preventDefault();

        if (did) {
            playerDidStep = true;
            playerSteps++;
        }
    });
}

startMenu();
