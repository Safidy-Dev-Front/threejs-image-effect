'use client'
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Figure from './Figure';

const Scene = () => {
    const sceneRef = useRef(null);
    const scene = useRef(new THREE.Scene()); // Correction ✅
    const perspective = 800;

    useEffect(() => {
        if (!sceneRef.current) return;

        const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
        const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: sceneRef.current, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.position.set(0, 0, perspective);
        document.body.appendChild(renderer.domElement);

        const ambientlight = new THREE.AmbientLight(0xffffff, 2);
        scene.current.add(ambientlight); // Correction ✅

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene.current, camera);
        };
        animate();

        return () => {
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <>
            <section className="container">
                <article className="tile">
                    <Figure scene={scene.current} /> {/* Correction ✅ */}
                </article>
            </section>
            <canvas ref={sceneRef}></canvas>
        </>
    );
};

export default Scene;
