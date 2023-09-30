const TypeWall = 0;
const TypeEmpty = 1;
const TypePlayer = 2;

const TypeDreamer = 3;
const TypeNormal = 4;
const TypeAggressive = 5;

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

function distance(a, b) {
    const dx = (a.x - b.x);
    const dy = (a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
}
