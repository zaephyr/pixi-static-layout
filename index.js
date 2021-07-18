import * as PIXI from 'pixi.js';

let canvasWidth = 960;
const heightRatio = 0.5625;
const canvas = document.getElementById('mycanvas');
const saveBtn = document.getElementById('save-btn');
const app = new PIXI.Application({
    view: canvas,
    width: canvasWidth,
    height: canvasWidth * heightRatio,
    antialias: true,
    autoDensity: true,
});

app.stage.interactive = true;
app.stage.hitArea = app.renderer.screen;

const bgGuy = 'images/bg-guy.json';
const stuff = 'images/stuff.json';
const loader = PIXI.Loader.shared;

const dragNDrop = new PIXI.Container();
dragNDrop.width = app.screen.width;
dragNDrop.height = app.screen.height;

let selectedSprite;

const onDragStart = (e) => {
    e.target.alpha = 0.5;
    selectedSprite = e.target;
    app.stage.on('pointermove', onDragMove);
};

const onDragMove = (e) => {
    selectedSprite.parent.toLocal(e.data.global, null, selectedSprite.position);
};

const onDragEnd = () => {
    selectedSprite.alpha = 1;
    app.stage.off('pointermove', onDragMove);
};

const onResize = (e) => {
    if (selectedSprite) {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            const resize = e.code === 'ArrowDown' ? -0.02 : 0.02;
            selectedSprite.scale.x += resize;
            selectedSprite.scale.y += resize;
        }
    }
};

document.addEventListener('keydown', onResize);

const sprites = {};
const generateStuffSprites = (spriteSheet) => {
    Object.keys(spriteSheet.textures).forEach((texture, index) => {
        const textureName = texture.split('.')[0];
        spriteSheet.textures[texture].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        sprites[textureName] = new PIXI.Sprite(spriteSheet.textures[texture]);
        sprites[textureName].height *= 0.5;
        sprites[textureName].width *= 0.5;
        sprites[textureName].x = (app.screen.width * index) / 8;
        sprites[textureName].y = app.screen.height * 0.85;
        sprites[textureName].anchor.set(0.5);
        sprites[textureName].interactive = true;
        sprites[textureName].buttonMode = true;
        if (textureName === 'NewspaperBox_01') {
            sprites.NewspaperBox_01.scale.set(1.2);
            sprites.NewspaperBox_01.zIndex = -1;
        }

        sprites[textureName].on('pointerdown', onDragStart);
        sprites[textureName].on('pointerup', onDragEnd);
        sprites[textureName].on('pointerupoutside', onDragEnd);

        dragNDrop.addChild(sprites[textureName]);
    });
};

const onSetup = () => {
    const mainSheet = loader.resources[bgGuy].spritesheet;
    const stuffSheet = loader.resources[stuff].spritesheet;
    sprites.background = new PIXI.Sprite(mainSheet.textures['background.png']);
    sprites.background.height *= 0.5;
    sprites.background.width *= 0.5;
    app.stage.addChild(sprites.background);

    sprites.animatedGuy = new PIXI.AnimatedSprite(mainSheet.animations['capguy']);
    sprites.animatedGuy.height *= 0.5;
    sprites.animatedGuy.width *= 0.5;
    sprites.animatedGuy.x = app.screen.width * 0.1;
    sprites.animatedGuy.y = app.screen.height * 0.95;
    sprites.animatedGuy.anchor.set(1, 1);
    // sprites.animatedGuy.animationSpeed = 0.167;
    // sprites.animatedGuy.play();
    app.stage.addChild(sprites.animatedGuy);

    app.stage.addChild(dragNDrop);
    generateStuffSprites(stuffSheet);
};
loader.add(bgGuy).add(stuff).load(onSetup);

saveBtn.addEventListener('click', () => {
    const getData = dragNDrop.children.map((sprite) => {
        const texture = sprite.texture.textureCacheIds[0];
        const spriteData = {
            name: texture.split('.')[0],
            texture,
            alpha: sprite.alpha,
            anchor: {
                x: sprite.anchor.x,
                y: sprite.anchor.y,
            },
            scale: {
                x: sprite.scale.x,
                y: sprite.scale.y,
            },
            position: {
                x: sprite.position.x,
                y: sprite.position.y,
            },
        };
        return spriteData;
    });

    console.log(getData);
});
