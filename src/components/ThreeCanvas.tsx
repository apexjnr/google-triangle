import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DotData, PlayerId, TetrahedronValidation } from '../types/game';

interface ThreeCanvasProps {
  dots: DotData[];
  selectedDots: DotData[];
  currentPlayer: PlayerId;
  validation: TetrahedronValidation;
  isBlinking: boolean;
  onDotClick: (dot: DotData) => void;
  cameraViewTrigger: string | null;
}

// Pre-allocated math objects to avoid GC in animation loop (Skill Guideline #4.3)
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _vecC = new THREE.Vector3();
const _vecD = new THREE.Vector3();
const _colorP1 = new THREE.Color('#ef4444');
const _colorP2 = new THREE.Color('#22c55e');
const _colorNeutral = new THREE.Color('#38bdf8');
const _colorSelected = new THREE.Color('#facc15');
const _colorDestroyed = new THREE.Color('#334155');

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  dots,
  selectedDots,
  currentPlayer,
  validation,
  isBlinking,
  onDotClick,
  cameraViewTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store latest props in refs for animation loop access without scene recreation
  const dotsRef = useRef(dots);
  dotsRef.current = dots;

  const selectedDotsRef = useRef(selectedDots);
  selectedDotsRef.current = selectedDots;

  const currentPlayerRef = useRef(currentPlayer);
  currentPlayerRef.current = currentPlayer;

  const validationRef = useRef(validation);
  validationRef.current = validation;

  const isBlinkingRef = useRef(isBlinking);
  isBlinkingRef.current = isBlinking;

  const onDotClickRef = useRef(onDotClick);
  onDotClickRef.current = onDotClick;

  // Scene references
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hoveredDotIdRef = useRef<number | null>(null);

  // Tetrahedron geometry refs
  const tetraMeshRef = useRef<THREE.Mesh | null>(null);
  const tetraLinesRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.016);
    scene.background = new THREE.Color(0x05070f);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 38);
    cameraRef.current = camera;

    // 2. Renderer setup
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 75;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.1;
    controls.panSpeed = 0.85;
    controlsRef.current = controls;

    // 4. Lighting Rig (Skill guideline #3: Warm/cool studio rig)
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(20, 30, 25);
    scene.add(dirLight);

    // Red and Green accent point lights for thematic volumetric glow
    const p1AccentLight = new THREE.PointLight(0xef4444, 2.5, 60);
    p1AccentLight.position.set(-25, -10, 15);
    scene.add(p1AccentLight);

    const p2AccentLight = new THREE.PointLight(0x10b981, 2.5, 60);
    p2AccentLight.position.set(25, -10, -15);
    scene.add(p2AccentLight);

    const centerGlow = new THREE.PointLight(0x38bdf8, 1.8, 45);
    centerGlow.position.set(0, 0, 0);
    scene.add(centerGlow);

    // 5. Starfield & Cosmic Grid
    const starCount = 850;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const colorA = new THREE.Color(0x38bdf8);
    const colorB = new THREE.Color(0xa78bfa);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const dist = 60 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = dist * Math.cos(phi);

      const rChoice = Math.random();
      const c = rChoice < 0.4 ? colorWhite : rChoice < 0.7 ? colorA : colorB;
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Subtle coordinate ring horizon in background
    const ringGeo = new THREE.RingGeometry(24, 24.15, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const horizonRing = new THREE.Mesh(ringGeo, ringMat);
    horizonRing.rotation.x = Math.PI / 2;
    scene.add(horizonRing);

    // 6. Dot Meshes Representation
    // We create individual Interactive Dot Groups for clean raycasting and rich visuals
    // (Dot body + halo glow + ownership ring)
    const dotGroup = new THREE.Group();
    scene.add(dotGroup);

    const sphereGeo = new THREE.SphereGeometry(0.58, 20, 20);
    const ringMarkerGeo = new THREE.TorusGeometry(0.85, 0.08, 12, 28);
    const hoverHaloGeo = new THREE.SphereGeometry(0.88, 16, 16);

    interface DotRenderObject {
      dataId: number;
      group: THREE.Group;
      bodyMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
      ringMesh: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
      haloMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      baseScale: number;
    }

    const dotRenderMap = new Map<number, DotRenderObject>();
    const raycastTargets: THREE.Mesh[] = [];

    // Initialize dot objects from initial dots
    dotsRef.current.forEach((dot) => {
      const g = new THREE.Group();
      g.position.set(dot.x, dot.y, dot.z);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: _colorNeutral,
        roughness: 0.25,
        metalness: 0.2,
        emissive: _colorNeutral,
        emissiveIntensity: 0.45,
      });
      const bodyMesh = new THREE.Mesh(sphereGeo, bodyMat);
      bodyMesh.userData = { dotId: dot.id };
      g.add(bodyMesh);
      raycastTargets.push(bodyMesh);

      // Ownership ring (visible when owned)
      const ringMat = new THREE.MeshStandardMaterial({
        color: _colorNeutral,
        roughness: 0.15,
        metalness: 0.8,
        emissive: _colorNeutral,
        emissiveIntensity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringMarkerGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      ringMesh.visible = false;
      g.add(ringMesh);

      // Hover/Selection glow halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: _colorSelected,
        transparent: true,
        opacity: 0,
        wireframe: true,
      });
      const haloMesh = new THREE.Mesh(hoverHaloGeo, haloMat);
      haloMesh.visible = false;
      g.add(haloMesh);

      dotGroup.add(g);
      dotRenderMap.set(dot.id, {
        dataId: dot.id,
        group: g,
        bodyMesh,
        ringMesh,
        haloMesh,
        baseScale: 1.0,
      });
    });

    // 7. Dynamic Tetrahedron Mesh & Lines
    // 4 triangular faces = 12 vertices (4 triangles * 3 vertices)
    const tetraGeo = new THREE.BufferGeometry();
    const tetraPositions = new Float32Array(12 * 3);
    tetraGeo.setAttribute('position', new THREE.BufferAttribute(tetraPositions, 3));

    const tetraMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false, // Skill directive: multi-layer glass/transparency
    });
    const tetraMesh = new THREE.Mesh(tetraGeo, tetraMat);
    tetraMesh.visible = false;
    scene.add(tetraMesh);
    tetraMeshRef.current = tetraMesh;

    // 6 Wireframe edge lines for the tetrahedron
    // 6 edges = 12 vertices
    const linesGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(6 * 2 * 3);
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const linesMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });
    const tetraLines = new THREE.LineSegments(linesGeo, linesMat);
    tetraLines.visible = false;
    scene.add(tetraLines);
    tetraLinesRef.current = tetraLines;

    // 8. Particle System for Captured / Destroyed Dot Implosions
    const MAX_PARTICLES = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(MAX_PARTICLES * 3);
    const particleVelocities = new Float32Array(MAX_PARTICLES * 3);
    const particleLifes = new Float32Array(MAX_PARTICLES); // 0 = dead, >0 = remaining life
    const particleColors = new Float32Array(MAX_PARTICLES * 3);

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    function spawnExplosion(center: THREE.Vector3, color: THREE.Color, count = 28) {
      let spawned = 0;
      for (let i = 0; i < MAX_PARTICLES && spawned < count; i++) {
        if (particleLifes[i] <= 0) {
          particlePositions[i * 3] = center.x;
          particlePositions[i * 3 + 1] = center.y;
          particlePositions[i * 3 + 2] = center.z;

          // Outward velocity burst
          const speed = 2.5 + Math.random() * 4.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
          particleVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
          particleVelocities[i * 3 + 2] = speed * Math.cos(phi);

          particleLifes[i] = 0.85 + Math.random() * 0.45; // seconds

          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;

          spawned++;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleGeo.attributes.color.needsUpdate = true;
    }

    // 9. Raycasting Interaction
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points ? (raycaster.params.Points.threshold = 0.8) : null;
    const mouse = new THREE.Vector2();

    const getMouseCoords = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };

    renderer.domElement.style.touchAction = 'none';

    let isDragging = false;
    let downPos = { x: 0, y: 0 };
    let downTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = false;
      downPos = { x: e.clientX, y: e.clientY };
      downTime = performance.now();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const threshold = e.pointerType === 'touch' ? 14 : 6;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > threshold) {
        isDragging = true;
      }

      const coords = getMouseCoords(e);
      mouse.x = coords.x;
      mouse.y = coords.y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets, false);

      if (intersects.length > 0) {
        const dotId = intersects[0].object.userData.dotId as number;
        const dotData = dotsRef.current.find((d) => d.id === dotId);

        // Only show pointer if clickable (active and either neutral or already selected)
        if (
          dotData &&
          dotData.state === 'active' &&
          (dotData.owner === 'neutral' || selectedDotsRef.current.some((d) => d.id === dotData.id))
        ) {
          renderer.domElement.style.cursor = 'pointer';
          hoveredDotIdRef.current = dotId;
          return;
        }
      }
      renderer.domElement.style.cursor = 'default';
      hoveredDotIdRef.current = null;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const upTime = performance.now();
      // If dragged or held down for more than 400ms (a deliberate hold/drag), ignore as tap
      if (isDragging || upTime - downTime > 400) return;
      if (isBlinkingRef.current) return;

      const coords = getMouseCoords(e);
      mouse.x = coords.x;
      mouse.y = coords.y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets, false);

      if (intersects.length > 0) {
        const dotId = intersects[0].object.userData.dotId as number;
        const targetDot = dotsRef.current.find((d) => d.id === dotId);
        if (targetDot) {
          onDotClickRef.current(targetDot);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('pointerup', handlePointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop (using THREE.Clock)
    const clock = new THREE.Clock();
    let animId: number;

    const previousDestroyedIds = new Set<number>();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Slow background cosmic rotation
      starPoints.rotation.y = elapsed * 0.015;
      starPoints.rotation.x = elapsed * 0.008;
      horizonRing.rotation.z = elapsed * 0.02;

      // Update dot appearances based on state, ownership, selection, and destruction
      const currentDots = dotsRef.current;
      const currentSelected = selectedDotsRef.current;
      const currentValidation = validationRef.current;
      const selectedIds = new Set(currentSelected.map((d) => d.id));
      const capturedPreviewIds = new Set(currentValidation.capturedDotIds);
      const hoveredId = hoveredDotIdRef.current;

      currentDots.forEach((dot) => {
        const renderObj = dotRenderMap.get(dot.id);
        if (!renderObj) return;

        // Ensure 3D position always matches dot data exactly
        if (
          renderObj.group.position.x !== dot.x ||
          renderObj.group.position.y !== dot.y ||
          renderObj.group.position.z !== dot.z
        ) {
          renderObj.group.position.set(dot.x, dot.y, dot.z);
        }

        const isSelected = selectedIds.has(dot.id);
        const isHovered = hoveredId === dot.id;
        const isCapturedPreview =
          currentSelected.length === 4 &&
          currentValidation.isValid &&
          capturedPreviewIds.has(dot.id);

        // State: Destroyed
        if (dot.state === 'destroyed') {
          // Trigger explosion once upon destruction
          if (!previousDestroyedIds.has(dot.id)) {
            previousDestroyedIds.add(dot.id);
            _vecA.set(dot.x, dot.y, dot.z);
            spawnExplosion(
              _vecA,
              dot.owner === 'player1'
                ? _colorP1
                : dot.owner === 'player2'
                ? _colorP2
                : _colorNeutral,
              30
            );
          }

          // Smoothly shrink and fade to zero
          renderObj.group.scale.set(
            THREE.MathUtils.damp(renderObj.group.scale.x, 0.0, 6, delta),
            THREE.MathUtils.damp(renderObj.group.scale.y, 0.0, 6, delta),
            THREE.MathUtils.damp(renderObj.group.scale.z, 0.0, 6, delta)
          );
          if (renderObj.group.scale.x < 0.02) {
            renderObj.group.visible = false;
          }
          return;
        }

        // If dot is active, ensure it's not marked as destroyed from previous round
        if (previousDestroyedIds.has(dot.id)) {
          previousDestroyedIds.delete(dot.id);
        }

        renderObj.group.visible = true;
        if (renderObj.group.scale.x < 0.1) {
          renderObj.group.scale.set(1.0, 1.0, 1.0);
        }

        // Base color determination
        let targetColor = _colorNeutral;
        let emissiveIntensity = 0.4;
        let targetScale = 1.0;

        if (dot.owner === 'player1') {
          targetColor = _colorP1;
          emissiveIntensity = 0.65;
          renderObj.ringMesh.visible = true;
          renderObj.ringMesh.material.color.copy(_colorP1);
          renderObj.ringMesh.material.emissive.copy(_colorP1);
          renderObj.ringMesh.rotation.z += delta * 1.5;
        } else if (dot.owner === 'player2') {
          targetColor = _colorP2;
          emissiveIntensity = 0.65;
          renderObj.ringMesh.visible = true;
          renderObj.ringMesh.material.color.copy(_colorP2);
          renderObj.ringMesh.material.emissive.copy(_colorP2);
          renderObj.ringMesh.rotation.z -= delta * 1.5;
        } else {
          renderObj.ringMesh.visible = false;
        }

        // Selected state takes precedence
        if (isSelected) {
          targetColor = _colorSelected;
          emissiveIntensity = 0.95;
          // Pulse scale
          const pulse = 1.35 + Math.sin(elapsed * 7 + dot.id) * 0.18;
          targetScale = pulse;
          renderObj.haloMesh.visible = true;
          renderObj.haloMesh.material.color.copy(_colorSelected);
          renderObj.haloMesh.material.opacity = 0.45 + Math.sin(elapsed * 6) * 0.2;
          renderObj.haloMesh.rotation.y += delta * 2;
        } else if (isCapturedPreview) {
          // Highlight dots that will be captured inside tetrahedron
          targetColor = _colorDestroyed;
          emissiveIntensity = 0.8;
          const previewPulse = 1.1 + Math.sin(elapsed * 10 + dot.id) * 0.12;
          targetScale = previewPulse;
          renderObj.haloMesh.visible = true;
          renderObj.haloMesh.material.color.set(0xff4444);
          renderObj.haloMesh.material.opacity = 0.55;
        } else if (isHovered && dot.owner === 'neutral') {
          targetScale = 1.25;
          emissiveIntensity = 0.8;
          renderObj.haloMesh.visible = true;
          renderObj.haloMesh.material.color.copy(targetColor);
          renderObj.haloMesh.material.opacity = 0.4;
        } else {
          renderObj.haloMesh.visible = false;
        }

        // Apply smooth scale damping
        renderObj.group.scale.set(
          THREE.MathUtils.damp(renderObj.group.scale.x, targetScale, 10, delta),
          THREE.MathUtils.damp(renderObj.group.scale.y, targetScale, 10, delta),
          THREE.MathUtils.damp(renderObj.group.scale.z, targetScale, 10, delta)
        );

        // Apply material colors
        renderObj.bodyMesh.material.color.lerp(targetColor, 0.2);
        renderObj.bodyMesh.material.emissive.lerp(targetColor, 0.2);
        renderObj.bodyMesh.material.emissiveIntensity = emissiveIntensity;
      });

      // Update Tetrahedron geometry when 1..4 dots selected
      if (currentSelected.length === 4) {
        const [a, b, c, d] = currentSelected;
        _vecA.set(a.x, a.y, a.z);
        _vecB.set(b.x, b.y, b.z);
        _vecC.set(c.x, c.y, c.z);
        _vecD.set(d.x, d.y, d.z);

        // Update 4 triangular faces (ABC, ABD, BCD, CAD)
        const posAttr = tetraGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        const faces = [
          [_vecA, _vecB, _vecC],
          [_vecA, _vecB, _vecD],
          [_vecB, _vecC, _vecD],
          [_vecC, _vecA, _vecD],
        ];

        let offset = 0;
        faces.forEach((face) => {
          face.forEach((pt) => {
            arr[offset++] = pt.x;
            arr[offset++] = pt.y;
            arr[offset++] = pt.z;
          });
        });
        posAttr.needsUpdate = true;
        tetraGeo.computeVertexNormals();

        // 6 wireframe edges: AB, AC, AD, BC, BD, CD
        const lineAttr = linesGeo.attributes.position as THREE.BufferAttribute;
        const lineArr = lineAttr.array as Float32Array;
        const edges = [
          [_vecA, _vecB],
          [_vecA, _vecC],
          [_vecA, _vecD],
          [_vecB, _vecC],
          [_vecB, _vecD],
          [_vecC, _vecD],
        ];

        let lineOffset = 0;
        edges.forEach(([p1, p2]) => {
          lineArr[lineOffset++] = p1.x;
          lineArr[lineOffset++] = p1.y;
          lineArr[lineOffset++] = p1.z;
          lineArr[lineOffset++] = p2.x;
          lineArr[lineOffset++] = p2.y;
          lineArr[lineOffset++] = p2.z;
        });
        lineAttr.needsUpdate = true;

        tetraMesh.visible = true;
        tetraLines.visible = true;

        // Color based on validity and current player
        const activeColor =
          currentPlayerRef.current === 'player1' ? _colorP1 : _colorP2;

        if (currentValidation.isValid) {
          tetraMat.color.copy(activeColor);
          linesMat.color.copy(activeColor);
          tetraMat.opacity = 0.28 + Math.sin(elapsed * 4) * 0.06;
        } else {
          tetraMat.color.set(0x94a3b8);
          linesMat.color.set(0xef4444);
          tetraMat.opacity = 0.15;
        }
      } else if (currentSelected.length >= 2) {
        // Draw partial edge wires for 2 or 3 selected dots
        tetraMesh.visible = false;
        tetraLines.visible = true;

        const lineAttr = linesGeo.attributes.position as THREE.BufferAttribute;
        const lineArr = lineAttr.array as Float32Array;
        let lineOffset = 0;

        for (let i = 0; i < currentSelected.length; i++) {
          for (let j = i + 1; j < currentSelected.length; j++) {
            const p1 = currentSelected[i];
            const p2 = currentSelected[j];
            lineArr[lineOffset++] = p1.x;
            lineArr[lineOffset++] = p1.y;
            lineArr[lineOffset++] = p1.z;
            lineArr[lineOffset++] = p2.x;
            lineArr[lineOffset++] = p2.y;
            lineArr[lineOffset++] = p2.z;
          }
        }
        // Fill remaining buffer with zero
        while (lineOffset < lineArr.length) {
          lineArr[lineOffset++] = 0;
        }
        lineAttr.needsUpdate = true;
        linesMat.color.copy(_colorSelected);
      } else {
        tetraMesh.visible = false;
        tetraLines.visible = false;
      }

      // Update particle system
      let hasAliveParticles = false;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (particleLifes[i] > 0) {
          hasAliveParticles = true;
          particleLifes[i] -= delta;

          particlePositions[i * 3] += particleVelocities[i * 3] * delta;
          particlePositions[i * 3 + 1] += particleVelocities[i * 3 + 1] * delta;
          particlePositions[i * 3 + 2] += particleVelocities[i * 3 + 2] * delta;

          // Drag
          particleVelocities[i * 3] *= 0.96;
          particleVelocities[i * 3 + 1] *= 0.96;
          particleVelocities[i * 3 + 2] *= 0.96;
        } else {
          particlePositions[i * 3] = 9999;
          particlePositions[i * 3 + 1] = 9999;
          particlePositions[i * 3 + 2] = 9999;
        }
      }
      if (hasAliveParticles) {
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    // Pre-warm shaders
    renderer.compile(scene, camera);
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', handlePointerDown);
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, []);

  // Handle camera view transitions smoothly
  useEffect(() => {
    if (!cameraViewTrigger || !cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (cameraViewTrigger) {
      case 'front':
        camera.position.set(0, 0, 42);
        controls.target.set(0, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 45, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'side':
        camera.position.set(42, 0, 0);
        controls.target.set(0, 0, 0);
        break;
      case 'iso':
        camera.position.set(28, 24, 28);
        controls.target.set(0, 0, 0);
        break;
      case 'reset':
      default:
        camera.position.set(0, 15, 38);
        controls.target.set(0, 0, 0);
        break;
    }
  }, [cameraViewTrigger]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
    />
  );
};
