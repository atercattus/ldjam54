class Pos {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Obj {
    pos;
    image;
    map;

    constructor(pos, map, image) {
        this.pos = pos;
        this.map = map;

        this.image = image;
        this.moveImageToPos();
    }

    moveImageToPos() {
        this.image.x = map.idx2X(this.pos.x);
        this.image.y = map.idx2Y(this.pos.y);
    }

    moveBy(dx, dy) {
        this.pos.x += dx;
        this.pos.y += dy;
        this.moveImageToPos();
    }

    moveTo(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.moveImageToPos();
    }
}
