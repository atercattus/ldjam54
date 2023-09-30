class Thing extends Obj {
    constructor(pos, map, parent) {
        let image = new PIXI.Graphics();
        image.beginFill(0xff0033);
        image.drawCircle(0, 0, 12);
        parent.addChild(image);

        super(pos, map, image);
    }
}
