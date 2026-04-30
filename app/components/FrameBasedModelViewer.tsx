'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function FrameBasedModel() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }

    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1, 3)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5)
    scene.add(hemiLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(5, 10, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffee, 0.8)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)

    let loadedModel: THREE.Object3D | null = null

    const loader = new GLTFLoader()
    loader.load(
      '/models/f8ad5b640f0ffd506323ce0f73e12a42.glb',
      (gltf) => {
        const model = gltf.scene
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

    // Frame-based animation (每次旋转固定角度)
    let animationId: number
    const autoRotationSpeed = 0.008 // 固定每帧旋转量

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (loadedModel) {
        if (isDragging) {
          loadedModel.rotation.y = manualRotationY
          loadedModel.rotation.x = manualRotationX
        } else {
          loadedModel.rotation.y += autoRotationSpeed
        }
      }
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeEventListener('mousedown', onMouseDown)
      containerRef.current?.removeEventListener('mousemove', onMouseMove)
      containerRef.current?.removeEventListener('mouseup', onMouseUp)
      containerRef.current?.removeEventListener('mouseleave', onMouseUp)

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

export default function FrameBasedModelViewer() {
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

  return <FrameBasedModel />
}
