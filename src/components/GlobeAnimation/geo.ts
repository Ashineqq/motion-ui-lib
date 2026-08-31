import type { LngLat } from './worldData';

const DEG2RAD = Math.PI / 180;

/** 经纬度(度) → three.js 坐标 [x,y,z]（radius=1 的单位球；y 向上、lng=0 朝 +Z、x 向右） */
export function latLngToVec3(
  latitude: number,
  longitude: number,
  radius = 1,
): [number, number, number] {
  const lat = latitude * DEG2RAD;
  const lng = longitude * DEG2RAD;
  const x = radius * Math.cos(lat) * Math.sin(lng);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lng);
  return [x, y, z];
}

/** 旋转角 rotationY（度，正值=地球右旋）下，点相对摄像机的可见度 0..1 */
export function visibilityFactor(
  latitude: number,
  longitude: number,
  rotationY: number,
  fadeBand = 0.25,
): number {
  const worldAzimuth = longitude + rotationY; // 世界方位角（度）
  const az = worldAzimuth * DEG2RAD;
  const u = Math.cos(latitude * DEG2RAD) * Math.cos(az);
  if (u > fadeBand) return 1;
  if (u < -fadeBand) return 0;
  return (u + fadeBand) / (2 * fadeBand); // 中间线性插值
}

/** 起点→终点的空间弧线（沿球面大圆 slerp + 正弦径向抬升），返回 segments+1 个 [x,y,z] 点。
 *  保证弧线全程不低于球面（最低恰为 radius），最高点在 t=0.5 处，高度为 radius·(1+bulge)。 */
export function arcPoints(
  from: LngLat,
  to: LngLat,
  radius: number,
  segments = 48,
  bulge = 0.35,
): [number, number, number][] {
  const n = Math.max(2, Math.floor(segments));
  const A = latLngToVec3(from[1], from[0], radius);
  const B = latLngToVec3(to[1], to[0], radius);

  // 大圆旋转轴 k = normalize(A × B)
  let kx = A[1] * B[2] - A[2] * B[1];
  let ky = A[2] * B[0] - A[0] * B[2];
  let kz = A[0] * B[1] - A[1] * B[0];
  let kLen = Math.hypot(kx, ky, kz);
  if (kLen < 1e-9) {
    // A、B 重合或对径导致叉积为零：任取一个与 A 垂直的轴兜底
    const ref: [number, number, number] = Math.abs(A[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    kx = A[1] * ref[2] - A[2] * ref[1];
    ky = A[2] * ref[0] - A[0] * ref[2];
    kz = A[0] * ref[1] - A[1] * ref[0];
    kLen = Math.hypot(kx, ky, kz);
  }
  kx /= kLen;
  ky /= kLen;
  kz /= kLen;

  // A、B 夹角（slerp 角），钳制浮点误差
  const dot = Math.min(
    Math.max((A[0] * B[0] + A[1] * B[1] + A[2] * B[2]) / (radius * radius), -1),
    1,
  );
  const angle = Math.acos(dot);

  const out: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = t * angle;
    // Rodrigues 旋转：把 A 绕轴 k 转 th 弧度，落到大圆路径上
    const cosT = Math.cos(th);
    const sinT = Math.sin(th);
    const kv = kx * A[0] + ky * A[1] + kz * A[2];
    const cx = ky * A[2] - kz * A[1];
    const cy = kz * A[0] - kx * A[2];
    const cz = kx * A[1] - ky * A[0];
    // 正弦径向抬升：两端贴地、中点最高
    const lift = 1 + bulge * Math.sin(Math.PI * t);
    out.push([
      (A[0] * cosT + cx * sinT + kx * kv * (1 - cosT)) * lift,
      (A[1] * cosT + cy * sinT + ky * kv * (1 - cosT)) * lift,
      (A[2] * cosT + cz * sinT + kz * kv * (1 - cosT)) * lift,
    ]);
  }
  return out;
}
