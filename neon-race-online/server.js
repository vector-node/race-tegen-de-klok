
import * as THREE from "three";

// Multiplayer is optioneel: GitHub Pages heeft geen eigen Socket.IO-server.
const socket = typeof window.io === "function"
  ? window.io()
  : {
      connected: false,
      id: null,
      on() {},
      emit() {}
    };

const statusEl = document.querySelector("#status");
const playersEl = document.querySelector("#players");
const messageEl = document.querySelector("#message");
const startButton = document.querySelector("#start");
const lapEl = document.querySelector("#lap");
const difficultyEl = document.querySelector("#difficultyValue");

if (!socket.connected) {
  statusEl.textContent = "OFFLINE — lokale race";
  playersEl.textContent = "Spelers: 1 (offline)";
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#05051a");
scene.fog = new THREE.FogExp2("#08051f", 0.009);

const camera = new THREE.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  0.1,
  500
);
camera.position.set(0, 7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x687dff, 0x170a38, 1.3));

const sun = new THREE.DirectionalLight(0x7e8cff, 1.7);
sun.position.set(-20, 35, 15);
sun.castShadow = true;
scene.add(sun);

const pinkLight = new THREE.PointLight(0xff19d0, 80, 95);
pinkLight.position.set(0, 9, -13);
scene.add(pinkLight);

const cyanLight = new THREE.PointLight(0x00d9ff, 70, 90);
cyanLight.position.set(0, 7, 15);
scene.add(cyanLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({
    color: "#080d25",
    roughness: 0.85,
    metalness: 0.1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;
ground.receiveShadow = true;
scene.add(ground);

// Neon circuit.
const trackGroup = new THREE.Group();
scene.add(trackGroup);

const outerA = 29;
const outerB = 18;
const innerA = 20;
const innerB = 9;

const verts = [];
const indices = [];
const segments = 180;

for (let i = 0; i <= segments; i++) {
  const t = (i / segments) * Math.PI * 2;

  verts.push(Math.cos(t) * outerA, 0, Math.sin(t) * outerB);
  verts.push(Math.cos(t) * innerA, 0, Math.sin(t) * innerB);

  if (i < segments) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

const roadGeo = new THREE.BufferGeometry();
roadGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(verts, 3)
);
roadGeo.setIndex(indices);
roadGeo.computeVertexNormals();

const road = new THREE.Mesh(
  roadGeo,
  new THREE.MeshStandardMaterial({
    color: "#17182d",
    emissive: "#100b28",
    emissiveIntensity: 0.75,
    side: THREE.DoubleSide,
    roughness: 0.35,
    metalness: 0.45
  })
);

road.position.y = 0.01;
road.receiveShadow = true;
trackGroup.add(road);

// Neon rails.
function addNeonRail(a, b, color, y = 0.25) {
  const points = [];

  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(t) * a,
        y,
        Math.sin(t) * b
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(points, true);

  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 240, 0.10, 6, true),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 3.2
    })
  );

  scene.add(mesh);
}

addNeonRail(29.5, 18.5, "#00d9ff", 0.23);
addNeonRail(19.5, 8.5, "#ff21d4", 0.20);

// Track markers.
const markerMat = new THREE.MeshStandardMaterial({
  color: "#f5f6ff",
  emissive: "#00cfff",
  emissiveIntensity: 1.2
});

for (let i = 0; i < 72; i++) {
  const t = (i / 72) * Math.PI * 2;

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.045, 0.12),
    markerMat
  );

  marker.position.set(
    Math.cos(t) * 24.5,
    0.07,
    Math.sin(t) * 13.5
  );

  marker.rotation.y = -t;
  trackGroup.add(marker);
}

// Neon barriers.
for (let i = 0; i < 64; i++) {
  const t = (i / 64) * Math.PI * 2;

  const block = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.55, 0.65),
    new THREE.MeshStandardMaterial({
      color: i % 2 ? "#111a3c" : "#351038",
      emissive: i % 2 ? "#00cfff" : "#ff149d",
      emissiveIntensity: 1.8,
      metalness: 0.3
    })
  );

  block.position.set(
    Math.cos(t) * 31,
    0.28,
    Math.sin(t) * 20
  );

  block.rotation.y = -t;
  block.castShadow = true;
  scene.add(block);
}

// Finish gate.
const gateMat = new THREE.MeshStandardMaterial({
  color: "#ff4df0",
  emissive: "#ff10df",
  emissiveIntensity: 2.5
});

const gateTop = new THREE.Mesh(
  new THREE.BoxGeometry(8, 0.35, 0.35),
  gateMat
);

gateTop.position.set(0, 4.2, -13.5);
scene.add(gateTop);

for (const x of [-3.8, 3.8]) {
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 4.2, 0.28),
    gateMat
  );

  post.position.set(x, 2.1, -13.5);
  scene.add(post);
}

for (let i = 0; i < 8; i++) {
  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.05, 0.62),
    new THREE.MeshStandardMaterial({
      color: i % 2 ? "#111426" : "#ffffff",
      emissive: i % 2 ? "#111426" : "#00d9ff",
      emissiveIntensity: i % 2 ? 0.2 : 1.5
    })
  );

  tile.position.set(-3.5 + i, 0.12, -13.5);
  scene.add(tile);
}

// Neon city.
for (let i = 0; i < 34; i++) {
  const angle = (i / 34) * Math.PI * 2;
  const radius = 58 + (i % 5) * 5;
  const height = 5 + (i % 6) * 2.6;

  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(
      3 + (i % 3),
      height,
      3 + (i % 2)
    ),
    new THREE.MeshStandardMaterial({
      color: "#0c1233",
      emissive: i % 2 ? "#091a46" : "#240b3b",
      emissiveIntensity: 1.0,
      metalness: 0.55,
      roughness: 0.4
    })
  );

  tower.position.set(
    Math.cos(angle) * radius,
    height / 2 - 0.1,
    Math.sin(angle) * radius
  );

  scene.add(tower);

  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, height * 0.75, 0.09),
    new THREE.MeshStandardMaterial({
      color: i % 2 ? "#00d9ff" : "#ff21d4",
      emissive: i % 2 ? "#00d9ff" : "#ff21d4",
      emissiveIntensity: 3.0
    })
  );

  strip.position.set(
    tower.position.x - 0.6,
    height * 0.5,
    tower.position.z + 1.53
  );

  scene.add(strip);
}

// Build a car.
function makeCar(color, isLocal = false) {
  const group = new THREE.Group();

  const paint = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.45,
    roughness: 0.24,
    emissive: color,
    emissiveIntensity: 0.25
  });

  const dark = new THREE.MeshStandardMaterial({
    color: "#080b18",
    roughness: 0.45
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.48, 3),
    paint
  );

  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 0.5, 1.25),
    new THREE.MeshStandardMaterial({
      color: "#bdeaff",
      emissive: "#147ca0",
      emissiveIntensity: 0.65,
      metalness: 0.4,
      roughness: 0.18
    })
  );

  cabin.position.set(0, 1.05, -0.15);
  cabin.castShadow = true;
  group.add(cabin);

  for (const x of [-0.88, 0.88]) {
    for (const z of [-0.95, 0.95]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12),
        dark
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      group.add(wheel);
    }
  }

  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.09, 0.08),
    new THREE.MeshStandardMaterial({
      color: "#ff20d8",
      emissive: "#ff20d8",
      emissiveIntensity: 3
    })
  );

  tail.position.set(0, 0.72, 1.53);
  group.add(tail);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.1, 0.08),
    new THREE.MeshStandardMaterial({
      color: "#00eaff",
      emissive: "#00eaff",
      emissiveIntensity: 3
    })
  );

  nose.position.set(0, 0.68, -1.52);
  group.add(nose);

  group.userData.isLocal = isLocal;
  return group;
}

// Player's car.
const localCar = makeCar("#2deaff", true);
scene.add(localCar);
localCar.position.set(0, 0, 13.5);

const remoteCars = new Map();
const keys = new Set();

let started = false;
let speed = 0;
let steering = 0;
let lastSend = 0;
let laps = 0;
let lastFinishZ = localCar.position.z;
let finishCooldown = 0;

let wins = Number(sessionStorage.getItem("neonRaceWins") || 0);
let difficulty = wins + 1;

difficultyEl.textContent = String(difficulty);
lapEl.textContent = "0/3";

let raceComplete = false;

// Keyboard controls.
addEventListener("keydown", (e) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      .includes(e.key)
  ) {
    e.preventDefault();
  }

  keys.add(e.key.toLowerCase());

  if (e.key.startsWith("Arrow")) {
    keys.add(e.key);
  }
});

addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
  keys.delete(e.key);
});

// Mobile controls.
document.querySelectorAll("#touchControls button").forEach(button => {
  const key = button.dataset.key;

  const down = (e) => {
    e.preventDefault();
    keys.add(key);
  };

  const up = (e) => {
    e.preventDefault();
    keys.delete(key);
  };

  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointerleave", up);
  button.addEventListener("pointercancel", up);
});

// Start button.
startButton.addEventListener("click", () => {
  started = true;
  raceComplete = false;
  laps = 0;
  speed = 0;
  lastFinishZ = localCar.position.z;
  finishCooldown = 0;

  lapEl.textContent = "0/3";
  messageEl.style.display = "none";
});

// Multiplayer events. These are harmless when offline.
socket.on("connect", () => {
  statusEl.textContent = "ONLINE ✓";
});

socket.on("disconnect", () => {
  statusEl.textContent = "VERBINDING VERBROKEN";
});

socket.on("currentPlayers", (players) => {
  players.forEach(p => {
    if (p.id !== socket.id) addRemote(p);
  });

  updatePlayerCount();
});

socket.on("playerJoined", (p) => {
  addRemote(p);
  updatePlayerCount();
});

socket.on("playerMoved", (p) => {
  const item = remoteCars.get(p.id);
  if (!item) return;

  item.target.set(p.x, 0, p.z);
  item.targetRotation = p.rotation;
});

socket.on("playerLeft", (id) => {
  const item = remoteCars.get(id);

  if (item) {
    scene.remove(item.car);
    remoteCars.delete(id);
  }

  updatePlayerCount();
});

function addRemote(p) {
  if (p.id === socket.id || remoteCars.has(p.id)) return;

  const car = makeCar(p.color || "#ff4d6d");
  car.position.set(p.x || 0, 0, p.z || 0);
  car.rotation.y = p.rotation || 0;

  scene.add(car);

  remoteCars.set(p.id, {
    car,
    target: new THREE.Vector3(p.x || 0, 0, p.z || 0),
    targetRotation: p.rotation || 0
  });
}

function updatePlayerCount() {
  playersEl.textContent = "Spelers: " + (remoteCars.size + 1);
}

function showResult(won) {
  started = false;
  raceComplete = true;

  if (won) {
    wins += 1;
    sessionStorage.setItem("neonRaceWins", String(wins));

    difficulty = wins + 1;
    difficultyEl.textContent = String(difficulty);

    messageEl.querySelector("h1").textContent = "RACE GEWONNEN!";
    messageEl.querySelector("p").textContent =
      `Goed gedaan! De volgende race wordt moeilijker (niveau ${difficulty}).`;

    startButton.textContent = "VOLGENDE RACE";

    messageEl.querySelector("small").textContent =
      "Geen levens: blijf proberen en versla je eigen record.";
  }

  messageEl.style.display = "block";
}

function checkFinishLine() {
  const z = localCar.position.z;

  if (finishCooldown > 0) {
    finishCooldown--;
  }

  if (
    finishCooldown === 0 &&
    lastFinishZ > -13.5 &&
    z <= -13.5 &&
    Math.abs(localCar.position.x) < 4.5
  ) {
    laps++;
    lapEl.textContent = `${Math.min(laps, 3)}/3`;
    finishCooldown = 50;

    if (laps >= 3) {
      showResult(true);
    }
  }

  lastFinishZ = z;
}

// Main game loop.
function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min(
    0.04,
    animate.last ? (now - animate.last) / 1000 : 0.016
  );

  animate.last = now;

  if (started) {
    const forward = keys.has("w") || keys.has("arrowup");
    const backward = keys.has("s") || keys.has("arrowdown");
    const left = keys.has("a") || keys.has("arrowleft");
    const right = keys.has("d") || keys.has("arrowright");
    const brake = keys.has(" ");

    const maxSpeed = Math.min(24 + (difficulty - 1) * 1.8, 36);
    const acceleration = 13 + Math.min(difficulty - 1, 8) * 0.65;

    if (forward) {
      speed += acceleration * dt;
    } else if (backward) {
      speed -= 9 * dt;
    } else {
      speed *= Math.pow(0.94, dt * 60);
    }

    if (brake) {
      speed *= Math.pow(0.82, dt * 60);
    }

    speed = THREE.MathUtils.clamp(speed, -7, maxSpeed);

    const steeringInput = (left ? 1 : 0) - (right ? 1 : 0);

    steering = THREE.MathUtils.damp(
      steering,
      steeringInput,
      Math.max(3.5, 7 - (difficulty - 1) * 0.15),
      dt
    );

    if (Math.abs(speed) > 0.3) {
      localCar.rotation.y +=
        steering *
        dt *
        (1.7 * Math.sign(speed)) *
        Math.min(1, Math.abs(speed) / 5);
    }

    localCar.position.x -=
      Math.sin(localCar.rotation.y) * speed * dt;

    localCar.position.z -=
      Math.cos(localCar.rotation.y) * speed * dt;

    localCar.position.x = THREE.MathUtils.clamp(
      localCar.position.x,
      -55,
      55
    );

    localCar.position.z = THREE.MathUtils.clamp(
      localCar.position.z,
      -40,
      40
    );

    checkFinishLine();
  }

  const behind = new THREE.Vector3(
    localCar.position.x + Math.sin(localCar.rotation.y) * 8,
    localCar.position.y + 5.2,
    localCar.position.z + Math.cos(localCar.rotation.y) * 8
  );

  camera.position.lerp(behind, 1 - Math.pow(0.001, dt));

  camera.lookAt(
    localCar.position.x,
    0.6,
    localCar.position.z
  );

  for (const item of remoteCars.values()) {
    item.car.position.lerp(
      item.target,
      1 - Math.pow(0.0001, dt)
    );

    let diff = item.targetRotation - item.car.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));

    item.car.rotation.y += diff * Math.min(1, dt * 8);
  }

  if (socket.connected && now - lastSend > 50) {
    socket.emit("playerMove", {
      x: localCar.position.x,
      z: localCar.position.z,
      rotation: localCar.rotation.y
    });

    lastSend = now;
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// Resize camera when the browser window changes.
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
