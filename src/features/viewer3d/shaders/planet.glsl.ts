import { noiseGLSL } from './noise.glsl.ts'

export const planetVertexShader = /* glsl */ `
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;

void main() {
  vObjectPosition = position;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const planetFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uNoiseScale;
uniform float uSeed;
uniform int   uMode;          // 0 = rochoso, 1 = gasoso, 2 = terrestre, 3 = estrela
uniform float uBandFrequency;
uniform float uWarp;
uniform float uPolarCaps;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec3  uColorD;
uniform vec3  uLightDirection;

varying vec3 vObjectPosition;
varying vec3 vWorldNormal;

${noiseGLSL}

vec3 rockySurface(vec3 p, vec3 dir) {
  float craters = ridged(p * uNoiseScale, 5);
  float detail = fbm(p * uNoiseScale * 3.0, 4) * 0.5 + 0.5;
  float height = mix(craters, detail, 0.35);

  vec3 color = mix(uColorC, uColorA, smoothstep(0.25, 0.65, height));
  color = mix(color, uColorB, smoothstep(0.6, 0.95, height));

  // Calotas polares, quando o corpo as tiver.
  float latitude = abs(dir.y);
  float caps = smoothstep(0.82, 0.95, latitude) * uPolarCaps;
  return mix(color, vec3(0.95, 0.96, 0.98), caps);
}

vec3 gasSurface(vec3 p, vec3 dir) {
  // As faixas seguem a latitude; o ruído as faz ondular como turbulência real.
  float turbulence = fbm(p * uNoiseScale + vec3(uTime * 0.02, 0.0, 0.0), 4);
  float bands = sin((dir.y + turbulence * uWarp) * uBandFrequency * 3.14159);
  float t = bands * 0.5 + 0.5;

  vec3 color = mix(uColorC, uColorA, smoothstep(0.15, 0.6, t));
  color = mix(color, uColorB, smoothstep(0.55, 1.0, t));

  // Redemoinhos finos sobre as faixas.
  float swirl = fbm(p * uNoiseScale * 4.0 + vec3(0.0, uTime * 0.03, 0.0), 3);
  return color * (0.92 + swirl * 0.16);
}

vec3 earthSurface(vec3 p, vec3 dir) {
  float continents = fbm(p * uNoiseScale, 6);
  float latitude = abs(dir.y);

  vec3 ocean = uColorA;
  vec3 land = uColorB;
  vec3 mountain = uColorC;
  vec3 ice = uColorD;

  float landMask = smoothstep(0.02, 0.12, continents);
  vec3 color = mix(ocean, land, landMask);
  color = mix(color, mountain, smoothstep(0.28, 0.45, continents));

  // Gelo nos polos, avançando um pouco sobre o oceano.
  float caps = smoothstep(0.76, 0.9, latitude);
  color = mix(color, ice, caps);

  // Nuvens esparsas.
  float clouds = fbm(p * uNoiseScale * 1.6 + vec3(uTime * 0.01, 0.0, 0.0), 4);
  color = mix(color, vec3(0.97, 0.98, 1.0), smoothstep(0.22, 0.5, clouds) * 0.55);
  return color;
}

vec3 starSurface(vec3 p) {
  float granulation = fbm(p * uNoiseScale * 4.0 + vec3(uTime * 0.05), 5) * 0.5 + 0.5;
  float plasma = ridged(p * uNoiseScale * 1.5 - vec3(uTime * 0.03), 4);
  float t = clamp(granulation * 0.65 + plasma * 0.45, 0.0, 1.0);

  vec3 color = mix(uColorA, uColorB, smoothstep(0.25, 0.7, t));
  return mix(color, uColorC, smoothstep(0.7, 1.0, t));
}

void main() {
  // dir é a direção real na esfera: dela saem latitude, faixas e calotas.
  // p apenas desloca a AMOSTRAGEM do ruído, para que cada corpo tenha um padrão
  // próprio. Misturar os dois achata a latitude e apaga o relevo.
  vec3 dir = normalize(vObjectPosition);
  vec3 p = vObjectPosition + vec3(uSeed * 13.37);

  vec3 albedo;
  if (uMode == 0)      albedo = rockySurface(p, dir);
  else if (uMode == 1) albedo = gasSurface(p, dir);
  else if (uMode == 2) albedo = earthSurface(p, dir);
  else                 albedo = starSurface(p);

  vec3 color;
  if (uMode == 3) {
    // Estrelas emitem luz própria: nada de sombreamento direcional.
    float limb = pow(max(dot(normalize(vWorldNormal), vec3(0.0, 0.0, 1.0)), 0.0), 0.35);
    color = albedo * mix(0.75, 1.15, limb);
  } else {
    vec3 normal = normalize(vWorldNormal);
    float lambert = max(dot(normal, normalize(uLightDirection)), 0.0);
    // "Wrap lighting": suaviza o terminador e evita que metade do corpo suma no preto.
    float diffuse = pow(lambert * 0.5 + 0.5, 1.6);
    float ambient = 0.16;
    color = albedo * (ambient + diffuse * 1.05);
  }

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const atmosphereVertexShader = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vViewDirection = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

export const atmosphereFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uIntensity;

varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
  // Fresnel: o brilho aparece na borda, onde a atmosfera é vista de raspão.
  float fresnel = 1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0);
  float glow = pow(fresnel, 2.6) * uIntensity;
  gl_FragColor = vec4(uColor, clamp(glow, 0.0, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`
