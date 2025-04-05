'use client'
import React, { createRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import glsl from 'glslify';
const vertexShader = `
    varying vec2 v_uv;

    void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader avec bruit procédural
const fragmentShader = `
    varying vec2 v_uv;

    // Fonction pour générer un bruit pseudo-aléatoire basé sur une valeur
    float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        // Utilisation de la position UV pour générer un bruit
        float noiseValue = random(v_uv * 10.0); // Multiplier pour augmenter la fréquence du bruit

        // Affichage du bruit sur toute la scène
        gl_FragColor = vec4(vec3(noiseValue), 1.0); // Application du bruit à la couleur finale
    }
`;

class Figure extends React.Component {
    constructor(props) {
        super(props);
        this.$image = createRef();
        this.scene = props.scene || new THREE.Scene(); // Correction ✅
        
        this.loader = new THREE.TextureLoader();
        this.sizes = new THREE.Vector2(0, 0);
        this.offset = new THREE.Vector2(0, 0);
        this.mouse = new THREE.Vector2(0, 0);

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ map: null }); // Init sans texture
        this.mesh = new THREE.Mesh(this.geometry, this.material);  

        // this.shaderVertex = this.loadShader('/glsl/shaderVertex.vert')
        // this.shaderFragement = this.loadShader('/glsl/shaderFragement.frag')
    }

    componentDidMount() {
        if (!this.$image.current) return;
        const imgElement = this.$image.current;

        // Charger l'image de base
        this.image = this.loader.load(imgElement.dataset.src, (texture) => {
            this.material.map = texture;
            this.material.needsUpdate = true;
        });

        // Charger l'image au survol
        this.hoverImage = this.loader.load(imgElement.dataset.hover);

        // Définir les uniforms
        this.uniforms = {
            u_image: { type: 't', value: this.image },
            u_imagehover: { type: 't', value: this.hoverImage },
            u_mouse: { value: this.mouse },
            u_time: { value: 0 },
            u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_pixelRatio: { value: window.devicePixelRatio.toFixed(1)  }
        }

        // Utiliser ShaderMaterial pour appliquer un shader

        // this.material = new THREE.ShaderMaterial({
        //     vertexShader: vertexShader,
        //     fragmentShader : fragmentShader
        // });


        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: glsl`
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: glsl`
            precision mediump float;
            uniform vec2 u_mouse;
            uniform vec2 u_res;
            uniform float u_time;
            uniform float u_pixelRatio;
            uniform sampler2D u_image;
            uniform sampler2D u_imagehover;
            varying vec2 v_uv;
            
            // --- Simplex Noise (3D) ---
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 mod289(vec4 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 permute(vec4 x) {
                return mod289(((x * 34.0) + 10.0) * x);
            }
            
            vec4 taylorInvSqrt(vec4 r) {
                return 1.79284291400159 - 0.85373472095314 * r;
            }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
            
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
            
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
            
                i = mod289(i);
                vec4 p = permute(
                    permute(
                        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0)
                );
            
                float n_ = 1.0 / 7.0;
                vec3 ns = n_ * D.wyz - D.xzx;
            
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
            
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
            
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
            
                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
            
                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
            
                vec4 norm = taylorInvSqrt(vec4(
                    dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)
                ));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
            
                vec4 m = max(0.5 - vec4(
                    dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)
                ), 0.0);
                m *= m;
                m *= m;
            
                return 105.0 * dot(m, vec4(
                    dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)
                ));
            }
            
            float circle(vec2 _st, float _radius, float blurriness) {
                vec2 dist = _st;
                return 1.0 - smoothstep(
                    _radius - (_radius * blurriness),
                    _radius + (_radius * blurriness),
                    dot(dist, dist) * 4.0
                );
            }
            
            void main() {
                vec4 image = texture(u_image, v_uv);
                vec4 hover = texture(u_imagehover, v_uv);

                vec2 res = u_res * u_pixelRatio;
                vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
                st.y *= u_res.y / u_res.x;
            
                vec2 mouse = u_mouse * 0.5;
                mouse.y *= u_res.y / u_res.x;
                mouse *= -1.0;
            
                float offx = v_uv.x + sin(v_uv.y + u_time * .1);
                float offy = v_uv.y - u_time * 0.1 - cos(u_time * 0.001) * .01;
            
                vec2 circlePos = st + mouse;
                float c = circle(circlePos, 0.1, 0.2) * 1.5;
            
                float n = snoise(vec3(offx, offy, u_time * .1) * 4.0) - 1.0;
                float finalMask = smoothstep(0.4, 0.5, n + pow(c, 2.));

                vec4 finalImage = mix(image, hover, finalMask);
                gl_FragColor = finalImage;
            }`,
            defines: {
                 PR: window.devicePixelRatio.toFixed(1)
            }
        });

        // Mettre à jour les tailles et créer le mesh
        this.getSizes();
        this.createMesh();
        window.addEventListener('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove);
    }

    getSizes() {
        if (!this.$image.current) return;
        const { width, height, top, left } = this.$image.current.getBoundingClientRect();
        this.sizes.set(width, height);
        this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2);
    }

    createMesh() {
        this.mesh.position.set(this.offset.x, this.offset.y, 1);
        this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
        this.mesh.material = this.material;
        this.scene.add(this.mesh); // Correction ✅
    }

    onMouseMove = (event) => {
        gsap.to(this.mouse, {
            duration: 0.5,
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1,
        });

        gsap.to(this.mesh.rotation, {
            duration: 0.5,
            x: -this.mouse.y * 0.3,
            y: this.mouse.x * (Math.PI / 6),
        });
    };

    render() {
        return (
            <figure className="tile__figure">
                <img
                    ref={this.$image}
                    data-src="/imgs/pexels-matus-burian-6692972-5975534.jpg"
                    data-hover="/imgs/pexels-mikhail-nilov-6942965.jpg"
                    className="tile__image"
                    alt="My image"
                    width="400"
                    height="300"
                />
            </figure>
        );
    }
}

export default Figure;
