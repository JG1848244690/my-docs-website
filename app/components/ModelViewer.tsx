'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function Model() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing canvas in container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1, 3)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Enable transparency
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5)
    scene.add(hemiLight)

    // Main directional light (sun-like)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(5, 10, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)

    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(0xffffee, 0.8)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)

    // Model reference
    let loadedModel: THREE.Object3D | null = null

    // Loader
    const loader = new GLTFLoader()
    loader.load(
      '/models/f8ad5b640f0ffd506323ce0f73e12a42.glb',
      (gltf) => {
        const model = gltf.scene

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim

        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))
        model.castShadow = true

        loadedModel = model
        scene.add(model)
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
      }
    )

    // Orbit controls (manual implementation)
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let manualRotationX = 0
    let manualRotationY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !loadedModel) return
      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y
      manualRotationY += deltaX * 0.01
      manualRotationX += deltaY * 0.01
      manualRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, manualRotationX))
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    containerRef.current.addEventListener('mousedown', onMouseDown)
    containerRef.current.addEventListener('mousemove', onMouseMove)
    containerRef.current.addEventListener('mouseup', onMouseUp)
    containerRef.current.addEventListener('mouseleave', onMouseUp)

    // Animation loop (time-based)
    let animationId: number
    let lastTime = performance.now()
    const autoRotationSpeed = Math.PI * 2 // 一秒转一圈 (2π 弧度/秒)

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const currentTime = performance.now()
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1) // cap at 100ms to prevent jumps
      lastTime = currentTime

      if (loadedModel) {
        if (isDragging) {
          loadedModel.rotation.y = manualRotationY
          loadedModel.rotation.x = manualRotationX
        } else {
          loadedModel.rotation.y += autoRotationSpeed * deltaTime
        }
      }
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeEventListener('mousedown', onMouseDown)
      containerRef.current?.removeEventListener('mousemove', onMouseMove)
      containerRef.current?.removeEventListener('mouseup', onMouseUp)
      containerRef.current?.removeEventListener('mouseleave', onMouseUp)

      // Dispose model resources
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => disposeMaterial(mat))
            } else {
              disposeMaterial(child.material)
            }
          }
        })
        scene.remove(loadedModel)
      }

      function disposeMaterial(mat: THREE.Material) {
        const matAny = mat as any
        const textureProps = [
          'map', 'normalMap', 'roughnessMap', 'metalnessMap',
          'aoMap', 'emissiveMap', 'lightMap', 'envMap',
          'gradientMap', 'alphaMap', 'specularMap', 'specularIntensityMap',
          'specularColorMap', 'iridescenceMap', 'sheenColorMap', 'sheenRoughnessMap',
        ]
        textureProps.forEach((prop) => {
          if (matAny[prop]) matAny[prop].dispose()
        })
        mat.dispose()
      }

      // Dispose scene resources
      while (scene.children.length > 0) {
        scene.remove(scene.children[0])
      }
      renderer.dispose()
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'grab',
        backgroundColor: 'transparent',
      }}
    />
  )
}

export default function ModelViewer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          borderRadius: '8px',
          color: '#ffffff',
        }}
      >
        Loading...
      </div>
    )
  }

  return <Model />
}