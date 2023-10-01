class Player extends Obj {
    viewDistance;

    waitTextures;
    walkTextures;

    movingTo;
    parentMovingTo;
    movingSpeed;
    movingDuration;

    isMoveDisabled = false;

    soundCoin;
    isSoundCoinPlaying = false;
    soundHitHurt;
    soundDeny;

    goldChestValue = 0;
    goldInvIdxs = [];
    goldInvIdxsCap = 9;

    minigameUI = {};

    constructor(pos, map, parent, viewDistance) {
        const texture = PIXI.Texture.from('assets/characters.png');

        const walkTextures = [
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 32 * 4, 32, 32)),
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(32, 32 * 4, 32, 32)),
        ];
        const waitTextures = [
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 32 * 4, 32, 32)),
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(32 * 2, 32 * 4, 32, 32)),
        ];

        const sprite = new PIXI.AnimatedSprite(waitTextures);
        sprite.anchor.set(0.5, 0.5);
        sprite.zIndex = 1;
        sprite.animationSpeed = 0.03;
        parent.addChild(sprite);

        super(pos, map, sprite);

        this.waitTextures = waitTextures;
        this.walkTextures = walkTextures;

        this.switchWalk(false);

        this.soundCoin = PIXI.sound.Sound.from({url: 'assets/coin.mp3', preload: true,});
        this.soundCoin.volume = 0.5;
        this.soundHitHurt = PIXI.sound.Sound.from({url: 'assets/hitHurt.mp3', preload: true,});
        this.soundDeny = PIXI.sound.Sound.from({url: 'assets/deny.mp3', preload: true,});
        this.soundDeny.volume = 0.7;

        this.viewDistance = viewDistance;

        this.buildMinigameUI(sprite);

        chestBottomText.text = 'Press [Enter] for finish... if you want';
        chestBottomText.visible = false;

        map.hideAllCells();
        map.showNear(this.pos, this.viewDistance);
    }

    switchWalk(walk) {
        this.image.animationSpeed = walk ? 0.3 : 0.03;
        this.image.textures = walk ? this.walkTextures : this.waitTextures;

        this.image.gotoAndPlay(0);
    }

    moveByCell(dx, dy) {
        if (this.movingTo || this.isMoveDisabled) {
            return false;
        }

        const newX = this.pos.x + dx;
        const newY = this.pos.y + dy;

        if (!this.map.isEmpty(newX, newY)) {
            return false;
        }

        this.switchWalk(true);
        if (dx !== 0) {
            this.image.scale.x = (dx > 0) ? 1 : -1;
        }

        this.movingTo = new Pos(newX, newY);
        this.logicPos = new Pos(newX, newY);
        this.parentMovingTo = new Pos(
            this.image.parent.x - SCALE * dx * this.map.CellW,
            this.image.parent.y - SCALE * dy * this.map.CellH,
        );
        this.movingDuration = 0.25;
        if (dx === 0 && dy !== 0) {
            this.movingDuration /= 1.6;
        }
        this.movingSpeed = new Pos(dx * this.movingDuration, dy * this.movingDuration);

        return true;
    }

    isInChestCell() {
        return (this.map.mapInfo.start.x === this.pos.x) && (this.map.mapInfo.start.y === this.pos.y);
    }

    update(delta) {
        if (this.isInChestCell()) {
            if (this.goldInvIdxs.length > 0) {
                if (this.playCoinSound()) {
                    let gi = this.goldInvIdxs.pop();
                    this.goldChestValue += GoldValues[gi];
                    this.setScoreText();
                }
            }
            chestBottomText.visible = (this.goldChestValue > 0) && (this.goldInvIdxs.length === 0);
        } else {
            chestBottomText.visible = false;
        }

        if (!this.movingTo) {
            return;
        }
        this.movingDuration -= delta;
        if (this.movingDuration <= 0) {
            this.moveTo(this.movingTo.x, this.movingTo.y);
            //this.logicPos = new Pos(this.movingTo.x, this.movingTo.y);

            this.image.parent.x = this.parentMovingTo.x;
            this.image.parent.y = this.parentMovingTo.y;

            map.showNear(this.pos, this.viewDistance);
            this.movingTo = undefined;
            this.switchWalk(false);
            this.processNewCell();
            return;
        }

        const dx = this.movingSpeed.x ? (delta / this.movingSpeed.x) : 0;
        const dy = this.movingSpeed.y ? (delta / this.movingSpeed.y) : 0;

        this.moveBy(dx, dy);

        this.image.parent.x -= SCALE * dx * this.map.CellW;
        this.image.parent.y -= SCALE * dy * this.map.CellH;
    }

    processNewCell() {
        const sprite = this.map.sprites[this.pos.y][this.pos.x];
        const gold = sprite.__gold;
        if (gold) {
            if (this.goldInvIdxs.length < this.goldInvIdxsCap) {
                const gi = sprite.__goldIdx;
                const value = GoldValues[gi];
                this.playCoinSound();
                sprite.__gold = undefined;
                sprite.__goldIdx = undefined;
                gold.destroy();

                this.goldInvIdxs.push(gi);
                this.setScoreText();
            } else {
                this.soundDeny.play();
            }
        }

        if (this.map.showThingsPowerupActive) {
            if (--this.map.showThingsPowerupActive === 0) {
                this.map.showThingsPowerupActive = undefined;
            }
        }

        if (this.map.hideFoWPowerupActive) {
            if (--this.map.hideFoWPowerupActive === 0) {
                this.map.hideFoWPowerupActive = undefined;
                game.showFogOfWar();
            }
        }

        const powerup = sprite.__powerup;
        if (powerup) {
            const type = sprite.__powerupType;
            sprite.__powerup = undefined;
            sprite.__powerupType = undefined;
            powerup.destroy();

            switch (type) {
                case TypePowerUpSee:
                    this.map.showThingsPowerupActive = this.map.showThingsPowerupActiveMax;
                    break;

                case TypePowerUpLight:
                    this.map.hideFoWPowerupActive = this.map.hideFoWPowerupActiveMax;
                    game.hideFogOfWar();
                    break;
            }
        }

        const thing = this.map.getThingByCoords(this.getCellCoords());
        if (thing) {
            if ((thing.type !== TypeDreamer) || (thing.inSearch)) {
                this.catched(thing);
            }
        }
    }

    catched(thing) {
        this.isMoveDisabled = true;

        const size = ActionSizes[thing.type];

        this.showMinigame(size, (isInside) => {
            thing.cooldown = true;
            if (isInside) {
                return;
            }

            map.hideAllCells();

            this.goldInvIdxs = [];
            this.setScoreText();

            this.soundHitHurt.play();

            setTimeout(() => {
                this.isMoveDisabled = false;

                const startPos = this.map.mapInfo.start;
                const dx = this.pos.x - startPos.x;
                const dy = this.pos.y - startPos.y;

                this.moveTo(startPos.x, startPos.y);
                this.logicPos = new Pos(startPos.x, startPos.y);

                this.image.parent.x += SCALE * dx * this.map.CellW;
                this.image.parent.y += SCALE * dy * this.map.CellH;

                map.showNear(this.pos, this.viewDistance);
            }, 1000);
        });
    }

    setScoreText() {
        scoreText.text = `\$ ${this.goldChestValue}`;

        let maxInfix = "";
        if (this.goldInvIdxs.length === this.goldInvIdxsCap) {
            maxInfix = " (MAX. Return to the chest)"
        }
        backpackText.text = `${this.goldInvIdxs.length} / ${this.goldInvIdxsCap}${maxInfix}`;

        backpackContainer.removeChildren();
        for (let i = 0; i < this.goldInvIdxs.length; i++) {
            const gi = this.goldInvIdxs[i];

            const gold = new PIXI.Sprite(this.map.goldTextures[gi]);
            gold.y = i * gold.height;
            backpackContainer.addChild(gold);
        }
    }

    playCoinSound() {
        if (this.isSoundCoinPlaying) {
            return false;
        }
        this.isSoundCoinPlaying = true;

        this.soundCoin.play().on('end', () => {
            this.isSoundCoinPlaying = false;
        });

        return true;
    }

    buildMinigameUI(parent) {
        const tex = PIXI.Texture.from('assets/ui.png');

        // bg
        const sprite = new PIXI.Sprite(
            new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(0, 0, 76, 21)),
        );
        sprite.y = -1.3 * sprite.height;
        sprite.anchor.set(0.5, 0.5);
        sprite.zIndex = 3;
        parent.addChild(sprite);

        // active
        const activeArea = {
            'l': new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(16, 30, 2, 21)),
            'm': new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(22, 30, 2, 21)),
            'r': new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(28, 30, 2, 21)),
        };

        const m = new PIXI.TilingSprite(activeArea['m']);
        m.anchor.set(0, 0);
        m.y = -sprite.height / 2;
        m.height = 17 + 4;
        sprite.addChild(m);

        const l = new PIXI.Sprite(activeArea['l']);
        l.anchor.set(1, 0);
        l.y = -sprite.height / 2;
        sprite.addChild(l);

        const r = new PIXI.Sprite(activeArea['r']);
        r.anchor.set(0, 0);
        r.y = -sprite.height / 2;
        sprite.addChild(r);

        const line = new PIXI.Sprite(
            new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(7, 30, 5, 21)),
        );
        line.anchor.set(0.5, 0.5);
        sprite.addChild(line);

        // text
        const text = new PIXI.Text(`To avoid the attack, press [Space]\nwhen line is in central zone\n\nPress [Space] to start`, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2,
            align: 'center',
        });
        text.zIndex = 4;
        text.y = text.height;
        text.anchor.set(0.5, 0.5);
        sprite.addChild(text);

        this.minigameUI = {
            bg: sprite,
            l: l,
            m: m,
            r: r,
            line: line,
            text: text,
            animTimer: 0,
            speed: 0,
            lineMinX: 0,
            lineMaxX: 0,
            awaitInput: true,
            cb: undefined,
        };

        this.hideMinigame();
    }

    showMinigame(size, cb) {
        const speed = 1.5;

        const ui = this.minigameUI;

        const l = ui.l;
        const m = ui.m;
        const r = ui.r;
        const line = ui.line;

        const maxSize = 50;

        const offset = (maxSize - size) * (Math.random() - 0.5);

        m.x = -size / 2 + offset;
        m.width = size;

        l.x = m.x;

        r.x = size / 2 + offset;

        const lineMaxX = maxSize / 2 + line.width / 2;
        const lineMinX = -lineMaxX;

        line.x = lineMinX;

        if (ui.animTimer) {
            clearInterval(ui.animTimer);
        }

        // for proper UI orientation
        this.image.scale.x = 1;

        soundInGameTheme.stop();
        menuTheme.play();

        ui.bg.visible = true;
        ui.awaitInput = true;
        ui.lineMinX = lineMinX;
        ui.lineMaxX = lineMaxX;
        ui.speed = speed;
        ui.cb = cb;

        this.isMoveDisabled = true;
    }

    hideMinigame() {
        const ui = this.minigameUI;

        this.isMoveDisabled = false;

        if (menuTheme) {
            menuTheme.stop();
        }
        if (soundInGameTheme) {
            soundInGameTheme.play();
        }

        ui.bg.visible = false;

        if (ui.animTimer) {
            clearInterval(ui.animTimer);
            ui.animTimer = 0;
        }
    }

    minigameSpaceAction() {
        const ui = this.minigameUI;

        if (!ui.bg.visible) {
            return;
        }

        if (ui.awaitInput) {
            ui.awaitInput = false;

            ui.animTimer = setInterval(() => {
                const line = ui.line;
                line.x += ui.speed;
                if (line.x >= ui.lineMaxX) {
                    line.x = ui.lineMaxX;
                    ui.speed = -ui.speed;
                } else if (line.x <= ui.lineMinX) {
                    this.minigameProcessInside(false);
                }
            }, 16);

            return;
        }

        const l = this.minigameUI.l;
        const r = this.minigameUI.r;
        const line = this.minigameUI.line;

        const minX = Math.floor(l.x - l.width);
        const maxX = Math.ceil(r.x + r.width);

        const inside = (minX <= line.x) && (line.x <= maxX);
        this.minigameProcessInside(inside);
    }

    minigameProcessInside(isInside) {
        this.soundHitHurt.play();
        this.minigameUI.cb(isInside);
        this.hideMinigame();
    }
}
