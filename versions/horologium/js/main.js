// ============================================================================
// FINIS TEMPORIS · 《时间的尽头》
// Main 3D Scene Orchestrator, Post-Processing Pipeline & Interactive Physics
// ============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import {
  AccretionDiskShader,
  SingularitySphereShader,
  SpacetimeGridShader,
  ChrononParticleShader,
  ChronoLensPostShader
} from './shaders.js';
import { CelestialHorologium, TEMPORAL_RELICS_DATA } from './horologium.js';
import { ChronoAudioEngine } from './audio.js';

const EPOCH_CONFIGS = [
  {
    id: 0,
    name: '秩序之轮 · Celestial Horologium',
    epigraph: '“当第一缕星光校准浑天仪的刻度，万物皆在开普勒的黄金律令中周而复始。”',
    timeScale: 1.0,
    gravityDepth: 13.5,
    lensStrength: 0.011,
    chromatic: 0.0009,
    bloomStrength: 0.48,
    primaryColor: '#E8B86D',
    secondaryColor: '#C85A32',
    accentCyan: '#72B8D4',
    gridColor: '#8B6B3B',
    cameraPos: new THREE.Vector3(-15.5, 14.2, 28.5),
    cameraTarget: new THREE.Vector3(0, 0, 0)
  },
  {
    id: 1,
    name: '引力膨胀 · Relativistic Dilation',
    epigraph: '“逼近史瓦西视界，时空度规坍塌为无底深渊；外界千载流逝，此处不过一息。”',
    timeScale: 0.25,
    gravityDepth: 23.0,
    lensStrength: 0.019,
    chromatic: 0.0014,
    bloomStrength: 0.58,
    primaryColor: '#FFB366',
    secondaryColor: '#D9381E',
    accentCyan: '#64DFDF',
    gridColor: '#C85A32',
    cameraPos: new THREE.Vector3(21.0, 5.8, 21.5),
    cameraTarget: new THREE.Vector3(0, -1.0, 0)
  },
  {
    id: 2,
    name: '熵寂逆流 · Entropic Reversal',
    epigraph: '“热力学之箭在相空间尽头折返，破碎的星尘与记忆晶格逆着时间长河重聚。”',
    timeScale: -1.35,
    gravityDepth: 11.0,
    lensStrength: 0.014,
    chromatic: 0.0011,
    bloomStrength: 0.52,
    primaryColor: '#9D7FEA',
    secondaryColor: '#4A6FA5',
    accentCyan: '#90E0EF',
    gridColor: '#5E60CE',
    cameraPos: new THREE.Vector3(4.0, 26.5, 24.0),
    cameraTarget: new THREE.Vector3(0, 0, 0)
  },
  {
    id: 3,
    name: '奇点终焉 · Omega Singularity',
    epigraph: '“在时间的尽头，过去与未来坍缩为同一道永恒的光环，万籁俱寂，唯光长存。”',
    timeScale: 0.03,
    gravityDepth: 26.5,
    lensStrength: 0.022,
    chromatic: 0.0016,
    bloomStrength: 0.64,
    primaryColor: '#FFF3D6',
    secondaryColor: '#E8B86D',
    accentCyan: '#A8E6FF',
    gridColor: '#E8B86D',
    cameraPos: new THREE.Vector3(0.0, 4.2, 18.5),
    cameraTarget: new THREE.Vector3(0, 0.0, 0)
  }
];

class FinisTemporisApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.audio = new ChronoAudioEngine();

    // Simulation & Relativistic Time State
    this.clock = new THREE.Clock();
    this.coordinateTime = 0.0; // Observer coordinate time t
    this.properTime = 0.0;     // Singularity proper time tau
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.savedTimeScaleBeforeFreeze = 1.0;
    this.currentEpoch = 0;

    // Shockwave Collapse State
    this.collapseWave = 0.0;
    this.collapseActive = false;

    // 3D Cursor & Raycasting State
    this.pointerNDC = new THREE.Vector2(99, 99);
    this.raycaster = new THREE.Raycaster();
    this.orbitalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.cursorWorldPos = new THREE.Vector3(0, 0, 0);
    this.smoothedCursorWorldPos = new THREE.Vector3(0, 0, 0);
    this.cursorActive = 0.0;
    this.isPointerInWindow = false;

    // Camera transition state
    this.cameraGoalPos = null;
    this.cameraGoalTarget = null;
    this.focusedRelicId = null;
    this.autoDrift = true;

    this._initScene();
    this._initPostProcessing();
    this._buildSingularityCore();
    this._buildWarpedSpacetimeGrid();
    this._buildChrononParticles();
    this._buildDeepStarfield();
    this._buildCursorGravityVisualizer();

    this.horologium = new CelestialHorologium(this.scene);

    this._bindEvents();
    this._initUI();

    // Hide loading veil smoothly after initial frame compilation
    requestAnimationFrame(() => {
      const veil = document.getElementById('loading-veil');
      if (veil) veil.classList.add('hidden');
    });

    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#040508');
    this.scene.fog = new THREE.FogExp2('#040508', 0.0055);

    this.camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.camera.position.copy(EPOCH_CONFIGS[0].cameraPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.045;
    this.controls.maxDistance = 82;
    this.controls.minDistance = 7.5;
    this.controls.rotateSpeed = 0.75;
    this.controls.zoomSpeed = 0.9;

    // Subtle Lighting for PBR Metallic Armillary Rings & Crystal Relics
    const ambient = new THREE.AmbientLight('#1A233A', 1.4);
    this.scene.add(ambient);

    this.corePointLight = new THREE.PointLight('#FCE1A6', 6.5, 65, 1.2);
    this.corePointLight.position.set(0, 1.5, 0);
    this.scene.add(this.corePointLight);

    this.rimDirLight1 = new THREE.DirectionalLight('#E8B86D', 2.4);
    this.rimDirLight1.position.set(25, 30, 20);
    this.scene.add(this.rimDirLight1);

    this.rimDirLight2 = new THREE.DirectionalLight('#72B8D4', 1.8);
    this.rimDirLight2.position.set(-25, -18, -20);
    this.scene.add(this.rimDirLight2);
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.48, // strength
      0.42, // radius
      0.66  // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.chronoLensPass = new ShaderPass(ChronoLensPostShader);
    this.chronoLensPass.uniforms.uSingularityScreenPos.value = new THREE.Vector2(0.5, 0.5);
    this.chronoLensPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    this.composer.addPass(this.chronoLensPass);
  }

  _buildSingularityCore() {
    this.singularityGroup = new THREE.Group();
    this.scene.add(this.singularityGroup);

    // 1. Event Horizon Sphere (Schwarzschild Radius r_s = 4.15)
    const sphereGeo = new THREE.SphereGeometry(4.15, 64, 64);
    this.horizonUniforms = {
      uTime: { value: 0 },
      uRimColor: { value: new THREE.Color('#FCE1A6') },
      uCyanColor: { value: new THREE.Color('#72B8D4') }
    };
    const sphereMat = new THREE.ShaderMaterial({
      vertexShader: SingularitySphereShader.vertexShader,
      fragmentShader: SingularitySphereShader.fragmentShader,
      uniforms: this.horizonUniforms
    });
    this.eventHorizonMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.singularityGroup.add(this.eventHorizonMesh);

    // 2. Inner Razor Photon Ring Halo
    const photonRingGeo = new THREE.RingGeometry(4.18, 4.55, 128);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFF4D9'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    this.photonRingMesh = new THREE.Mesh(photonRingGeo, photonRingMat);
    this.singularityGroup.add(this.photonRingMesh);

    // 3. Primary Equatorial Relativistic Accretion Disk
    const diskGeo = new THREE.RingGeometry(4.3, 23.5, 180, 64);
    diskGeo.rotateX(-Math.PI / 2);

    this.accretionUniforms = {
      uTime: { value: 0 },
      uTimeScale: { value: 1.0 },
      uCollapseWave: { value: 0.0 },
      uPrimaryColor: { value: new THREE.Color('#E8B86D') },
      uSecondaryColor: { value: new THREE.Color('#C85A32') },
      uAccentCyan: { value: new THREE.Color('#72B8D4') },
      uCursorWorldPos: { value: new THREE.Vector3() },
      uCursorActive: { value: 0.0 }
    };

    const diskMat = new THREE.ShaderMaterial({
      vertexShader: AccretionDiskShader.vertexShader,
      fragmentShader: AccretionDiskShader.fragmentShader,
      uniforms: this.accretionUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.accretionDiskMesh = new THREE.Mesh(diskGeo, diskMat);
    this.singularityGroup.add(this.accretionDiskMesh);

    // 4. Gargantua-style Gravitationally Lensed Vertical Photon Arch
    // Simulates light from the rear of the disk bent over the top & bottom of the shadow
    const lensedArchGeo = new THREE.RingGeometry(4.25, 12.2, 160, 48);
    lensedArchGeo.rotateX(-Math.PI / 2); // Ensure local coordinates lie in XZ plane for radial shader!
    this.lensedArchMesh = new THREE.Mesh(lensedArchGeo, diskMat);
    this.singularityGroup.add(this.lensedArchMesh);
  }

  _buildWarpedSpacetimeGrid() {
    const gridGeo = new THREE.RingGeometry(3.2, 54.0, 180, 96);
    gridGeo.rotateX(-Math.PI / 2);

    this.gridUniforms = {
      uTime: { value: 0 },
      uGravityDepth: { value: 13.5 },
      uCursorWorldPos: { value: new THREE.Vector3() },
      uCursorActive: { value: 0.0 },
      uCollapseWave: { value: 0.0 },
      uGridColor: { value: new THREE.Color('#8B6B3B') },
      uHighlightColor: { value: new THREE.Color('#72B8D4') }
    };

    const gridMat = new THREE.ShaderMaterial({
      vertexShader: SpacetimeGridShader.vertexShader,
      fragmentShader: SpacetimeGridShader.fragmentShader,
      uniforms: this.gridUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.spacetimeGridMesh = new THREE.Mesh(gridGeo, gridMat);
    this.spacetimeGridMesh.position.y = -3.6;
    this.scene.add(this.spacetimeGridMesh);
  }

  _buildChrononParticles() {
    const count = 58000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const aRadius = new Float32Array(count);
    const aAngle = new Float32Array(count);
    const aSpeed = new Float32Array(count);
    const aHeight = new Float32Array(count);
    const aScale = new Float32Array(count);
    const aBand = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      aRadius[i] = Math.random();
      aAngle[i] = Math.random() * Math.PI * 2;
      aSpeed[i] = 0.4 + Math.random() * 1.4;
      aHeight[i] = (Math.random() - 0.5) * 2.0;
      aScale[i] = 0.45 + Math.pow(Math.random(), 2.2) * 2.1;

      if (i < 35000) {
        aBand[i] = 0.0; // Accretion spiral vortex
      } else if (i < 49000) {
        aBand[i] = 1.0; // Polar hourglass jets
      } else {
        aBand[i] = 2.0; // Outer sanctuary chronon dust
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(aAngle, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));
    geometry.setAttribute('aHeight', new THREE.BufferAttribute(aHeight, 1));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(aScale, 1));
    geometry.setAttribute('aBand', new THREE.BufferAttribute(aBand, 1));

    this.particleUniforms = {
      uTime: { value: 0 },
      uTimeScale: { value: 1.0 },
      uCollapseWave: { value: 0.0 },
      uCursorWorldPos: { value: new THREE.Vector3() },
      uCursorActive: { value: 0.0 },
      uColorGold: { value: new THREE.Color('#FCE1A6') },
      uColorCyan: { value: new THREE.Color('#72B8D4') },
      uColorEmber: { value: new THREE.Color('#C85A32') }
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader: ChrononParticleShader.vertexShader,
      fragmentShader: ChrononParticleShader.fragmentShader,
      uniforms: this.particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.chrononPoints = new THREE.Points(geometry, mat);
    this.chrononPoints.frustumCulled = false;
    this.scene.add(this.chrononPoints);
  }

  _buildDeepStarfield() {
    const starCount = 7500;
    const starGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const cols = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#FCE1A6'),
      new THREE.Color('#EAE4D7'),
      new THREE.Color('#72B8D4'),
      new THREE.Color('#C85A32'),
      new THREE.Color('#9D7FEA')
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 85 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[i % palette.length];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);
  }

  _buildCursorGravityVisualizer() {
    this.cursorWellGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.85, 0.96, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#72B8D4'),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.cursorRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.cursorWellGroup.add(this.cursorRingMesh);
    this.scene.add(this.cursorWellGroup);
  }

  // ==========================================================================
  // EPOCH & INTERACTION CONTROLLERS
  // ==========================================================================
  setEpoch(epochIdx) {
    if (epochIdx < 0 || epochIdx >= EPOCH_CONFIGS.length) return;
    this.currentEpoch = epochIdx;
    const cfg = EPOCH_CONFIGS[epochIdx];

    this.setTimeScale(cfg.timeScale);
    this.focusedRelicId = null;
    this.cameraGoalPos = cfg.cameraPos.clone();
    this.cameraGoalTarget = cfg.cameraTarget.clone();

    // Update UI Epoch buttons & epigraph
    document.querySelectorAll('.epoch-item').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === epochIdx);
    });

    const epigraphEl = document.getElementById('poetic-epigraph');
    if (epigraphEl) {
      epigraphEl.textContent = cfg.epigraph;
    }

    // Trigger subtle collapse wave when entering Epoch IV (Omega Singularity)
    if (epochIdx === 3) {
      this.triggerSingularityCollapse();
    }
  }

  setTimeScale(val) {
    this.targetTimeScale = THREE.MathUtils.clamp(val, -2.5, 4.0);
    const slider = document.getElementById('time-slider');
    if (slider) slider.value = String(this.targetTimeScale);
    this._updateScrubberLabel(this.targetTimeScale);
  }

  _updateScrubberLabel(val) {
    const readout = document.getElementById('scrubber-readout');
    if (!readout) return;
    let stateTag = '正向演化';
    if (Math.abs(val) < 0.04) stateTag = '绝对凝滞 · BULLET TIME';
    else if (val < 0) stateTag = '熵寂逆流 · REVERSAL';
    else if (val > 1.8) stateTag = '极速坍缩 · HYPERFLOW';
    else if (val < 0.5) stateTag = '相对论慢放 · DILATION';

    const sign = val >= 0 ? '+' : '';
    readout.textContent = `${sign}${val.toFixed(2)}x · ${stateTag}`;
  }

  triggerSingularityCollapse() {
    this.collapseWave = 0.001;
    this.collapseActive = true;
    this.audio.playCollapsePulse();
  }

  selectRelic(relicId, focusCamera = false) {
    const data = TEMPORAL_RELICS_DATA[relicId];
    if (!data) return;

    this.horologium.setSelectedRelic(relicId);
    this.audio.playRelicChime(relicId);

    const romanEl = document.getElementById('relic-roman');
    const coordEl = document.getElementById('relic-coord');
    const titleEl = document.getElementById('relic-title');
    const descEl = document.getElementById('relic-desc');

    if (romanEl) romanEl.textContent = `RELIC ${data.roman} / XII`;
    if (coordEl) coordEl.textContent = data.coord;
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;

    if (focusCamera) {
      this.focusedRelicId = relicId;
    }
  }

  focusSelectedRelic() {
    this.focusedRelicId = this.horologium.selectedRelicId;
  }

  resetCameraView() {
    this.focusedRelicId = null;
    const cfg = EPOCH_CONFIGS[this.currentEpoch];
    this.cameraGoalPos = cfg.cameraPos.clone();
    this.cameraGoalTarget = cfg.cameraTarget.clone();
  }

  // ==========================================================================
  // DOM & INPUT EVENTS
  // ==========================================================================
  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());

    window.addEventListener('pointermove', (e) => {
      this.isPointerInWindow = true;
      this.pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Subtle parallax on SVG astrolabe reticle
      const reticle = document.getElementById('astrolabe-reticle');
      if (reticle) {
        const rx = this.pointerNDC.x * 12;
        const ry = -this.pointerNDC.y * 12;
        reticle.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px)) rotate(${this.properTime * 4}deg)`;
      }

      this._updateRaycasting(e.clientX, e.clientY);
    });

    window.addEventListener('pointerleave', () => {
      this.isPointerInWindow = false;
    });

    // Click on 3D canvas to select hovered relic
    this.renderer.domElement.addEventListener('pointerdown', () => {
      // Stop programmatic camera glide if user grabs orbit controls
      this.cameraGoalPos = null;
      this.cameraGoalTarget = null;

      if (this.horologium.hoveredRelicId !== -1) {
        this.selectRelic(this.horologium.hoveredRelicId, false);
      }
    });

    // Double-click on canvas triggers a localized singularity wave or focuses relic
    this.renderer.domElement.addEventListener('dblclick', () => {
      if (this.horologium.hoveredRelicId !== -1) {
        this.selectRelic(this.horologium.hoveredRelicId, true);
      } else {
        this.triggerSingularityCollapse();
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (Math.abs(this.targetTimeScale) > 0.02) {
          this.savedTimeScaleBeforeFreeze = this.targetTimeScale;
          this.setTimeScale(0.0);
        } else {
          this.setTimeScale(this.savedTimeScaleBeforeFreeze || 1.0);
        }
      } else if (e.key === '1') {
        this.setEpoch(0);
      } else if (e.key === '2') {
        this.setEpoch(1);
      } else if (e.key === '3') {
        this.setEpoch(2);
      } else if (e.key === '4') {
        this.setEpoch(3);
      } else if (e.key === 'p' || e.key === 'P') {
        this.triggerSingularityCollapse();
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetCameraView();
      } else if (e.key === 'h' || e.key === 'H') {
        document.body.classList.toggle('cinema-mode');
      }
    });
  }

  _initUI() {
    // Epoch chapter buttons
    document.querySelectorAll('.epoch-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-epoch'));
        this.setEpoch(idx);
      });
    });

    // Time slider
    const slider = document.getElementById('time-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.targetTimeScale = val;
        this._updateScrubberLabel(val);
      });
    }

    // Quick time preset buttons
    document.querySelectorAll('[data-timescale]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.getAttribute('data-timescale'));
        this.setTimeScale(val);
      });
    });

    // Singularity Collapse button
    const collapseBtn = document.getElementById('btn-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.triggerSingularityCollapse());
    }

    // Audio toggle button
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const active = this.audio.toggle();
        audioBtn.classList.toggle('active', active);
        const label = audioBtn.querySelector('.btn-text');
        if (label) label.textContent = active ? '宇宙声景 · ON' : '宇宙声景 · OFF';
      });
    }

    // Auto camera drift toggle
    const driftBtn = document.getElementById('btn-drift');
    if (driftBtn) {
      driftBtn.addEventListener('click', () => {
        this.autoDrift = !this.autoDrift;
        driftBtn.classList.toggle('active', this.autoDrift);
      });
    }

    // Reset Camera View button
    const resetCamBtn = document.getElementById('btn-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => this.resetCameraView());
    }

    // Cinema HUD toggle
    const hudBtn = document.getElementById('btn-cinema');
    if (hudBtn) {
      hudBtn.addEventListener('click', () => {
        const isCinema = document.body.classList.toggle('cinema-mode');
        hudBtn.classList.toggle('active', isCinema);
        const label = hudBtn.querySelector('.btn-text');
        if (label) label.textContent = isCinema ? '退出纯净视界' : '纯净视界';
      });
    }

    // Relic Inspector Actions
    const focusRelicBtn = document.getElementById('btn-focus-relic');
    if (focusRelicBtn) {
      focusRelicBtn.addEventListener('click', () => this.focusSelectedRelic());
    }

    const nextRelicBtn = document.getElementById('btn-next-relic');
    if (nextRelicBtn) {
      nextRelicBtn.addEventListener('click', () => {
        const nextId = (this.horologium.selectedRelicId + 1) % TEMPORAL_RELICS_DATA.length;
        this.selectRelic(nextId, true);
      });
    }

    // Initialize default relic UI
    this.selectRelic(3, false);
  }

  _updateRaycasting(clientX, clientY) {
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);

    // 1. Intersect orbital plane for 3D Cursor Gravity Well
    const hitPoint = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.orbitalPlane, hitPoint);
    if (hit && hitPoint.length() < 45) {
      this.cursorWorldPos.copy(hitPoint);
    }

    // 2. Check intersection with the 12 Temporal Relic crystal monoliths
    const intersects = this.raycaster.intersectObjects(this.horologium.relicMeshes, false);
    const hoverTag = document.getElementById('relic-hover-tag');

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const relicId = hitMesh.userData.relicId;
      const relicData = hitMesh.userData.relicData;

      if (this.horologium.hoveredRelicId !== relicId) {
        this.horologium.setHoveredRelic(relicId);
        this.audio.playRelicChime(relicId);
      }

      this.container.classList.add('hovering-relic');
      if (hoverTag && relicData) {
        hoverTag.classList.add('visible');
        hoverTag.style.left = `${clientX}px`;
        hoverTag.style.top = `${clientY}px`;
        hoverTag.querySelector('.tag-roman').textContent = relicData.roman;
        hoverTag.querySelector('.tag-name').textContent = relicData.title;
      }
    } else {
      this.horologium.setHoveredRelic(-1);
      this.container.classList.remove('hovering-relic');
      if (hoverTag) hoverTag.classList.remove('visible');
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.chronoLensPass.uniforms.uAspect.value = w / h;
  }

  // ==========================================================================
  // TELEMETRY & PHYSICS READOUTS
  // ==========================================================================
  _updateTelemetry() {
    const distFromCenter = this.camera.position.length();
    const rs = 4.15;
    const rRatio = Math.max(distFromCenter / rs, 1.02);

    // Gravitational Lorentz factor gamma = 1 / sqrt(1 - Rs/r) + velocity term
    const gravGamma = 1.0 / Math.sqrt(Math.max(1.0 - 1.0 / rRatio, 0.005));
    const totalGamma = gravGamma * (1.0 + Math.abs(this.timeScale) * 0.42);

    const elTau = document.getElementById('metric-tau');
    const elGamma = document.getElementById('metric-gamma');
    const elRadius = document.getElementById('metric-radius');
    const elEntropy = document.getElementById('metric-entropy');

    if (elTau) {
      const sign = this.properTime >= 0 ? '+' : '-';
      const absTau = Math.abs(this.properTime);
      const mins = Math.floor(absTau / 60).toString().padStart(2, '0');
      const secs = (absTau % 60).toFixed(3).padStart(6, '0');
      elTau.textContent = `${sign}${mins}:${secs} s`;
    }
    if (elGamma) {
      elGamma.textContent = `γ = ${totalGamma.toFixed(4)}`;
    }
    if (elRadius) {
      elRadius.textContent = `${rRatio.toFixed(2)} Rₛ`;
    }
    if (elEntropy) {
      const entropyRate = (this.timeScale * 1.3806).toFixed(3);
      elEntropy.textContent = `${this.timeScale >= 0 ? '+' : ''}${entropyRate} k_B`;
      elEntropy.className = `metric-value ${this.timeScale < 0 ? 'cyan' : 'ember'}`;
    }
  }

  // ==========================================================================
  // MAIN RENDER LOOP
  // ==========================================================================
  _animate() {
    requestAnimationFrame(() => this._animate());

    const rawDt = Math.min(this.clock.getDelta(), 0.05);
    this.coordinateTime += rawDt;

    // Smoothly interpolate timeScale
    this.timeScale = THREE.MathUtils.lerp(this.timeScale, this.targetTimeScale, 0.08);
    const deltaProper = rawDt * this.timeScale;
    this.properTime += deltaProper;

    // Update shockwave collapse animation
    if (this.collapseActive) {
      this.collapseWave += rawDt * 0.55;
      if (this.collapseWave >= 1.0) {
        this.collapseWave = 0.0;
        this.collapseActive = false;
      }
    }

    // Smooth 3D Cursor Gravity Well position & strength
    this.smoothedCursorWorldPos.lerp(this.cursorWorldPos, 0.14);
    const targetCursorActive = this.isPointerInWindow ? 1.0 : 0.0;
    this.cursorActive = THREE.MathUtils.lerp(this.cursorActive, targetCursorActive, 0.08);

    this.cursorWellGroup.position.copy(this.smoothedCursorWorldPos);
    this.cursorWellGroup.position.y = 0.05;
    this.cursorRingMesh.material.opacity = this.cursorActive * 0.35;
    this.cursorRingMesh.scale.setScalar(1.0 + Math.sin(this.coordinateTime * 4.0) * 0.15);

    // Smooth Epoch visual parameters (colors, gravity depth, lensing, bloom)
    const cfg = EPOCH_CONFIGS[this.currentEpoch];
    this.accretionUniforms.uPrimaryColor.value.lerp(new THREE.Color(cfg.primaryColor), 0.04);
    this.accretionUniforms.uSecondaryColor.value.lerp(new THREE.Color(cfg.secondaryColor), 0.04);
    this.accretionUniforms.uAccentCyan.value.lerp(new THREE.Color(cfg.accentCyan), 0.04);
    this.gridUniforms.uGridColor.value.lerp(new THREE.Color(cfg.gridColor), 0.04);

    this.gridUniforms.uGravityDepth.value = THREE.MathUtils.lerp(
      this.gridUniforms.uGravityDepth.value,
      cfg.gravityDepth,
      0.04
    );

    const targetBloom = cfg.bloomStrength + Math.sin(this.collapseWave * Math.PI) * 0.55;
    this.bloomPass.strength = THREE.MathUtils.lerp(this.bloomPass.strength, targetBloom, 0.06);

    // Update shader uniforms
    this.accretionUniforms.uTime.value = this.properTime;
    this.accretionUniforms.uTimeScale.value = this.timeScale;
    this.accretionUniforms.uCollapseWave.value = this.collapseWave;
    this.accretionUniforms.uCursorWorldPos.value.copy(this.smoothedCursorWorldPos);
    this.accretionUniforms.uCursorActive.value = this.cursorActive;

    this.horizonUniforms.uTime.value = this.coordinateTime;

    this.gridUniforms.uTime.value = this.properTime;
    this.gridUniforms.uCursorWorldPos.value.copy(this.smoothedCursorWorldPos);
    this.gridUniforms.uCursorActive.value = this.cursorActive;
    this.gridUniforms.uCollapseWave.value = this.collapseWave;

    this.particleUniforms.uTime.value = this.properTime;
    this.particleUniforms.uTimeScale.value = this.timeScale;
    this.particleUniforms.uCollapseWave.value = this.collapseWave;
    this.particleUniforms.uCursorWorldPos.value.copy(this.smoothedCursorWorldPos);
    this.particleUniforms.uCursorActive.value = this.cursorActive;

    // Make the inner photon ring & vertical lensed arch face the camera dynamically (billboarded lensing illusion!)
    this.photonRingMesh.lookAt(this.camera.position);
    // Keep the Gargantua lensed arch oriented toward the camera's azimuth while tilted ~76 deg
    const camAzimuth = Math.atan2(this.camera.position.x, this.camera.position.z);
    this.lensedArchMesh.rotation.set(Math.PI * 0.43, camAzimuth, 0);

    // Update Celestial Horologium & 12 Temporal Relics
    this.horologium.update(
      this.properTime,
      deltaProper,
      this.timeScale,
      this.smoothedCursorWorldPos,
      this.cursorActive,
      this.collapseWave
    );

    // Slowly rotate deep starfield
    this.starfield.rotation.y = this.properTime * 0.008;

    // Camera choreography: focus on orbiting relic OR glide to Epoch preset OR subtle orbital drift
    if (this.focusedRelicId !== null) {
      const relicWorldPos = this.horologium.getRelicWorldPosition(this.focusedRelicId);
      const radialDir = relicWorldPos.clone().normalize();
      const tangentDir = new THREE.Vector3(-radialDir.z, 0, radialDir.x);
      const desiredCamPos = relicWorldPos
        .clone()
        .add(radialDir.multiplyScalar(7.8))
        .add(tangentDir.multiplyScalar(2.4))
        .add(new THREE.Vector3(0, 2.6, 0));
      const lookTarget = relicWorldPos.clone().lerp(new THREE.Vector3(0, 0, 0), 0.28);

      this.camera.position.lerp(desiredCamPos, 0.05);
      this.controls.target.lerp(lookTarget, 0.06);
    } else if (this.cameraGoalPos && this.cameraGoalTarget) {
      this.camera.position.lerp(this.cameraGoalPos, 0.04);
      this.controls.target.lerp(this.cameraGoalTarget, 0.05);
      if (this.camera.position.distanceTo(this.cameraGoalPos) < 0.25) {
        this.cameraGoalPos = null;
        this.cameraGoalTarget = null;
      }
    } else if (this.autoDrift) {
      // Gentle cinematic orbital drift around the singularity
      const driftAngle = rawDt * 0.055 * (this.timeScale >= 0 ? 1 : -1);
      const offset = this.camera.position.clone().sub(this.controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), driftAngle);
      this.camera.position.copy(this.controls.target).add(offset);
    }

    this.controls.update();

    // Project 3D Singularity center (0,0,0) to 2D Screen UV [0..1] for Post-Processing Gravitational Lensing
    const centerNDC = new THREE.Vector3(0, 0, 0).project(this.camera);
    this.chronoLensPass.uniforms.uSingularityScreenPos.value.set(
      centerNDC.x * 0.5 + 0.5,
      centerNDC.y * 0.5 + 0.5
    );
    this.chronoLensPass.uniforms.uTime.value = this.coordinateTime;
    this.chronoLensPass.uniforms.uTimeScale.value = this.timeScale;
    this.chronoLensPass.uniforms.uCollapseWave.value = this.collapseWave;
    this.chronoLensPass.uniforms.uLensStrength.value = THREE.MathUtils.lerp(
      this.chronoLensPass.uniforms.uLensStrength.value,
      cfg.lensStrength,
      0.05
    );
    this.chronoLensPass.uniforms.uChromaticIntensity.value = THREE.MathUtils.lerp(
      this.chronoLensPass.uniforms.uChromaticIntensity.value,
      cfg.chromatic,
      0.05
    );

    // Update WebAudio synthesizer & HUD telemetry
    this.audio.update(rawDt, this.timeScale, this.cursorActive > 0.5);
    this._updateTelemetry();

    // Render full HDR + Bloom + Gravitational Lensing pipeline
    this.composer.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.finisTemporisApp = new FinisTemporisApp();
});
