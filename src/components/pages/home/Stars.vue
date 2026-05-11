<script setup lang="ts">
  import * as THREE from 'three'
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useInputRotation } from '@/composables/useInputRotation'

  // Configuration
  const STAR_COUNT = 1000
  const STAR_SPEED = 2
  const STAR_SPREAD = 2000
  const STAR_DEPTH = 2000

  const canvasRef = ref<HTMLCanvasElement | null>(null)

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let stars: THREE.Points
  let starGeometry: THREE.BufferGeometry
  let starSpeeds: Float32Array
  let animationId: number

  const input = useInputRotation({
    mouseSensitivity: 0.0005,
    touchSensitivity: 0.003,
    gyroSensitivity: 0.015,
    lerpFactor: 0.05
  })

  function createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    const size = 64
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.25, 'rgba(200, 220, 255, 0.4)')
    gradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
  }

  function createStars(): THREE.Points {
    const starTexture = createStarTexture()
    const starPositions = new Float32Array(STAR_COUNT * 3)
    const starSizes = new Float32Array(STAR_COUNT)

    starGeometry = new THREE.BufferGeometry()
    starSpeeds = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3
      starPositions[i3] = (Math.random() - 0.5) * STAR_SPREAD
      starPositions[i3 + 1] = (Math.random() - 0.5) * STAR_SPREAD
      starPositions[i3 + 2] =
        -(i / STAR_COUNT) * STAR_DEPTH + (Math.random() - 0.5) * 100
      starSizes[i] = Math.random() * 2 + 1
      starSpeeds[i] = STAR_SPEED * (0.5 + Math.random())
    }

    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3)
    )
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        starTexture: { value: starTexture },
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying float vSize;
        varying float vDistance;

        void main() {
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = -mvPosition.z;

          float sizeScale = 300.0 / vDistance;
          gl_PointSize = size * sizeScale * 15.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D starTexture;
        varying float vSize;
        varying float vDistance;

        void main() {
          vec4 texColor = texture2D(starTexture, gl_PointCoord);

          float brightness = clamp(500.0 / vDistance, 0.3, 2.0);
          vec3 color = vec3(0.9, 0.95, 1.0) * brightness;

          gl_FragColor = vec4(color, texColor.a * brightness);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    return new THREE.Points(starGeometry, starMaterial)
  }

  function onResize(): void {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate(): void {
    animationId = requestAnimationFrame(animate)

    input.update()

    stars.rotation.y = input.mouse.x + input.gyro.x
    stars.rotation.x = input.mouse.y + input.gyro.y

    const positions = starGeometry.attributes.position.array as Float32Array

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3

      positions[i3 + 2] += starSpeeds[i]

      if (positions[i3 + 2] > 500) {
        positions[i3] = (Math.random() - 0.5) * STAR_SPREAD
        positions[i3 + 1] = (Math.random() - 0.5) * STAR_SPREAD
        positions[i3 + 2] = -STAR_DEPTH
        starSpeeds[i] = STAR_SPEED * (0.5 + Math.random())
      }
    }

    starGeometry.attributes.position.needsUpdate = true

    renderer.render(scene, camera)
  }

  function init(): void {
    if (!canvasRef.value) return

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      STAR_DEPTH
    )
    camera.position.z = 500

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    stars = createStars()
    scene.add(stars)

    input.init()
    window.addEventListener('resize', onResize)

    animate()
  }

  function cleanup(): void {
    cancelAnimationFrame(animationId)

    input.cleanup()
    window.removeEventListener('resize', onResize)

    starGeometry?.dispose()

    if (stars?.material) {
      ;(stars.material as THREE.ShaderMaterial).dispose()
    }

    renderer?.dispose()
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })

  defineOptions({
    name: 'Stars'
  })
</script>

<template>
  <canvas ref="canvasRef" class="home__background"></canvas>
</template>
