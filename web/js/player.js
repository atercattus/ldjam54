class Player extends Obj {
    visibleDistance = 6;

    isMoving = false;

    constructor(pos, map, image) {
        super(pos, map, image);

        map.hideAllCells();
        map.showNear(this.pos, this.visibleDistance);
    }

    moveBy(dx, dy) {
        if (this.isMoving) {
            return;
        }

        const newX = this.pos.x + dx;
        const newY = this.pos.y + dy;

        if (!this.map.isEmpty(newX, newY)) {
            return;
        }

        this.isMoving = true;

        let interval_ms = 300;
        if (dx === 0 && dy !== 0) {
            interval_ms /= 1.2;
        }
        const iters = interval_ms / 16;
        const animDx = dx / iters;
        const animDy = dy / iters;
        let iter = 0;
        const timer = setInterval(() => {
            super.moveBy(animDx, animDy);

            this.image.parent.x -= animDx * this.map.CellW;
            this.image.parent.y -= animDy * this.map.CellH;

            if (++iter >= iters) {
                clearInterval(timer);

                this.moveTo(newX, newY);
                map.showNear(this.pos, this.visibleDistance);

                this.isMoving = false;
            }
        }, 16);
    }
}
