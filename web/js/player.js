class Player extends Obj {
    viewDistance;

    movingTo;
    parentMovingTo;
    movingSpeed;
    movingDuration;

    isMoveDisabled = false;

    soundCoin;
    isSoundCoinPlaying = false;
    soundHitHurt;
    soundDeny;

    goldChest = 0;
    goldInv = 0;
    goldInvMax = 9;

    constructor(pos, map, parent, viewDistance) {
        const texture = PIXI.Texture.from('assets/characters.png');

        const sprite = new PIXI.AnimatedSprite([
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 32 * 4, 32, 32)),
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(32, 32 * 4, 32, 32)),
        ]);
        sprite.anchor.set(0.5, 0.5);
        sprite.zIndex = 1;
        sprite.animationSpeed = 0.15;
        //sprite.play();
        parent.addChild(sprite);

        super(pos, map, sprite);

        this.soundCoin = PIXI.sound.Sound.from({url: 'assets/coin.mp3', preload: true,});
        this.soundHitHurt = PIXI.sound.Sound.from({url: 'assets/hitHurt.mp3', preload: true,});
        this.soundDeny = PIXI.sound.Sound.from({url: 'assets/deny.mp3', preload: true,});
        this.soundDeny.volume = 0.7;

        this.viewDistance = viewDistance;

        map.hideAllCells();
        map.showNear(this.pos, this.viewDistance);
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

        this.image.gotoAndPlay(1);
        this.image.scale.x = (dx > 0) ? 1 : -1;

        this.movingTo = new Pos(newX, newY);
        this.parentMovingTo = new Pos(
            this.image.parent.x - dx * this.map.CellW,
            this.image.parent.y - dy * this.map.CellH,
        );
        this.movingDuration = 0.25;
        if (dx === 0 && dy !== 0) {
            this.movingDuration /= 1.6;
        }
        this.movingSpeed = new Pos(dx * this.movingDuration, dy * this.movingDuration);

        return true;
    }

    update(delta) {
        // chest cell?
        if (this.map.map.start.x === this.pos.x && this.map.map.start.y === this.pos.y) {
            if (this.goldInv > 0) {
                if (this.playCoinSound()) {
                    this.goldChest++;
                    this.goldInv--;
                    this.setScoreText();
                }
            }
            doneText.visible = (this.goldChest > 0) && (this.goldInv === 0);
        } else {
            doneText.visible = false;
        }

        if (!this.movingTo) {
            return;
        }
        this.movingDuration -= delta;
        if (this.movingDuration <= 0) {
            this.moveTo(this.movingTo.x, this.movingTo.y);
            this.logicPos = new Pos(this.movingTo.x, this.movingTo.y);

            this.image.parent.x = this.parentMovingTo.x;
            this.image.parent.y = this.parentMovingTo.y;

            map.showNear(this.pos, this.viewDistance);
            this.movingTo = undefined;
            this.image.gotoAndStop(2);
            this.processNewCell();
            return;
        }

        const dx = this.movingSpeed.x ? (delta / this.movingSpeed.x) : 0;
        const dy = this.movingSpeed.y ? (delta / this.movingSpeed.y) : 0;

        this.moveBy(dx, dy);

        this.image.parent.x -= dx * this.map.CellW;
        this.image.parent.y -= dy * this.map.CellH;
    }

    processNewCell() {
        const sprite = this.map.sprites[this.pos.y][this.pos.x];
        const gold = sprite.__gold;
        if (gold) {
            if (this.goldInv < this.goldInvMax) {
                this.playCoinSound();
                gold.destroy();
                sprite.__gold = undefined;

                this.goldInv++;
                this.setScoreText();
            } else {
                this.soundDeny.play();
            }
        }

        const thing = this.map.getThingByCoords(this.getCellCoords());
        if (thing) {
            if ((thing.type !== TypeDreamer) || (thing.inSearch)) {
                this.catched();
            }
        }
    }

    catched() {
        this.isMoveDisabled = true;

        map.hideAllCells();

        this.goldInv = 0;
        this.setScoreText();

        this.soundHitHurt.play();

        setTimeout(() => {
            this.isMoveDisabled = false;

            const startPos = this.map.map.start;
            const dx = this.pos.x - startPos.x;
            const dy = this.pos.y - startPos.y;

            this.moveTo(startPos.x, startPos.y);
            this.logicPos = startPos.y;

            this.image.parent.x += dx * this.map.CellW;
            this.image.parent.y += dy * this.map.CellH;

            map.showNear(this.pos, this.viewDistance);
        }, 1000);
    }

    setScoreText() {
        let maxInfix = "";
        if (this.goldInv === this.goldInvMax) {
            maxInfix = " (MAX)"
        }

        scoreText.text = `Chest: ${this.goldChest}\nInventory: ${this.goldInv}/${this.goldInvMax}${maxInfix}`; //\nTotal ${this.map.goldTotal}`;
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
}
