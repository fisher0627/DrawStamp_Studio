import { ISecurityPattern } from '../DrawStampTypes'

export class DrawSecurityPatternUtils {
    constructor(private mmToPixel: number) {}

    drawSecurityPattern(
        ctx: CanvasRenderingContext2D,
        pattern: ISecurityPattern,
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        forceRefresh: boolean,
        borderWidth: number
    ) {
        if (radiusX <= 0 || radiusY <= 0 || borderWidth <= 0) return
        const count = Math.max(1, Math.min(100, Math.round(pattern.securityPatternCount)))
        // 只在主动刷新或迁移旧格式时重排，改变数量保留已手调的断口。
        if (forceRefresh || pattern.securityPatternVersion !== 2 || !pattern.securityPatternParams) {
            pattern.securityPatternParams = []
            pattern.securityPatternVersion = 2
        }
        const params = pattern.securityPatternParams
        if (params.length > count) params.splice(count)
        const turn = Math.PI * 2
        const normalize = (angle: number) => (angle % turn + turn) % turn
        while (params.length < count) {
            const distance = (angle: number) => params.reduce((min, item) => {
                const delta = Math.abs(normalize(item.angle) - angle)
                return Math.min(min, delta, turn - delta)
            }, turn)
            let angle = 0
            let bestDistance = -1
            // 全圆随机采样，仅排除过近的位置，不再每个等分区固定放一处。
            for (let attempt = 0; attempt < 100; attempt++) {
                const candidate = Math.random() * turn
                const gap = distance(candidate)
                if (gap > bestDistance) {
                    angle = candidate
                    bestDistance = gap
                }
                if (gap >= turn / count * 0.22) {
                    angle = candidate
                    break
                }
            }
            params.push({ angle, lineAngle: Math.random() - 0.5, seed: Math.floor(Math.random() * 0xffffffff) })
        }
        const roughness = Math.max(0, Math.min(1, pattern.securityPatternRoughness ?? 0.25))
        const angleRange = Math.max(0, Math.min(60, pattern.securityPatternAngleRange)) * Math.PI / 180
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = '#000'
        // 限制在外圈附近，避免断口损伤靠近圈线的文字和内部图案。
        const half = borderWidth / 2 + 0.03 * this.mmToPixel
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX + half, radiusY + half, 0, 0, Math.PI * 2)
        if (radiusX > half && radiusY > half) {
            ctx.ellipse(centerX, centerY, radiusX - half, radiusY - half, 0, 0, Math.PI * 2, true)
        }
        ctx.clip('evenodd')
        for (const { angle, lineAngle, seed } of pattern.securityPatternParams) {
            let state = seed ?? 1
            const random = () => {
                state = (Math.imul(state, 1664525) + 1013904223) >>> 0
                return state / 0x100000000
            }
            // 椭圆隐式方程的梯度才是法线；圆形时自然退化为径向。
            const normal = Math.atan2(Math.sin(angle) / radiusY, Math.cos(angle) / radiusX)
            const tilt = lineAngle * angleRange
            const direction = normal + tilt
            const length = (borderWidth + 0.16 * this.mmToPixel) / Math.cos(tilt)
            const width = Math.max(0.01, pattern.securityPatternWidth) * this.mmToPixel * (0.8 + random() * 0.4)
            const taper = (random() - 0.5) * 0.3
            const x = centerX + radiusX * Math.cos(angle)
            const y = centerY + radiusY * Math.sin(angle)
            const points: Array<[number, number]> = []
            for (const side of [-1, 1]) {
                for (let i = 0; i <= 8; i++) {
                    const t = (side === -1 ? i : 8 - i) / 8
                    const along = (t - 0.5) * length
                    const across = side * width / 2 * (1 + taper * (t - 0.5) + (random() - 0.5) * roughness * 0.6)
                    points.push([x + along * Math.cos(direction) - across * Math.sin(direction),
                        y + along * Math.sin(direction) + across * Math.cos(direction)])
                }
            }
            ctx.beginPath()
            points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py))
            ctx.closePath()
            ctx.fill()
        }
        ctx.restore()
    }
}
