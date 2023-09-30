class Player extends Obj {
    viewDistance;

    movingTo;
    movingSpeed;
    movingDuration;

    constructor(pos, map, parent, viewDistance) {
        let image = new PIXI.Graphics();
        image.beginFill(0xffffff);
        image.drawCircle(0, 0, 12);
        parent.addChild(image);

        super(pos, map, image);

        this.viewDistance = viewDistance;

        map.hideAllCells();
        map.showNear(this.pos, this.viewDistance);
    }

    moveBy(dx, dy) {
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
            map.showNear(this.pos, this.viewDistance);
            this.movingTo = undefined;
            return;
        }

        const dx = this.movingSpeed.x ? (delta / this.movingSpeed.x) : 0;
        const dy = this.movingSpeed.y ? (delta / this.movingSpeed.y) : 0;

        super.moveBy(dx, dy);

        this.image.parent.x -= dx * this.map.CellW;
        this.image.parent.y -= dy * this.map.CellH;
    }

    getCellCoords() {
        return new Pos(
            Math.floor(this.pos.x),
            Math.floor(this.pos.y)
        );
    }
}
