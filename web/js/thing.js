const ViewDistances = {
    [TypeDreamer]: 0.5,
    [TypeNormal]: 5,
    [TypeAggressive]: 9,
};

const Radiuses = {
    [TypeDreamer]: 10,
    [TypeNormal]: 12,
    [TypeAggressive]: 20,
};

const Colors = {
    [TypeDreamer]: 0xaaaaaa,
    [TypeNormal]: 0x5555cc,
    [TypeAggressive]: 0xff3366,
};

let counter = 1;

class Thing extends Obj {
    type;
    playerPosFunc;
    viewDistance;

    inSearch;
    gotoPos;
    moveTimer;

    dreamerWakeupInterval = undefined;

    constructor(type, pos, map, parent, playerPosFunc, tex) {
        //let color = Colors[type];
        //let radius = Radiuses[type];
        let viewDistance = ViewDistances[type];

        switch (type) {
            case TypeDreamer:
                break;
            case TypeAggressive:
                break;
            case TypeNormal:
                break;
            default: // wtf
                return;
        }

        let image = new PIXI.Sprite(tex);
        image.anchor.set(0.5, 0.5);
        image.zIndex = 1;
        parent.addChild(image);

        super(pos, map, image);

        this.name = `t#${counter++}`;

        this.type = type;
        this.playerPosFunc = playerPosFunc;
        this.viewDistance = viewDistance;
    }

    update(delta, playerDidStep) {
        this.image.visible = this.map.isVisibleForThing(this.pos.x, this.pos.y);

        if (!playerDidStep) {
            return;
        }

        if (this.dreamerWakeupInterval > 0) {
            if (--this.dreamerWakeupInterval <= 0) {
                // angry mode :)
                //console.log(this.name, 'dreamer is here!');
                //this.dreamerWakeupInterval = undefined;
                //this.viewDistance = ViewDistances[TypeNormal];
            }
        }

        const playerPos = this.playerPosFunc();
        const dist = distance(this.pos, playerPos);
        const see = (dist <= this.viewDistance) && map.canSee(playerPos, this.pos);

        if (this.inSearch) {
            if (see) {
                this.gotoPos = playerPos;
            } else {
                //console.log(this.name, 'didnt see');
                this.inSearch = false;
            }
        } else if (see) {
            //console.log(this.name, 'see!');
            if (this.type === TypeDreamer) {
                if (this.dreamerWakeupInterval === undefined) {
                    //console.log(this.name, 'dreamer wake up...');
                    this.viewDistance = ViewDistances[TypeNormal];
                    this.dreamerWakeupInterval = 2;
                    return;
                } else {
                    //console.log(this.name, 'dreamer warming up...');
                }
            }
            this.inSearch = true;
            this.gotoPos = playerPos;
        } else {
            if (!this.gotoPos) {
                if ((this.type === TypeDreamer) && (this.dreamerWakeupInterval !== undefined)) {
                    //console.log(this.name, 'dreamer calm down...');
                    this.viewDistance = ViewDistances[TypeDreamer];
                    this.dreamerWakeupInterval = undefined;
                    return;
                }

                this.moveToRandom(delta);
                return;
            }
        }

        if (this.gotoPos) {
            this.moveToTarget(delta);
        }
    }

    moveToTarget(delta) {
        if (this.moveTimer) {
            return;
        }

        let dx = this.pos.x - this.gotoPos.x;
        if (dx !== 0) {
            this.image.scale.x = (dx > 0) ? -1 : 1;

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

    enemyTextures = {};

    constructor(playerPosFunc, map, parent) {
        this.playerPosFunc = playerPosFunc;
        this.map = map;
        this.container = parent;

        const texture = PIXI.Texture.from('assets/characters.png');
        this.enemyTextures = {
            [TypeDreamer]: new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 0, 32, 32)),
            [TypeNormal]: new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 32, 32, 32)),
            [TypeAggressive]: new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 64, 32, 32)),
        };
    }

    add(pos, type) {
        let thing = new Thing(type, pos, this.map, this.container, this.playerPosFunc, this.enemyTextures[type]);
        this.things.push(thing);
        thing.image.visible = false;

        return thing;
    }

    update(delta, playerDidStep) {
        for (let i = 0; i < this.things.length; i++) {
            this.things[i].update(delta, playerDidStep);
        }
    }

    getByCoords(pos) {
        for (let i = 0; i < this.things.length; i++) {
            const thing = this.things[i];
            const thingPos = thing.getCellCoords()
            if ((pos.x === thingPos.x) && (pos.y === thingPos.y)) {
                return thing;
            }
        }
        return undefined;
    }
}
