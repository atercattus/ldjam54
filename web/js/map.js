class Map {
    CellW = 64;
    CellH = 32;

    topSprite;
    wallSprite;
    groundSprite;
    goldSprites;

    map = {};

    sprites = [];

    visibleCells = [];

    constructor(topSprite, wallSprite, groundSprite, goldSprites) {
        this.topSprite = topSprite;
        this.wallSprite = wallSprite;
        this.groundSprite = groundSprite;
        this.goldSprites = goldSprites;
    }

    gen() {
        const map = [
            [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
            [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
            [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
            [1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
            [1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
            [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        ];
        return {
            map: map,
            rows: map.length,
            cols: map[0].length,
            start: {x: 6, y: 5}, // counts from 1
        };
    }

    build(container) {
        this.map = this.gen();

        const scheme = this.map.map;
        const rows = this.map.rows;
        const cols = this.map.cols;

        this.sprites = [];
        for (let y = 0; y <= rows + 1; y++) {
            this.sprites[y] = Array.from({length: cols + 2}, () => 0);
        }

        // top & bottom borders
        for (let x = 0; x <= cols + 1; x++) {
            let sprite = new PIXI.Sprite(this.topSprite);
            sprite.x = x * this.CellW;
            sprite.anchorX = 0;
            sprite.anchorY = 0;
            container.addChild(sprite);
            this.sprites[0][x] = sprite;

            sprite = new PIXI.Sprite(this.topSprite);
            sprite.x = x * this.CellW;
            sprite.y = (rows + 1) * this.CellH;
            sprite.anchorX = 0;
            sprite.anchorY = 0;
            container.addChild(sprite);
            this.sprites[rows + 1][x] = sprite;
        }

        // left & right borders
        for (let y = 1; y <= rows; y++) {
            let sprite = new PIXI.Sprite(this.topSprite);
            sprite.y = y * this.CellH;
            sprite.anchorX = 0;
            sprite.anchorY = 0;
            container.addChild(sprite);
            this.sprites[y][0] = sprite;

            sprite = new PIXI.Sprite(this.topSprite);
            sprite.x = (cols + 1) * this.CellW;
            sprite.y = y * this.CellH;
            sprite.anchorX = 0;
            sprite.anchorY = 0;
            container.addChild(sprite);
            this.sprites[y][cols + 1] = sprite;
        }

        // map
        for (let y = 0; y < rows; y++) {
            const mapRow = scheme[y];
            for (let x = 0; x < cols; x++) {
                const type = mapRow[x];
                let tex;
                if (type === 0) {
                    tex = this.topSprite;
                } else if (y === 0 || scheme[y - 1][x] === 0) {
                    tex = this.wallSprite;
                } else {
                    tex = this.groundSprite;
                }

                const sprite = new PIXI.Sprite(tex);
                sprite.x = (x + 1) * this.CellW;
                sprite.y = (y + 1) * this.CellH;

                container.addChild(sprite);
                this.sprites[y + 1][x + 1] = sprite;

                if (tex === this.groundSprite) {
                    if (Math.random() < 0.1) {
                        const gi = Math.floor(Math.random() * this.goldSprites.length);
                        const gold = new PIXI.Sprite(this.goldSprites[gi]);
                        gold.x = sprite.x;
                        gold.y = sprite.y;
                        gold.scale.x = 0.6;
                        gold.scale.y = 0.6;
                        container.addChild(gold);

                        sprite.__goldSprite = gold;
                    }
                }
            }
        }
    }

    idx2X(x) {
        return (x + 0.5) * this.CellW;
    }

    idx2Y(y) {
        return (y + 0.5) * this.CellH;
    }

    // xy2idxs(x, y) {
    //     return [
    //         Math.ceil(x / this.CellW),
    //         Math.ceil(y / this.CellH)
    //     ];
    // }

    isEmpty(x, y) {
        if (x <= 0 || x > this.map.cols) {
            return false;
        }
        if (y <= 0 || y > this.map.rows) {
            return false;
        }
        if (this.map.map[y - 1][x - 1] === 0) {
            return false;
        }
        return true;
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

        if (sprite.__goldSprite) {
            sprite.__goldSprite.visible = true;
        }
    }

    hideCell(sprite) {
        sprite.visible = false;

        if (sprite.__goldSprite) {
            sprite.__goldSprite.visible = false;
        }
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
}
