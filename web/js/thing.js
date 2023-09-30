class Thing extends Obj {
    type;
    playerPosFunc;
    viewDistance;

    inSearch;
    gotoPos;
    moveTimer;

    constructor(type, pos, map, parent, playerPosFunc) {
        let color;
        let radius;
        let viewDistance;

        switch (type) {
            case TypeDreamer:
                color = 0xaaaaaa;
                radius = 10;
                viewDistance = 0.5;
                break;
            case TypeAggressive:
                color = 0xff3366;
                radius = 20;
                viewDistance = 9;
                break;
            case TypeNormal:
                color = 0x5555cc;
                radius = 12;
                viewDistance = 3;
                break;
            default: // wtf
                return;
        }

        let image = new PIXI.Graphics();
        image.beginFill(color);
        image.drawCircle(0, 0, radius);
        image.zIndex = 1;
        parent.addChild(image);

        super(pos, map, image);

        this.type = type;
        this.playerPosFunc = playerPosFunc;
        this.viewDistance = viewDistance;
    }

    update(delta, playerDidStep) {
        this.image.visible = this.map.isVisibleForThing(this.pos.x, this.pos.y);

        if (!playerDidStep) {
            return;
        }

        const playerPos = this.playerPosFunc();
        const dist = distance(this.pos, playerPos);
        const see = (dist <= this.viewDistance) && map.canSee(playerPos, this.pos);

        if (this.inSearch) {
            if (see) {
                this.gotoPos = playerPos;
            } else {
                console.log('didnt see');
                this.inSearch = false;
            }
        } else if (see) {
            console.log('see!');
            if (this.type === TypeDreamer) {
                // angry mode :)
                this.viewDistance = 4;
                this.type = TypeNormal;
            }
            this.inSearch = true;
            this.gotoPos = playerPos;
        } else {
            if (!this.gotoPos) {
                this.moveToRandom(delta);
                return;
            }
        }

        if (this.gotoPos) {
            //if (Math.random() > 0.95) { // skip a move sometimes
            this.moveToTarget(delta);
            //}
        }
    }

    moveToTarget(delta) {
        if (this.moveTimer) {
            return;
        }

        let dx = this.pos.x - this.gotoPos.x;
        if (dx !== 0) {
            let targetX = (dx > 0) ? this.pos.x - 1 : this.pos.x + 1;
            if (map.isEmpty(targetX, this.pos.y)) {
                let times = 10;
                dx = (targetX - this.pos.x) / times;

                this.moveTimer = setInterval(() => {
                    if (--times <= 0) {
                        clearInterval(this.moveTimer);
                        this.moveTimer = undefined;

                        this.pos.x = targetX;
                        this.moveImageToPos();
                        return;
                    }

                    this.pos.x += dx;
                    this.moveImageToPos();
                }, 16 * 2);
                return;
            }
        }

        let dy = this.pos.y - this.gotoPos.y;
        if (dy !== 0) {
            let times = 10;

            let targetY = (dy > 0) ? this.pos.y - 1 : this.pos.y + 1;
            if (map.isEmpty(this.pos.x, targetY)) {
                dy = (targetY - this.pos.y) / times;

                this.moveTimer = setInterval(() => {
                    if (--times <= 0) {
                        clearInterval(this.moveTimer);
                        this.moveTimer = undefined;

                        this.pos.y = targetY;
                        this.moveImageToPos();
                        return;
                    }

                    this.pos.y += dy;
                    this.moveImageToPos();
                }, 16 * 2);
                return;
            }
        }

        this.gotoPos = undefined;
    }

    moveToRandom() {
        if (this.type === TypeDreamer) {
            return;
        }

        if (Math.random() <= 0.1) {
            this.gotoPos = new Pos(
                this.pos.x + ((Math.random() < 0.5) ? -1 : 1),
                this.pos.y + ((Math.random() < 0.5) ? -1 : 1),
            );
        }
    }
}

class Things {
    things = [];

    playerPosFunc;
    map;
    container;

    constructor(playerPosFunc, map, parent) {
        this.playerPosFunc = playerPosFunc;
        this.map = map;
        this.container = parent;
    }

    add(pos, type) {
        let thing = new Thing(type, pos, this.map, this.container, this.playerPosFunc);
        this.things.push(thing);
        thing.image.visible = false;

        return thing;
    }

    update(delta, playerDidStep) {
        for (let i = 0; i < this.things.length; i++) {
            this.things[i].update(delta, playerDidStep);
        }
    }
}
