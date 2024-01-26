import { NES } from './jsnes/nes';
import { Controller } from './jsnes/controller';
import marioBin from './roms/mario.nes.bin';
import { Quaternion, Vector3 } from 'babylonjs';

const { scene } = spatialDocument;

let t = 0;
const amplitude = 0.4; // 浮动的幅度
const speed = 0.02; // 浮动的速度

var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 260;

var FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

let targetGameObject: BABYLON.Mesh;
const model = spatialDocument.getNodeById('model');


const groundTex = new BABYLON.DynamicTexture("dynamic texture", {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
}, scene, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, BABYLON.Engine.TEXTUREFORMAT_RGBA, false);

spatialDocument.addEventListener('spaceReady', () => {
  const screen = model.getChildMeshes().find(mesh => mesh.name === 'model.GB_02_low_Screen__0');
  if (screen) {
    {
      const mat = new BABYLON.StandardMaterial('mat', scene);
      mat.roughness = 1;

      mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
      mat.diffuseTexture = groundTex;
      
      mat.diffuseTexture.scale(5.4);

      screen.material = mat;

    }
    targetGameObject = screen as BABYLON.Mesh;
  }
});


const context2d = groundTex.getContext();

var buffer = new ArrayBuffer(FRAMEBUFFER_SIZE * 4);
var framebuffer_u8 = new Uint8ClampedArray(buffer);
var framebuffer_u32 = new Uint32Array(buffer);

var nes = new NES({
  onFrame: function (framebuffer_24) {
    for (var i = 0; i < FRAMEBUFFER_SIZE; i++) {
      framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
    }
    const imageData = new ImageData(framebuffer_u8, SCREEN_WIDTH, SCREEN_HEIGHT);
    context2d.putImageData(imageData, 545, 685);
    groundTex.update(true);
  },
  onAudioSample: function (left, right) {
    // ... play audio sample
  }
});

const romData = Buffer.from(marioBin).toString('binary');
nes.loadROM(romData);

scene.registerAfterRender(function () {
  nes.frame();
});


scene.registerAfterRender(() => {
  model.getChildMeshes().forEach(child => {
    if (child instanceof BABYLON.TransformNode) {
      const offsetY = amplitude * Math.sin(t * speed);
      child.position.y = offsetY;
      child.rotation = new BABYLON.Vector3(offsetY, 0, 0);
      }
  });
  t++;
});

function keyboard(callback, code) {
  var player = 1;
  switch (code) {
    case 38: // UP
      callback(player, Controller.BUTTON_UP); break;
    case 40: // Down
      callback(player, Controller.BUTTON_DOWN); break;
    case 37: // Left
      callback(player, Controller.BUTTON_LEFT); break;
    case 39: // Right
      callback(player, Controller.BUTTON_RIGHT); break;
    case 65: // 'a' - qwerty, dvorak
    case 81: // 'q' - azerty
      callback(player, Controller.BUTTON_A); break;
    case 83: // 's' - qwerty, azerty
    case 79: // 'o' - dvorak
      callback(player, Controller.BUTTON_B); break;
    case 9: // Tab
      callback(player, Controller.BUTTON_SELECT); break;
    case 13: // Return
      callback(player, Controller.BUTTON_START); break;
    default: break;
  }
}

spatialDocument.watchInputEvent();
spatialDocument.addEventListener('mouse', (event: any) => {
  const { inputData } = event;
  if (inputData.Action === 'down') {
    keyboard(nes.buttonDown, 13);
  } else if (inputData.Action === 'up') {
    keyboard(nes.buttonUp, 13);
  }
});
