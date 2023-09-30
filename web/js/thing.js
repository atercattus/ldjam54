class Thing extends Obj {
    playerPosFunc;
    viewDistance;

    inSearch;
    gotoPos;
    moveTimer;

    constructor(pos, map, parent, playerPosFunc, viewDistance) {
        let image = new PIXI.Graphics();
        image.beginFill(0xff0033);
        image.drawCircle(0, 0, 12);
        image.zIndex = 1;
        parent.addChild(image);

        super(pos, map, image);

        this.playerPosFunc = playerPosFunc;
        this.viewDistance = viewDistance;
    }

    update(delta, playerDidStep) {
        this.image.visible = this.map.isVisible(this.pos.x, this.pos.y);

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
            this.inSearch = true;
            this.gotoPos = playerPos;
        } else {
            if (!this.gotoPos) {
                this.moveToRandom(delta);
                return;
            }
        }

        if (this.gotoPos) {
            this.moveToTarget(delta);
        }
    }

    moveToTarget(delta) {
        if (!this.moveTimer) {
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
                }
            }
        }
    }

    moveToRandom() {
        // todo
        //console.log('random');
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

    add(pos) {
        const thingViewDistance = 8;
        let thing = new Thing(pos, this.map, this.container, this.playerPosFunc, thingViewDistance);
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
