class Player extends Obj {
    viewDistance;

    movingTo;
    movingSpeed;
    movingDuration;

    goldChess = 0;
    goldInv = 0;

    constructor(pos, map, parent, viewDistance) {
        const texture = PIXI.Texture.from('assets/characters.png');

        const sprite = new PIXI.AnimatedSprite([
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 32 * 4, 32, 32)),
            new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(32, 32 * 4, 32, 32)),
        ]);
        sprite.anchor.set(0.5, 0.5);
        sprite.zIndex = 1;
        sprite.animationSpeed = 0.03;
        sprite.play();
        parent.addChild(sprite);

        super(pos, map, sprite);

        this.viewDistance = viewDistance;

        map.hideAllCells();
        map.showNear(this.pos, this.viewDistance);
    }

    moveByCell(dx, dy) {
        if (this.movingTo) {
            return false;
        }

        const newX = this.pos.x + dx;
        const newY = this.pos.y + dy;

        if (!this.map.isEmpty(newX, newY)) {
            return false;
        }

        this.movingTo = new Pos(newX, newY);
        this.movingDuration = 0.25;
        if (dx === 0 && dy !== 0) {
            this.movingDuration /= 1.6;
        }
        this.movingSpeed = new Pos(dx * this.movingDuration, dy * this.movingDuration);

        return true;
    }

    update(delta) {
        if (!this.movingTo) {
            return;
        }
        this.movingDuration -= delta;
        if (this.movingDuration <= 0) {
            this.moveTo(this.movingTo.x, this.movingTo.y);
            this.logicPos = new Pos(this.movingTo.x, this.movingTo.y);
            map.showNear(this.pos, this.viewDistance);
            this.movingTo = undefined;
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
            gold.destroy();
            sprite.__gold = undefined;

            this.goldInv++;
            this.setScoreText();
        }

        // chess cell
        if (this.map.map.start.x === this.pos.x && this.map.map.start.y === this.pos.y) {
            if (this.goldInv > 0) {
                this.goldChess += this.goldInv;
                this.goldInv = 0;
                this.setScoreText();
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
        this.goldInv = 0;
        this.setScoreText();
        const startPos = this.map.map.start;
        const dx = this.pos.x - startPos.x;
        const dy = this.pos.y - startPos.y;

        this.moveTo(startPos.x, startPos.y);
        this.logicPos = startPos.y;

        this.image.parent.x += dx * this.map.CellW;
        this.image.parent.y += dy * this.map.CellH;

        map.hideAllCells();
        map.showNear(this.pos, this.viewDistance);
    }

    setScoreText() {
        scoreText.text = `Chess: ${this.goldChess.toString()} Inventory: ${this.goldInv.toString()} / Total ${this.map.goldTotal}`;
    }
}
