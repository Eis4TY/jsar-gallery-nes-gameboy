import { NES } from './jsnes/nes';
import { Controller } from './jsnes/controller';
import marioBin from './roms/mario.nes.bin';
import { Quaternion, Vector3 } from 'babylonjs';
import { NativeDocument, NativeEngine } from '@yodaos-jsar/dom/src/impl-interfaces';
//111111
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
      mat.emissiveColor = new BABYLON.Color3(1, 0.5, 1);
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

// floting Gameboy
// scene.registerAfterRender(() => {
//   model.getChildMeshes().forEach(child => {
//     if (child instanceof BABYLON.TransformNode) {
//       const offsetY = amplitude * Math.sin(t * speed);
//       child.position.y = offsetY;
//       child.rotation = new BABYLON.Vector3(offsetY, 0, 0);
//       }
//   });
//   t++;
// });


const buttons = spatialDocument.querySelectorAll('ref');
let buttonA;
let buttonB;
let buttonSTART;

for (const button of buttons) {
  if (button.id === 'model.GB_03_low_ButtonA.001__0.GB_03_low_ButtonA.001__0') {
    buttonA = button;
  }

  if (button.id === 'model.GB_03_low_ButtonA__0.GB_03_low_ButtonA__0') {
    buttonB = button;
  }
  
  if (button.id === 'model.GB_03_low_ButtonSelect__0.GB_03_low_ButtonSelect__0') {
    buttonSTART = button;
  }
}

if (buttonA) {
  buttonA.addEventListener('raydown', () => {
    console.log('raydown_BUTTON_A');
    nes.buttonDown(1, Controller.BUTTON_A);
  });
  buttonA.addEventListener('rayup', () => {
    console.log('rayup_BUTTON_A');
    nes.buttonUp(1, Controller.BUTTON_A);
  });
}

if (buttonB) {
  buttonB.addEventListener('raydown', () => {
    console.log('raydown_BUTTON_B');
    nes.buttonDown(1, Controller.BUTTON_B);
  });
  buttonB.addEventListener('rayup', () => {
    console.log('rayup_BUTTON_B');
    nes.buttonUp(1, Controller.BUTTON_B);
  });
}
if (buttonSTART) {
  buttonSTART.addEventListener('rayenter', () => {
    buttonSTART.asNativeType().material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  });
  buttonSTART.addEventListener('rayleave', () => {
    buttonSTART.asNativeType().material.emissiveColor = new BABYLON.Color3(0, 0, 0);
  });
  buttonSTART.addEventListener('raydown', () => {
    console.log('raydown_BUTTON_START');
    nes.buttonDown(1, Controller.BUTTON_START);
  });
  buttonSTART.addEventListener('rayup', () => {
    console.log('rayup_BUTTON_START');
    nes.buttonUp(1, Controller.BUTTON_START);
  });
}


const container = spaceDocument.querySelector('#container');

const box_LEFT = spaceDocument.createElement('cube');
box_LEFT.setAttribute('size', '0.6');
container.appendChild(box_LEFT);
var mesh_LEFT = box_LEFT.asNativeType()

const box_RIGHT = spaceDocument.createElement('cube');
box_RIGHT.setAttribute('size', '0.6');
container.appendChild(box_RIGHT);
var mesh_RIGHT = box_RIGHT.asNativeType()

var invisableMaterial = new BABYLON.StandardMaterial("transparentMaterial", scene);
invisableMaterial.alpha = 0;

if (mesh_RIGHT instanceof BABYLON.Mesh) {
  mesh_RIGHT.position = new BABYLON.Vector3(-1, -0.3, -0.7);
  mesh_RIGHT.material = invisableMaterial;
}
if (mesh_LEFT instanceof BABYLON.Mesh) {
  mesh_LEFT.position = new BABYLON.Vector3(-1.7, -0.3, -0.7);
  mesh_LEFT.material = invisableMaterial;
}

box_LEFT.addEventListener('raydown', () => {
  console.log('raydown_BUTTON_LEFT');
  nes.buttonDown(1, Controller.BUTTON_LEFT);
});
box_LEFT.addEventListener('rayup', () => {
  console.log('rayup_BUTTON_LEFT');
  nes.buttonUp(1, Controller.BUTTON_LEFT);
});

box_RIGHT.addEventListener('raydown', () => {
  console.log('raydown_BUTTON_RIGHT');
  nes.buttonDown(1, Controller.BUTTON_RIGHT);
});
box_RIGHT.addEventListener('rayup', () => {
  console.log('rayup_BUTTON_RIGHT');
  nes.buttonUp(1, Controller.BUTTON_RIGHT);
});