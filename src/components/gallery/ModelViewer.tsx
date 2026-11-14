// @ts-nocheck
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

interface Props { modelPath: string; mode?: 'default' | 'necklace' | 'earrings' | 'ring' }

export const ModelViewer = ({ modelPath, mode = 'default' }: Props) => {
  const isNecklace = mode === 'necklace'
  const isEarrings = mode === 'earrings'
  const isRing = mode === 'ring'
  const isStatic = isNecklace || isEarrings || isRing
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let animationId = 0
    let controls: OrbitControls

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    // 项链：略抬高俯视（颈圈前低后高的透视椭圆）；耳饰：正面平视；戒指：抬高俯视（戒圈呈扁椭圆）；其他：略俯视
    if (isNecklace) camera.position.set(0, 0.55, 5.2)
    else if (isEarrings) camera.position.set(0, 0, 5)
    else if (isRing) camera.position.set(0, 1.1, 5)
    else camera.position.set(0, 0.5, 5)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const size = Math.min(container.clientWidth, container.clientHeight, 500)
    renderer.setSize(size, size)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight('#ffffff', 0.6))
    const key = new THREE.DirectionalLight('#ffffff', 1.2); key.position.set(5, 5, 5); scene.add(key)
    const rim = new THREE.DirectionalLight('#7ec8e3', 0.8); rim.position.set(-3, -1, -3); scene.add(rim)
    scene.add(new THREE.DirectionalLight('#b8c5ff', 0.4))

    // 环境贴图：金属材质靠环境反射显色，没有它高金属度模型会渲染成黑色
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.2

    // 底部圆形展示台
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.01, 32, 100),
      new THREE.MeshStandardMaterial({ color: '#7ec8e3', roughness: 0.3, metalness: 0.8, transparent: true, opacity: 0.5 })
    )
    ring.rotation.x = -Math.PI / 2; ring.position.y = -1.6; scene.add(ring)

    const pGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(60 * 3)
    for (let i = 0; i < 60; i++) {
      const th = Math.random() * Math.PI * 2; const ph = Math.random() * Math.PI * 0.6 + 0.6; const r = 1.8 + Math.random() * 0.6
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); pos[i * 3 + 2] = r * Math.cos(ph)
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: '#7ec8e3', size: 0.02, transparent: true, opacity: 0.6 }))
    scene.add(particles)

    // 加载模型（draco 压缩模型需要 DRACOLoader 解码，解码器本地加载）
    const draco = new DRACOLoader()
    draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`)
    draco.preload()
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)
    loader.load(modelPath,
      (gltf) => {
        let obj = gltf.scene
        if (isNecklace) {
          // 项链：模型原始平躺（颈圈弧与吊坠共面）。
          // 组合旋转后：颈圈弧在上左右对称、吊坠从弧中央垂直朝下，
          // 再绕竖直中轴向右转 35°，露出链条侧面的层次与厚度
          obj.rotation.x = Math.PI / 2
          obj.rotation.y = Math.PI / 2
          const holder = new THREE.Group()
          holder.add(obj)
          holder.rotation.z = Math.PI
          holder.rotation.y = Math.PI * 0.19
          obj = holder
        } else if (isEarrings) {
          // 耳饰：模型原始在 YZ 平面（两只耳坠沿 Z 并排），
          // 绕 Y 轴转 -90°（水平镜像方向）后：两只耳坠左右镜像对称、并排朝向镜头
          obj.rotation.y = -Math.PI / 2
        } else if (isRing) {
          // 戒指：模型环面法线沿 +X（默认视角为纯侧面），
          // 绕戒圈竖直轴转 -90°：法线正对镜头（完全正面），
          // 两侧小圆钻与交叉戒臂左右对称展开，粉钻在上方居中
          obj.rotation.y = -Math.PI / 2
        }
        const box = new THREE.Box3().setFromObject(obj)
        const c = box.getCenter(new THREE.Vector3())
        const sz = box.getSize(new THREE.Vector3())
        // 项链/戒指放大一些；其他品类保持原尺寸；山魂戒指显示偏大，单独按标准尺寸
        const isMountainSoul = modelPath.includes('mountain-soul')
        const s = ((isNecklace || isRing) && !isMountainSoul ? 3.0 : 2.5) / Math.max(sz.x, sz.y, sz.z)
        obj.scale.setScalar(s); obj.position.sub(c.multiplyScalar(s))
        scene.add(obj); setLoading(false)
      },
      undefined,
      () => { setError(true); setLoading(false) }
    )

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.dampingFactor = 0.08
    // 项链/耳饰/戒指静止正面展示（像作品图片）；其他品类缓慢自转
    controls.autoRotate = !isStatic; controls.autoRotateSpeed = 0.8
    controls.minDistance = 1.5; controls.maxDistance = 8
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI
    controls.enablePan = false
    controls.target.set(0, 0, 0)

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      particles.rotation.y += 0.001; ring.rotation.z += 0.003
      controls.update(); renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId); controls.dispose()
      pmrem.dispose(); scene.environment?.dispose(); renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [modelPath, mode])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      {loading && <div className="w-8 h-8 rounded-full border-2 border-brand-ice/30 border-t-brand-ice animate-spin" />}
      {error && <p className="text-xs text-brand-muted">模型加载失败</p>}
    </div>
  )
}
