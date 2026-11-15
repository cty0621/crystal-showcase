// ========== 手串渲染和拖拽管理 ==========
const BraceletRender = {
    svgNS: 'http://www.w3.org/2000/svg',
    svgElement: null,  // FIX: 缓存 SVG DOM 元素（用于坐标转换）
    svgPoint: null,    // FIX: 缓存 SVGPoint 对象（性能优化）
    centerX: 300,
    centerY: 300,
    minCircumference: 168, // 最小周长 (mm)
    maxCircumference: 350, // 最大周长 (mm)
    canvasSize: 600, // 画布大小 (px)
    maxRadiusRatio: 0.6, // 最大半径占画布比例 (4/5直径 = 0.4半径)
    draggedBead: null,
    globalRotation: 0, // 全局旋转角度（弧度）
    isRotating: false, // 是否正在旋转画布
    rotationStartAngle: 0, // 旋转开始时的鼠标角度
    currentLayout: [], // 当前珠子布局缓存
    currentRadiusPx: 0,
    currentMmToPx: 0,
    currentBeadScaleFactor: 1,
    currentIsSpaced: false,
    dragState: null,
    previousLayoutMap: new Map(),
    pendingAngleLock: null,
    pendingDragLayoutOverride: null,
    webpSupported: null,
    scatterMode: false,
    scatterPositions: new Map(),
    scatterSeed: 0,
    scatterTransition: null,
    scatterAnimationDuration: 1650,
    scatterDropAnimations: [],
    scatterDropAnimationFrame: null,
    threeMode: false,
    threeLib: null,
    threeRenderer: null,
    threeScene: null,
    threeCamera: null,
    threeGroup: null,
    threeCanvas: null,
    threeAnimationFrame: null,
    threeTextures: new Map(),
    threeTextureLoader: null,
    threeGeneratedTextures: [],
    
    // 初始化
    init() {
        // FIX: 初始化 SVG 元素和坐标点（用于精确的屏幕→SVG坐标转换）
        this.svgElement = document.getElementById('bracelet-svg');
        if (!this.svgElement) {
            console.error('❌ SVG element not found!');
            return;
        }
        this.svgPoint = this.svgElement.createSVGPoint();

        this.createSVGFilters();
        this.render();
        this.setupDragListeners();
    },

    // 在不修改 AppState 数据的前提下，渲染时按需用更小的 WebP（浏览器不支持则保持 PNG）。
    supportsWebp() {
        return false;
    },

    getOptimizedImageUrl(url) {
        if (!url) return url;
        if (!this.supportsWebp()) return url;
        if (typeof url !== 'string') return url;
        if (!url.startsWith('./assets/textures/products/')) return url;
        if (!url.toLowerCase().endsWith('.png')) return url;
        return url.replace(/\.png$/i, '.webp');
    },

    getBeadLengthMm(bead) {
        const length = bead && typeof bead.length === 'number' ? bead.length : undefined;
        return typeof length === 'number' && !Number.isNaN(length) ? length : bead.size;
    },

    getBeadWidthMm(bead) {
        const width = bead && typeof bead.width === 'number' ? bead.width : undefined;
        return typeof width === 'number' && !Number.isNaN(width) ? width : bead.size;
    },

    getBeadImagePreserveAspectRatio(bead) {
        const beadLengthMm = this.getBeadLengthMm(bead);
        const beadWidthMm = this.getBeadWidthMm(bead);
        return beadLengthMm === beadWidthMm ? 'xMidYMid meet' : 'xMidYMid slice';
    },

    getBeadDimensionsPx(bead, beadScaleFactor, mmToPx) {
        const beadLengthPx = this.getBeadLengthMm(bead) * beadScaleFactor * mmToPx;
        const beadWidthPx = this.getBeadWidthMm(bead) * beadScaleFactor * mmToPx;
        const beadRadiusPx = Math.max(beadLengthPx, beadWidthPx) / 2;
        return { beadLengthPx, beadWidthPx, beadRadiusPx };
    },

    hashText(value) {
        const text = String(value);
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    },

    createSeededRandom(seed) {
        let state = seed >>> 0;
        return () => {
            state += 0x6D2B79F5;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    getScatterTrayBounds() {
        return {
            left: 62,
            right: this.canvasSize - 62,
            top: 66,
            bottom: this.canvasSize - 62
        };
    },

    constrainParticleToTray(particle, bounds) {
        const bounce = 0.58;

        if (particle.x < bounds.left + particle.radius) {
            particle.x = bounds.left + particle.radius;
            particle.vx = Math.abs(particle.vx) * bounce;
            particle.angularVelocity += particle.vy / Math.max(particle.radius, 1) * 18;
        } else if (particle.x > bounds.right - particle.radius) {
            particle.x = bounds.right - particle.radius;
            particle.vx = -Math.abs(particle.vx) * bounce;
            particle.angularVelocity -= particle.vy / Math.max(particle.radius, 1) * 18;
        }

        if (particle.enteredTray && particle.y < bounds.top + particle.radius) {
            particle.y = bounds.top + particle.radius;
            particle.vy = Math.abs(particle.vy) * bounce;
            particle.angularVelocity -= particle.vx / Math.max(particle.radius, 1) * 18;
        } else if (particle.y > bounds.bottom - particle.radius) {
            particle.enteredTray = true;
            particle.y = bounds.bottom - particle.radius;
            particle.vy = -Math.abs(particle.vy) * bounce;
            particle.angularVelocity += particle.vx / Math.max(particle.radius, 1) * 22;
        }
    },

    resolveParticleCollision(a, b) {
        if (!a.enteredTray && !b.enteredTray) return;

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (a.radius + b.radius) * 1.01;

        if (distance >= minDistance) return;

        if (distance < 0.001) {
            distance = 0.001;
            dx = 1;
            dy = 0;
        }

        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minDistance - distance;
        const totalMass = a.mass + b.mass;
        const aShare = b.mass / totalMass;
        const bShare = a.mass / totalMass;

        a.x -= nx * overlap * aShare;
        a.y -= ny * overlap * aShare;
        b.x += nx * overlap * bShare;
        b.y += ny * overlap * bShare;

        const relativeVx = b.vx - a.vx;
        const relativeVy = b.vy - a.vy;
        const normalVelocity = relativeVx * nx + relativeVy * ny;
        if (normalVelocity > 0) return;

        const restitution = 0.48;
        const impulse = -(1 + restitution) * normalVelocity / (1 / a.mass + 1 / b.mass);
        const impulseX = impulse * nx;
        const impulseY = impulse * ny;

        a.vx -= impulseX / a.mass;
        a.vy -= impulseY / a.mass;
        b.vx += impulseX / b.mass;
        b.vy += impulseY / b.mass;

        const tangentX = -ny;
        const tangentY = nx;
        const tangentialVelocity = relativeVx * tangentX + relativeVy * tangentY;
        const spinImpulse = tangentialVelocity * 0.16;
        a.angularVelocity -= spinImpulse / Math.max(a.radius, 1) * 42;
        b.angularVelocity += spinImpulse / Math.max(b.radius, 1) * 42;
    },

    relaxScatterParticles(particles, bounds) {
        for (let iteration = 0; iteration < 52; iteration++) {
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.enteredTray = true;
                this.constrainParticleToTray(particle, bounds);
            }

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    this.resolveParticleCollision(particles[i], particles[j]);
                }
            }
        }
    },

    buildPhysicsScatterPositions(beads, layoutEntries) {
        const bounds = this.getScatterTrayBounds();
        const dt = 1 / 60;
        const durationSeconds = 1.85;
        const steps = Math.round(durationSeconds / dt);
        const sampleEvery = 3;
        const particles = beads.map((bead, index) => {
            const layoutEntry = layoutEntries[index] || {};
            const radius = Math.max(layoutEntry.beadRadiusPx || 20, 15);
            const seed = this.hashText(`${this.scatterSeed}:${bead.instanceId}:${index}`);
            const rng = this.createSeededRandom(seed);
            const pourLane = (index - (beads.length - 1) / 2) / Math.max(beads.length, 1);
            const startX = this.clamp(
                this.centerX + pourLane * 120 + (rng() - 0.5) * 90,
                bounds.left + radius,
                bounds.right - radius
            );
            const startY = bounds.top - 150 - rng() * 120 - index * 4;
            const entryAngle = (Math.PI * 0.5) + (rng() - 0.5) * 1.2;
            const speed = 330 + rng() * 250;
            const vx = Math.cos(entryAngle) * speed + pourLane * 180 + (rng() - 0.5) * 160;
            const vy = Math.abs(Math.sin(entryAngle)) * speed + 170 + rng() * 90;
            const rotationDeg = -180 + rng() * 360;

            return {
                bead,
                index,
                radius,
                mass: Math.max(radius * radius, 1),
                x: startX,
                y: startY,
                vx,
                vy,
                rotationDeg,
                angularVelocity: vx / Math.max(radius, 1) * 72 + (rng() - 0.5) * 260,
                enteredTray: false,
                delay: Math.min(index * 20, 240),
                path: [{ x: startX, y: startY, t: 0 }],
                rotationPath: [{ rotationDeg, t: 0 }]
            };
        });

        for (let step = 1; step <= steps; step++) {
            const elapsed = step * dt;
            const trayTiltForce = elapsed < 0.48 ? 260 * (1 - elapsed / 0.48) : 0;
            const drag = Math.pow(elapsed < 0.65 ? 0.36 : 0.08, dt);

            particles.forEach((particle) => {
                particle.vy += trayTiltForce * dt;
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.rotationDeg += particle.angularVelocity * dt;

                if (particle.y > bounds.top + particle.radius) {
                    particle.enteredTray = true;
                }

                this.constrainParticleToTray(particle, bounds);

                particle.vx *= drag;
                particle.vy *= drag;
                particle.angularVelocity *= Math.pow(0.12, dt);

                if (elapsed > 1.12 && Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) < 10) {
                    particle.vx *= 0.82;
                    particle.vy *= 0.82;
                    particle.angularVelocity *= 0.82;
                }
            });

            for (let collisionPass = 0; collisionPass < 3; collisionPass++) {
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        this.resolveParticleCollision(particles[i], particles[j]);
                    }
                }
            }

            if (step % sampleEvery === 0 || step === steps) {
                const t = elapsed / durationSeconds;
                particles.forEach((particle) => {
                    particle.path.push({ x: particle.x, y: particle.y, t });
                    particle.rotationPath.push({ rotationDeg: particle.rotationDeg, t });
                });
            }
        }

        this.relaxScatterParticles(particles, bounds);

        particles.forEach((particle) => {
            const finalT = 1;
            if (particle.path[particle.path.length - 1]?.t >= 0.999) {
                particle.path[particle.path.length - 1] = { x: particle.x, y: particle.y, t: finalT };
            } else {
                particle.path.push({ x: particle.x, y: particle.y, t: finalT });
            }

            if (particle.rotationPath[particle.rotationPath.length - 1]?.t >= 0.999) {
                particle.rotationPath[particle.rotationPath.length - 1] = { rotationDeg: particle.rotationDeg, t: finalT };
            } else {
                particle.rotationPath.push({ rotationDeg: particle.rotationDeg, t: finalT });
            }

            this.scatterPositions.set(particle.bead.instanceId, {
                x: particle.x,
                y: particle.y,
                radius: particle.radius,
                rotationDeg: particle.rotationDeg,
                startX: particle.path[0].x,
                startY: particle.path[0].y,
                startRotationDeg: particle.rotationPath[0].rotationDeg,
                delay: particle.delay,
                duration: this.scatterAnimationDuration,
                path: particle.path,
                rotationPath: particle.rotationPath
            });
        });
    },

    dispatchScatterModeChange() {
        window.dispatchEvent(new CustomEvent('bracelet-scatter-changed', {
            detail: { isScattered: this.scatterMode }
        }));
    },

    dispatchThreeModeChange() {
        window.dispatchEvent(new CustomEvent('bracelet-3d-changed', {
            detail: { isThreeD: this.threeMode }
        }));
    },

    setThree(threeLib) {
        this.threeLib = threeLib;
        if (this.threeMode) {
            this.render();
        }
    },

    isThreeMode() {
        return this.threeMode;
    },

    setThreeMode(isThreeD) {
        const nextMode = Boolean(isThreeD);
        if (nextMode === this.threeMode) {
            return this.threeMode;
        }

        if (nextMode && (!AppState.selectedBeads || AppState.selectedBeads.length === 0 || !this.threeLib)) {
            return false;
        }

        this.threeMode = nextMode;
        this.globalRotation = 0;

        if (nextMode && this.scatterMode) {
            this.scatterMode = false;
            this.scatterTransition = null;
            this.scatterPositions.clear();
            this.dispatchScatterModeChange();
        }

        this.dispatchThreeModeChange();
        this.render();
        return this.threeMode;
    },

    toggleThreeMode() {
        return this.setThreeMode(!this.threeMode);
    },

    isScatterMode() {
        return this.scatterMode;
    },

    setScatterMode(isScattered) {
        const nextMode = Boolean(isScattered);
        if (nextMode === this.scatterMode) {
            return this.scatterMode;
        }

        if (nextMode && (!AppState.selectedBeads || AppState.selectedBeads.length === 0)) {
            return false;
        }

        this.scatterMode = nextMode;
        this.scatterTransition = nextMode ? 'pour' : 'gather';
        this.globalRotation = 0;

        if (nextMode) {
            if (this.threeMode) {
                this.threeMode = false;
                this.dispatchThreeModeChange();
            }
            this.scatterSeed += 1;
            this.scatterPositions.clear();
            this.destroyThreeScene();
        }

        this.dispatchScatterModeChange();
        this.render();
        return this.scatterMode;
    },

    toggleScatterMode() {
        return this.setScatterMode(!this.scatterMode);
    },

    ensureScatterPositions(beads, layoutEntries) {
        const activeIds = new Set(beads.map(bead => bead.instanceId));
        Array.from(this.scatterPositions.keys()).forEach((instanceId) => {
            if (!activeIds.has(instanceId)) {
                this.scatterPositions.delete(instanceId);
            }
        });

        const hasAllPositions = beads.length > 0
            && this.scatterPositions.size === beads.length
            && beads.every(bead => this.scatterPositions.has(bead.instanceId));

        if (hasAllPositions) return;

        this.scatterPositions.clear();
        this.buildPhysicsScatterPositions(beads, layoutEntries);
    },

    /**
     * FIX: 将屏幕坐标 (clientX/Y) 转换为 SVG 内部坐标
     * 解决响应式缩放导致的坐标不匹配问题
     * @param {MouseEvent|TouchEvent} e - 事件对象
     * @returns {DOMPoint|null} SVG 坐标 {x, y}，失败返回 null
     */
    getSVGPoint(e) {
        let clientX, clientY;

        if (e.clientX !== undefined) {
            // 鼠标事件 (mousedown, mousemove, mouseup, mouseleave)
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.touches && e.touches[0]) {
            // 触摸事件 (touchstart, touchmove)
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches[0]) {
            // 触摸结束事件 (touchend, touchcancel)
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            console.warn('⚠️ 无法识别的事件类型');
            return null;
        }

        // 复用 SVGPoint 对象（性能优化，避免每次创建新对象）
        this.svgPoint.x = clientX;
        this.svgPoint.y = clientY;

        try {
            // ✅ 关键：使用 CTM (Current Transformation Matrix) 的逆矩阵
            // 将屏幕坐标精确转换回 SVG 的"用户空间"坐标（viewBox坐标系）
            const ctm = this.svgElement.getScreenCTM();
            return this.svgPoint.matrixTransform(ctm.inverse());
        } catch (error) {
            console.error('❌ SVG 坐标转换失败:', error);
            return null;
        }
    },

    // 创建 SVG 滤镜定义
    createSVGFilters() {
        const svg = document.getElementById('bracelet-svg');
        
        // 创建 defs 元素（如果不存在）
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(this.svgNS, 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }
        
        // 创建模糊滤镜 - 用于阴影（减小模糊度以保持颜色深度）
        const shadowBlur = document.createElementNS(this.svgNS, 'filter');
        shadowBlur.setAttribute('id', 'shadow-blur');
        shadowBlur.setAttribute('x', '-50%');
        shadowBlur.setAttribute('y', '-50%');
        shadowBlur.setAttribute('width', '200%');
        shadowBlur.setAttribute('height', '200%');
        const shadowGaussian = document.createElementNS(this.svgNS, 'feGaussianBlur');
        shadowGaussian.setAttribute('in', 'SourceGraphic');
        shadowGaussian.setAttribute('stdDeviation', '2'); // 从4减小到2
        shadowBlur.appendChild(shadowGaussian);
        
        // 创建外层阴影模糊滤镜
        const outerBlur = document.createElementNS(this.svgNS, 'filter');
        outerBlur.setAttribute('id', 'outer-shadow-blur');
        outerBlur.setAttribute('x', '-50%');
        outerBlur.setAttribute('y', '-50%');
        outerBlur.setAttribute('width', '200%');
        outerBlur.setAttribute('height', '200%');
        const outerGaussian = document.createElementNS(this.svgNS, 'feGaussianBlur');
        outerGaussian.setAttribute('in', 'SourceGraphic');
        outerGaussian.setAttribute('stdDeviation', '4'); // 从8减小到4
        outerBlur.appendChild(outerGaussian);
        
        // 创建高光模糊滤镜
        const highlightBlur = document.createElementNS(this.svgNS, 'filter');
        highlightBlur.setAttribute('id', 'highlight-blur');
        highlightBlur.setAttribute('x', '-50%');
        highlightBlur.setAttribute('y', '-50%');
        highlightBlur.setAttribute('width', '200%');
        highlightBlur.setAttribute('height', '200%');
        const highlightGaussian = document.createElementNS(this.svgNS, 'feGaussianBlur');
        highlightGaussian.setAttribute('in', 'SourceGraphic');
        highlightGaussian.setAttribute('stdDeviation', '3');
        highlightBlur.appendChild(highlightGaussian);
        
        defs.appendChild(shadowBlur);
        defs.appendChild(outerBlur);
        defs.appendChild(highlightBlur);
    },
    
    // 渲染手串
    render() {
        const beadsContainer = document.getElementById('beads-container');
        const circleContainer = document.getElementById('bracelet-circle');
        const emptyHint = document.getElementById('empty-hint');
        
        this.stopScatterDropAnimations();

        // 清空容器
        beadsContainer.innerHTML = '';
        circleContainer.innerHTML = '';
        
        // 创建分层容器（阴影层 → 图片层 → 高光层）
        const shadowsLayer = document.createElementNS(this.svgNS, 'g');
        shadowsLayer.setAttribute('id', 'shadows-layer');
        const imagesLayer = document.createElementNS(this.svgNS, 'g');
        imagesLayer.setAttribute('id', 'images-layer');
        const highlightsLayer = document.createElementNS(this.svgNS, 'g');
        highlightsLayer.setAttribute('id', 'highlights-layer');
        
        beadsContainer.appendChild(shadowsLayer);
        beadsContainer.appendChild(imagesLayer);
        beadsContainer.appendChild(highlightsLayer);

        const beads = AppState.selectedBeads;
        
        const prevLayoutMap = new Map(this.currentLayout.map(entry => [entry.instanceId, entry]));
        this.previousLayoutMap = prevLayoutMap;
        this.currentLayout = [];

        // 如果没有珠子，显示提示和虚线圆圈
        if (beads.length === 0) {
            if (this.threeMode) {
                this.threeMode = false;
                this.dispatchThreeModeChange();
            }
            this.destroyThreeScene();
            if (this.scatterMode) {
                this.scatterMode = false;
                this.scatterTransition = null;
                this.scatterPositions.clear();
                this.dispatchScatterModeChange();
            }
            emptyHint.style.display = 'none';  // 不显示提示文字
            // 绘制虚线圆圈（使用最小周长）
            const minRadiusMM = this.minCircumference / (2 * Math.PI);
            const maxDiameterMM = this.maxCircumference / Math.PI;
            const maxRadiusPx = this.canvasSize * this.maxRadiusRatio;
            const mmToPx = maxRadiusPx / (maxDiameterMM / 2);
            const minRadiusPx = minRadiusMM * mmToPx;
            this.drawCircle(minRadiusPx, true); // true 表示绘制虚线
            return;
        }
        
        emptyHint.style.display = 'none';
        
        // 计算珠子总直径（紧密排列时，珠子直径之和 = 周长）
        const totalBeadLength = beads.reduce((sum, bead) => sum + this.getBeadLengthMm(bead), 0);
        
        // 计算画布到实际尺寸的缩放因子
        // 最大周长350mm对应的直径 = 350/π ≈ 111.4mm
        // 这个直径应该映射到画布的 480px (600 * 0.8)
        const maxDiameterMM = this.maxCircumference / Math.PI; // ≈ 73.2mm
        const maxRadiusPx = this.canvasSize * this.maxRadiusRatio; // 240px
        const mmToPx = maxRadiusPx / (maxDiameterMM / 2); // px/mm 转换因子
        
        // 判断当前阶段并计算参数（简化版：固定周长大小）
        let radiusMM, radiusPx, isSpaced, beadScaleFactor;

        // 固定使用最小周长作为手串圆圈大小
        radiusMM = this.minCircumference / (2 * Math.PI); // 周长转半径
        radiusPx = radiusMM * mmToPx;

        if (totalBeadLength < this.minCircumference) {
            // 阶段1：珠子较少，固定周长，间隔显示
            isSpaced = true;
            beadScaleFactor = 1;
        } else {
            // 阶段2：珠子达到或超过周长，固定周长，紧密排列，珠子缩放
            isSpaced = false;
            beadScaleFactor = this.minCircumference / totalBeadLength;
        }
        
        this.currentRadiusPx = radiusPx;
        this.currentMmToPx = mmToPx;
        this.currentBeadScaleFactor = beadScaleFactor;
        this.currentIsSpaced = isSpaced;
        this.currentLayout = [];

        // 先计算布局，再决定是否需要根据落点锁定旋转角度（避免在动画进行中改变父级 transform）
        const layoutEntries = isSpaced
            ? this.calculateLayoutSpaced(beads, radiusPx, beadScaleFactor, mmToPx)
            : this.calculateLayoutTight(beads, radiusPx, beadScaleFactor, mmToPx);

        if (this.threeMode) {
            this.renderThreeBracelet(beads, layoutEntries);
            return;
        }

        this.destroyThreeScene();

        if (this.scatterMode) {
            this.applyRotationTransform(0);
            this.renderBeadsScattered(beads, layoutEntries);
            return;
        }

        if (this.pendingAngleLock) {
            const { instanceId, dropAngle } = this.pendingAngleLock;
            const layoutEntry = layoutEntries.find(entry => entry.instanceId === instanceId);
            if (layoutEntry) {
                const targetRotation = this.normalizeRotation(dropAngle - layoutEntry.centerAngle);
                this.globalRotation = targetRotation;
            }
            this.pendingAngleLock = null;
        }

        this.applyRotationTransform(this.globalRotation);

        if (this.pendingDragLayoutOverride) {
            const { instanceId, rootX, rootY, rotationDeg: overrideRotationDeg } = this.pendingDragLayoutOverride;
            const dx = rootX - this.centerX;
            const dy = rootY - this.centerY;
            const invRotation = -this.globalRotation;
            const cosInv = Math.cos(invRotation);
            const sinInv = Math.sin(invRotation);
            const baseX = this.centerX + dx * cosInv - dy * sinInv;
            const baseY = this.centerY + dx * sinInv + dy * cosInv;

            const previousEntry = prevLayoutMap.get(instanceId) || { instanceId };
            prevLayoutMap.set(instanceId, {
                ...previousEntry,
                baseX,
                baseY,
                rotationDeg: overrideRotationDeg
            });

            this.pendingDragLayoutOverride = null;
        }

        // 绘制圆圈线
        this.drawCircle(radiusPx);
        
        // 渲染每个珠子
        if (isSpaced) {
            // 间隔显示：按珠子大小比例分配角度，然后放大填满圆周
            this.renderBeadsSpaced(beads, radiusPx, beadScaleFactor, mmToPx);
        } else {
            // 紧密排列：珠子首尾相连
            this.renderBeadsTight(beads, radiusPx, beadScaleFactor, mmToPx);
        }
    },
    
    // 绘制圆圈
    drawCircle(radius, isDashed = false) {
        const circle = document.createElementNS(this.svgNS, 'circle');
        circle.setAttribute('cx', this.centerX);
        circle.setAttribute('cy', this.centerY);
        circle.setAttribute('r', radius);
        
        // 如果是虚线模式，添加虚线样式
        if (isDashed) {
            circle.setAttribute('stroke-dasharray', '8 6'); // 8px实线，6px间隔
            circle.setAttribute('opacity', '0.5'); // 半透明效果
        }
        
        document.getElementById('bracelet-circle').appendChild(circle);
    },

    ensureThreeCanvas() {
        const container = document.querySelector('.bracelet-container');
        if (!container) return null;
        container.classList.add('bracelet-container--3d');

        if (!this.threeCanvas) {
            this.threeCanvas = document.createElement('canvas');
            this.threeCanvas.className = 'bracelet-3d-canvas';
            this.threeCanvas.setAttribute('aria-hidden', 'true');
            container.appendChild(this.threeCanvas);
        }

        return this.threeCanvas;
    },

    getThreeTexture(url) {
        const THREE = this.threeLib;
        const optimizedUrl = this.getOptimizedImageUrl(url);
        if (!THREE || !optimizedUrl) return null;

        if (this.threeTextures.has(optimizedUrl)) {
            return this.threeTextures.get(optimizedUrl);
        }

        if (!this.threeTextureLoader) {
            this.threeTextureLoader = new THREE.TextureLoader();
        }

        const texture = this.threeTextureLoader.load(optimizedUrl);
        if (THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        }
        const maxAnisotropy = this.threeRenderer?.capabilities?.getMaxAnisotropy?.();
        if (maxAnisotropy) {
            texture.anisotropy = Math.min(maxAnisotropy, 4);
        }
        texture.needsUpdate = true;
        this.threeTextures.set(optimizedUrl, texture);
        return texture;
    },

    destroyThreeScene() {
        if (this.threeAnimationFrame) {
            window.cancelAnimationFrame(this.threeAnimationFrame);
            this.threeAnimationFrame = null;
        }

        if (this.svgElement) {
            this.svgElement.style.visibility = '';
        }
        const container = document.querySelector('.bracelet-container');
        if (container) {
            container.classList.remove('bracelet-container--3d');
        }

        if (this.threeScene) {
            this.threeScene.traverse((object) => {
                if (object.geometry && typeof object.geometry.dispose === 'function') {
                    object.geometry.dispose();
                }
                if (object.material) {
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    materials.forEach((material) => {
                        if (material && typeof material.dispose === 'function') {
                            material.dispose();
                        }
                    });
                }
            });
        }
        this.threeGeneratedTextures.forEach((texture) => {
            if (texture && typeof texture.dispose === 'function') {
                texture.dispose();
            }
        });
        this.threeGeneratedTextures = [];

        if (this.threeRenderer) {
            this.threeRenderer.dispose();
            this.threeRenderer = null;
        }

        if (this.threeCanvas && this.threeCanvas.parentNode) {
            this.threeCanvas.parentNode.removeChild(this.threeCanvas);
        }

        this.threeCanvas = null;
        this.threeScene = null;
        this.threeCamera = null;
        this.threeGroup = null;
    },

    renderThreeBracelet(beads, layoutEntries) {
        const THREE = this.threeLib;
        const container = document.querySelector('.bracelet-container');

        if (!THREE || !container) {
            this.threeMode = false;
            this.dispatchThreeModeChange();
            this.destroyThreeScene();
            return;
        }

        this.destroyThreeScene();
        const canvas = this.ensureThreeCanvas();
        if (!canvas) {
            this.threeMode = false;
            this.dispatchThreeModeChange();
            this.destroyThreeScene();
            return;
        }

        this.threeCanvas = canvas;
        if (!canvas.parentNode) {
            container.appendChild(canvas);
        }

        const rect = container.getBoundingClientRect();
        const width = Math.max(Math.round(rect.width), 1);
        const height = Math.max(Math.round(rect.height), 1);

        if (this.svgElement) {
            this.svgElement.style.visibility = 'hidden';
        }

        try {
            this.threeRenderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        } catch (error) {
            console.error('Failed to initialize 3D bracelet renderer:', error);
            this.threeMode = false;
            this.dispatchThreeModeChange();
            this.destroyThreeScene();
            return;
        }

        this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.threeRenderer.setSize(width, height, false);
        if (THREE.SRGBColorSpace) {
            this.threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        if (THREE.ACESFilmicToneMapping) {
            this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.threeRenderer.toneMappingExposure = 0.96;
        }

        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        this.threeCamera.position.set(0, 0.12, 5.9);

        const createRadialTexture = (stops) => {
            const textureCanvas = document.createElement('canvas');
            textureCanvas.width = 96;
            textureCanvas.height = 96;
            const ctx = textureCanvas.getContext('2d');
            const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
            stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 96, 96);
            const texture = new THREE.CanvasTexture(textureCanvas);
            if (THREE.SRGBColorSpace) {
                texture.colorSpace = THREE.SRGBColorSpace;
            }
            texture.needsUpdate = true;
            this.threeGeneratedTextures.push(texture);
            return texture;
        };

        const beadHighlightTexture = createRadialTexture([
            [0, 'rgba(255, 255, 255, 1)'],
            [0.22, 'rgba(255, 255, 255, 0.78)'],
            [0.56, 'rgba(255, 255, 255, 0.24)'],
            [0.78, 'rgba(255, 255, 255, 0.08)'],
            [1, 'rgba(255, 255, 255, 0)']
        ]);
        const beadShadowTexture = createRadialTexture([
            [0, 'rgba(46, 36, 22, 0.58)'],
            [0.42, 'rgba(46, 36, 22, 0.26)'],
            [1, 'rgba(46, 36, 22, 0)']
        ]);

        const ambientLight = new THREE.AmbientLight(0xfffbf1, 0.82);
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.45);
        keyLight.position.set(2.4, 3.9, 4.8);
        const fillLight = new THREE.DirectionalLight(0xf0e1be, 0.52);
        fillLight.position.set(-3.1, -1.4, 3.4);
        const rimLight = new THREE.DirectionalLight(0xdfe7d1, 0.9);
        rimLight.position.set(-2.4, 2.8, -3.2);
        this.threeScene.add(ambientLight, keyLight, fillLight, rimLight);

        this.threeGroup = new THREE.Group();
        this.threeGroup.position.set(-0.045, 0.3, 0);
        this.threeGroup.rotation.x = -0.62;
        this.threeGroup.rotation.y = -0.08;
        this.threeScene.add(this.threeGroup);

        const layoutRadiusPx = this.currentRadiusPx || 188;
        const ringRadius = this.clamp(layoutRadiusPx / 128, 1.22, 1.55);
        const cordGeometry = new THREE.TorusGeometry(ringRadius, 0.012, 12, 176);
        const cordMaterial = new THREE.MeshStandardMaterial({
            color: 0xc4ad72,
            roughness: 0.86,
            metalness: 0.04,
            transparent: true,
            opacity: 0.42,
            depthWrite: false
        });
        const cord = new THREE.Mesh(cordGeometry, cordMaterial);
        cord.position.z = -0.035;
        this.threeGroup.add(cord);

        const beadShellGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const beadScaleFactor = this.currentBeadScaleFactor || 1;

        beads.forEach((bead, index) => {
            const layoutEntry = layoutEntries[index];
            if (!layoutEntry || bead._entering) return;

            const angle = layoutEntry.centerAngle + Math.PI / 2;
            const texture = this.getThreeTexture(bead.thumbnail);
            const beadLengthMm = this.getBeadLengthMm(bead) * beadScaleFactor;
            const beadWidthMm = this.getBeadWidthMm(bead) * beadScaleFactor;
            const lengthScale = this.clamp(beadLengthMm * 0.04, 0.24, 0.5);
            const widthScale = this.clamp(beadWidthMm * 0.04, 0.24, 0.5);
            const maxScale = Math.max(lengthScale, widthScale);
            const beadX = Math.cos(angle) * ringRadius;
            const beadY = Math.sin(angle) * ringRadius;

            const shellMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xf8f2e5,
                roughness: 0.22,
                metalness: 0,
                transparent: true,
                opacity: texture ? 0.24 : 0.62,
                clearcoat: 0.9,
                clearcoatRoughness: 0.18,
                transmission: 0.12,
                depthWrite: false
            });
            const shell = new THREE.Mesh(beadShellGeometry, shellMaterial);
            shell.scale.set(lengthScale, widthScale, this.clamp(maxScale * 0.7, 0.18, 0.36));
            shell.position.set(beadX, beadY, -0.015);
            shell.renderOrder = 0;
            this.threeGroup.add(shell);

            const shadowMaterial = new THREE.SpriteMaterial({
                map: beadShadowTexture,
                color: 0x332717,
                transparent: true,
                opacity: 0.48,
                depthTest: false,
                depthWrite: false,
                toneMapped: false
            });
            const shadow = new THREE.Sprite(shadowMaterial);
            shadow.scale.set(maxScale * 1.18, maxScale * 0.58, 1);
            shadow.position.set(beadX + 0.055, beadY - 0.075, -0.12);
            shadow.renderOrder = -10;
            this.threeGroup.add(shadow);

            const material = new THREE.SpriteMaterial({
                map: texture || undefined,
                color: 0xffffff,
                transparent: true,
                opacity: 1,
                depthTest: true,
                depthWrite: false,
                toneMapped: false
            });

            const sprite = new THREE.Sprite(material);
            sprite.scale.set(lengthScale, widthScale, 1);
            sprite.position.set(beadX, beadY, 0.035);
            sprite.renderOrder = 1;
            this.threeGroup.add(sprite);

            const highlightMaterial = new THREE.SpriteMaterial({
                map: beadHighlightTexture,
                color: 0xffffff,
                transparent: true,
                opacity: 0.58,
                depthTest: false,
                depthWrite: false,
                toneMapped: false
            });
            const highlight = new THREE.Sprite(highlightMaterial);
            highlight.scale.set(maxScale * 0.48, maxScale * 0.24, 1);
            highlight.position.set(beadX - lengthScale * 0.18, beadY + widthScale * 0.2, 0.13);
            highlight.renderOrder = 3;
            this.threeGroup.add(highlight);

            const highlightCoreMaterial = new THREE.SpriteMaterial({
                map: beadHighlightTexture,
                color: 0xffffff,
                transparent: true,
                opacity: 0.72,
                depthTest: false,
                depthWrite: false,
                toneMapped: false
            });
            const highlightCore = new THREE.Sprite(highlightCoreMaterial);
            highlightCore.scale.set(maxScale * 0.2, maxScale * 0.1, 1);
            highlightCore.position.set(beadX - lengthScale * 0.22, beadY + widthScale * 0.23, 0.16);
            highlightCore.renderOrder = 4;
            this.threeGroup.add(highlightCore);
        });

        const renderFrame = (time) => {
            if (!this.threeMode || !this.threeRenderer || !this.threeCamera || !this.threeScene || !this.threeGroup) {
                return;
            }

            const nextRect = container.getBoundingClientRect();
            const nextWidth = Math.max(Math.round(nextRect.width), 1);
            const nextHeight = Math.max(Math.round(nextRect.height), 1);
            const size = this.threeRenderer.getSize(new THREE.Vector2());
            if (size.width !== nextWidth || size.height !== nextHeight) {
                this.threeRenderer.setSize(nextWidth, nextHeight, false);
                this.threeCamera.aspect = nextWidth / nextHeight;
                this.threeCamera.updateProjectionMatrix();
            }

            const t = time * 0.001;
            this.threeGroup.rotation.x = -0.62 + Math.sin(t * 0.62) * 0.04;
            this.threeGroup.rotation.y = Math.sin(t * 0.48) * 0.16;
            this.threeGroup.rotation.z = t * 0.34 + Math.sin(t * 0.36) * 0.025;

            this.threeRenderer.render(this.threeScene, this.threeCamera);
            this.threeAnimationFrame = window.requestAnimationFrame(renderFrame);
        };

        this.threeAnimationFrame = window.requestAnimationFrame(renderFrame);
    },

    renderBeadsScattered(beads, layoutEntries) {
        this.ensureScatterPositions(beads, layoutEntries);

        beads.forEach((bead, index) => {
            const baseEntry = layoutEntries[index] || {};
            const scatter = this.scatterPositions.get(bead.instanceId);
            if (!scatter) return;

            const beadLengthPx = baseEntry.beadLengthPx || (scatter.radius * 2);
            const beadWidthPx = baseEntry.beadWidthPx || (scatter.radius * 2);
            const beadRadiusPx = baseEntry.beadRadiusPx || scatter.radius;
            const centerAngle = Math.atan2(scatter.y - this.centerY, scatter.x - this.centerX);
            const rotation = scatter.rotationDeg;

            const layoutEntry = {
                ...baseEntry,
                index,
                instanceId: bead.instanceId,
                centerAngle,
                startAngle: centerAngle,
                endAngle: centerAngle,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                baseX: scatter.x,
                baseY: scatter.y,
                rotationDeg: rotation,
                isScattered: true
            };

            this.currentLayout.push(layoutEntry);

            const prevEntry = this.scatterTransition === 'pour'
                ? {
                    instanceId: bead.instanceId,
                    baseX: scatter.startX,
                    baseY: scatter.startY,
                    rotationDeg: scatter.startRotationDeg,
                    scatterPour: true,
                    scatterDelay: scatter.delay,
                    scatterDuration: scatter.duration,
                    scatterPath: scatter.path,
                    scatterRotationPath: scatter.rotationPath
                }
                : this.previousLayoutMap.get(bead.instanceId);

            this.createBeadElement(
                bead,
                index,
                scatter.x,
                scatter.y,
                beadLengthPx,
                beadWidthPx,
                beadRadiusPx,
                rotation,
                layoutEntry,
                prevEntry
            );
        });

        this.scatterTransition = null;
    },

    calculateLayoutSpaced(beads, radiusPx, beadScaleFactor, mmToPx) {
        const totalBeadLength = beads.reduce((sum, bead) => sum + this.getBeadLengthMm(bead) * beadScaleFactor, 0);
        const radiusMM = radiusPx / mmToPx;

        let cumulativeAngle = 0;
        const beadAngles = beads.map(bead => {
            const beadLengthMM = this.getBeadLengthMm(bead) * beadScaleFactor;
            const baseAngleSpan = beadLengthMM / radiusMM;
            const startAngle = cumulativeAngle;
            cumulativeAngle += baseAngleSpan;
            return { startAngle, baseAngleSpan };
        });

        const totalBaseAngle = cumulativeAngle;
        const scaleFactor = (2 * Math.PI) / totalBaseAngle;
        const startOffset = -Math.PI / 2;

        return beads.map((bead, index) => {
            const { startAngle, baseAngleSpan } = beadAngles[index];
            const scaledAngleSpan = baseAngleSpan * scaleFactor;
            const beadAngle = startOffset + startAngle * scaleFactor + scaledAngleSpan / 2;

            const x = this.centerX + radiusPx * Math.cos(beadAngle);
            const y = this.centerY + radiusPx * Math.sin(beadAngle);

            const { beadLengthPx, beadWidthPx, beadRadiusPx } = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);

            return {
                index,
                instanceId: bead.instanceId,
                centerAngle: beadAngle,
                startAngle: startOffset + startAngle * scaleFactor,
                endAngle: startOffset + (startAngle + baseAngleSpan) * scaleFactor,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                baseX: x,
                baseY: y
            };
        });
    },

    calculateLayoutTight(beads, radiusPx, beadScaleFactor, mmToPx) {
        const totalBeadLength = beads.reduce((sum, bead) => sum + this.getBeadLengthMm(bead) * beadScaleFactor, 0);

        let cumulativeAngle = 0;
        const beadAngles = beads.map(bead => {
            const beadLengthMM = this.getBeadLengthMm(bead) * beadScaleFactor;
            const angleSpan = (beadLengthMM / totalBeadLength) * 2 * Math.PI;
            const startAngle = cumulativeAngle;
            cumulativeAngle += angleSpan;
            return { startAngle, angleSpan };
        });

        const startOffset = -Math.PI / 2;

        return beads.map((bead, index) => {
            const { startAngle, angleSpan } = beadAngles[index];
            const beadAngle = startOffset + startAngle + angleSpan / 2;

            const x = this.centerX + radiusPx * Math.cos(beadAngle);
            const y = this.centerY + radiusPx * Math.sin(beadAngle);

            const { beadLengthPx, beadWidthPx, beadRadiusPx } = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);

            return {
                index,
                instanceId: bead.instanceId,
                centerAngle: beadAngle,
                startAngle: startOffset + startAngle,
                endAngle: startOffset + startAngle + angleSpan,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                baseX: x,
                baseY: y
            };
        });
    },
    
    // 渲染珠子（间隔显示模式）
    renderBeadsSpaced(beads, radiusPx, beadScaleFactor, mmToPx) {
        // 计算每个珠子基于其直径应该占据的基础角度
        const totalBeadLength = beads.reduce((sum, bead) => sum + this.getBeadLengthMm(bead) * beadScaleFactor, 0);
        const radiusMM = radiusPx / mmToPx;
        
        // 计算每个珠子的基础角度（基于直径在半径上的弧度）
        let cumulativeAngle = 0;
        const beadAngles = beads.map(bead => {
            const beadLengthMM = this.getBeadLengthMm(bead) * beadScaleFactor;
            // 基础角度（如果珠子紧密排列时占据的角度）
            const baseAngleSpan = beadLengthMM / radiusMM;
            const startAngle = cumulativeAngle;
            cumulativeAngle += baseAngleSpan;
            return { startAngle, baseAngleSpan };
        });
        
        // 计算总基础角度
        const totalBaseAngle = cumulativeAngle;
        
        // 计算缩放因子，将基础角度放大到填满整个圆周（2π）
        const scaleFactor = (2 * Math.PI) / totalBaseAngle;
        
        // 从顶部（-π/2）开始渲染
        const startOffset = -Math.PI / 2;
        
        beads.forEach((bead, index) => {
            const { startAngle, baseAngleSpan } = beadAngles[index];
            
            // 缩放后的角度
            const scaledAngleSpan = baseAngleSpan * scaleFactor;
            
            // 珠子中心的角度（加上起始偏移）
            const beadAngle = startOffset + startAngle * scaleFactor + scaledAngleSpan / 2;
            
            // 计算珠子位置
            const x = this.centerX + radiusPx * Math.cos(beadAngle);
            const y = this.centerY + radiusPx * Math.sin(beadAngle);
            
            // 计算珠子显示半径（px）
            const { beadLengthPx, beadWidthPx, beadRadiusPx } = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);
            
            // 计算旋转角度（转换为度数）
            const rotation = (beadAngle * 180 / Math.PI) + 90;

            const layoutEntry = {
                index,
                instanceId: bead.instanceId,
                centerAngle: beadAngle,
                startAngle: startOffset + startAngle * scaleFactor,
                endAngle: startOffset + (startAngle + baseAngleSpan) * scaleFactor,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                baseX: x,
                baseY: y
            };
            this.currentLayout.push(layoutEntry);
            const prevEntry = this.previousLayoutMap.get(bead.instanceId);
            
            this.createBeadElement(bead, index, x, y, beadLengthPx, beadWidthPx, beadRadiusPx, rotation, layoutEntry, prevEntry);
        });
    },
    
    // 渲染珠子（紧密排列模式）
    renderBeadsTight(beads, radiusPx, beadScaleFactor, mmToPx) {
        // 先计算总直径和每个珠子的角度比例
        const totalBeadLength = beads.reduce((sum, bead) => sum + this.getBeadLengthMm(bead) * beadScaleFactor, 0);
        const radiusMM = radiusPx / mmToPx;
        
        // 预计算每个珠子的起始角度，确保正好闭合成一个完整的圆
        let cumulativeAngle = 0;
        const beadAngles = beads.map(bead => {
            const beadLengthMM = this.getBeadLengthMm(bead) * beadScaleFactor;
            // 计算这个珠子应该占据整个圆周的比例
            const angleSpan = (beadLengthMM / totalBeadLength) * 2 * Math.PI;
            const startAngle = cumulativeAngle;
            cumulativeAngle += angleSpan;
            return { startAngle, angleSpan };
        });
        
        // 从顶部（-π/2）开始渲染
        const startOffset = -Math.PI / 2;
        
        beads.forEach((bead, index) => {
            const { startAngle, angleSpan } = beadAngles[index];
            
            // 珠子中心的角度（加上起始偏移）
            const beadAngle = startOffset + startAngle + angleSpan / 2;
            
            // 计算珠子位置
            const x = this.centerX + radiusPx * Math.cos(beadAngle);
            const y = this.centerY + radiusPx * Math.sin(beadAngle);
            
            // 计算珠子显示半径（px）
            const { beadLengthPx, beadWidthPx, beadRadiusPx } = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);
            
            // 计算旋转角度（转换为度数）
            const rotation = (beadAngle * 180 / Math.PI) + 90;

            const layoutEntry = {
                index,
                instanceId: bead.instanceId,
                centerAngle: beadAngle,
                startAngle: startOffset + startAngle,
                endAngle: startOffset + startAngle + angleSpan,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                baseX: x,
                baseY: y
            };
            this.currentLayout.push(layoutEntry);
            const prevEntry = this.previousLayoutMap.get(bead.instanceId);
            
            this.createBeadElement(bead, index, x, y, beadLengthPx, beadWidthPx, beadRadiusPx, rotation, layoutEntry, prevEntry);
        });
    },
    
    // 归一化角度到 [0, 2π)，顶部为 0
    normalizeAngle(angle) {
        const twoPi = Math.PI * 2;
        const normalized = angle + Math.PI / 2;
        return ((normalized % twoPi) + twoPi) % twoPi;
    },

    normalizeRotation(angle) {
        const twoPi = Math.PI * 2;
        let normalized = angle % twoPi;
        if (normalized > Math.PI) normalized -= twoPi;
        if (normalized <= -Math.PI) normalized += twoPi;
        return normalized;
    },

    applyRotationTransform(angle) {
        const rotationDeg = angle * 180 / Math.PI;
        const rotationTransform = `rotate(${rotationDeg} ${this.centerX} ${this.centerY})`;
        const shadowsLayer = document.getElementById('shadows-layer');
        const imagesLayer = document.getElementById('images-layer');
        const highlightsLayer = document.getElementById('highlights-layer');
        if (shadowsLayer) shadowsLayer.setAttribute('transform', rotationTransform);
        if (imagesLayer) imagesLayer.setAttribute('transform', rotationTransform);
        if (highlightsLayer) highlightsLayer.setAttribute('transform', rotationTransform);
    },

    animateElementRotation(element, fromDeg, toDeg, cx, cy, duration = 260) {
        if (!element || Math.abs(fromDeg - toDeg) < 0.2) return;

        const anim = document.createElementNS(this.svgNS, 'animateTransform');
        anim.setAttribute('attributeName', 'transform');
        anim.setAttribute('type', 'rotate');
        anim.setAttribute('from', `${fromDeg} ${cx} ${cy}`);
        anim.setAttribute('to', `${toDeg} ${cx} ${cy}`);
        anim.setAttribute('dur', `${duration}ms`);
        anim.setAttribute('fill', 'freeze');
        element.appendChild(anim);

        try {
            anim.beginElement();
        } catch (e) {
            // WebKit 可能在元素尚未附加时抛错，忽略即可
        }

        const finalize = () => {
            // 确保最终角度持久化，防止移除动画后角度回退
            element.setAttribute('transform', `rotate(${toDeg} ${cx} ${cy})`);
            if (anim.parentNode) {
                anim.parentNode.removeChild(anim);
            }
        };

        setTimeout(finalize, duration + 20);
    },

    // 平滑平移元素到新位置（在重新渲染时保留连贯性）
    animateElementTranslate(element, dx, dy, duration = 260) {
        if (!element) return;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

        const anim = document.createElementNS(this.svgNS, 'animateTransform');
        anim.setAttribute('attributeName', 'transform');
        anim.setAttribute('type', 'translate');
        anim.setAttribute('additive', 'sum'); // 不覆盖已有旋转
        anim.setAttribute('from', `${dx} ${dy}`);
        anim.setAttribute('to', '0 0');
        anim.setAttribute('dur', `${duration}ms`);
        anim.setAttribute('fill', 'freeze');
        element.appendChild(anim);

        try {
            anim.beginElement();
        } catch (e) {
            // 如果在还没插入 DOM 时调用，忽略异常
        }

        setTimeout(() => {
            if (anim.parentNode) {
                anim.parentNode.removeChild(anim);
            }
        }, duration + 50);
    },

    animateElementTranslatePath(element, offsets, duration = 640, keyTimes = null) {
        if (!element || !offsets || offsets.length < 2) return;

        const normalizedKeyTimes = Array.isArray(keyTimes) && keyTimes.length === offsets.length
            ? keyTimes
            : offsets.map((_, index) => {
                if (offsets.length === 4) return [0, 0.58, 0.84, 1][index];
                return index / (offsets.length - 1);
            });

        const anim = document.createElementNS(this.svgNS, 'animateTransform');
        anim.setAttribute('attributeName', 'transform');
        anim.setAttribute('type', 'translate');
        anim.setAttribute('additive', 'sum');
        anim.setAttribute('values', offsets.map(([dx, dy]) => `${dx} ${dy}`).join(';'));
        anim.setAttribute('keyTimes', normalizedKeyTimes.join(';'));
        anim.setAttribute('calcMode', 'spline');
        anim.setAttribute('keySplines', Array.from({ length: offsets.length - 1 }, () => '0.18 0.82 0.28 1').join(';'));
        anim.setAttribute('dur', `${duration}ms`);
        anim.setAttribute('fill', 'freeze');
        element.appendChild(anim);

        try {
            anim.beginElement();
        } catch (e) {
            // 某些浏览器可能在元素刚插入时抛错，忽略即可
        }

        setTimeout(() => {
            if (anim.parentNode) {
                anim.parentNode.removeChild(anim);
            }
        }, duration + 80);
    },

    animateElementRotationPath(element, rotations, cx, cy, duration = 640, keyTimes = null) {
        if (!element || !rotations || rotations.length < 2) return;

        const normalizedKeyTimes = Array.isArray(keyTimes) && keyTimes.length === rotations.length
            ? keyTimes
            : rotations.map((_, index) => index / (rotations.length - 1));

        const anim = document.createElementNS(this.svgNS, 'animateTransform');
        anim.setAttribute('attributeName', 'transform');
        anim.setAttribute('type', 'rotate');
        anim.setAttribute('values', rotations.map(rotation => `${rotation} ${cx} ${cy}`).join(';'));
        anim.setAttribute('keyTimes', normalizedKeyTimes.join(';'));
        anim.setAttribute('calcMode', 'spline');
        anim.setAttribute('keySplines', Array.from({ length: rotations.length - 1 }, () => '0.16 0.78 0.28 1').join(';'));
        anim.setAttribute('dur', `${duration}ms`);
        anim.setAttribute('fill', 'freeze');
        element.appendChild(anim);

        try {
            anim.beginElement();
        } catch (e) {
            // 某些浏览器可能在元素刚插入时抛错，忽略即可
        }

        setTimeout(() => {
            element.setAttribute('transform', `rotate(${rotations[rotations.length - 1]} ${cx} ${cy})`);
            if (anim.parentNode) {
                anim.parentNode.removeChild(anim);
            }
        }, duration + 80);
    },

    readTranslate(element) {
        if (!element) return { x: 0, y: 0 };
        const transform = element.getAttribute('transform') || '';
        const match = transform.match(/translate\(\s*([-+]?\d*\.?\d+)(?:[\s,]+)([-+]?\d*\.?\d+)\s*\)/);
        if (!match) return { x: 0, y: 0 };
        return {
            x: Number(match[1]) || 0,
            y: Number(match[2]) || 0
        };
    },

    sampleKeyframedValue(values, keyTimes, progress) {
        if (!values || values.length === 0) return null;
        if (values.length === 1 || progress <= 0) return values[0];
        if (progress >= 1) return values[values.length - 1];

        for (let i = 1; i < keyTimes.length; i++) {
            const endTime = keyTimes[i];
            if (progress <= endTime || i === keyTimes.length - 1) {
                const startTime = keyTimes[i - 1];
                const range = Math.max(endTime - startTime, 0.0001);
                const segmentProgress = this.clamp((progress - startTime) / range, 0, 1);
                const from = values[i - 1];
                const to = values[i];

                if (Array.isArray(from) && Array.isArray(to)) {
                    return [
                        from[0] + (to[0] - from[0]) * segmentProgress,
                        from[1] + (to[1] - from[1]) * segmentProgress
                    ];
                }

                return from + (to - from) * segmentProgress;
            }
        }

        return values[values.length - 1];
    },

    applyScatterDropFrame(item, offset, rotation) {
        if (!item || !offset) return;
        const dx = offset[0] || 0;
        const dy = offset[1] || 0;
        const movedX = item.x + dx;
        const movedY = item.y + dy;

        if (item.parts.beadGroup) {
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                item.parts.beadGroup.setAttribute('transform', `translate(${dx} ${dy})`);
            } else {
                item.parts.beadGroup.removeAttribute('transform');
            }
        }

        if (item.parts.image) {
            item.parts.image.setAttribute('transform', `rotate(${rotation} ${item.x} ${item.y})`);
        }

        if (item.parts.outerShadowGroup) {
            item.parts.outerShadowGroup.setAttribute('transform', `translate(${item.outerShadowBase.x + dx} ${item.outerShadowBase.y + dy})`);
        }
        if (item.parts.shadowGroup) {
            item.parts.shadowGroup.setAttribute('transform', `translate(${item.shadowBase.x + dx} ${item.shadowBase.y + dy})`);
        }
        if (item.parts.outerShadow) {
            item.parts.outerShadow.setAttribute('transform', `rotate(${rotation} 0 0)`);
        }
        if (item.parts.shadow) {
            item.parts.shadow.setAttribute('transform', `rotate(${rotation} 0 0)`);
        }

        if (item.parts.highlight) {
            item.parts.highlight.setAttribute('cx', item.highlightBase.cx + dx);
            item.parts.highlight.setAttribute('cy', item.highlightBase.cy + dy);
            item.parts.highlight.setAttribute('transform', `rotate(${rotation} ${movedX} ${movedY})`);
        }
    },

    finishScatterDropFrame(item) {
        if (!item) return;
        const finalOffset = item.offsets[item.offsets.length - 1] || [0, 0];
        const finalRotation = item.rotations[item.rotations.length - 1] ?? item.rotation;
        this.applyScatterDropFrame(item, finalOffset, finalRotation);

        item.motionParts.forEach((element) => {
            if (!element) return;
            element.style.removeProperty('opacity');
            element.style.removeProperty('transition');
            element.style.removeProperty('will-change');
        });
    },

    runScatterDropAnimationFrame(now) {
        const remaining = [];

        this.scatterDropAnimations.forEach((item) => {
            const elapsed = now - item.createdAt - item.delay;

            if (elapsed < 0) {
                remaining.push(item);
                return;
            }

            if (!item.started) {
                item.started = true;
                item.motionParts.forEach((element) => {
                    if (!element) return;
                    element.style.opacity = '1';
                    element.style.transition = 'none';
                    element.style.willChange = 'transform, opacity';
                });
            }

            const progress = this.clamp(elapsed / item.duration, 0, 1);
            const offset = this.sampleKeyframedValue(item.offsets, item.keyTimes, progress);
            const rotation = this.sampleKeyframedValue(item.rotations, item.keyTimes, progress);
            this.applyScatterDropFrame(item, offset, rotation);

            if (progress < 1) {
                remaining.push(item);
            } else {
                this.finishScatterDropFrame(item);
            }
        });

        this.scatterDropAnimations = remaining;
        if (remaining.length > 0) {
            this.scatterDropAnimationFrame = window.requestAnimationFrame((frameTime) => {
                this.runScatterDropAnimationFrame(frameTime);
            });
        } else {
            this.scatterDropAnimationFrame = null;
        }
    },

    scheduleScatterDropAnimation(item) {
        this.scatterDropAnimations.push(item);
        if (!this.scatterDropAnimationFrame) {
            this.scatterDropAnimationFrame = window.requestAnimationFrame((frameTime) => {
                this.runScatterDropAnimationFrame(frameTime);
            });
        }
    },

    stopScatterDropAnimations() {
        if (this.scatterDropAnimationFrame) {
            window.cancelAnimationFrame(this.scatterDropAnimationFrame);
            this.scatterDropAnimationFrame = null;
        }
        this.scatterDropAnimations = [];
    },

    animateScatterDrop(parts, prevLayoutEntry, layoutEntry, rotation) {
        if (!parts || !prevLayoutEntry || !layoutEntry) return;

        const delay = prevLayoutEntry.scatterDelay || 0;
        const duration = prevLayoutEntry.scatterDuration || this.scatterAnimationDuration;
        const startRotation = typeof prevLayoutEntry.rotationDeg === 'number'
            ? prevLayoutEntry.rotationDeg
            : rotation - 540;
        const x = layoutEntry.baseX;
        const y = layoutEntry.baseY;
        const path = Array.isArray(prevLayoutEntry.scatterPath) && prevLayoutEntry.scatterPath.length > 1
            ? prevLayoutEntry.scatterPath
            : [
                { x: prevLayoutEntry.baseX, y: prevLayoutEntry.baseY, t: 0 },
                { x, y, t: 1 }
            ];
        const rotationPath = Array.isArray(prevLayoutEntry.scatterRotationPath) && prevLayoutEntry.scatterRotationPath.length === path.length
            ? prevLayoutEntry.scatterRotationPath
            : path.map((point, index) => ({
                rotationDeg: startRotation + (rotation - startRotation) * (index / Math.max(path.length - 1, 1)),
                t: point.t
            }));
        const offsets = path.map(point => [point.x - x, point.y - y]);
        const keyTimes = path.map(point => this.clamp(point.t ?? 0, 0, 1));
        keyTimes[0] = 0;
        keyTimes[keyTimes.length - 1] = 1;
        const rotations = rotationPath.map(point => point.rotationDeg);

        const motionParts = [
            parts.beadGroup,
            parts.outerShadowGroup,
            parts.shadowGroup,
            parts.highlight
        ].filter(Boolean);

        motionParts.forEach((element) => {
            element.style.opacity = '0';
            element.style.transition = 'none';
            element.style.willChange = 'transform, opacity';
        });

        if (parts.image) parts.image.setAttribute('transform', `rotate(${startRotation} ${x} ${y})`);

        const item = {
            parts,
            x,
            y,
            rotation,
            offsets,
            rotations,
            keyTimes,
            delay,
            duration,
            createdAt: window.performance ? window.performance.now() : Date.now(),
            started: false,
            motionParts,
            outerShadowBase: this.readTranslate(parts.outerShadowGroup),
            shadowBase: this.readTranslate(parts.shadowGroup),
            highlightBase: {
                cx: parts.highlight ? Number(parts.highlight.getAttribute('cx')) || x : x,
                cy: parts.highlight ? Number(parts.highlight.getAttribute('cy')) || y : y
            }
        };

        this.applyScatterDropFrame(item, offsets[0], rotations[0]);
        this.scheduleScatterDropAnimation(item);
    },

    setElementTransitionEnabled(element, enabled) {
        if (!element) return;

        if (!enabled) {
            if (element.__dragOriginalTransition === undefined) {
                element.__dragOriginalTransition = element.style.transition || '';
            }
            element.style.transition = 'none';
        } else {
            const previous = element.__dragOriginalTransition;
            if (previous !== undefined) {
                if (previous) {
                    element.style.transition = previous;
                } else {
                    element.style.removeProperty('transition');
                }
                delete element.__dragOriginalTransition;
            } else {
                element.style.removeProperty('transition');
            }
        }
    },

    disableTransitionsForDrag(draggedElements) {
        if (!draggedElements) return;
        const collected = new Set();

        const collect = (element) => {
            if (!element || collected.has(element)) return;
            collected.add(element);
            this.setElementTransitionEnabled(element, false);
        };

        if (draggedElements.shadows) {
            draggedElements.shadows.forEach(collect);
        }
        collect(draggedElements.image);
        collect(draggedElements.highlight);
        collect(draggedElements.deleteGroup);

        if (draggedElements.deleteGroup) {
            collect(draggedElements.deleteGroup.querySelector('circle'));
            collect(draggedElements.deleteGroup.querySelector('text'));
        }

        draggedElements.__transitionDisabledNodes = Array.from(collected);
    },

    restoreTransitionsAfterDrag(draggedElements) {
        if (!draggedElements || !draggedElements.__transitionDisabledNodes) return;
        draggedElements.__transitionDisabledNodes.forEach(element => {
            this.setElementTransitionEnabled(element, true);
        });
        delete draggedElements.__transitionDisabledNodes;
    },

    hideDraggedBeadElements(draggedElements) {
        if (!draggedElements) return;

        const hide = (element) => {
            if (!element) return;
            element.style.transition = 'none';
            element.style.opacity = '0';
        };

        if (draggedElements.shadows) {
            draggedElements.shadows.forEach(hide);
        }
        hide(draggedElements.image);
        hide(draggedElements.highlight);
        hide(draggedElements.deleteGroup);
        if (draggedElements.deleteGroup) {
            hide(draggedElements.deleteGroup.querySelector('circle'));
            hide(draggedElements.deleteGroup.querySelector('text'));
        }
    },

    // 根据鼠标距离判断落点区域
    determineDropZone(distance, beadRadiusPx) {
        if (!this.currentRadiusPx) return 'inner';

        const ringThickness = Math.max(beadRadiusPx * 1.45, 50);
        const innerLimit = Math.max(this.currentRadiusPx - ringThickness, 0);
        const outerLimit = this.currentRadiusPx + ringThickness*1.3;
        if (distance < innerLimit) return 'inner';
        if (distance > outerLimit) return 'outer';
        return 'ring';
    },

    // 根据角度计算目标插入位置
    getTargetIndexForAngle(angle, draggedInstanceId) {
        if (!this.currentLayout || this.currentLayout.length === 0) return 0;
        const filtered = this.currentLayout.filter(entry => entry.instanceId !== draggedInstanceId);
        if (filtered.length === 0) return 0;
        const normAngle = this.normalizeAngle(angle);
        const ordered = filtered.slice().sort((a, b) => this.normalizeAngle(a.centerAngle) - this.normalizeAngle(b.centerAngle));
        for (let i = 0; i < ordered.length; i++) {
            const entryAngle = this.normalizeAngle(ordered[i].centerAngle);
            if (normAngle < entryAngle) {
                return ordered[i].index;
            }
        }
        return ordered[0].index;
    },

    // 触发珠子回位动画
    animateBeadReturn(dragState, draggedBeadElements, onComplete) {
        if (!dragState) {
            if (onComplete) onComplete();
            return;
        }

        const layoutEntry = this.currentLayout.find(entry => entry.instanceId === dragState.instanceId);
        if (!layoutEntry) {
            if (onComplete) onComplete();
            return;
        }

        const bead = AppState.selectedBeads[dragState.originalIndex];
        if (!bead) {
            if (onComplete) onComplete();
            return;
        }

        const imagesLayer = document.getElementById('images-layer');
        if (!imagesLayer) {
            if (onComplete) onComplete();
            return;
        }

        const beadRadiusPx = dragState.beadRadiusPx || layoutEntry.beadRadiusPx;
        const beadLengthPx = dragState.beadLengthPx || layoutEntry.beadLengthPx || beadRadiusPx * 2;
        const beadWidthPx = dragState.beadWidthPx || layoutEntry.beadWidthPx || beadRadiusPx * 2;
        const startX = dragState.elementX ?? layoutEntry.baseX;
        const startY = dragState.elementY ?? layoutEntry.baseY;
        const targetX = layoutEntry.baseX;
        const targetY = layoutEntry.baseY;

        if (draggedBeadElements) {
            const allElements = [
                ...(draggedBeadElements.shadows || []),
                draggedBeadElements.image,
                draggedBeadElements.highlight,
                draggedBeadElements.deleteGroup
            ];
            allElements.forEach(el => {
                if (el) {
                    el.style.opacity = '0';
                }
            });
        }

        const tempGroup = document.createElementNS(this.svgNS, 'g');
        tempGroup.setAttribute('class', 'bead-returning');
        tempGroup.style.pointerEvents = 'none';

        const tempImage = document.createElementNS(this.svgNS, 'image');
        tempImage.setAttribute('href', this.getOptimizedImageUrl(bead.thumbnail));
        tempImage.setAttribute('x', startX - beadLengthPx / 2);
        tempImage.setAttribute('y', startY - beadWidthPx / 2);
        tempImage.setAttribute('width', beadLengthPx);
        tempImage.setAttribute('height', beadWidthPx);
        tempImage.setAttribute('preserveAspectRatio', this.getBeadImagePreserveAspectRatio(bead));

        tempGroup.appendChild(tempImage);
        imagesLayer.appendChild(tempGroup);

        if (typeof tempImage.animate === 'function') {
            const animation = tempImage.animate([
                { 
                    x: `${startX - beadLengthPx / 2}`,
                    y: `${startY - beadWidthPx / 2}`,
                    opacity: 0.6
                },
                { 
                    x: `${targetX - beadLengthPx / 2}`,
                    y: `${targetY - beadWidthPx / 2}`,
                    opacity: 1
                }
            ], {
                duration: 220,
                easing: 'ease-out',
                fill: 'forwards'
            });

            animation.onfinish = () => {
                tempGroup.remove();
                if (onComplete) onComplete();
            };
            animation.oncancel = () => {
                tempGroup.remove();
                if (onComplete) onComplete();
            };
        } else {
            tempImage.setAttribute('x', targetX - beadLengthPx / 2);
            tempImage.setAttribute('y', targetY - beadWidthPx / 2);
            setTimeout(() => {
                tempGroup.remove();
                if (onComplete) onComplete();
            }, 220);
        }
    },

    // 珠子沿环旋转到目标位置动画
    animateBeadSwap(dragState, draggedBeadElements, targetEntry, onComplete) {
        if (!dragState || !targetEntry) {
            if (onComplete) onComplete();
            return;
        }

        const imagesLayer = document.getElementById('images-layer');
        if (!imagesLayer) {
            if (onComplete) onComplete();
            return;
        }

        const bead = AppState.selectedBeads[dragState.originalIndex];
        if (!bead) {
            if (onComplete) onComplete();
            return;
        }

        const radius = this.currentRadiusPx;
        if (!radius) {
            if (onComplete) onComplete();
            return;
        }

        if (draggedBeadElements) {
            const allElements = [
                ...(draggedBeadElements.shadows || []),
                draggedBeadElements.image,
                draggedBeadElements.highlight,
                draggedBeadElements.deleteGroup
            ];
            allElements.forEach(el => {
                if (el) {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                }
            });
        }

        const beadRadiusPx = dragState.beadRadiusPx || targetEntry.beadRadiusPx;
        const beadLengthPx = dragState.beadLengthPx || targetEntry.beadLengthPx || beadRadiusPx * 2;
        const beadWidthPx = dragState.beadWidthPx || targetEntry.beadWidthPx || beadRadiusPx * 2;
        const startAngle = dragState.adjustedAngle;
        let targetAngle = targetEntry.centerAngle;
        let deltaAngle = targetAngle - startAngle;
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        const startX = this.centerX + radius * Math.cos(startAngle);
        const startY = this.centerY + radius * Math.sin(startAngle);

        const tempImage = document.createElementNS(this.svgNS, 'image');
        tempImage.setAttribute('href', this.getOptimizedImageUrl(bead.thumbnail));
        tempImage.setAttribute('x', startX - beadLengthPx / 2);
        tempImage.setAttribute('y', startY - beadWidthPx / 2);
        tempImage.setAttribute('width', beadLengthPx);
        tempImage.setAttribute('height', beadWidthPx);
        tempImage.setAttribute('preserveAspectRatio', this.getBeadImagePreserveAspectRatio(bead));
        tempImage.style.pointerEvents = 'none';

        imagesLayer.appendChild(tempImage);

        if (typeof tempImage.animate === 'function') {
            const steps = Math.max(12, Math.round(Math.abs(deltaAngle) / (Math.PI / 36)));
            const keyframes = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const angle = startAngle + deltaAngle * t;
                const x = this.centerX + radius * Math.cos(angle) - beadLengthPx / 2;
                const y = this.centerY + radius * Math.sin(angle) - beadWidthPx / 2;
                keyframes.push({
                    x: `${x}`,
                    y: `${y}`
                });
            }

            if (keyframes.length) {
                keyframes[0].opacity = 1;
                keyframes[keyframes.length - 1].opacity = 1;
            }

            const duration = Math.min(Math.max(220 + Math.abs(deltaAngle) * 160, 220), 600);

            const animation = tempImage.animate(keyframes, {
                duration,
                easing: 'ease-in-out',
                fill: 'forwards'
            });

            animation.onfinish = () => {
                tempImage.remove();
                if (onComplete) onComplete();
            };
            animation.oncancel = () => {
                tempImage.remove();
                if (onComplete) onComplete();
            };
        } else {
            const finalX = this.centerX + radius * Math.cos(targetAngle) - beadLengthPx / 2;
            const finalY = this.centerY + radius * Math.sin(targetAngle) - beadWidthPx / 2;
            tempImage.setAttribute('x', finalX);
            tempImage.setAttribute('y', finalY);
            setTimeout(() => {
                tempImage.remove();
                if (onComplete) onComplete();
            }, 240);
        }
    },
    
    // 创建珠子元素（分层渲染架构）
    createBeadElement(bead, index, x, y, beadLengthPx, beadWidthPx, beadRadiusPx, rotation = 0, layoutEntry = null, prevLayoutEntry = null) {
        // 获取分层容器
        const shadowsLayer = document.getElementById('shadows-layer');
        const imagesLayer = document.getElementById('images-layer');
        const highlightsLayer = document.getElementById('highlights-layer');
        
        // === 阴影层 ===
        // 外层柔和阴影（更大范围）
        if (bead._entering) {
            return;
        }

        const beadRadius = beadRadiusPx;
        const halfLength = beadLengthPx / 2;
        const halfWidth = beadWidthPx / 2;
        const outerShadowCx = x - beadRadius * 0.3;
        const outerShadowCy = y + beadRadius * 0.3;
        const innerShadowCx = x - beadRadius * 0.25;
        const innerShadowCy = y + beadRadius * 0.25;

        const outerShadowGroup = document.createElementNS(this.svgNS, 'g');
        outerShadowGroup.setAttribute('transform', `translate(${outerShadowCx} ${outerShadowCy})`);
        outerShadowGroup.style.pointerEvents = 'none';
        outerShadowGroup.dataset.beadId = bead.instanceId;

        const outerShadow = document.createElementNS(this.svgNS, 'ellipse');
        outerShadow.setAttribute('cx', '0'); // 向左下偏移
        outerShadow.setAttribute('cy', '0');
        outerShadow.setAttribute('rx', halfLength * 0.9);
        outerShadow.setAttribute('ry', halfWidth * 0.9);
        outerShadow.setAttribute('transform', `rotate(${rotation} 0 0)`);
        outerShadow.setAttribute('fill', 'rgba(0, 0, 0, 0.28)');
        outerShadow.setAttribute('filter', 'url(#outer-shadow-blur)');
        outerShadow.style.pointerEvents = 'none';
        outerShadowGroup.appendChild(outerShadow);
        
        // 内层阴影（更清晰）
        const shadowGroup = document.createElementNS(this.svgNS, 'g');
        shadowGroup.setAttribute('transform', `translate(${innerShadowCx} ${innerShadowCy})`);
        shadowGroup.style.pointerEvents = 'none';
        shadowGroup.dataset.beadId = bead.instanceId;

        const shadow = document.createElementNS(this.svgNS, 'ellipse');
        shadow.setAttribute('cx', '0'); // 向左下偏移
        shadow.setAttribute('cy', '0');
        shadow.setAttribute('rx', halfLength * 0.7);
        shadow.setAttribute('ry', halfWidth * 0.7);
        shadow.setAttribute('transform', `rotate(${rotation} 0 0)`);
        shadow.setAttribute('fill', 'rgba(0, 0, 0, 0.33)');
        shadow.setAttribute('filter', 'url(#shadow-blur)');
        shadow.style.pointerEvents = 'none';
        shadowGroup.appendChild(shadow);
        
        shadowsLayer.appendChild(outerShadowGroup);
        shadowsLayer.appendChild(shadowGroup);
        
        // === 图片层 ===
        // 创建珠子组（用于事件处理）
        const beadGroup = document.createElementNS(this.svgNS, 'g');
        beadGroup.classList.add('bead');
        beadGroup.dataset.instanceId = bead.instanceId;
        beadGroup.dataset.index = index;
        beadGroup.style.cursor = 'grab';
        if (layoutEntry?.isScattered) {
            beadGroup.classList.add('bead--scattered');
            beadGroup.style.cursor = 'default';
            beadGroup.style.pointerEvents = 'none';
        }
        
        const image = document.createElementNS(this.svgNS, 'image');
        image.setAttribute('href', this.getOptimizedImageUrl(bead.thumbnail));
        image.setAttribute('x', x - halfLength);
        image.setAttribute('y', y - halfWidth);
        image.setAttribute('width', beadLengthPx);
        image.setAttribute('height', beadWidthPx);
        image.setAttribute('preserveAspectRatio', this.getBeadImagePreserveAspectRatio(bead));
        image.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        image.dataset.beadId = bead.instanceId;
        
        beadGroup.appendChild(image);
        imagesLayer.appendChild(beadGroup);
        
        // === 高光层 ===
        const highlight = document.createElementNS(this.svgNS, 'ellipse');
        highlight.setAttribute('cx', x + halfLength * 0.3); // 右上角，横向基于切线方向长度
        highlight.setAttribute('cy', y - halfWidth * 0.3); // 纵向基于径向宽度
        highlight.setAttribute('rx', halfWidth * 0.18); // 高光大小基于可见宽度
        highlight.setAttribute('ry', halfWidth * 0.14);
        highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.92)');
        highlight.setAttribute('filter', 'url(#highlight-blur)');
        highlight.style.pointerEvents = 'none';
        highlight.dataset.beadId = bead.instanceId;
        highlight.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        
        highlightsLayer.appendChild(highlight);
        
        // === 删除按钮（在高光层） ===
        const deleteGroup = document.createElementNS(this.svgNS, 'g');
        deleteGroup.classList.add('delete-btn-group');
        deleteGroup.style.opacity = '0';
        deleteGroup.style.transition = 'opacity 0.2s';
        deleteGroup.style.pointerEvents = 'none';
        deleteGroup.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        deleteGroup.dataset.beadId = bead.instanceId;
        if (layoutEntry?.isScattered) {
            deleteGroup.style.display = 'none';
        }
        
        const deleteBtn = document.createElementNS(this.svgNS, 'circle');
        deleteBtn.setAttribute('cx', x + beadRadius * 0.6);
        deleteBtn.setAttribute('cy', y - beadRadius * 0.6);
        deleteBtn.setAttribute('r', 8);
        deleteBtn.setAttribute('fill', '#ff4444');
        deleteBtn.setAttribute('stroke', 'white');
        deleteBtn.setAttribute('stroke-width', '2');
        deleteBtn.style.cursor = 'pointer';
        
        const deleteX = document.createElementNS(this.svgNS, 'text');
        deleteX.setAttribute('x', x + beadRadius * 0.6);
        deleteX.setAttribute('y', y - beadRadius * 0.6 + 1);
        deleteX.setAttribute('text-anchor', 'middle');
        deleteX.setAttribute('dominant-baseline', 'middle');
        deleteX.setAttribute('fill', 'white');
        deleteX.setAttribute('font-size', '10');
        deleteX.setAttribute('font-weight', 'bold');
        deleteX.textContent = '×';
        deleteX.style.pointerEvents = 'none';
        
        deleteGroup.appendChild(deleteBtn);
        deleteGroup.appendChild(deleteX);
        highlightsLayer.appendChild(deleteGroup);
        
        // 从旧布局位置平滑过渡到新位置（位置+旋转同时进行，时长与新珠子一致）
        if (prevLayoutEntry && !bead._entering) {
            if (prevLayoutEntry.scatterPour) {
                this.animateScatterDrop({
                    outerShadowGroup,
                    shadowGroup,
                    beadGroup,
                    highlight,
                    outerShadow,
                    shadow,
                    image
                }, prevLayoutEntry, layoutEntry, rotation);
            } else {
                const dx = prevLayoutEntry.baseX - x;
                const dy = prevLayoutEntry.baseY - y;
                const duration = prevLayoutEntry.isScattered ? 480 : 310;
                const previousRotation = typeof prevLayoutEntry.rotationDeg === 'number'
                    ? prevLayoutEntry.rotationDeg
                    : (prevLayoutEntry.centerAngle * 180 / Math.PI) + 90;
                const rotationDiff = Math.abs(previousRotation - rotation);
                const needsMove = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
                const needsRotate = rotationDiff > 0.5;

                // 没有显著位移/旋转就不再隐藏高光，避免闪烁
                if (needsMove || needsRotate) {
                    // 让高光在最终到位后再显示，避免瞬移
                    const restoreHighlight = () => {
                        highlight.style.opacity = '1';
                        highlight.style.pointerEvents = 'none';
                    };
                    highlight.style.opacity = '0';
                    highlight.style.pointerEvents = 'none';

                    // 初始使用旧角度，避免动画回拉
                    image.setAttribute('transform', `rotate(${previousRotation} ${x} ${y})`);
                    highlight.setAttribute('transform', `rotate(${previousRotation} ${x} ${y})`);
                    deleteGroup.setAttribute('transform', `rotate(${previousRotation} ${x} ${y})`);
                    outerShadow.setAttribute('transform', `rotate(${previousRotation} 0 0)`);
                    shadow.setAttribute('transform', `rotate(${previousRotation} 0 0)`);

                    if (needsMove) {
                        this.animateElementTranslate(outerShadowGroup, dx, dy, duration);
                        this.animateElementTranslate(shadowGroup, dx, dy, duration);
                        this.animateElementTranslate(beadGroup, dx, dy, duration);
                        this.animateElementTranslate(deleteGroup, dx, dy, duration);
                    }

                    if (needsRotate) {
                        this.animateElementRotation(outerShadow, previousRotation, rotation, 0, 0, duration);
                        this.animateElementRotation(shadow, previousRotation, rotation, 0, 0, duration);
                        this.animateElementRotation(image, previousRotation, rotation, x, y, duration);
                        this.animateElementRotation(deleteGroup, previousRotation, rotation, x, y, duration);
                        this.animateElementRotation(highlight, previousRotation, rotation, x, y, duration);
                    }

                    setTimeout(restoreHighlight, duration);
                }
            }
        }

        if (layoutEntry?.isScattered) {
            return;
        }

        // === 事件处理 ===
        let hoverTimeout = null;
        
        // 显示删除按钮
        const showDeleteBtn = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            deleteGroup.style.opacity = '1';
            deleteGroup.style.pointerEvents = 'auto';
        };
        
        // 隐藏删除按钮
        const hideDeleteBtn = () => {
            hoverTimeout = setTimeout(() => {
                deleteGroup.style.opacity = '0';
                deleteGroup.style.pointerEvents = 'none';
            }, 100);
        };
        
        // 珠子悬停
        beadGroup.addEventListener('mouseenter', showDeleteBtn);
        beadGroup.addEventListener('mouseleave', hideDeleteBtn);
        
        // 删除按钮组悬停（保持显示）
        deleteGroup.addEventListener('mouseenter', showDeleteBtn);
        deleteGroup.addEventListener('mouseleave', hideDeleteBtn);
        
        // 删除按钮点击
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            AppState.removeBead(bead.instanceId);
        });
    },
    
    // 珠子飞入动画
    animateBeadEntry(bead, onComplete) {
        if (this.threeMode) {
            if (onComplete) onComplete();
            return;
        }

        const svg = document.getElementById('bracelet-svg');
        
        const layoutEntry = this.currentLayout.find(entry => entry.instanceId === bead.instanceId);
        const mmToPx = this.currentMmToPx || (this.canvasSize * this.maxRadiusRatio) / ((this.maxCircumference / Math.PI) / 2);
        const beadScaleFactor = this.currentBeadScaleFactor || 1;
        let beadLengthPx, beadWidthPx, beadRadiusPx;
        if (layoutEntry) {
            beadLengthPx = layoutEntry.beadLengthPx;
            beadWidthPx = layoutEntry.beadWidthPx;
            beadRadiusPx = layoutEntry.beadRadiusPx;
        } else {
            const dims = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);
            beadLengthPx = dims.beadLengthPx;
            beadWidthPx = dims.beadWidthPx;
            beadRadiusPx = dims.beadRadiusPx;
        }

        let targetX;
        let targetY;

        if (layoutEntry) {
            const offsetX = layoutEntry.baseX - this.centerX;
            const offsetY = layoutEntry.baseY - this.centerY;
            const cosRot = Math.cos(this.globalRotation);
            const sinRot = Math.sin(this.globalRotation);
            targetX = this.centerX + offsetX * cosRot - offsetY * sinRot;
            targetY = this.centerY + offsetX * sinRot + offsetY * cosRot;
        } else {
            const radiusPx = this.currentRadiusPx || (this.canvasSize * this.maxRadiusRatio * 0.85);
            const rotatedAngle = -Math.PI / 2 + this.globalRotation;
            targetX = this.centerX + radiusPx * Math.cos(rotatedAngle);
            targetY = this.centerY + radiusPx * Math.sin(rotatedAngle);
        }
        
        // 起始位置：画布底部中央
        const startX = this.centerX;
        const startY = this.canvasSize + 50; // 画布外部
        
        // 创建临时珠子组
        const tempGroup = document.createElementNS(this.svgNS, 'g');
        tempGroup.setAttribute('class', 'bead-flying');
        
        const tempImage = document.createElementNS(this.svgNS, 'image');
        tempImage.setAttribute('href', this.getOptimizedImageUrl(bead.thumbnail));
        tempImage.setAttribute('x', startX - beadLengthPx / 2);
        tempImage.setAttribute('y', startY - beadWidthPx / 2);
        tempImage.setAttribute('width', beadLengthPx);
        tempImage.setAttribute('height', beadWidthPx);
        tempImage.setAttribute('preserveAspectRatio', this.getBeadImagePreserveAspectRatio(bead));
        
        tempGroup.appendChild(tempImage);
        svg.appendChild(tempGroup);
        
        // 执行动画（使用 Web Animations API）
        const flyInAnimation = tempImage.animate([
            {
                x: `${startX - beadLengthPx / 2}`,
                y: `${startY - beadWidthPx / 2}`,
                opacity: 0
            },
            {
                x: `${targetX - beadLengthPx / 2}`,
                y: `${targetY - beadWidthPx / 2}`,
                opacity: 1
            }
        ], {
            duration: 620,
            easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            fill: 'forwards'
        });

        const finalize = () => {
            tempGroup.remove();
            if (onComplete) onComplete();
        };

        flyInAnimation.onfinish = finalize;
        flyInAnimation.oncancel = finalize;
    },

    animateBeadFlyOut(dragState, bead, onComplete) {
        const svg = document.getElementById('bracelet-svg');
        if (!svg || !dragState || !bead) {
            if (onComplete) onComplete();
            return;
        }

        const layoutEntry = this.currentLayout.find(entry => entry.instanceId === bead.instanceId);
        const mmToPx = this.currentMmToPx || (this.canvasSize * this.maxRadiusRatio) / ((this.maxCircumference / Math.PI) / 2);
        const beadScaleFactor = this.currentBeadScaleFactor || 1;

        let beadLengthPx = dragState.beadLengthPx;
        let beadWidthPx = dragState.beadWidthPx;
        let beadRadiusPx = dragState.beadRadiusPx;

        if (layoutEntry) {
            beadLengthPx = beadLengthPx || layoutEntry.beadLengthPx;
            beadWidthPx = beadWidthPx || layoutEntry.beadWidthPx;
            beadRadiusPx = beadRadiusPx || layoutEntry.beadRadiusPx;
        }

        if (!beadLengthPx || !beadWidthPx || !beadRadiusPx) {
            const dims = this.getBeadDimensionsPx(bead, beadScaleFactor, mmToPx);
            beadLengthPx = beadLengthPx || dims.beadLengthPx;
            beadWidthPx = beadWidthPx || dims.beadWidthPx;
            beadRadiusPx = beadRadiusPx || dims.beadRadiusPx;
        }

        if (!beadRadiusPx) {
            beadRadiusPx = 24;
        }

        const baseStartX = dragState.elementX ?? layoutEntry?.baseX ?? this.centerX;
        const baseStartY = dragState.elementY ?? layoutEntry?.baseY ?? this.centerY;

        const cosRot = Math.cos(this.globalRotation);
        const sinRot = Math.sin(this.globalRotation);
        const offsetX = baseStartX - this.centerX;
        const offsetY = baseStartY - this.centerY;
        const screenStartX = this.centerX + offsetX * cosRot - offsetY * sinRot;
        const screenStartY = this.centerY + offsetX * sinRot + offsetY * cosRot;

        let dirX = screenStartX - this.centerX;
        let dirY = screenStartY - this.centerY;
        let dist = Math.sqrt(dirX * dirX + dirY * dirY);
        if (dist < 1) {
            const angle = (dragState && typeof dragState.mouseAngle === 'number') ? dragState.mouseAngle : (Math.atan2(offsetY, offsetX) + this.globalRotation);
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
            dist = 1;
        }
        const travelDistance = Math.max(beadRadiusPx * 5, 180);
        const endX = screenStartX + (dirX / dist) * travelDistance;
        const endY = screenStartY + (dirY / dist) * travelDistance;

        const rotationDeg = Math.atan2(dirY, dirX) * 180 / Math.PI + 90;

        const tempGroup = document.createElementNS(this.svgNS, 'g');
        tempGroup.setAttribute('class', 'bead-removal');
        tempGroup.setAttribute('transform', `translate(${screenStartX} ${screenStartY})`);
        tempGroup.style.pointerEvents = 'none';

        const innerGroup = document.createElementNS(this.svgNS, 'g');
        innerGroup.setAttribute('transform', `rotate(${rotationDeg})`);

        const outerShadow = document.createElementNS(this.svgNS, 'ellipse');
        outerShadow.setAttribute('cx', -beadRadiusPx * 0.3);
        outerShadow.setAttribute('cy', beadRadiusPx * 0.3);
        outerShadow.setAttribute('rx', (beadLengthPx / 2) * 0.9);
        outerShadow.setAttribute('ry', (beadWidthPx / 2) * 0.9);
        outerShadow.setAttribute('fill', 'rgba(0, 0, 0, 0.28)');
        outerShadow.setAttribute('filter', 'url(#outer-shadow-blur)');
        outerShadow.style.pointerEvents = 'none';

        const innerShadow = document.createElementNS(this.svgNS, 'ellipse');
        innerShadow.setAttribute('cx', -beadRadiusPx * 0.25);
        innerShadow.setAttribute('cy', beadRadiusPx * 0.25);
        innerShadow.setAttribute('rx', (beadLengthPx / 2) * 0.7);
        innerShadow.setAttribute('ry', (beadWidthPx / 2) * 0.7);
        innerShadow.setAttribute('fill', 'rgba(0, 0, 0, 0.33)');
        innerShadow.setAttribute('filter', 'url(#shadow-blur)');
        innerShadow.style.pointerEvents = 'none';

        const tempImage = document.createElementNS(this.svgNS, 'image');
        tempImage.setAttribute('href', this.getOptimizedImageUrl(bead.thumbnail));
        tempImage.setAttribute('x', -beadLengthPx / 2);
        tempImage.setAttribute('y', -beadWidthPx / 2);
        tempImage.setAttribute('width', beadLengthPx);
        tempImage.setAttribute('height', beadWidthPx);
        tempImage.setAttribute('preserveAspectRatio', this.getBeadImagePreserveAspectRatio(bead));

        const highlight = document.createElementNS(this.svgNS, 'ellipse');
        highlight.setAttribute('cx', (beadLengthPx / 2) * 0.3);
        highlight.setAttribute('cy', -(beadWidthPx / 2) * 0.3);
        highlight.setAttribute('rx', (beadWidthPx / 2) * 0.18);
        highlight.setAttribute('ry', (beadWidthPx / 2) * 0.14);
        highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.92)');
        highlight.setAttribute('filter', 'url(#highlight-blur)');
        highlight.style.pointerEvents = 'none';

        innerGroup.appendChild(outerShadow);
        innerGroup.appendChild(innerShadow);
        innerGroup.appendChild(tempImage);
        innerGroup.appendChild(highlight);
        tempGroup.appendChild(innerGroup);
        svg.appendChild(tempGroup);

        const duration = 320;

        const translateAnim = document.createElementNS(this.svgNS, 'animateTransform');
        translateAnim.setAttribute('attributeName', 'transform');
        translateAnim.setAttribute('type', 'translate');
        translateAnim.setAttribute('from', `${screenStartX} ${screenStartY}`);
        translateAnim.setAttribute('to', `${endX} ${endY}`);
        translateAnim.setAttribute('dur', `${duration}ms`);
        translateAnim.setAttribute('fill', 'freeze');
        tempGroup.appendChild(translateAnim);

        const opacityAnim = document.createElementNS(this.svgNS, 'animate');
        opacityAnim.setAttribute('attributeName', 'opacity');
        opacityAnim.setAttribute('values', '1;1;0');
        opacityAnim.setAttribute('keyTimes', '0;0.6;1');
        opacityAnim.setAttribute('dur', `${duration}ms`);
        opacityAnim.setAttribute('fill', 'freeze');
        tempGroup.appendChild(opacityAnim);

        try {
            translateAnim.beginElement();
            opacityAnim.beginElement();
        } catch (e) {
            // 某些浏览器可能在刚插入时触发异常，忽略即可
        }

        setTimeout(() => {
            tempGroup.remove();
            if (onComplete) onComplete();
        }, duration + 20);
    },
    
    // 设置拖拽监听
    setupDragListeners() {
        const svg = document.getElementById('bracelet-svg');
        if (!svg) return;
        
        let dragMode = null;
        let isDraggingBead = false;
        let draggedElement = null;
        let draggedBeadElements = null;

        const beginBeadDrag = (beadGroup, pointerX, pointerY) => {
            dragMode = 'bead';
            isDraggingBead = true;
            draggedElement = beadGroup;

            const originalIndex = parseInt(beadGroup.dataset.index, 10);
            const draggedBeadId = Number(beadGroup.dataset.instanceId);
            const imageEl = beadGroup.querySelector('image');
            const beadLengthPx = imageEl ? parseFloat(imageEl.getAttribute('width')) : 0;
            const beadWidthPx = imageEl ? parseFloat(imageEl.getAttribute('height')) : 0;
            const beadRadiusPx = Math.max(beadLengthPx, beadWidthPx) / 2;

            draggedBeadElements = {
                shadows: Array.from(document.querySelectorAll(`#shadows-layer [data-bead-id="${draggedBeadId}"]`)),
                image: beadGroup,
                highlight: document.querySelector(`#highlights-layer ellipse[data-bead-id="${draggedBeadId}"]`),
                deleteGroup: document.querySelector(`#highlights-layer .delete-btn-group[data-bead-id="${draggedBeadId}"]`)
            };

            if (draggedBeadElements.deleteGroup) {
                draggedBeadElements.deleteGroup.style.opacity = '0';
                draggedBeadElements.deleteGroup.style.pointerEvents = 'none';
            }

            this.disableTransitionsForDrag(draggedBeadElements);

            const imagesLayer = document.getElementById('images-layer');
            if (imagesLayer && beadGroup.parentNode === imagesLayer) {
                imagesLayer.appendChild(beadGroup);
            }
            if (draggedBeadElements.highlight && draggedBeadElements.highlight.parentNode) {
                draggedBeadElements.highlight.parentNode.appendChild(draggedBeadElements.highlight);
            }
            if (draggedBeadElements.deleteGroup && draggedBeadElements.deleteGroup.parentNode) {
                draggedBeadElements.deleteGroup.parentNode.appendChild(draggedBeadElements.deleteGroup);
            }

            const layoutEntry = this.currentLayout.find(entry => entry.instanceId === draggedBeadId);
            const baseX = layoutEntry ? layoutEntry.baseX : this.centerX;
            const baseY = layoutEntry ? layoutEntry.baseY : this.centerY;

            // FIX: 将鼠标位置转换到 Base 坐标系（逆向旋转）
            const mouseDx = pointerX - this.centerX;
            const mouseDy = pointerY - this.centerY;
            const invRotation = -this.globalRotation;
            const cosInv = Math.cos(invRotation);
            const sinInv = Math.sin(invRotation);
            const mouseBaseX = this.centerX + mouseDx * cosInv - mouseDy * sinInv;
            const mouseBaseY = this.centerY + mouseDx * sinInv + mouseDy * cosInv;

            // FIX: 在 Base 坐标系计算偏移量（而不是 Screen 坐标系）
            const offsetX = mouseBaseX - baseX;
            const offsetY = mouseBaseY - baseY;

            const dx = pointerX - this.centerX;
            const dy = pointerY - this.centerY;
            const mouseAngle = Math.atan2(dy, dx);
            const mouseDistance = Math.sqrt(dx * dx + dy * dy);

            beadGroup.classList.add('dragging');
            beadGroup.style.cursor = 'grabbing';

            this.dragState = {
                originalIndex,
                instanceId: draggedBeadId,
                beadRadiusPx,
                beadLengthPx,
                beadWidthPx,
                pointerX,
                pointerY,
                mouseAngle,
                mouseDistance,
                adjustedAngle: mouseAngle - this.globalRotation,
                elementX: baseX,
                elementY: baseY,
                offsetX,  // 保存偏移量
                offsetY,  // 保存偏移量
                dropZone: 'ring',
                targetIndex: originalIndex
            };
        };

        const beginRotateDrag = (pointerX, pointerY) => {
            const dx = pointerX - this.centerX;
            const dy = pointerY - this.centerY;
            dragMode = 'rotate';
            this.isRotating = true;
            this.rotationStartAngle = Math.atan2(dy, dx) - this.globalRotation;
            svg.style.cursor = 'grabbing';
        };

        const updateDraggedElementsPosition = (finalX, finalY, beadLengthPx, beadWidthPx, beadRadiusPx) => {
            if (!draggedBeadElements) return;

            const imageEl = draggedBeadElements.image ? draggedBeadElements.image.querySelector('image') : null;
            if (imageEl) {
                imageEl.setAttribute('x', finalX - beadLengthPx / 2);
                imageEl.setAttribute('y', finalY - beadWidthPx / 2);
                imageEl.setAttribute('transform', `rotate(0 ${finalX} ${finalY})`);
            }

            if (draggedBeadElements.shadows) {
                draggedBeadElements.shadows.forEach((shadow, idx) => {
                    if (!shadow) return;
                    const offsetFactor = idx === 0 ? 0.3 : 0.25;
                    const shadowCx = finalX - beadRadiusPx * offsetFactor;
                    const shadowCy = finalY + beadRadiusPx * offsetFactor;
                    const tagName = shadow.tagName ? shadow.tagName.toLowerCase() : '';

                    if (tagName === 'g') {
                        shadow.setAttribute('transform', `translate(${shadowCx} ${shadowCy})`);
                        const ellipse = shadow.querySelector('ellipse');
                        if (ellipse) ellipse.setAttribute('transform', 'rotate(0 0 0)');
                    } else {
                        shadow.setAttribute('cx', shadowCx);
                        shadow.setAttribute('cy', shadowCy);
                        if (tagName === 'ellipse') {
                            shadow.setAttribute('transform', `rotate(0 ${shadowCx} ${shadowCy})`);
                        }
                    }
                });
            }

            if (draggedBeadElements.highlight) {
                draggedBeadElements.highlight.setAttribute('cx', finalX + (beadLengthPx / 2) * 0.3);
                draggedBeadElements.highlight.setAttribute('cy', finalY - (beadWidthPx / 2) * 0.3);
                draggedBeadElements.highlight.setAttribute('transform', `rotate(0 ${finalX} ${finalY})`);
            }

            if (draggedBeadElements.deleteGroup) {
                draggedBeadElements.deleteGroup.setAttribute('transform', `rotate(0 ${finalX} ${finalY})`);
                const deleteCircle = draggedBeadElements.deleteGroup.querySelector('circle');
                const deleteText = draggedBeadElements.deleteGroup.querySelector('text');
                if (deleteCircle) {
                    deleteCircle.setAttribute('cx', finalX + beadRadiusPx * 0.6);
                    deleteCircle.setAttribute('cy', finalY - beadRadiusPx * 0.6);
                }
                if (deleteText) {
                    deleteText.setAttribute('x', finalX + beadRadiusPx * 0.6);
                    deleteText.setAttribute('y', finalY - beadRadiusPx * 0.6 + 1);
                }
            }
        };

        const updateDragState = (mouseX, mouseY, mouseAngle, mouseDistance, finalX, finalY) => {
            if (!this.dragState) return;

            this.dragState.pointerX = mouseX;
            this.dragState.pointerY = mouseY;
            this.dragState.mouseAngle = mouseAngle;
            this.dragState.mouseDistance = mouseDistance;
            const adjustedAngle = mouseAngle - this.globalRotation;
            this.dragState.adjustedAngle = adjustedAngle;
            this.dragState.elementX = finalX;
            this.dragState.elementY = finalY;

            // 计算珠子中心到圆心的距离（而不是鼠标到圆心的距离）
            const offsetX = this.dragState.offsetX || 0;
            const offsetY = this.dragState.offsetY || 0;
            const beadCenterX = mouseX - offsetX;
            const beadCenterY = mouseY - offsetY;
            const beadDx = beadCenterX - this.centerX;
            const beadDy = beadCenterY - this.centerY;
            const beadCenterDistance = Math.sqrt(beadDx * beadDx + beadDy * beadDy);

            const beadRadiusPx = this.dragState.beadRadiusPx || 0;
            const dropZone = this.determineDropZone(beadCenterDistance, beadRadiusPx);
            this.dragState.dropZone = dropZone;

            if (dropZone === 'ring') {
                this.dragState.targetIndex = this.getTargetIndexForAngle(adjustedAngle, this.dragState.instanceId);
            } else {
                this.dragState.targetIndex = null;
            }
        };

        const processPointerMove = (mouseX, mouseY) => {
            if (!dragMode) return;

            const dx = mouseX - this.centerX;
            const dy = mouseY - this.centerY;
            const mouseAngle = Math.atan2(dy, dx);
            const mouseDistance = Math.sqrt(dx * dx + dy * dy);

            if (dragMode === 'bead' && isDraggingBead && draggedElement && draggedBeadElements) {
                if (this.dragState && (!this.dragState.beadRadiusPx || !this.dragState.beadLengthPx || !this.dragState.beadWidthPx)) {
                    const img = draggedElement.querySelector('image');
                    if (img) {
                        const lengthPx = parseFloat(img.getAttribute('width')) || 0;
                        const widthPx = parseFloat(img.getAttribute('height')) || 0;
                        this.dragState.beadLengthPx = lengthPx;
                        this.dragState.beadWidthPx = widthPx;
                        this.dragState.beadRadiusPx = Math.max(lengthPx, widthPx) / 2;
                    }
                }

                const beadRadiusPx = this.dragState?.beadRadiusPx || 0;
                const beadLengthPx = this.dragState?.beadLengthPx || beadRadiusPx * 2;
                const beadWidthPx = this.dragState?.beadWidthPx || beadRadiusPx * 2;
                const offsetX = this.dragState?.offsetX || 0;
                const offsetY = this.dragState?.offsetY || 0;

                // FIX: 将鼠标位置转换到 Base 坐标系（逆向旋转）
                const mouseDx = mouseX - this.centerX;
                const mouseDy = mouseY - this.centerY;
                const invRotation = -this.globalRotation;
                const cosInv = Math.cos(invRotation);
                const sinInv = Math.sin(invRotation);
                const mouseBaseX = this.centerX + mouseDx * cosInv - mouseDy * sinInv;
                const mouseBaseY = this.centerY + mouseDx * sinInv + mouseDy * cosInv;

                // FIX: 在 Base 坐标系减去偏移量，直接得到正确的 Base 坐标
                const finalX = mouseBaseX - offsetX;
                const finalY = mouseBaseY - offsetY;

                updateDraggedElementsPosition(finalX, finalY, beadLengthPx, beadWidthPx, beadRadiusPx);
                updateDragState(mouseX, mouseY, mouseAngle, mouseDistance, finalX, finalY);

                if (this.dragState && this.dragState.dropZone === 'outer') {
                    draggedElement.classList.add('bead-delete-hint');
                } else if (draggedElement) {
                    draggedElement.classList.remove('bead-delete-hint');
                }
            } else if (dragMode === 'rotate' && this.isRotating) {
                const newRotation = mouseAngle - this.rotationStartAngle;
                this.globalRotation = newRotation;

                const rotationDeg = this.globalRotation * 180 / Math.PI;
                const rotationTransform = `rotate(${rotationDeg} ${this.centerX} ${this.centerY})`;

                const shadowsLayer = document.getElementById('shadows-layer');
                const imagesLayer = document.getElementById('images-layer');
                const highlightsLayer = document.getElementById('highlights-layer');

                if (shadowsLayer) shadowsLayer.setAttribute('transform', rotationTransform);
                if (imagesLayer) imagesLayer.setAttribute('transform', rotationTransform);
                if (highlightsLayer) highlightsLayer.setAttribute('transform', rotationTransform);
            }
        };

        const endDrag = (event) => {
            if (!dragMode) return;

            // FIX: 统一使用 getSVGPoint 处理最后位置
            if (event) {
                const point = this.getSVGPoint(event);
                if (point) {
                    processPointerMove(point.x, point.y);
                }
            }

            if (dragMode === 'bead' && isDraggingBead && this.dragState) {
                this.restoreTransitionsAfterDrag(draggedBeadElements);

                const { dropZone, instanceId, originalIndex, targetIndex } = this.dragState;

                if (dropZone === 'outer' && instanceId) {
                    const bead = AppState.selectedBeads[originalIndex];
                    if (draggedBeadElements) {
                        this.hideDraggedBeadElements(draggedBeadElements);
                    }
                    // Start fly-out immediately, then remove bead from state right away so
                    // remaining beads reflow/shift at the same time.
                    this.animateBeadFlyOut(this.dragState, bead);
                    AppState.removeBead(instanceId);
                } else if (dropZone === 'ring' && targetIndex != null) {
                    let insertIndex = targetIndex;
                    if (insertIndex > originalIndex) {
                        insertIndex -= 1;
                    }
                    if (insertIndex < 0) insertIndex = 0;

                    const dropAngle = this.dragState.mouseAngle;
                    if (typeof this.dragState.elementX === 'number' && typeof this.dragState.elementY === 'number') {
                        const offsetX = this.dragState.elementX - this.centerX;
                        const offsetY = this.dragState.elementY - this.centerY;
                        const cosRot = Math.cos(this.globalRotation);
                        const sinRot = Math.sin(this.globalRotation);
                        const rootX = this.centerX + offsetX * cosRot - offsetY * sinRot;
                        const rootY = this.centerY + offsetX * sinRot + offsetY * cosRot;
                        this.pendingDragLayoutOverride = {
                            instanceId,
                            rootX,
                            rootY,
                            rotationDeg: 0
                        };
                    }
                    this.pendingAngleLock = {
                        instanceId,
                        dropAngle
                    };

                    const targetEntry = this.currentLayout.find(entry => entry.instanceId !== instanceId && entry.index === targetIndex);
                    const performReorder = () => {
                        AppState.reorderBeads(originalIndex, insertIndex);
                    };

                    // 直接重排，关闭首段换位动画，保留重渲染后的过渡
                    performReorder();
                } else {
                    this.animateBeadReturn(this.dragState, draggedBeadElements, () => {
                        this.render();
                    });
                }
            }

            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement.classList.remove('bead-delete-hint');
                draggedElement.style.cursor = 'grab';
            }

            dragMode = null;
            isDraggingBead = false;
            draggedElement = null;
            draggedBeadElements = null;
            this.dragState = null;
            this.isRotating = false;
            svg.style.cursor = '';
        };

        svg.addEventListener('mousedown', (e) => {
            if (this.scatterMode) return;
            const beadGroup = e.target.closest('.bead');
            const isDeleteButton = e.target.closest('.delete-btn-group');
            if (isDeleteButton) return;

            // FIX: 使用 getSVGPoint 进行精确坐标转换
            const point = this.getSVGPoint(e);
            if (!point) return;

            if (beadGroup) {
                beginBeadDrag(beadGroup, point.x, point.y);
            } else if (AppState.selectedBeads.length > 0) {
                beginRotateDrag(point.x, point.y);
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (!dragMode || this.scatterMode) return;
            // FIX: 使用 getSVGPoint 进行精确坐标转换
            const point = this.getSVGPoint(e);
            if (!point) return;
            processPointerMove(point.x, point.y);
        });

        svg.addEventListener('mouseup', endDrag);
        svg.addEventListener('mouseleave', endDrag);

        svg.addEventListener('touchstart', (e) => {
            if (this.scatterMode) return;
            const beadGroup = e.target.closest('.bead');
            const isDeleteButton = e.target.closest('.delete-btn-group');
            if (isDeleteButton) return;

            // FIX: 使用 getSVGPoint 进行精确坐标转换
            const point = this.getSVGPoint(e);
            if (!point) return;

            if (beadGroup) {
                e.preventDefault();
                beginBeadDrag(beadGroup, point.x, point.y);
            } else if (AppState.selectedBeads.length > 0) {
                e.preventDefault();
                beginRotateDrag(point.x, point.y);
            }
        });

        svg.addEventListener('touchmove', (e) => {
            if (!dragMode || this.scatterMode) return;
            // FIX: 使用 getSVGPoint 进行精确坐标转换
            const point = this.getSVGPoint(e);
            if (!point) return;

            e.preventDefault();
            processPointerMove(point.x, point.y);
        });

        svg.addEventListener('touchend', (e) => {
            e.preventDefault();
            endDrag(e);
        });

        svg.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            endDrag(e);
        });
    }
};

// 暴露到全局对象，供 TypeScript 模块使用
window.BraceletRender = BraceletRender;
