// ============================================================================
// FINIS TEMPORIS · 《时间的尽头》
// Custom GLSL Shaders: Relativistic Accretion Disk, Event Horizon Fresnel,
// Warped Spacetime Geodesic Grid, GPU Chronon Vortex, and Gravitational Lensing
// ============================================================================

const SIMPLEX_NOISE_3D = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

// 1. RELATIVISTIC ACCRETION DISK SHADER (High-Contrast Filaments, Controlled HDR)
export const AccretionDiskShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;

    uniform float uTime;
    uniform float uCollapseWave;
    uniform vec3 uCursorWorldPos;
    uniform float uCursorActive;

    void main() {
      vUv = uv;
      vec3 pos = position;
      float r = length(pos.xz);

      float wave = sin(r * 1.4 - uTime * 3.2) * 0.09 * smoothstep(4.5, 16.0, r);
      float pulse = exp(-pow(r - uCollapseWave * 28.0, 2.0) * 0.18) * sin(uCollapseWave * 18.0) * 1.2;
      pos.y += wave + pulse;

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);

      float dCursor = distance(worldPosition.xz, uCursorWorldPos.xz);
      float cursorPull = exp(-dCursor * dCursor * 0.06) * uCursorActive;
      worldPosition.y -= cursorPull * 1.1;

      vLocalPos = pos;
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    ${SIMPLEX_NOISE_3D}

    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;

    uniform float uTime;
    uniform float uTimeScale;
    uniform float uCollapseWave;
    uniform vec3 uPrimaryColor;
    uniform vec3 uSecondaryColor;
    uniform vec3 uAccentCyan;
    uniform vec3 uCursorWorldPos;
    uniform float uCursorActive;

    void main() {
      float r = length(vLocalPos.xz);
      float innerR = 4.35;
      float outerR = 22.0;

      float innerMask = smoothstep(innerR, innerR + 0.85, r);
      float outerMask = 1.0 - smoothstep(innerR + 3.5, outerR, r);
      float radialMask = innerMask * pow(outerMask, 1.35);
      if (radialMask <= 0.002) discard;

      float theta = atan(vLocalPos.z, vLocalPos.x);

      // Keplerian differential swirl
      float keplerSpeed = 12.0 / pow(max(r, 3.5), 1.15);
      float swirlAngle = theta + uTime * keplerSpeed * 0.42 + 8.5 / (r * 0.4 + 0.5);

      vec3 noiseCoord1 = vec3(cos(swirlAngle) * r * 0.36, sin(swirlAngle) * r * 0.36, r * 0.28 - uTime * 0.45);
      vec3 noiseCoord2 = vec3(cos(swirlAngle * 2.0) * r * 0.72, sin(swirlAngle * 2.0) * r * 0.72, uTime * 0.7);

      float n1 = snoise(noiseCoord1) * 0.5 + 0.5;
      float n2 = snoise(noiseCoord2) * 0.5 + 0.5;

      // Crisp, luminous spiral plasma filaments with dark gaps so Horologium rings remain legible
      float spiralGrooves = sin(r * 4.2 - theta * 3.0 - uTime * 2.4 + n1 * 4.2) * 0.5 + 0.5;
      float fineRings = sin(r * 11.0 - uTime * 4.0 + n2 * 3.0) * 0.5 + 0.5;
      float filaments = pow(mix(n1, n2, 0.5) * spiralGrooves, 1.55) * (0.65 + 0.35 * fineRings);

      // Relativistic Doppler beaming
      vec3 tangentDir = normalize(vec3(-vWorldPos.z, 0.0, vWorldPos.x));
      float flowSign = uTimeScale >= 0.0 ? 1.0 : -1.0;
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float doppler = dot(tangentDir * flowSign, viewDir);

      // Thin inner photon ring
      float photonRing = exp(-pow((r - (innerR + 0.45)) * 2.4, 2.0)) * 1.25;

      // Shockwave ring highlight
      float shockRing = exp(-pow(r - uCollapseWave * 26.0, 2.0) * 0.25)
        * smoothstep(0.01, 0.2, uCollapseWave)
        * (1.0 - smoothstep(0.75, 1.0, uCollapseWave)) * 1.45;

      // Cursor proximity glow
      float dCursor = distance(vWorldPos.xz, uCursorWorldPos.xz);
      float cursorGlow = exp(-dCursor * dCursor * 0.08) * uCursorActive * 0.85;

      vec3 baseCol = mix(uSecondaryColor, uPrimaryColor, smoothstep(outerR, innerR, r));
      vec3 approachingCol = mix(uPrimaryColor * 1.15, uAccentCyan * 1.2, 0.45);
      vec3 recedingCol = uSecondaryColor * 0.72;

      vec3 dopplerColor = mix(recedingCol, approachingCol, smoothstep(-0.85, 0.85, doppler));
      vec3 finalColor = mix(baseCol, dopplerColor, 0.62);

      finalColor += vec3(1.0, 0.92, 0.75) * photonRing * 0.75;
      finalColor += uAccentCyan * (shockRing + cursorGlow) * 0.75;

      float intensity = (filaments * 1.25 + photonRing * 0.65 + shockRing * 0.6 + cursorGlow * 0.45) * radialMask;
      intensity *= (0.92 + doppler * 0.28);

      float alpha = clamp(intensity * 0.82, 0.0, 0.88);
      gl_FragColor = vec4(finalColor * (0.75 + intensity * 0.45), alpha);
    }
  `
};

// 2. EVENT HORIZON & GRAVITATIONAL EINSTEIN HALO SHADER
export const SingularitySphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPos;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPos;

    uniform float uTime;
    uniform vec3 uRimColor;
    uniform vec3 uCyanColor;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float ndotv = max(dot(normal, viewDir), 0.0);

      // Razor-thin photon sphere ring only at extreme grazing angle (ndotv < 0.22)
      float fresnel = pow(1.0 - ndotv, 7.5);
      float razorEdge = exp(-pow((ndotv - 0.11) * 14.0, 2.0)) * 1.35;

      float shimmer = sin(vWorldPos.y * 3.5 + uTime * 2.8) * 0.5 + 0.5;
      vec3 rim = mix(uRimColor, uCyanColor, shimmer * 0.32) * (fresnel * 0.95 + razorEdge);

      // Deep pitch-black interior shadow
      float coreBlack = smoothstep(0.04, 0.26, ndotv);
      vec3 col = mix(rim, vec3(0.002, 0.003, 0.006), coreBlack);

      gl_FragColor = vec4(col, 1.0);
    }
  `
};

// 3. WARPED SPACETIME GEODESIC FABRIC SHADER (Flamm's Paraboloid + Cursor Gravity Well)
export const SpacetimeGridShader = {
  vertexShader: /* glsl */ `
    varying vec3 vWorldPos;
    varying float vRadius;
    varying float vWellDepth;
    varying float vCursorInfluence;

    uniform float uTime;
    uniform float uGravityDepth;
    uniform vec3 uCursorWorldPos;
    uniform float uCursorActive;
    uniform float uCollapseWave;

    void main() {
      vec3 pos = position;
      float r = length(pos.xz);
      vRadius = r;

      float funnel = -uGravityDepth / (pow(r * 0.135, 1.35) + 0.72);

      vec4 worldBase = modelMatrix * vec4(pos, 1.0);
      float dCursor = distance(worldBase.xz, uCursorWorldPos.xz);
      float cursorWell = -3.8 * exp(-dCursor * dCursor * 0.035) * uCursorActive;
      float cursorRipple = sin(dCursor * 1.6 - uTime * 5.0) * 0.35 * exp(-dCursor * 0.12) * uCursorActive;

      float collapseRipple = sin((r - uCollapseWave * 38.0) * 1.2) * exp(-pow(r - uCollapseWave * 38.0, 2.0) * 0.06) * 2.2;

      pos.y += funnel + cursorWell + cursorRipple + collapseRipple;

      vec4 finalWorld = modelMatrix * vec4(pos, 1.0);
      vWorldPos = finalWorld.xyz;
      vWellDepth = clamp(abs(funnel + cursorWell) / 14.0, 0.0, 1.0);
      vCursorInfluence = exp(-dCursor * dCursor * 0.04) * uCursorActive;

      gl_Position = projectionMatrix * viewMatrix * finalWorld;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vWorldPos;
    varying float vRadius;
    varying float vWellDepth;
    varying float vCursorInfluence;

    uniform float uTime;
    uniform vec3 uGridColor;
    uniform vec3 uHighlightColor;

    void main() {
      float r = vRadius;
      float theta = atan(vWorldPos.z, vWorldPos.x);

      float radialCoord = r * 0.42 - uTime * 0.18;
      float radialGrid = abs(fract(radialCoord - 0.5) - 0.5) / max(fwidth(radialCoord), 0.001);
      float radialLine = 1.0 - min(radialGrid, 1.0);

      float spokeCoord = (theta / (2.0 * 3.14159265)) * 24.0;
      float spokeGrid = abs(fract(spokeCoord - 0.5) - 0.5) / max(fwidth(spokeCoord), 0.001);
      float spokeLine = 1.0 - min(spokeGrid, 1.0);

      float lineMask = max(radialLine * 0.85, spokeLine * 0.65);

      float innerFade = smoothstep(4.2, 7.2, r);
      float outerFade = 1.0 - smoothstep(26.0, 50.0, r);
      float fade = innerFade * outerFade;

      vec3 col = mix(uGridColor, uHighlightColor, clamp(vWellDepth * 0.75 + vCursorInfluence * 1.1, 0.0, 1.0));
      float pulseGlow = (sin(r * 0.45 - uTime * 1.8) * 0.5 + 0.5) * 0.18;

      float alpha = (lineMask * 0.34 + vCursorInfluence * 0.22 + pulseGlow * lineMask) * fade;
      if (alpha < 0.01) discard;

      gl_FragColor = vec4(col * (0.85 + vCursorInfluence * 0.65), alpha);
    }
  `
};

// 4. GPU CHRONON PARTICLE VORTEX & POLAR HOURGLASS JETS SHADER
export const ChrononParticleShader = {
  vertexShader: /* glsl */ `
    attribute float aRadius;
    attribute float aAngle;
    attribute float aSpeed;
    attribute float aHeight;
    attribute float aScale;
    attribute float aBand;

    varying vec3 vColor;
    varying float vAlpha;

    uniform float uTime;
    uniform float uTimeScale;
    uniform float uCollapseWave;
    uniform vec3 uCursorWorldPos;
    uniform float uCursorActive;
    uniform vec3 uColorGold;
    uniform vec3 uColorCyan;
    uniform vec3 uColorEmber;

    void main() {
      float t = uTime;
      vec3 pos = vec3(0.0);
      float alpha = 1.0;

      if (aBand < 0.5) {
        // Band 0: Logarithmic Spiral Accretion Chronons
        float radialFlow = fract(aRadius - t * aSpeed * 0.042);
        float r = mix(4.6, 33.0, radialFlow);
        float kepler = (11.5 / pow(r, 0.82)) * t * aSpeed * 0.32;
        float theta = aAngle + kepler;

        float verticalThickness = aHeight * (0.18 + pow(r / 33.0, 1.4) * 2.0);
        pos = vec3(cos(theta) * r, verticalThickness, sin(theta) * r);

        float dShock = r - uCollapseWave * 34.0;
        pos += normalize(vec3(pos.x, 0.0, pos.z)) * exp(-dShock * dShock * 0.12) * sin(uCollapseWave * 12.0) * 2.0;

        vec3 toCursor = uCursorWorldPos - pos;
        float dCursor = length(toCursor.xz);
        float pull = exp(-dCursor * dCursor * 0.045) * uCursorActive;
        pos.xz += normalize(toCursor.xz + vec2(0.0001)) * pull * 2.1;
        pos.y += sin(dCursor * 1.5 - t * 4.0) * pull * 1.0;

        float heat = 1.0 - smoothstep(4.6, 24.0, r);
        vColor = mix(uColorEmber, uColorGold, heat);
        if (uTimeScale < -0.05) {
          vColor = mix(vColor, uColorCyan, 0.65);
        }
        vColor = mix(vColor, uColorCyan * 1.25, pull);
        alpha = smoothstep(4.5, 6.2, r) * (1.0 - smoothstep(25.0, 33.0, r)) * (0.22 + heat * 0.32);

      } else if (aBand < 1.5) {
        // Band 1: Cosmic Hourglass Polar Relativistic Jets (North & South Cones)
        float poleSign = aHeight >= 0.0 ? 1.0 : -1.0;
        float life = fract(aRadius + t * aSpeed * 0.13);
        float y = poleSign * mix(4.4, 27.0, life);
        float coneR = (0.42 + pow(abs(y) * 0.09, 1.5) * 3.8) * (0.35 + 0.65 * fract(aSpeed * 7.13));
        float twist = aAngle + t * aSpeed * 1.3 + y * 0.3;

        pos = vec3(cos(twist) * coneR, y, sin(twist) * coneR);
        vColor = mix(uColorGold, uColorCyan, smoothstep(4.5, 22.0, abs(y)));
        alpha = sin(life * 3.14159265) * 0.34;

      } else {
        // Band 2: Suspended Relic Dust & Celestial Sanctuary Motes
        float r = mix(9.0, 46.0, aRadius);
        float theta = aAngle + t * aSpeed * 0.05;
        float y = aHeight * 15.0 + sin(t * 0.6 + aAngle * 3.0) * 1.1;
        pos = vec3(cos(theta) * r, y, sin(theta) * r);
        vColor = mix(uColorGold * 0.85, uColorCyan, fract(aSpeed * 3.7));
        alpha = (1.0 - smoothstep(30.0, 46.0, r)) * 0.32;
      }

      float freezeBoost = 1.0 + exp(-abs(uTimeScale) * 8.0) * 0.28;
      vAlpha = clamp(alpha * freezeBoost, 0.0, 0.62);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float dist = max(-mvPosition.z, 1.0);
      gl_PointSize = clamp((aScale * 44.0 * freezeBoost) / dist, 1.0, 5.2);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r2 = dot(cxy, cxy);
      if (r2 > 1.0) discard;

      float glow = exp(-r2 * 3.8);
      float core = smoothstep(0.28, 0.0, r2);
      vec3 col = vColor * 0.85 + vec3(0.22) * core;

      gl_FragColor = vec4(col, vAlpha * glow);
    }
  `
};

// 5. POST-PROCESSING GRAVITATIONAL LENSING & CHROMATIC DISPERSION PASS
export const ChronoLensPostShader = {
  uniforms: {
    tDiffuse: { value: null },
    uSingularityScreenPos: { value: null },
    uAspect: { value: 1.777 },
    uLensStrength: { value: 0.012 },
    uChromaticIntensity: { value: 0.0012 },
    uTime: { value: 0.0 },
    uTimeScale: { value: 1.0 },
    uCollapseWave: { value: 0.0 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uSingularityScreenPos;
    uniform float uAspect;
    uniform float uLensStrength;
    uniform float uChromaticIntensity;
    uniform float uTime;
    uniform float uTimeScale;
    uniform float uCollapseWave;

    varying vec2 vUv;

    float hash12(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 uv = vUv;
      vec2 delta = uv - uSingularityScreenPos;
      vec2 aspectDelta = vec2(delta.x * uAspect, delta.y);
      float dist = length(aspectDelta);

      // Smooth gravitational lensing ring deflection (zero inside shadow core so event horizon stays crisp)
      float shadowRadius = 0.088;
      float ringProfile = smoothstep(shadowRadius * 0.5, shadowRadius * 1.15, dist) * exp(-(dist - shadowRadius) * 7.5);
      float deflection = uLensStrength * ringProfile;

      // Shockwave ripple distortion
      float waveRadius = uCollapseWave * 0.85;
      float shockWave = sin((dist - waveRadius) * 36.0)
        * exp(-pow((dist - waveRadius) * 9.0, 2.0))
        * 0.012
        * smoothstep(0.01, 0.15, uCollapseWave)
        * (1.0 - smoothstep(0.75, 1.0, uCollapseWave));

      vec2 dir = normalize(delta + vec2(0.00001));
      vec2 warpedUv = clamp(uv - dir * (deflection + shockWave), 0.001, 0.999);

      // Subtle, crisp radial chromatic dispersion
      float caAmount = uChromaticIntensity * (0.25 + dist * 0.65 + ringProfile * 1.5);
      vec2 caOffset = dir * caAmount;

      float rChannel = texture2D(tDiffuse, clamp(warpedUv + caOffset, 0.001, 0.999)).r;
      float gChannel = texture2D(tDiffuse, warpedUv).g;
      float bChannel = texture2D(tDiffuse, clamp(warpedUv - caOffset, 0.001, 0.999)).b;
      vec3 col = vec3(rChannel, gChannel, bChannel);

      // Soft highlight compression so bright cores never blow out to flat white
      col = col / (1.0 + col * 0.28);

      // Subtle Einstein photon ring glint
      float ringGlint = exp(-pow((dist - shadowRadius * 1.05) * 42.0, 2.0)) * 0.14;
      col += vec3(0.96, 0.80, 0.52) * ringGlint;

      // Time-freeze crystalline tint when uTimeScale ~ 0
      float freezeFactor = exp(-abs(uTimeScale) * 10.0);
      vec3 frozenTint = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))) * vec3(0.88, 0.98, 1.15), freezeFactor * 0.25);
      col = frozenTint;

      // Subtle filmic grain & observatory vignette
      float grain = (hash12(uv * 800.0 + uTime) - 0.5) * 0.014;
      float vig = 1.0 - smoothstep(0.58, 1.35, length((uv - 0.5) * vec2(uAspect * 0.78, 1.0)));
      col = (col + grain) * (0.76 + 0.24 * vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `
};
