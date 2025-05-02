import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

function NetworkGraph() {
    const group = useRef<THREE.Group>(null!);
    const lineMat = useRef<THREE.LineBasicMaterial>(null!);
    const pointer = useRef<[number, number]>([0, 0]);
    const { size, gl } = useThree();

    // 1) Generate random points
    const points = useMemo(() => {
        const pts: number[] = [];
        for (let i = 0; i < 200; i++) {
            pts.push(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
            );
        }
        return new Float32Array(pts);
    }, []);

    // 2) Build edges between neighbors < 2 units apart
    const edges = useMemo(() => {
        const e: number[] = [];
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        const count = points.length / 3;

        for (let i = 0; i < count; i++) {
            a.set(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
            for (let j = i + 1; j < count; j++) {
                b.set(points[j * 3], points[j * 3 + 1], points[j * 3 + 2]);
                if (a.distanceTo(b) < 2) {
                    e.push(
                        points[i * 3],
                        points[i * 3 + 1],
                        points[i * 3 + 2],
                        points[j * 3],
                        points[j * 3 + 1],
                        points[j * 3 + 2],
                    );
                }
            }
        }
        return new Float32Array(e);
    }, [points]);

    // 3) Rotate + parallax + hue‐cycle each frame
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // rotate & parallax
        if (group.current) {
            group.current.rotation.x = t * 0.02;
            group.current.rotation.y = t * 0.03;
            group.current.position.x = pointer.current[0] * 0.5;
            group.current.position.y = pointer.current[1] * 0.5;
        }

        if (lineMat.current) {
            const hue = (t * 0.05 + 0.33) % 1;
            lineMat.current.color.setHSL(hue, 1.0, 0.5);
        }
    });

    // 4) Track pointer for parallax
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            pointer.current = [
                (e.clientX / size.width) * 2 - 1,
                -(e.clientY / size.height) * 2 + 1,
            ];
        };
        gl.domElement.addEventListener("pointermove", onMove);
        return () => gl.domElement.removeEventListener("pointermove", onMove);
    }, [gl.domElement, size]);

    // 5) Scale network up on mount
    useEffect(() => {
        if (group.current) group.current.scale.set(1.3, 1.3, 1.3);
    }, []);

    return (
        <group ref={group}>
            {/* nodes */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[points, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.05} color="#0ff" />
            </points>

            {/* edges */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[edges, 3]} />
                </bufferGeometry>
                <lineBasicMaterial ref={lineMat} transparent opacity={0.6} />
            </lineSegments>
        </group>
    );
}

export default memo(NetworkGraph);
