import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, MeshWobbleMaterial, Stars, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function RoamingProduct({ position, rotation, scale, color, speed, type }) {
    const meshRef = useRef();
  const timerRef = useRef(new THREE.Timer());

    useFrame(() => {
        timerRef.current.update();
        const time = timerRef.current.getElapsed();
        meshRef.current.position.y += Math.sin(time * speed) * 0.002;
        meshRef.current.rotation.x += 0.005 * speed;
        meshRef.current.rotation.y += 0.005 * speed;
      });

    return (
        <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <mesh ref={meshRef} rotation={rotation} scale={scale}>
                {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
                {type === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
                {type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
                {type === 'torus' && <torusGeometry args={[0.6, 0.2, 16, 100]} />}

                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.2}
                    radius={1}
                    transparent
                    opacity={0.4}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>

            {/* Holograhic Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[scale * 1.5, 0.01, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
        </Float>
    );
}

function ProductCloud() {
    const products = useMemo(() => {
        const types = ['box', 'sphere', 'cylinder', 'torus'];
        return new Array(20).fill().map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15 - 10
            ],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            scale: 0.3 + Math.random() * 0.6,
            speed: 0.2 + Math.random() * 0.5,
            color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#06b6d4' : '#ec4899',
            type: types[i % types.length]
        }));
    }, []);

    return (
        <group>
            {products.map((p, i) => (
                <RoamingProduct key={i} {...p} />
            ))}
        </group>
    );
}

function MovingStars() {
    const starsRef = useRef();
  const timerRef = useRef(new THREE.Timer());
    useFrame(() => {
    timerRef.current.update();
    starsRef.current.rotation.y = timerRef.current.getElapsed() * 0.01;
  });
    return <Stars ref={starsRef} radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

export default function ThreeBackground() {
    return (
        <div
            className="fixed inset-0 bg-[#060912] pointer-events-none"
            style={{ zIndex: -10 }}
        >
            <Canvas dpr={[1, 2]} style={{ pointerEvents: 'none' }}>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.8} color="#7c3aed" />
                <pointLight position={[-10, -10, -10]} intensity={0.4} color="#06b6d4" />

                <MovingStars />
                <ProductCloud />

                <fog attach="fog" args={['#060912', 15, 35]} />
            </Canvas>

            {/* Dark gradient overlay to ensure readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060912]/80 via-transparent to-[#060912] pointer-events-none" />
        </div>
    );
}
