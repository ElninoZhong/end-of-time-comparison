// ============================================================================
// FINIS TEMPORIS · 《时间的尽头》
// Procedural 3D Celestial Horologium, Engraved Astrolabe Dial,
// Relativistic Clock Hands, and 12 Interactive Temporal Relic Monoliths
// ============================================================================

import * as THREE from 'three';

export const TEMPORAL_RELICS_DATA = [
  {
    id: 0,
    roman: 'I',
    title: '普朗克黎明 · Planck Dawn',
    coord: 't = 10⁻⁴³ s · ΔS = 0.00',
    desc: '时空度规从量子泡沫中结晶的第一瞬。引力与万物的因果律在此刻分道扬镳，第一粒时间量子（Chronon）开始跳动。',
    color: '#FCE1A6'
  },
  {
    id: 1,
    roman: 'II',
    title: '暴胀回响 · Inflationary Echo',
    coord: 't = 10⁻³² s · r = 0.18 Rs',
    desc: '空间以超光速指数级舒展，微小的量子涨落被拉伸为横跨百亿光年的宇宙网丝与星系胚胎。',
    color: '#E8B86D'
  },
  {
    id: 2,
    roman: 'III',
    title: '初代星火 · First Ignition',
    coord: 't = +1.8×10⁸ yr · Z = 20',
    desc: '黑暗纪元终结。第一代巨型恒星在引力坍缩中点燃核聚变，将重元素锻造并播撒向虚空。',
    color: '#F4A261'
  },
  {
    id: 3,
    roman: 'IV',
    title: '黄金星轨 · Celestial Order',
    coord: 't = +4.6×10⁹ yr · γ = 1.00',
    desc: '行星沿开普勒椭圆精密运转，昼夜、四季与潮汐构成了生命感知“时间流逝”的黄金钟摆。',
    color: '#E8B86D'
  },
  {
    id: 4,
    roman: 'V',
    title: '观测者之眼 · The Observer',
    coord: 't = +1.38×10¹⁰ yr · τ = t',
    desc: '碳基意识首次仰望星空，铸造日晷、浑天仪与原子钟，试图用有限的刻度丈量无限的宇宙。',
    color: '#72B8D4'
  },
  {
    id: 5,
    roman: 'VI',
    title: '光锥迷城 · Light-Cone Horizon',
    coord: 'v = 0.87c · γ = 2.02',
    desc: '当文明逼近光速边界，同时性彻底瓦解。过去与未来的界限在洛伦兹变换中折叠为倾斜的光锥。',
    color: '#72B8D4'
  },
  {
    id: 6,
    roman: 'VII',
    title: '群星熄灭纪 · Stelliferous Twilight',
    coord: 't = 10¹⁴ yr · ΔS → MAX',
    desc: '最后一颗红矮星耗尽氢燃料，宇宙从璀璨的恒星纪元滑入漫长的简并态黑夜，唯余白矮星与中子星余温。',
    color: '#C85A32'
  },
  {
    id: 7,
    roman: 'VIII',
    title: '视界潮汐 · Tidal Spaghettification',
    coord: 'r = 1.50 Rs · Photon Sphere',
    desc: '光子在此被迫沿球面轨道永恒环绕黑洞。站在光子球层上，你将看见自己后脑勺的无限重影。',
    color: '#E06D44'
  },
  {
    id: 8,
    roman: 'IX',
    title: '霍金辐射 · Hawking Evaporation',
    coord: 't = 10⁶⁷ yr · T_H ∝ 1/M',
    desc: '真空量子涨落在视界边缘撕裂虚粒子对，黑洞以极其缓慢的辐射交还它曾吞噬的一切信息。',
    color: '#9D7FEA'
  },
  {
    id: 9,
    roman: 'X',
    title: '庞加莱重现 · Poincaré Recurrence',
    coord: 'ΔS < 0 · Phase Reversal',
    desc: '在超越想象的时间尺度尽头，孤立系统的量子态穿越相空间迷雾，逆着熵增之箭重返最初的秩序。',
    color: '#88C9E8'
  },
  {
    id: 10,
    roman: 'XI',
    title: '永恒凝滞 · Frozen Asymptote',
    coord: 'r → 1.000 Rs · dτ/dt → 0',
    desc: '对于远方观测者而言，坠入视界的旅人永远定格在琥珀般的红移残影中，一秒被拉长成永恒。',
    color: '#B8E2F2'
  },
  {
    id: 11,
    roman: 'XII',
    title: '终焉奇点 · Omega Singularity',
    coord: 't = ∞ · Curvature = ∞',
    desc: '空间向内坍缩为无维度的纯光之点，一切过去、现在与未来的记忆晶格在此交汇合一。',
    color: '#FFF3D6'
  }
];

/**
 * Generates an intricate 2048x2048 procedural Canvas texture for the floating
 * Astrolabe Dial Plate (Roman numerals, 360 degree ticks, sacred geometry, Latin inscriptions).
 */
function createAstrolabeDialTexture() {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  const gold = 'rgba(232, 184, 109, 0.88)';
  const goldDim = 'rgba(232, 184, 109, 0.32)';
  const cyanDim = 'rgba(114, 184, 212, 0.42)';

  // Concentric astrolabe rings
  const radii = [340, 420, 445, 580, 610, 740, 775, 890, 920, 965];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 3 === 0 ? gold : goldDim;
    ctx.lineWidth = idx === 3 || idx === 7 ? 3.0 : 1.5;
    if (idx === 5) ctx.setLineDash([8, 10]);
    else ctx.setLineDash([]);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // 360 Fine Degree Ticks between r=740 and r=775
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 30 === 0;
    const isMid = i % 5 === 0;
    const rIn = isMajor ? 725 : isMid ? 736 : 746;
    const rOut = 774;

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * rIn, Math.sin(angle) * rIn);
    ctx.lineTo(Math.cos(angle) * rOut, Math.sin(angle) * rOut);
    ctx.strokeStyle = isMajor ? gold : goldDim;
    ctx.lineWidth = isMajor ? 3.2 : isMid ? 1.8 : 1.0;
    ctx.stroke();
  }

  // 60 Chronometer Second Ticks on Inner Track (r=420..445)
  for (let i = 0; i < 60; i++) {
    const angle = (i * Math.PI) / 30;
    const isHour = i % 5 === 0;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (isHour ? 408 : 420), Math.sin(angle) * (isHour ? 408 : 420));
    ctx.lineTo(Math.cos(angle) * 445, Math.sin(angle) * 445);
    ctx.strokeStyle = isHour ? cyanDim : goldDim;
    ctx.lineWidth = isHour ? 3.0 : 1.2;
    ctx.stroke();
  }

  // 12 Roman Numerals around r=835
  const romans = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  ctx.font = '500 54px "Cinzel", "Times New Roman", serif';
  ctx.fillStyle = 'rgba(252, 225, 166, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  romans.forEach((num, idx) => {
    const angle = (idx * Math.PI) / 6 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(num, 0, -834);

    // Diamond marker below each numeral
    ctx.beginPath();
    ctx.moveTo(0, -790);
    ctx.lineTo(7, -780);
    ctx.lineTo(0, -770);
    ctx.lineTo(-7, -780);
    ctx.closePath();
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.restore();
  });

  // Geometric dodecagram / astrolabe chord lines
  ctx.strokeStyle = 'rgba(232, 184, 109, 0.14)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {
    const a1 = (i * Math.PI) / 6;
    const a2 = ((i + 5) * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * 580, Math.sin(a1) * 580);
    ctx.lineTo(Math.cos(a2) * 580, Math.sin(a2) * 580);
    ctx.stroke();
  }

  // Circular Latin Epigraph along r=665
  const inscription = '· FINIS TEMPORIS · HOROLOGIUM SINGULARITATIS · TEMPUS EDAX RERUM · MEMORIA AETERNA ';
  ctx.font = '400 22px "Cinzel", Georgia, serif';
  ctx.fillStyle = 'rgba(232, 184, 109, 0.56)';
  const step = (Math.PI * 2) / inscription.length;
  for (let i = 0; i < inscription.length; i++) {
    ctx.save();
    ctx.rotate(i * step);
    ctx.fillText(inscription[i], 0, -665);
    ctx.restore();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a crisp 3D Roman numeral plaque texture for individual floating markers
 */
function createRomanBadgeTexture(romanText, subText) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.strokeStyle = 'rgba(232, 184, 109, 0.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, 220, 220);

  ctx.strokeStyle = 'rgba(114, 184, 212, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, 200, 200);

  ctx.fillStyle = '#FCE1A6';
  ctx.font = '600 76px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(romanText, 128, 118);

  ctx.fillStyle = 'rgba(114, 184, 212, 0.85)';
  ctx.font = '400 22px monospace';
  ctx.fillText(subText, 128, 184);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export class CelestialHorologium {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.rings = [];
    this.shatteredShards = [];
    this.relicMeshes = []; // Raycast targets for the 12 Temporal Relics
    this.relicGroups = [];
    this.selectedRelicId = 3; // Default: IV · Celestial Order
    this.hoveredRelicId = -1;

    this._initMaterials();
    this._buildAstrolabeDialPlate();
    this._buildNestedArmillaryRings();
    this._buildShatteredOuterRing();
    this._buildRelativisticClockHands();
    this._buildTemporalRelics();
    this._buildPolarHourglassFilaments();
  }

  _initMaterials() {
    this.goldMetalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8B86D'),
      metalness: 0.92,
      roughness: 0.22,
      emissive: new THREE.Color('#5A3E14'),
      emissiveIntensity: 0.45
    });

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0E131F'),
      metalness: 0.85,
      roughness: 0.18,
      emissive: new THREE.Color('#142038'),
      emissiveIntensity: 0.35
    });

    this.emissiveGoldMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FCE1A6'),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    this.emissiveCyanMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#72B8D4'),
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending
    });
  }

  _buildAstrolabeDialPlate() {
    const dialTex = createAstrolabeDialTexture();
    const dialGeo = new THREE.PlaneGeometry(34, 34);
    const dialMat = new THREE.MeshBasicMaterial({
      map: dialTex,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.dialPlate = new THREE.Mesh(dialGeo, dialMat);
    this.dialPlate.rotation.x = -Math.PI / 2;
    this.dialPlate.position.y = -0.15;
    this.root.add(this.dialPlate);
  }

  _buildNestedArmillaryRings() {
    const ringSpecs = [
      { radius: 6.4, tube: 0.09, tiltX: 0.32, tiltZ: -0.18, speed: [0.22, 0.35, -0.14], mat: this.goldMetalMat, ticks: 24 },
      { radius: 9.8, tube: 0.12, tiltX: -0.24, tiltZ: 0.28, speed: [-0.14, 0.22, 0.08], mat: this.goldMetalMat, ticks: 60 },
      { radius: 13.6, tube: 0.15, tiltX: 0.41, tiltZ: 0.12, speed: [0.08, -0.16, 0.11], mat: this.obsidianMat, ticks: 36 },
      { radius: 22.8, tube: 0.11, tiltX: 1.18, tiltZ: -0.25, speed: [0.04, 0.09, -0.05], mat: this.goldMetalMat, ticks: 48 }
    ];

    ringSpecs.forEach((spec, idx) => {
      const group = new THREE.Group();
      group.rotation.x = spec.tiltX;
      group.rotation.z = spec.tiltZ;

      // Main Torus
      const torusGeo = new THREE.TorusGeometry(spec.radius, spec.tube, 20, 160);
      const torusMesh = new THREE.Mesh(torusGeo, spec.mat);
      group.add(torusMesh);

      // Thin additive glowing companion wire ring
      const glowTorusGeo = new THREE.TorusGeometry(spec.radius + spec.tube * 1.6, 0.022, 8, 160);
      const glowMesh = new THREE.Mesh(glowTorusGeo, idx % 2 === 0 ? this.emissiveGoldMat : this.emissiveCyanMat);
      group.add(glowMesh);

      // Instanced precision Vernier tick blocks around the ring
      const tickGeo = new THREE.BoxGeometry(0.05, 0.32, 0.12);
      const tickInst = new THREE.InstancedMesh(tickGeo, this.goldMetalMat, spec.ticks);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < spec.ticks; i++) {
        const a = (i / spec.ticks) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius, 0);
        dummy.rotation.set(0, 0, a + Math.PI / 2);
        const s = i % 5 === 0 ? 1.65 : 0.85;
        dummy.scale.set(1, s, 1);
        dummy.updateMatrix();
        tickInst.setMatrixAt(i, dummy.matrix);
      }
      group.add(tickInst);

      this.root.add(group);
      this.rings.push({
        group,
        baseTiltX: spec.tiltX,
        baseTiltZ: spec.tiltZ,
        speed: spec.speed,
        radius: spec.radius
      });
    });
  }

  _buildShatteredOuterRing() {
    this.shatteredGroup = new THREE.Group();
    this.root.add(this.shatteredGroup);

    const shardCount = 32;
    const baseRadius = 17.2;

    for (let i = 0; i < shardCount; i++) {
      const arcLen = ((Math.PI * 2) / shardCount) * (0.45 + Math.random() * 0.38);
      const startAngle = (i / shardCount) * Math.PI * 2;
      const rOffset = (Math.random() - 0.5) * 1.4;
      const yOffset = (Math.random() - 0.5) * 1.6;

      const geo = new THREE.TorusGeometry(
        baseRadius + rOffset,
        0.08 + Math.random() * 0.09,
        10,
        24,
        arcLen
      );
      const shard = new THREE.Mesh(geo, i % 3 === 0 ? this.goldMetalMat : this.obsidianMat);
      shard.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.16;
      shard.rotation.z = startAngle;
      shard.position.y = yOffset;

      this.shatteredGroup.add(shard);
      this.shatteredShards.push({
        mesh: shard,
        baseRadius: baseRadius + rOffset,
        baseY: yOffset,
        angle: startAngle,
        driftSpeed: (Math.random() * 0.4 + 0.15) * (i % 2 === 0 ? 1 : -1),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _buildRelativisticClockHands() {
    this.clockHandsGroup = new THREE.Group();
    this.clockHandsGroup.position.y = 0.08;
    this.root.add(this.clockHandsGroup);

    // Helper to create an ornate astronomical clock hand along +Z (or -Z)
    const createHand = (length, width, mat, glowMat, hasCounterweight = true) => {
      const hand = new THREE.Group();

      // Tapered main blade
      const bladeGeo = new THREE.ConeGeometry(width, length, 4);
      bladeGeo.rotateX(-Math.PI / 2);
      bladeGeo.translate(0, 0, -length / 2 - 4.5);
      const blade = new THREE.Mesh(bladeGeo, mat);
      hand.add(blade);

      // Luminous spine line
      const spineGeo = new THREE.BoxGeometry(width * 0.28, 0.04, length * 0.92);
      spineGeo.translate(0, 0.05, -length * 0.46 - 4.5);
      const spine = new THREE.Mesh(spineGeo, glowMat);
      hand.add(spine);

      // Astrolabe ring eyelet near tip
      const eyeletGeo = new THREE.RingGeometry(width * 1.6, width * 2.4, 24);
      eyeletGeo.rotateX(-Math.PI / 2);
      eyeletGeo.translate(0, 0.06, -length * 0.78 - 4.5);
      const eyelet = new THREE.Mesh(eyeletGeo, glowMat);
      hand.add(eyelet);

      if (hasCounterweight) {
        const tailGeo = new THREE.ConeGeometry(width * 1.3, length * 0.25, 4);
        tailGeo.rotateX(Math.PI / 2);
        tailGeo.translate(0, 0, 4.5 + length * 0.12);
        const tail = new THREE.Mesh(tailGeo, mat);
        hand.add(tail);
      }

      return hand;
    };

    // Hour Hand, Minute Hand, Proper-Time Second Hand
    this.hourHand = createHand(6.2, 0.22, this.goldMetalMat, this.emissiveGoldMat, true);
    this.minuteHand = createHand(9.4, 0.15, this.goldMetalMat, this.emissiveGoldMat, true);
    this.secondHand = createHand(12.6, 0.08, this.obsidianMat, this.emissiveCyanMat, false);

    this.clockHandsGroup.add(this.hourHand, this.minuteHand, this.secondHand);
  }

  _buildTemporalRelics() {
    this.relicsOrbitGroup = new THREE.Group();
    this.root.add(this.relicsOrbitGroup);

    const crystalGeo = new THREE.OctahedronGeometry(0.92, 0);
    crystalGeo.scale(0.72, 1.85, 0.72); // Elongated monolith crystal shard
    const edgesGeo = new THREE.EdgesGeometry(crystalGeo);
    const coreGeo = new THREE.OctahedronGeometry(0.32, 1);

    TEMPORAL_RELICS_DATA.forEach((data, idx) => {
      const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const orbitRadius = 18.8 + (idx % 2 === 0 ? 0.0 : 1.6);
      const baseHeight = Math.sin(idx * 1.5) * 2.2;

      const relicHolder = new THREE.Group();
      relicHolder.position.set(
        Math.cos(angle) * orbitRadius,
        baseHeight,
        Math.sin(angle) * orbitRadius
      );

      // Translucent crystalline shell
      const shellMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#141B2D'),
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.25,
        metalness: 0.2,
        roughness: 0.08,
        transmission: 0.78,
        thickness: 1.5,
        ior: 1.65,
        transparent: true,
        opacity: 0.92
      });

      const crystalMesh = new THREE.Mesh(crystalGeo, shellMat);
      crystalMesh.userData = { relicId: idx, relicData: data };
      this.relicMeshes.push(crystalMesh);
      relicHolder.add(crystalMesh);

      // Glowing wireframe edges
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(data.color),
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const wireCage = new THREE.LineSegments(edgesGeo, edgeMat);
      crystalMesh.add(wireCage);

      // Inner pulsating chronon core
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.color),
        transparent: true,
        opacity: 0.95
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      crystalMesh.add(coreMesh);

      // Floating Roman numeral plaque above crystal
      const badgeTex = createRomanBadgeTexture(data.roman, `EPOCH ${idx + 1}`);
      const badgeMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.position.set(0, 2.35, 0);
      badgeSprite.scale.set(1.75, 1.75, 1.0);
      relicHolder.add(badgeSprite);

      // Vertical golden tether beam down to the spacetime grid
      const tetherGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -1.6, 0),
        new THREE.Vector3(0, -10.5, 0)
      ]);
      const tetherMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(data.color),
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const tetherLine = new THREE.Line(tetherGeo, tetherMat);
      relicHolder.add(tetherLine);

      // Selection halo ring around the relic
      const haloGeo = new THREE.RingGeometry(1.15, 1.26, 32);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === this.selectedRelicId ? 0.9 : 0.15,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      relicHolder.add(haloMesh);

      this.relicsOrbitGroup.add(relicHolder);
      this.relicGroups.push({
        id: idx,
        holder: relicHolder,
        crystalMesh,
        shellMat,
        edgeMat,
        coreMesh,
        haloMesh,
        haloMat,
        badgeSprite,
        baseAngle: angle,
        orbitRadius,
        baseHeight
      });
    });
  }

  _buildPolarHourglassFilaments() {
    this.filamentsGroup = new THREE.Group();
    this.root.add(this.filamentsGroup);

    // Double-helix relativistic magnetic field lines along North & South poles
    const strandCount = 6;
    for (let s = 0; s < strandCount; s++) {
      const points = [];
      const phase = (s / strandCount) * Math.PI * 2;
      for (let i = -80; i <= 80; i++) {
        const t = i / 80; // -1 to 1
        const y = t * 26.0;
        const r = 0.65 + Math.pow(Math.abs(t), 1.65) * 6.8;
        const theta = t * 8.5 + phase;
        points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: s % 2 === 0 ? new THREE.Color('#E8B86D') : new THREE.Color('#72B8D4'),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(curveGeo, curveMat);
      this.filamentsGroup.add(line);
    }
  }

  setSelectedRelic(id) {
    this.selectedRelicId = id;
    this.relicGroups.forEach((rg) => {
      const isSel = rg.id === id;
      rg.haloMat.opacity = isSel ? 0.95 : 0.16;
      rg.shellMat.emissiveIntensity = isSel ? 0.85 : 0.25;
    });
  }

  setHoveredRelic(id) {
    this.hoveredRelicId = id;
  }

  /**
   * Updates all procedural rings, shattered fragments, clock hands, and relics
   */
  update(properTime, deltaProperTime, timeScale, cursorWorldPos, cursorActive, collapseWave) {
    // 1. Rotate dial plate & polar filaments
    this.dialPlate.rotation.z = -properTime * 0.05;
    this.filamentsGroup.rotation.y = properTime * 0.28;

    // 2. Precess nested armillary rings + subtle tilt toward 3D cursor
    const cursorTiltX = cursorActive ? (cursorWorldPos.z * 0.008) : 0;
    const cursorTiltZ = cursorActive ? (-cursorWorldPos.x * 0.008) : 0;

    this.rings.forEach((r, idx) => {
      r.group.rotation.x += r.speed[0] * deltaProperTime * 0.65;
      r.group.rotation.y += r.speed[1] * deltaProperTime * 0.65;
      r.group.rotation.z += r.speed[2] * deltaProperTime * 0.65;

      // Subtle breathing during singularity collapse wave
      const waveScale = 1.0 + Math.sin(collapseWave * Math.PI) * 0.08 * (idx % 2 === 0 ? -1 : 1);
      r.group.scale.setScalar(waveScale);

      // Gentle cursor magnetic alignment
      r.group.rotation.x += (cursorTiltX - (r.group.rotation.x - r.baseTiltX) * 0.01) * 0.04;
      r.group.rotation.z += (cursorTiltZ - (r.group.rotation.z - r.baseTiltZ) * 0.01) * 0.04;
    });

    // 3. Shattered outer ring segments drift
    this.shatteredShards.forEach((s) => {
      s.mesh.rotation.z += s.driftSpeed * deltaProperTime * 0.18;
      s.mesh.position.y = s.baseY + Math.sin(properTime * 0.8 + s.phase) * 0.45;
    });

    // 4. Relativistic Clock Hands driven by Proper Time (tau)
    this.secondHand.rotation.y = -properTime * 0.65;
    this.minuteHand.rotation.y = -properTime * 0.12;
    this.hourHand.rotation.y = -properTime * 0.025;

    // 5. Orbit & animate the 12 Temporal Relics
    this.relicsOrbitGroup.rotation.y = properTime * 0.032;

    this.relicGroups.forEach((rg) => {
      const isSelected = rg.id === this.selectedRelicId;
      const isHovered = rg.id === this.hoveredRelicId;

      rg.crystalMesh.rotation.y += deltaProperTime * 0.6 + (isHovered || isSelected ? 0.025 : 0.004);
      rg.crystalMesh.rotation.z = Math.sin(properTime * 1.1 + rg.id) * 0.12;
      rg.holder.position.y = rg.baseHeight + Math.sin(properTime * 0.9 + rg.id * 0.8) * 0.55;

      const targetScale = isHovered ? 1.32 : isSelected ? 1.22 : 1.0;
      rg.crystalMesh.scale.lerp(
        new THREE.Vector3(0.72 * targetScale, 1.85 * targetScale, 0.72 * targetScale),
        0.12
      );

      rg.haloMesh.rotation.z -= 0.015;
      rg.haloMesh.scale.setScalar(isHovered || isSelected ? 1.25 + Math.sin(properTime * 3.0) * 0.08 : 1.0);
    });
  }

  /**
   * Returns the current world position of a specific relic for camera focus or UI tagging
   */
  getRelicWorldPosition(id, targetVec = new THREE.Vector3()) {
    const rg = this.relicGroups[id];
    if (!rg) return targetVec;
    rg.crystalMesh.getWorldPosition(targetVec);
    return targetVec;
  }
}
