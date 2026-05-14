import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ─── 星云核心 Shader ──────────────────────────────────────────────────────── */

const nebulaVertexShader = `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x),
          mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
          mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
    return n;
  }

  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amp * noise3(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  float turbulence(vec3 p, int octaves) {
    float value = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amp * abs(noise3(p * freq));
      freq *= 2.1;
      amp *= 0.48;
    }
    return value;
  }

  void main() {
    vec3 pos = normalize(vWorldPos);

    float t = uTime * 0.012;
    vec3 p1 = vec3(
      pos.x * cos(t) - pos.z * sin(t),
      pos.y + t * 0.2,
      pos.x * sin(t) + pos.z * cos(t)
    );
    vec3 p2 = vec3(
      pos.x * cos(t * 0.7) + pos.z * sin(t * 0.7),
      pos.y * 0.8 - t * 0.15,
      -pos.x * sin(t * 0.7) + pos.z * cos(t * 0.7)
    );

    float n1 = fbm(p1 * 2.5 + vec3(t * 0.1, 0.0, 0.0), 5);
    float n2 = turbulence(p2 * 3.0 + vec3(0.0, t * 0.08, 0.0), 4);
    float n3 = fbm(p1 * 5.0 + n2 * 0.3, 3);

    float viewDot = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float centerGlow = pow(viewDot, 0.45);

    vec3 col = vec3(0.0);

    // 外层：暖红橙（柔和过渡）
    float outerMask = smoothstep(0.05, 0.6, n1);
    col += outerMask * vec3(0.55, 0.18, 0.12) * 0.8;

    // 中层：金黄
    float midMask = smoothstep(0.3, 0.65, n2) * smoothstep(0.85, 0.25, n1);
    col += midMask * vec3(0.95, 0.65, 0.22) * 1.1;

    // 内层：白金黄（恒星核心色）
    float goldMask = smoothstep(0.4, 0.72, n3) * smoothstep(0.9, 0.35, n2);
    col += goldMask * vec3(1.0, 0.88, 0.55) * 1.3;

    // 核心：白热亮核
    float coreMask = smoothstep(0.5, 0.88, n3) * centerGlow;
    col += coreMask * vec3(0.75, 0.85, 1.0) * 2.2;

    // 亮星点
    float stars = pow(n3, 14.0) * 4.0;
    stars += pow(hash3(floor(p1 * 80.0)), 22.0) * 2.5 * smoothstep(0.25, 0.85, n1);
    col += vec3(1.0, 0.98, 0.95) * stars;

    // 整体透明度：极柔和边缘
    float alpha = smoothstep(-0.3, 0.65, n1 + n2 * 0.5) * centerGlow;
    alpha = clamp(alpha * 1.6, 0.0, 0.95);

    // 亮度呼吸
    col *= 1.15 + 0.12 * sin(uTime * 0.4 + n1 * 6.28);

    // _gamma 提亮
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, alpha);
  }
`;

// 外层发光 Shader（柔和日冕）
const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vView = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float pulse = 0.75 + 0.25 * sin(uTime * 0.35);
    float noise = hash(gl_FragCoord.xy * 0.05 + uTime * 0.02);
    noise = 0.85 + noise * 0.3;

    vec3 warm = vec3(1.0, 0.5, 0.22) * pulse * 0.55 * noise;
    vec3 cool = vec3(0.35, 0.6, 1.0) * pulse * 0.18 * noise;
    float alpha = pulse * 0.5 * noise;

    gl_FragColor = vec4(warm + cool, alpha);
  }
`;

// 第二层更外光晕
const outerGlowFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float pulse = 0.6 + 0.4 * sin(uTime * 0.2 + 1.0);
    float noise = hash(gl_FragCoord.xy * 0.03 + uTime * 0.015);
    noise = 0.8 + noise * 0.4;

    vec3 col = vec3(1.0, 0.42, 0.15) * pulse * 0.3 * noise;
    float alpha = pulse * 0.25 * noise;

    gl_FragColor = vec4(col, alpha);
  }
`;

// 动态星云核心
function NebulaCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const nebulaUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glowUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glow2Uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    nebulaUniforms.uTime.value = t;
    glowUniforms.uTime.value = t;
    glow2Uniforms.uTime.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.004;
      meshRef.current.rotation.x = Math.sin(t * 0.006) * 0.04;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = -t * 0.003;
    }
    if (glow2Ref.current) {
      glow2Ref.current.rotation.y = t * 0.0015;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3.0 + Math.sin(t * 0.25) * 0.6;
    }
  });

  return (
    <group>
      {/* 主照明 */}
      <pointLight ref={lightRef} color="#ffe0b0" intensity={3.0} distance={60} decay={1.5} />
      <pointLight color="#a0d0ff" intensity={1.2} distance={35} decay={2} position={[0, 0, 0.3]} />

      {/* 主星云球 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 128, 128]} />
        <shaderMaterial
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={nebulaUniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 第一层光晕：柔和内日冕 */}
      <mesh ref={glowRef} scale={1.55}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 第二层光晕：更外扩散光 */}
      <mesh ref={glow2Ref} scale={2.0}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={outerGlowFragmentShader}
          uniforms={glow2Uniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// 场景内容
function SceneContent() {
  return (
    <>
      <color attach="background" args={['#03020f']} />
      <fog attach="fog" args={['#03020f', 12, 45]} />

      {/* 多色动态灯光 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[12, 10, 8]}   intensity={2.5} color="#8b5cf6" distance={40} />
      <pointLight position={[-10, -8, -10]} intensity={1.8} color="#3b82f6" distance={35} />
      <pointLight position={[0, 12, -8]}   intensity={2.0} color="#ec4899" distance={35} />
      <pointLight position={[8, -10, 6]}   intensity={1.2} color="#06b6d4" distance={30} />

      {/* 主体 3D */}
      <NebulaCore />

      {/* drei 星空 */}
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0.5} fade speed={0.08} />

      {/* 轨道控制 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.12}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        makeDefault
      />
    </>
  );
}

export default function SpaceScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 58 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
