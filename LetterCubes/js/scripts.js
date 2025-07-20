import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import * as dat from 'https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js';
import { EXRLoader } from './libs/EXRLoader.js';

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();

const settings = {
  collapseProgress: 0,
  cubeRotationSpeed: 0.01,
  meshRotationSpeed: 0.002,
  gravityMode: false,
  superForce: false,
};

function resetGame() {
  //location.reload();
  settings.gravityMode = false;
  createCubes(uniques);
}

// Camera and Renderer
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000); // Vertical field of view, Aspect Ratio, Near Clipping Plane (rendering limit), Far Clipping Plane
camera.position.set(-5.1, 0.81, -3.78);
camera.rotation.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

//Exr Background Loader
const loader = new EXRLoader();
loader.load(
  './image/11.exr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
  }
);

// OrbitControls 
const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

// Letter Textures
function createLetterTexture(letter) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5f5f5'; //letter colors --> light grey
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 20); //rounded rectangle origin on top left corner
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.font = 'bold 84px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size / 2, size / 2 + 5);
  return new THREE.CanvasTexture(canvas);
}

// Cube Collision - Aligned Bounding Box
function checkCubeCollision(cubeA, cubeB) {
  const a = cubeA.position;
  const b = cubeB.position;

  const size = 0.4; // half-size of cube
  return Math.abs(a.x - b.x) < size && Math.abs(a.y - b.y) < size && Math.abs(a.z - b.z) < size; //distance on every axes
  
}



function resolveCubeCollision(cubeA, cubeB) {
  const dir = new THREE.Vector3().subVectors(cubeA.position, cubeB.position); // create new vector and subtract cubeA vector and cubeB vector --> gives a direction vector pointing from cube B to cube A
  if (dir.lengthSq() === 0) dir.set(Math.random(), 0, Math.random()); //if the distance is 0 --> the cubes are perfectly overlapping, creates a random direction vector
  dir.normalize(); //unit vector
  const pushDistance = 0.05;
  cubeA.position.addScaledVector(dir, pushDistance);
  cubeB.position.addScaledVector(dir, -pushDistance);
}


//Plane Creation
const groundGeo = new THREE.PlaneGeometry(200, 20);
const groundMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,          
  metalness: 0,
  roughness: 0,
  transmission: 0.9,        // transparency / glass effect
  opacity: 0.3,            
  transparent: true,
  clearcoat: 1,
  clearcoatRoughness: 0,  
  reflectivity: 0.5,
  envMapIntensity: 1.0
});

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.rotation.z = 4 * Math.PI / 5;
ground.position.y = -4; 
ground.receiveShadow = true;
scene.add(ground);



//Unique Vertex Ectraction
const icoGeo = new THREE.IcosahedronGeometry(3, 1);
const positions = icoGeo.attributes.position;
//console.log(positions);
const uniques = [];
const temp = new THREE.Vector3();
for (let i = 0; i < positions.count; i++) {
  temp.fromBufferAttribute(positions, i);
  if (!uniques.some(v => v.equals(temp))) uniques.push(temp.clone()); //remove duplicates because we have overlapping triangles
}



// Words and letters setup

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

const necessaryLetters = 'INTERACTIVEMAPUBLEVISUZAOGMRSPNSS'.split('');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function fillOtherLetters(array, targetLength) {
  let count = 0;
  while (array.length < targetLength) {
    array.push(alphabet[count % alphabet.length]);
    count+=1;
  }
  return array;
}
let cubeLetters = fillOtherLetters(necessaryLetters.slice(), uniques.length);
shuffleArray(cubeLetters);

const wordList = ["INTERACTIVE", "MANIPULATABLE", "VISUALIZATION", "AUGMENTATION", "RESPONSIVENESS"];
const targetWord = wordList[Math.floor(Math.random() * wordList.length)];
let letterIndex = 0;

const wordDisplay = document.getElementById('wordDisplay');
if (wordDisplay) wordDisplay.innerText = `Spell the word: ${targetWord}`;

// Cube creation
const geometry = new THREE.BoxGeometry();
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);
const cubeMeshes = [];
const cubeRotations = [];
const cubeVelocities = [];
const cubeData = new Map();

function getRandomColor() {
  const hue = Math.random();
  const sat = 0.5 + Math.random() * 0.3;
  const light = 0.5 + Math.random() * 0.3;
  return new THREE.Color().setHSL(hue, sat, light);
}

function createCubes(positions) {
  cubeGroup.clear();
  cubeMeshes.length = 0;
  cubeVelocities.length = 0;
  cubeData.clear();
  cubeRotations.length = 0;
  shuffleArray(cubeLetters);

  positions.forEach((pos, idx) => {
    const letter = cubeLetters[idx];
    const tex = createLetterTexture(letter);
    const color = getRandomColor();

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: color,
      metalness: 0.1,
      roughness: 0.6
    });

    
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(pos);
    mesh.scale.setScalar(0.4);
    mesh.userData.letter = letter;

    cubeGroup.add(mesh);
    cubeMeshes.push(mesh);
    cubeRotations.push(new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ));
    cubeVelocities.push(new THREE.Vector3());
    cubeData.set(mesh, {
    shrinking: false,
    shrinkProgress: 0,
    originalPosition: pos.clone()
  });
    });
}

createCubes(uniques);

//Timer
let timerStarted = false;
let startTime = 0;
let elapsedTime = 0;

// Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048); //shadow resolution 512 --> 2048
dirLight.shadow.camera.near = 1; //near limit for shadows
dirLight.shadow.camera.far = 20; //far limit
dirLight.shadow.camera.left = -10; //left limit
dirLight.shadow.camera.right = 10; //right limit
dirLight.shadow.camera.top = 10; //top limit
dirLight.shadow.camera.bottom = -10; //bottom limit
scene.add(dirLight);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));

const dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
dirLightHelper.visible = false; // Hide it initially
scene.add(dirLightHelper);

const lightSettings = {
  showHelper: false
};


///Show message
function showMessage(text, duration = 3000) {
  const msgDiv = document.getElementById('gameMessage');
  if (!msgDiv) return;
  msgDiv.innerText = text;
  msgDiv.style.display = 'block';
  clearTimeout(msgDiv._timeout);
  msgDiv._timeout = setTimeout(() => {
    msgDiv.style.display = 'none';
  }, duration);
}


//Click with raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', onClick);

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(cubeMeshes);
  if (!hits.length) return; //if no hit, return early
  const mesh = hits[0].object; //first cube that's hit


  if (settings.gravityMode) {
  const velocity = cubeVelocities[cubeMeshes.indexOf(mesh)];
  if (settings.superForce) {
    velocity.x = 0;
    velocity.y = 0.2 + Math.random() * 0.15;
    velocity.z = (Math.random() - 0.5) * 2;
  } else {
    velocity.x = (Math.random() - 0.5) * 0.15;
    velocity.y = 0.2 + Math.random() * 0.15;
    velocity.z = (Math.random() - 0.5) * 0.15;
  }
  mesh.scale.setScalar(0.8);
  return;
}

  const letter = mesh.userData.letter;
  if (letter === targetWord[letterIndex]) {
    // Start timer on first letter
    if (!timerStarted) {
      timerStarted = true;
      startTime = performance.now();
    }

    cubeData.get(mesh).shrinking = true;
    letterIndex++;
    settings.meshRotationSpeed += 0.005;

    if (letterIndex >= targetWord.length) {
      elapsedTime = (performance.now() - startTime) / 1000; // from miliseconds to seconds
      showMessage(`🎉 You spelled "${targetWord}" correctly in ${elapsedTime.toFixed(2)} seconds!`);
      letterIndex = 0;
      timerStarted = false; // reset timer for next round or reload game
    }
  }
}

const lightPivot = new THREE.Object3D();
scene.add(lightPivot);
lightPivot.add(dirLight);


//GUI
const gui = new dat.GUI();

gui.add(lightSettings, 'showHelper').name('Show Helper').onChange(val => {
  dirLightHelper.visible = val;
});

const lightFolder = gui.addFolder('Directional Light');
lightFolder.add(lightPivot.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
lightFolder.add(lightPivot.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
lightFolder.add(lightPivot.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');

const rotationFolder = gui.addFolder('Rotation Speeds');
rotationFolder.add(settings, 'cubeRotationSpeed', 0.001, 0.1).name('Cube Spin');
rotationFolder.add(settings, 'meshRotationSpeed', 0.001, 0.05).name('Mesh Spin');

const collapseFolder = gui.addFolder('Collapse Settings');
collapseFolder.add(settings, 'collapseProgress', 0, 1, 0.01).name('Collapse Progress');

gui.add(settings, 'gravityMode').name('Gravity Mode').onChange(toggleGravityMode);

gui.add(settings, 'superForce').name('Super Force');

gui.add({ reset: resetGame }, 'reset').name('Reset Game');



//STUDIA
function isOverPlane(cube) {
const localPos = cube.position.clone();
// Inverse rotate the cube to match plane's orientation
const inverseRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -ground.rotation.z)); //works better with 0 as x
localPos.applyQuaternion(inverseRot);

// Ground is centered at (0, 0) with size 200 x 20
return Math.abs(localPos.x) < 100 && Math.abs(localPos.z) < 10;

}


//Animate Loop
function animate() {

  requestAnimationFrame(animate);
  cubeMeshes.forEach((mesh, i) => {
    const data = cubeData.get(mesh);
    //Collapse
    if (!data.shrinking && !settings.gravityMode) {
      const t = settings.collapseProgress;
      const target = new THREE.Vector3(0, 0, 0);
      const original = data.originalPosition;
      const newPos = original.clone().lerp(target, t); //linearly interpolate from cube original position to center (0,0,0)
      mesh.position.copy(newPos);
    }
    const rot = cubeRotations[i];

    if (settings.gravityMode) {
      cubeVelocities[i].y -= 0.01;
      mesh.position.add(cubeVelocities[i]);
      if (mesh.position.y < -3.8) {
        if (isOverPlane(mesh)) {
          mesh.position.y = -3.8;
          cubeVelocities[i].x = 0;  
          cubeVelocities[i].y *= -0.4;
          cubeVelocities[i].z = 0;

          mesh.rotation.set(0, Math.round(mesh.rotation.y / (Math.PI / 2)) * (Math.PI / 2), 0); //face down on plane

          if (Math.abs(cubeVelocities[i].y) < 0.07) {
            cubeVelocities[i].y = 0;
            mesh.scale.setScalar(0.4);
          }
        } else {

          //Fall off plane animation
          if (mesh.position.y < -10) {
            cubeGroup.remove(mesh);
          }
        }
      }

    } else {
      rot.x += settings.cubeRotationSpeed;
      rot.y += settings.cubeRotationSpeed;
      mesh.rotation.copy(rot);
    }

    if (data.shrinking) {
      data.shrinkProgress += 0.05;
      mesh.position.lerp(new THREE.Vector3(0, 0, 0), data.shrinkProgress);
      const scale = Math.max(0, 0.4 * (1 - data.shrinkProgress));
      mesh.scale.setScalar(scale);
      if (scale <= 0.01) {
        cubeGroup.remove(mesh);
      }
    }
  });

  //Collision detection and resolution (Axis-Aligned-Bounding-Box)

  if (settings.gravityMode) {

    for (let i = 0; i < cubeMeshes.length; i++) {
      for (let j = i + 1; j < cubeMeshes.length; j++) {
        if (checkCubeCollision(cubeMeshes[i], cubeMeshes[j])) {
          resolveCubeCollision(cubeMeshes[i], cubeMeshes[j]);
        }
      }
    }
  } 



  if (!settings.gravityMode) {
    cubeGroup.rotation.y += settings.meshRotationSpeed;
  }

  

  renderer.render(scene, camera);
  ctrls.update();
}

animate();

//Gravity Mode
function toggleGravityMode(enabled) {
  if (enabled) {
    cubeMeshes.forEach((mesh, i) => {
      cubeVelocities[i].x = (Math.random() - 0.5) * 0.2;
      cubeVelocities[i].y = (Math.random() + 0.4) * 0.3;
      cubeVelocities[i].z = (Math.random() - 0.5) * 0.2;
      });

  } else{
    resetGame();
  }
}

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});