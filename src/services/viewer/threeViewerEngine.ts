import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ViewerOptions {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  backgroundColor?: number;
}

/**
 * GENUINE THREE.JS WEBGL VIEWER ENGINE
 * Extracted and modernized from viewer360.js reference:
 * - Proper ACESFilmicToneMapping & sRGB color space
 * - Auto-centering and bounding-box camera distance calculation (no model stretching)
 * - Studio key/fill/rim lighting rig with soft shadow maps
 * - Complete memory and WebGL context disposal to prevent memory leaks
 */
export class ThreeViewerEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animId: number | null = null;
  private currentModel: THREE.Object3D | null = null;
  private isDisposed = false;

  constructor(container: HTMLElement, options: ViewerOptions = {}) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.backgroundColor ?? 0xf8f6f1);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 1.2, 3.2);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = options.autoRotate ?? false;
    this.controls.autoRotateSpeed = options.autoRotateSpeed ?? 1.2;
    this.controls.enableZoom = options.enableZoom ?? true;
    this.controls.enablePan = options.enablePan ?? false;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip below ground

    // 5. Studio Lighting Rig
    this.setupLighting();

    // 6. Handle Resize
    window.addEventListener('resize', this.onResize);

    // 7. Render Loop
    this.animate();
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.9);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfffaee, 1.6);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8ecf2, 0.8);
    fillLight.position.set(-4, 3, 2);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    rimLight.position.set(0, 4, -4);
    this.scene.add(rimLight);

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
  }

  /**
   * Centers model and computes optimal camera distance without distortion
   */
  public frameModel(model: THREE.Object3D): void {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }
    this.currentModel = model;
    this.scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center model at origin
    model.position.sub(center);

    // Put model directly on ground
    const minY = box.min.y - center.y;
    model.position.y = -minY;

    // Calculate camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.45; // Generous breathing room

    this.camera.position.set(0, maxDim * 0.45, cameraZ);
    this.camera.near = cameraZ / 100;
    this.camera.far = cameraZ * 100;
    this.camera.updateProjectionMatrix();

    this.controls.target.set(0, maxDim * 0.35, 0);
    this.controls.minDistance = cameraZ * 0.4;
    this.controls.maxDistance = cameraZ * 2.8;
    this.controls.update();
  }

  private onResize = (): void => {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = (): void => {
    if (this.isDisposed) return;
    this.animId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    this.isDisposed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);

    // Dispose scene meshes
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
