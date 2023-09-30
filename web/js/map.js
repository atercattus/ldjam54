class Cell extends PIXI.Sprite {
    constructor(tex) {
        super(tex);
    }
}

class Map {
    CellW = 64;
    CellH = 32;

    topTex;
    wallTex;
    wall2Tex;
    wall3Tex;
    wall4Tex;
    groundTex;
    chestTex;
    goldTextures;

    map = {};
    container;

    sprites = [];

    goldTotal = 0;

    visibleCells = [];

    things;

    showThingsAlways = false; // powerup?

    constructor(parent, playerPosFunc) {
        // map textures
        let texture = PIXI.Texture.from('assets/tiles.png');
        this.topTex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 0, 64, 32));
        this.wallTex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 64, 64, 32));
        this.wall2Tex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(64 * 2, 64, 64, 32));
        this.wall3Tex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(64 * 2, 64 * 2, 64, 32));
        this.wall4Tex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(64 * 2, 64 * 3, 64, 32));
        this.groundTex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(64 * 2, 0, 64, 32));
        this.chestTex = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 64 * 2, 64, 32));

        // gold textures
        let goldTex = PIXI.Texture.from('assets/gold.png');
        this.goldTextures = [
            new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(0, 0, 64, 64)),
            new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(64, 0, 64, 64)),
            new PIXI.Texture(goldTex.baseTexture, new PIXI.Rectangle(64, 64, 64, 64)),
        ];

        this.things = new Things(playerPosFunc, this, parent);
    }

    gen() {
        const P = TypePlayer;
        const G = TypeGold;
        const D = TypeDreamer;
        const A = TypeAggressive;
        const N = TypeNormal;
        const map = [
            [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [1, P, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,],
            [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, D, 0,],
            [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, D, 1, G, 0,],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, N, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,],
            [G, D, D, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,],
            [G, D, D, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,],
            [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0,],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0,],
            [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0,],
            [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [1, D, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, A, 0, 0,],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,],
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, N, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,],
        ];

        return {
            map: map,
            rows: map.length,
            cols: map[0].length,
            start: {x: 1, y: 1}, // counts from 1
        };
    }

    makeMapSprite(tex, x, y) {
        let sprite = new Cell(tex);
        sprite.anchorX = 0;
        sprite.anchorY = 0;
        this.sprites[y][x] = sprite;
        this.container.addChild(sprite);

        return sprite;
    }

    build(container) {
        this.map = this.gen();
        this.container = container;

        const scheme = this.map.map;
        const rows = this.map.rows;
        const cols = this.map.cols;

        this.sprites = [];
        for (let y = 0; y <= rows + 1; y++) {
            this.sprites[y] = Array.from({length: cols + 2}, () => TypeWall);
        }

        // top & bottom borders
        for (let x = 0; x <= cols + 1; x++) {
            let sprite = this.makeMapSprite(this.topTex, x, 0);
            sprite.x = x * this.CellW;

            sprite = this.makeMapSprite(this.topTex, x, rows + 1);
            sprite.x = x * this.CellW;
            sprite.y = (rows + 1) * this.CellH;
        }

        // left & right borders
        for (let y = 1; y <= rows; y++) {
            let sprite = this.makeMapSprite(this.topTex, 0, y);
            sprite.y = y * this.CellH;

            sprite = this.makeMapSprite(this.topTex, cols + 1, y);
            sprite.x = (cols + 1) * this.CellW;
            sprite.y = y * this.CellH;
        }

        // map
        for (let y = 0; y < rows; y++) {
            const mapRow = scheme[y];
            for (let x = 0; x < cols; x++) {
                const type = mapRow[x];
                let tex;
                if (type === TypeWall) {
                    tex = this.topTex;
                } else if (y === 0 || scheme[y - 1][x] === TypeWall) {
                    tex = this.wallTex;
                    let alternatives = [this.wall2Tex, this.wall3Tex, this.wall4Tex];
                    for (let i = 0; i < alternatives.length; i++) {
                        if (Math.random() < 0.03) {
                            tex = alternatives[i];
                        }
                    }
                } else {
                    tex = this.groundTex;
                }

                const sprite = this.makeMapSprite(tex, x + 1, y + 1);
                sprite.x = (x + 1) * this.CellW;
                sprite.y = (y + 1) * this.CellH;

                switch (type) {
                    case TypePlayer:
                        this.map.start.x = x + 1;
                        this.map.start.y = y + 1;

                        const chest = new PIXI.Sprite(this.chestTex);
                        chest.anchor.set(0, 0);
                        chest.scale.set(0.7);
                        sprite.addChild(chest);
                        break;

                    case TypeDreamer:
                    case TypeNormal:
                    case TypeAggressive:
                        this.things.add(new Pos(x + 1, y + 1), type);
                        break;

                    case TypeGold:
                        this.addGold(sprite);
                        break;
                }

                if (type === TypeEmpty) {
                    if (Math.random() < 0.1) {
                        this.addGold(sprite);
                    }
                }
            }
        }
    }

    addGold(groundSprite) {
        const gi = Math.floor(Math.random() * this.goldTextures.length);
        const gold = new PIXI.Sprite(this.goldTextures[gi]);
        gold.x = groundSprite.width * 0.5;
        gold.y = groundSprite.height * 0.7;
        gold.scale.x = 0.4;
        gold.scale.y = 0.4;
        gold.anchor.set(0.5, 0.5);
        groundSprite.addChild(gold);
        groundSprite.__gold = gold;
        this.goldTotal++;
    }

    idx2X(x) {
        return (x + 0.5) * this.CellW;
    }

    idx2Y(y) {
        return (y + 0.5) * this.CellH;
    }

    // pos2idxs(pos) {
    //     return [
    //         Math.ceil(pos.x / this.CellW),
    //         Math.ceil(pos.y / this.CellH)
    //     ];
    // }

    isEmpty(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        if (x <= 0 || x > this.map.cols) {
            return false;
        }
        if (y <= 0 || y > this.map.rows) {
            return false;
        }

        const type = this.map.map[y - 1][x - 1];
        if (type === TypeWall) {
            return false;
        }
        return true;
    }

    isVisible(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        if (x <= 0 || x > this.map.cols) {
            return false;
        }
        if (y <= 0 || y > this.map.rows) {
            return false;
        }
        return this.sprites[y][x].visible;
    }

    isVisibleForThing(x, y) {
        return this.showThingsAlways || this.isVisible(x, y);
    }

    canSee(from, to) {
        if (from.x === to.x && from.y === to.y) {
            return true;
        }

        let dx = from.x - to.x;
        let dy = from.y - to.y;
        const len = Math.sqrt(dx * dx + dy * dy) * 2;

        dx /= len;
        dy /= len;

        const steps = Math.floor(len);
        for (let i = 1; i <= steps; i++) {
            const nx = Math.round(from.x - dx * i);
            const ny = Math.round(from.y - dy * i);
            if (nx === to.x && ny === to.y) {
                return true;
            }
            if (!this.isEmpty(nx, ny)) {
                return false;
            }
        }

        return true;
    }

    hideAllCells() {
        for (let y = 0; y < this.sprites.length; y++) {
            let row = this.sprites[y];
            for (let x = 0; x < row.length; x++) {
                this.hideCell(row[x]);
            }
        }
    }

    hideVisibleCells() {
        for (let i = 0; i < this.visibleCells.length; i++) {
            this.hideCell(this.visibleCells[i]);
        }
        this.visibleCells = [];
    }

    showCell(sprite) {
        sprite.visible = true;
        this.visibleCells.push(sprite);
    }

    hideCell(sprite) {
        sprite.visible = false;
    }

    showNear(pos, distance) {
        this.hideVisibleCells();

        const neighbours = [
            {x: -1, y: 0},
            {x: -1, y: -1},
            {x: 0, y: -1},
            {x: 1, y: -1},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 0, y: 1},
            {x: -1, y: 1},
        ];

        const pos2idx = function (pos) {
            return pos.x * 100000 + pos.y;
        };

        let visited = {};
        visited[pos2idx(pos)] = true;
        let queue = [{energy: distance, pos: pos}];

        while (queue.length > 0) {
            const p = queue.shift();
            if (p.pos.y < 0 || p.pos.y >= this.sprites.length) {
                continue;
            }
            if (p.pos.x < 0 || p.pos.x >= this.sprites[0].length) {
                continue;
            }

            if (p.energy === 0) {
                continue;
            }
            if (!this.canSee(pos, p.pos)) {
                continue;
            }

            for (let i = 0; i < neighbours.length; i++) {
                const n = neighbours[i];
                const newPos = {x: p.pos.x + n.x, y: p.pos.y + n.y};

                if (visited[pos2idx(newPos)]) {
                    continue;
                }
                visited[pos2idx(newPos)] = true;

                queue.push({energy: p.energy - 1, pos: newPos});
            }

            this.showCell(this.sprites[p.pos.y][p.pos.x]);
        }
    }

    getThingByCoords(pos) {
        return this.things.getByCoords(pos);
    }

    update(delta, playerDidStep) {
        this.things.update(delta, playerDidStep);
    }
}
