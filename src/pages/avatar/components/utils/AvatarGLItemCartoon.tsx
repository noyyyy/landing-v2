import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getPublicAssetPath } from '../../../../utils';
import { loadingEE, LoadingSourceType } from '../../../app/App.utils';
import { AvatarGLItemBaseWithParticle } from './base/AvatarGLItemBaseWithParticle';
export class AvatarGLItemCartoon extends AvatarGLItemBaseWithParticle {
    public particleCanvasWidth = 1080;
    public particleCanvasHeight = 1080;
    public particleImgOffset = 140;

    public extraNode = (
        <>
            <div className='avatar-extra-subtitle'>Server DevOps</div>
            <div className='avatar-extra-subtitle'>Data Analytics</div>
            <div className='avatar-extra-subtitle'>Community / Social</div>
        </>
    );

    load() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise((resolve, reject) => {
            let gltfLoaded = false;
            let imageLoaded = false;
            new GLTFLoader().load(
                getPublicAssetPath('files/avatar/avatar-cartoon.glb?v051001'),
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(0, -3.18, 0);
                    model.scale.set(3.5, 3.5, 3.5);
                    this.scene.add(model);
                    this.mixer = new THREE.AnimationMixer(model);
                    // this.mixer?.clipAction(gltf.animations?.[0])?.play();
                    gltfLoaded = true;
                    this.loaded = gltfLoaded && imageLoaded;
                    this.render();
                    if (this.loaded) {
                        resolve();
                    }
                    this.scene.add(
                        new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
                    );
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_CARTOON}`,
                        1
                    );
                },
                (event) => {
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_CARTOON}`,
                        event.total ? (event.loaded / event.total) * 0.95 : 0.5
                    );
                }
            );

            const imageUrls = new Array(360).fill(0).map((_, i) => {
                return getPublicAssetPath(
                    `files/avatar/avatar-cartoon-particle/${i + 1 + 60000}.jpg`
                );
            });
            const imageLoader = new THREE.ImageLoader();
            Promise.all(imageUrls.map((url) => imageLoader.load(url))).then(
                (data) => {
                    this.imageDataArray = data;
                    imageLoaded = true;
                    this.loaded = gltfLoaded && imageLoaded;
                    this.render();
                    if (this.loaded) {
                        resolve();
                    }
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_CARTOON_PARTICLE}`,
                        1
                    );
                }
            );
        });
        return this.loadingPromise;
    }
}
