import * as THREE from 'three';
import {Points, PointsMaterial, BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
interface OrbitParticle {
    speed: number; // 轨道粒子的速度是一个弧度值，表示每一帧绕圆形旋转的弧度
    currentAngle: number; // 当前弧度数值
    opacity: number; // 粒子透明度;
}

interface CirclePlaneBaseVectors {
  base1: Vector3,
  base2: Vector3
}

export class AvatarCycle {
    public loading = false;
    public loaded = false;
    public container = document.createElement('div');
    public rendererWrap = document.createElement('div');
    public renderer = new THREE.WebGLRenderer({ alpha: true });
    public readonly scene = new THREE.Scene();
    protected frameId: number = 0;
    public camera: THREE.PerspectiveCamera;
    protected mixer?: THREE.AnimationMixer;
    public mountContainer?: HTMLDivElement;
    protected clock = new THREE.Clock();
    protected observer?: ResizeObserver;
    private positions: Array<number> = [];
    private colors: Array<number> = [];
    private particles: Array<OrbitParticle> = [];
    private PARTICLE_COUNT = 0;
    private R = 2.8; // 圆环半径
    private geometry: BufferGeometry = new BufferGeometry();
    private points: Points| null = null;
    private origin = new Vector3(0, 0, 0.5);
    private GAP_ANGLE = Math.PI * 45 / 100; // 豁口大小
    private alphas: Array<number> = [];
    private ALPHA_CANDIDATES = [.8, .64, .64, .48, .32 , .48, .32, .16, .16]; // 例子透明度分布，每个粒子的透明度从这个数组中随机抽取
    private POINT_MATERIAL: PointsMaterial = new PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        alphaTest: 0,
        map: this.createCanvasMaterial('#'+new THREE.Color(1, 1, 1).getHexString(), 256),
    });
    private circlePlaneBaseVectors: CirclePlaneBaseVectors = {
        base1: new Vector3(1, 0, 0),
        base2: new Vector3(0, 1, 0)
    };

    // 绘制圆形材质
    createCanvasMaterial(color, size) {
        var matCanvas = document.createElement('canvas');
        matCanvas.width = matCanvas.height = size;
        var matContext = matCanvas.getContext('2d');
        // create exture object from canvas.
        var texture = new THREE.Texture(matCanvas);
        // Draw a circle
        var center = size / 2;
        if(matContext) {
            matContext.beginPath();
            matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
            matContext.closePath();
            matContext.fillStyle = color;
            matContext.fill();
        }
        // need to set needsUpdate
        texture.needsUpdate = true;
        // return a texture made from the canvas
        return texture;
    }

    constructor(particleCount = 250) {
        this.PARTICLE_COUNT = particleCount;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.camera = new THREE.PerspectiveCamera(40, 1, 1, 100);
        this.camera.position.set(0, 0, 8);

        this.rendererWrap.appendChild(this.renderer.domElement);
        this.rendererWrap.className = 'avatar-gl-renderer-wrap';

        this.container.appendChild(this.rendererWrap);
        this.container.className = 'avatar-gl-container';
        this.calcBaseVector();
    }

    // this.points?.rotateX(-Math.PI / 2.49);
    // this.points?.rotateY(Math.PI / 12);
    // this.points?.rotateZ(Math.PI * 18 / 100);
    // 获得圆环所在平面的基向量
    calcBaseVector() {
        const rotateX = -Math.PI * 40 / 100, rotateY = Math.PI * 3 / 13, rotateZ = Math.PI * - 4 / 100;
        var base1 = new Vector3(1, 0, 0);
        var base2 = new Vector3(0, 1, 0);
        var xAxis = new Vector3(1, 0, 0);
        var yAxis = new Vector3(0, 1, 0);
        var zAxis = new Vector3(0, 0, 1);
        base1.applyAxisAngle(xAxis, rotateX);
        base2.applyAxisAngle(xAxis, rotateX);
        base1.applyAxisAngle(yAxis, rotateY);
        base2.applyAxisAngle(yAxis, rotateY);
        base1.applyAxisAngle(zAxis, rotateZ);
        base2.applyAxisAngle(zAxis, rotateZ);
        this.circlePlaneBaseVectors = {
            base1: base1.multiplyScalar(this.R),
            base2: base2.multiplyScalar(this.R)
        }
    }

    getCirclePlaneBaseVectorsCopy() {
        return [
            this.circlePlaneBaseVectors.base1.clone(),
            this.circlePlaneBaseVectors.base2.clone(),
        ];
    }
    
    
    getPositionByAngle(angle: number): Array<number> {
        const [ base1, base2 ] = this.getCirclePlaneBaseVectorsCopy();
        base1.multiplyScalar(Math.cos(angle));
        base2.multiplyScalar(Math.sin(angle));
        base1.add(base2).add(this.origin);
        return [base1.x, base1.y, base1.z];
    }

    getAlphaByAngle(angle: number, cap = 1): number {
        let alpha = 1;
        const coff =  Math.min(angle - this.GAP_ANGLE, 2* Math.PI - angle)
        const fraction = Math.PI / 4;
        alpha = coff / fraction;
        return alpha * cap;
    }

    getColorByAngle(angle: number, alphaCap: number = .8): Array<number> {
        return [
            1,
            1,
            1,
            (this.getAlphaByAngle(angle, alphaCap))
        ]
    }

    updatePosition() {
        this.geometry.setAttribute(
            'position',
            new Float32BufferAttribute(this.positions, 3),
        );
    }

    updateAlpha() {
        this.geometry.setAttribute(
            'alpha',
            new Float32BufferAttribute(this.alphas, 1),
        );
    }

    updateColor() {
        this.geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(this.colors, 4)
        )
    }

    initParticles () {
        const steeper = 2 * Math.PI / this.PARTICLE_COUNT;
        for(let angle = 0;angle < 2 * Math.PI; angle+=steeper) {
            if(angle > 0 && angle < this.GAP_ANGLE) continue;
            this.positions.push(...this.getPositionByAngle(angle));
            const opacity = this.ALPHA_CANDIDATES[Math.round(Math.random() * (this.ALPHA_CANDIDATES.length-1 ))];
            this.colors.push(...this.getColorByAngle(angle, opacity));
            this.particles.push({
                speed: Math.PI / 3200,
                // speed: Math.PI / 3200 + Math.random() * Math.PI / 6400,
                currentAngle: angle,
                opacity,
            });
        }
        this.updatePosition();
        this.updateColor();
        // this.updateAlpha();
        this.points = new Points(this.geometry, this.POINT_MATERIAL);
    }

    updateParticles() {
        this.particles.forEach((particle: OrbitParticle, index: number) => {
            const positionIndex = index * 3;
            const colorIndex = index * 4;
            particle.currentAngle += particle.speed;
            if(particle.currentAngle > Math.PI * 2) {
                particle.currentAngle = particle.currentAngle - Math.PI * 2;
            }
            let newPosition: Array<number> = [];
            if(particle.currentAngle > 0 && particle.currentAngle < this.GAP_ANGLE) {
                particle.currentAngle = this.GAP_ANGLE;
            }
            newPosition = this.getPositionByAngle(particle.currentAngle);
            const newAlpha = this.getAlphaByAngle(particle.currentAngle, particle.opacity);
            this.positions[positionIndex] = newPosition[0]
            this.positions[positionIndex+1] = newPosition[1];
            this.positions[positionIndex+2] = newPosition[2];
            this.colors[colorIndex + 3] = newAlpha
        });
        this.updatePosition();
        this.updateColor();
    }

    // 调整圆环姿态 (弃用，现在使用基底向量控制姿态)
    modifyCriclePosture() {
        this.points?.rotateX(-Math.PI / 2.49);
        this.points?.rotateY(Math.PI / 12);
        this.points?.rotateZ(Math.PI * 18 / 100);
    }


    load() {
        if (this.loaded || this.loading) {
            return;
        }
        this.loading = true;
        this.initParticles();
        if(this.points) {
            this.scene.add(this.points);
        }
        // this.modifyCriclePosture();
        this.loaded= true;
        this.loading = false;
        this.animate();
    }

    protected resize() {
        this.camera.aspect =
            this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.domElement.style.width = `${this.container.clientWidth}px`;
        this.renderer.domElement.style.height = `${this.container.clientHeight}px`;
    }

    protected animate() {
        this.frameId = requestAnimationFrame(() => this.animate());
        this.render();
    }

    protected render() {
        if (!this.loaded) {
            return;
        }
        const delta = this.clock.getDelta();
        this.updateParticles();
        this.mixer?.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    unMount() {
        this.container.style.zIndex = '1';
        cancelAnimationFrame(this.frameId);
        this.observer?.disconnect();
        this.mountContainer?.removeChild(this.container);
    }

    mount(mountContainer: HTMLDivElement) {
        this.mountContainer = mountContainer;
        this.resize();
        this.observer = new ResizeObserver(() => {
            this.resize();
        });
        this.observer.observe(this.container);
        this.mountContainer.appendChild(this.container);
        this.container.style.zIndex = '4';
        this.container.style.pointerEvents = 'none';
    }

}