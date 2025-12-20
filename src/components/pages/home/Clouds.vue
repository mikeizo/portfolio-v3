<script setup lang="ts">
  import * as THREE from 'three'
  import { onMounted, onUnmounted, ref } from 'vue'

  // Configuration
  const CLOUD_COUNT = 150
  const CLOUD_SPEED = 1.5
  const CLOUD_SPREAD = 1500
  const CLOUD_DEPTH = 2000
  const MOUSE_SENSITIVITY = 0.0009
  const TOUCH_SENSITIVITY = 0.002

  const canvasRef = ref<HTMLCanvasElement | null>(null)

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let clouds: THREE.Points
  let cloudGeometry: THREE.BufferGeometry
  let cloudSpeeds: Float32Array
  let cloudTextures: THREE.CanvasTexture[]
  let animationId: number

  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  }

  let touchStartX = 0
  let touchStartY = 0
  let touchStartTargetX = 0
  let touchStartTargetY = 0

  function createCloudTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const centerX = size / 2
    const centerY = size / 2

    ctx.clearRect(0, 0, size, size)

    const bumps: { x: number; y: number; r: number }[] = []
    const bumpCount = 12 + Math.floor(Math.random() * 6)

    for (let i = 0; i < bumpCount; i++) {
      const angle = (i / bumpCount) * Math.PI * 2 + Math.random() * 0.5
      const distance = 0.15 + Math.random() * 0.2
      const bumpSize = 0.25 + Math.random() * 0.2

      bumps.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.6,
        r: bumpSize
      })
    }

    bumps.push({ x: 0, y: 0, r: 0.35 })
    bumps.push({ x: -0.1, y: -0.05, r: 0.28 })
    bumps.push({ x: 0.12, y: 0.05, r: 0.26 })

    ctx.fillStyle = 'rgba(180, 195, 210, 1)'
    ctx.beginPath()

    bumps.forEach((bump) => {
      const bx = centerX + bump.x * size
      const by = centerY + bump.y * size
      const br = bump.r * size

      ctx.moveTo(bx + br, by)
      ctx.arc(bx, by, br, 0, Math.PI * 2)
    })

    ctx.fill()

    bumps.forEach((bump) => {
      const bx = centerX + bump.x * size
      const by = centerY + bump.y * size
      const br = bump.r * size

      const gradient = ctx.createRadialGradient(
        bx - br * 0.2,
        by - br * 0.2,
        0,
        bx,
        by,
        br
      )
      gradient.addColorStop(0, 'rgba(220, 230, 240, 0.6)')
      gradient.addColorStop(0.5, 'rgba(200, 215, 230, 0.3)')
      gradient.addColorStop(1, 'rgba(180, 195, 210, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(bx, by, br, 0, Math.PI * 2)
      ctx.fill()
    })

    const imageData = ctx.getImageData(0, 0, size, size)
    const data = imageData.data

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x - centerX) / centerX
        const dy = (y - centerY) / centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        const falloff = 1 - Math.pow(Math.min(distance, 1), 2)

        const i = (y * size + x) * 4
        data[i + 3] = data[i + 3] * falloff
      }
    }

    ctx.putImageData(imageData, 0, 0)

    return new THREE.CanvasTexture(canvas)
  }

  function createCloudTextures(count: number): THREE.CanvasTexture[] {
    const textures: THREE.CanvasTexture[] = []
    for (let i = 0; i < count; i++) {
      textures.push(createCloudTexture())
    }
    return textures
  }

  function createClouds(): THREE.Points {
    cloudTextures = createCloudTextures(5)
    cloudGeometry = new THREE.BufferGeometry()
    const cloudPositions = new Float32Array(CLOUD_COUNT * 3)
    const cloudSizes = new Float32Array(CLOUD_COUNT)
    const cloudOpacities = new Float32Array(CLOUD_COUNT)
    cloudSpeeds = new Float32Array(CLOUD_COUNT)

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const i3 = i * 3
      cloudPositions[i3] = (Math.random() - 0.5) * CLOUD_SPREAD
      cloudPositions[i3 + 1] = (Math.random() - 0.5) * CLOUD_SPREAD * 0.5
      cloudPositions[i3 + 2] =
        -(i / CLOUD_COUNT) * CLOUD_DEPTH + (Math.random() - 0.5) * 200
      cloudSizes[i] = Math.random() * 150 + 100
      cloudSpeeds[i] = CLOUD_SPEED * (0.5 + Math.random() * 0.5)
      cloudOpacities[i] = Math.random() * 0.2 + 0.8
    }

    cloudGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(cloudPositions, 3)
    )
    cloudGeometry.setAttribute('size', new THREE.BufferAttribute(cloudSizes, 1))
    cloudGeometry.setAttribute(
      'opacity',
      new THREE.BufferAttribute(cloudOpacities, 1)
    )

    const cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        cloudTexture: { value: cloudTextures[0] },
        time: { value: 0 }
      },
      vertexShader: `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;
      varying float vDistance;

      void main() {
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDistance = -mvPosition.z;

        float sizeScale = 800.0 / vDistance;
        gl_PointSize = size * sizeScale;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      uniform sampler2D cloudTexture;
      varying float vOpacity;
      varying float vDistance;

      void main() {
        vec4 texColor = texture2D(cloudTexture, gl_PointCoord);

        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center) * 2.0;
        float edgeFade = 1.0 - smoothstep(0.5, 1.0, dist);

        float distanceFade = smoothstep(1800.0, 200.0, vDistance);

        float alpha = texColor.a * vOpacity * distanceFade * edgeFade;

        vec3 color = vec3(0.65, 0.72, 0.8);

        gl_FragColor = vec4(color, alpha);
      }
    `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    })

    return new THREE.Points(cloudGeometry, cloudMaterial)
  }

  function onMouseMove(e: MouseEvent): void {
    mouse.targetX = (e.clientX - window.innerWidth / 2) * MOUSE_SENSITIVITY
    mouse.targetY = (e.clientY - window.innerHeight / 2) * MOUSE_SENSITIVITY
  }

  function onMouseLeave(): void {
    mouse.targetX = 0
    mouse.targetY = 0
  }

  function onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTargetX = mouse.targetX
      touchStartTargetY = mouse.targetY
    }
  }

  function onTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const deltaX = e.touches[0].clientX - touchStartX
      const deltaY = e.touches[0].clientY - touchStartY

      mouse.targetX = touchStartTargetX + deltaX * TOUCH_SENSITIVITY
      mouse.targetY = touchStartTargetY + deltaY * TOUCH_SENSITIVITY
    }
  }

  function onTouchEnd(): void {
    mouse.targetX = 0
    mouse.targetY = 0
  }

  function onResize(): void {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate(): void {
    animationId = requestAnimationFrame(animate)

    mouse.x += (mouse.targetX - mouse.x) * 0.03
    mouse.y += (mouse.targetY - mouse.y) * 0.03

    clouds.rotation.y = mouse.x
    clouds.rotation.x = mouse.y

    const positions = cloudGeometry.attributes.position.array as Float32Array

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const i3 = i * 3

      positions[i3 + 2] += cloudSpeeds[i]

      if (positions[i3 + 2] > 500) {
        positions[i3] = (Math.random() - 0.5) * CLOUD_SPREAD
        positions[i3 + 1] = (Math.random() - 0.5) * CLOUD_SPREAD * 0.5
        positions[i3 + 2] = -CLOUD_DEPTH
        cloudSpeeds[i] = CLOUD_SPEED * (0.5 + Math.random() * 0.5)
      }
    }

    cloudGeometry.attributes.position.needsUpdate = true

    renderer.render(scene, camera)
  }

  function init(): void {
    if (!canvasRef.value) return

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf0f6fa, 0.00025)

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      CLOUD_DEPTH
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

    clouds = createClouds()
    scene.add(clouds)

    window.addEventListener('mousemove', onMouseMove)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('resize', onResize)

    animate()
  }

  function cleanup(): void {
    cancelAnimationFrame(animationId)

    window.removeEventListener('mousemove', onMouseMove)
    document.documentElement.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('resize', onResize)

    cloudGeometry?.dispose()

    if (clouds?.material) {
      ;(clouds.material as THREE.ShaderMaterial).dispose()
    }

    cloudTextures?.forEach((texture) => texture.dispose())

    renderer?.dispose()
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })
</script>

<template>
  <canvas ref="canvasRef" class="home__background"></canvas>
</template>
