/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or d to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import checkBoxImage from './img/check2.png';
import inforMation from './img/information.png';
import "./css/control.css";
import * as posenet_module from '@tensorflow-models/posenet';
import * as facemesh_module from '@tensorflow-models/facemesh';
import * as tf from '@tensorflow/tfjs';
import * as paper from 'paper';
import dat from 'dat.gui';
import Stats from 'stats.js';
import "babel-polyfill";

import {drawKeypoints, drawPoint, drawSkeleton, isMobile, toggleLoadingUI, /*setStatusText*/} from './utils/demoUtils';
import {SVGUtils} from './utils/svgUtils'
import {PoseIllustration} from './illustrationGen/illustration';
import {Skeleton, facePartName2Index} from './illustrationGen/skeleton';
import {FileUtils} from './utils/fileUtils';

import * as alpacaSVG from './resources/illustration/alpaca.svg';
import * as bearSVG from './resources/illustration/bear.svg';
import * as birdSVG from './resources/illustration/bird.svg';
import * as catSVG from './resources/illustration/cat.svg';
import * as chickenSVG from './resources/illustration/chicken.svg';
import * as dogSVG from './resources/illustration/dog.svg';
import * as fishSVG from './resources/illustration/fish.svg';
import * as foxSVG from './resources/illustration/fox.svg';
import * as giraffeSVG from './resources/illustration/giraffe.svg';
import * as gineapigSVG from './resources/illustration/gineapig.svg';
import * as hamsterSVG from './resources/illustration/hamster.svg';
import * as horseSVG from './resources/illustration/horse.svg';
import * as koalaSVG from './resources/illustration/koala.svg';
import * as lionSVG from './resources/illustration/lion.svg';
import * as lizardSVG from './resources/illustration/lizard.svg';
import * as rabbitSVG from './resources/illustration/rabbit.svg';
import * as turtleSVG from './resources/illustration/turtle.svg';
import { createElement } from 'parse5/lib/tree-adapters/default';
import { imageTensorToCanvas } from "face-api.js";

/*import * as tomSVG from './resources/illustration/tom.svg';
import * as blathersSVG from './resources/illustration/blathers.svg';
import * as girlSVG from './resources/illustration/girl.svg';
import * as boySVG from './resources/illustration/boy.svg';*/

// Camera stream video element
let video;
let videoWidth = 350;
let videoHeight = 300;

// Canvas
let faceDetection = null;
let illustration = null;
let canvasScope;
let canvasWidth = null;
let canvasHeight = null;

// ML models
let facemesh;
let posenet;
let minPoseConfidence = 0.15;
let minPartConfidence = 0.1;
let nmsRadius = 30.0;

// Misc
let mobile = false;
const stats = new Stats();
const avatarSvgs = {
  'alpaca': alpacaSVG.default,
  'bear': bearSVG.default,
  'bird': birdSVG.default,
  'cat': catSVG.default,
  'chicken': chickenSVG.default,
  'dog': dogSVG.default,
  'fish': fishSVG.default,
  'fox': foxSVG.default,
  'giraffe': giraffeSVG.default,
  'gineapig': gineapigSVG.default,
  'hamster': hamsterSVG.default,
  'horse': horseSVG.default,
  'koala': koalaSVG.default,
  'lion' : lionSVG.default,
  'lizard': lizardSVG.default,
  'rabbit': rabbitSVG.default,
  'turtle': turtleSVG.default,
  /*'girl': girlSVG.default,
  'boy': boySVG.default,
  'blathers': blathersSVG.default,
  'tom': tomSVG.default,*/
};

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: videoWidth,
      height: videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const defaultPoseNetArchitecture = 'MobileNetV1';
const defaultQuantBytes = 2;
const defaultMultiplier = 0.75;
const defaultStride = 16;
const defaultInputResolution = 200;

const guiState = {
  List: Object.keys(avatarSvgs)[0],
  debug: {
    showDetectionDebug: false,
    showIllustrationDebug: false,
  },
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras) {

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({width: 315});

  let multi = gui.addFolder('Your Avatar');
  gui.add(guiState, 'List', Object.keys(avatarSvgs)).onChange(() => parseSVG(avatarSvgs[guiState.List]));
  multi.open();

  ///*
  let output = gui.addFolder('Watch the tutorial');
  /*output.add(guiState.debug, 'showDetectionDebug');
  // output.add(guiState.debug, 'showIllustrationDebug');*/

  var divEle = document.createElement("control");
  divEle.innerHTML = `
  <div class="control-wrap">
<<<<<<< HEAD
  <div class="control-recommend"><h1>- We recommend Google Chrome browser.</h1></div>
=======
  <div class="control-recommend"><h1>We recommend Google Chrome browser.</h1></div>
>>>>>>> b711222c9cbf0a1cf1343393db3b3cc47051c7da
  <div class="ment-wrap">
  Add "Display Capture" on Broadcaster Right-click on the "Display Capture" Go to "properties" :</div>
  <div class="ment-box">
  <div class="ment-content-01">
  <div class="ment-title-01">
  <img src="${checkBoxImage}"><a>Show Cursor</a></div>
  <h1>: disabled.</h1>
   </div>
  <div class="ment-content-02">
  <div class="ment-title-02">
   <img src="${checkBoxImage}"><a>Crop</a></div>
   <h1>: You have to adjust as you wish.</h1>
  </div>
  </div>
  </div>
  </div>
`;
  output.domElement.appendChild(divEle)

  // console.log(output.domElement.appendChild(divEle))
  // gui.add2(guiState.debug, 'showIllustrationDebug');
  output.open();
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
/*
function setupFPS() {
  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);
}
*/

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video) {
  const canvas = document.getElementById('output');
  const keypointCanvas = document.getElementById('keypoints');
  const videoCtx = canvas.getContext('2d');
  const keypointCtx = keypointCanvas.getContext('2d');

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  keypointCanvas.width = videoWidth;
  keypointCanvas.height = videoHeight;

  async function poseDetectionFrame() {
    // Begin monitoring code for frames per second
    stats.begin();

    let poses = [];
   
    videoCtx.clearRect(0, 0, videoWidth, videoHeight);
    // Draw video
    videoCtx.save();
    videoCtx.scale(-1, 1);
    videoCtx.translate(-videoWidth, 0);
    videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    videoCtx.restore();

    // Creates a tensor from an image
    const input = tf.browser.fromPixels(canvas);
    faceDetection = await facemesh.estimateFaces(input, false, false);
    let all_poses = await posenet.estimatePoses(video, {
      flipHorizontal: true,
      decodingMethod: 'multi-person',
      maxDetections: 5,
      scoreThreshold: minPartConfidence,
      nmsRadius: nmsRadius
    });

    poses = poses.concat(all_poses);
    input.dispose();

    keypointCtx.clearRect(0, 0, videoWidth, videoHeight);
    if (guiState.debug.showDetectionDebug) {
      poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
          drawKeypoints(keypoints, minPartConfidence, keypointCtx);
          drawSkeleton(keypoints, minPartConfidence, keypointCtx);
        }
      });
      faceDetection.forEach(face => {
        Object.values(facePartName2Index).forEach(index => {
            let p = face.scaledMesh[index];
            drawPoint(keypointCtx, p[1], p[0], 2, 'red');
        });
      });
    }

    canvasScope.project.clear();

    if (poses.length >= 1 && illustration) {
      Skeleton.flipPose(poses[0]);

      if (faceDetection && faceDetection.length > 0) {
        let face = Skeleton.toFaceFrame(faceDetection[0]);
        illustration.updateSkeleton(poses[0], face);
      } else {
        illustration.updateSkeleton(poses[0], null);
      }
      illustration.draw(canvasScope, videoWidth, videoHeight);

      if (guiState.debug.showIllustrationDebug) {
        illustration.debugDraw(canvasScope);
      }
    }

    canvasScope.project.activeLayer.scale(
      canvasWidth / videoWidth, 
      canvasHeight / videoHeight, 
      new canvasScope.Point(0, 0));

    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

function setupCanvas() {
  mobile = isMobile();
  if (mobile) {
    canvasWidth = Math.min(window.innerWidth, window.innerHeight);
    canvasHeight = canvasWidth;
    videoWidth *= 0.7;
    videoHeight *= 0.7;
  }  

  canvasScope = paper.default;
  let canvas = document.querySelector('.illustration-canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvasScope.setup(canvas);
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  setupCanvas();

  toggleLoadingUI(true);
  //setStatusText('Loading PoseNet model...');
  posenet = await posenet_module.load({
    architecture: defaultPoseNetArchitecture,
    outputStride: defaultStride,
    inputResolution: defaultInputResolution,
    multiplier: defaultMultiplier,
    quantBytes: defaultQuantBytes
  });
  //setStatusText('Loading FaceMesh model...');
  facemesh = await facemesh_module.load();

  //setStatusText('Loading Avatar file...');
  let t0 = new Date();
  await parseSVG(Object.values(avatarSvgs)[0]);

  //setStatusText('Setting up camera...');
  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this device type is not supported yet, ' +
      'or this browser does not support video capture: ' + e.toString();
    info.style.display = 'block';
    throw e;
  }

  setupGui([], posenet);
  //setupFPS();
  
  toggleLoadingUI(false);
  detectPoseInRealTime(video, posenet);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
FileUtils.setDragDropHandler((result) => {parseSVG(result)});

async function parseSVG(target) {
  let svgScope = await SVGUtils.importSVG(target /* SVG string or file path */);
  let skeleton = new Skeleton(svgScope);
  illustration = new PoseIllustration(canvasScope);
  illustration.bindSkeleton(skeleton, svgScope);
}
    
bindPage();
