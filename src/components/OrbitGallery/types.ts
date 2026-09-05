import type { ReactNode } from "react";

/** 单张环绕图片的数据 */
export interface OrbitItem {
  /** 图片地址（必填） */
  src: string;
  /** 替代文本 / 无障碍描述 */
  alt?: string;
  /** 可选：覆盖单张图片的 className 钩子 */
  className?: string;
}

export type OrbitGalleryDirection = "clockwise" | "counterclockwise";

/** 在系统要求「减少动态效果」时的降级行为 */
export type ReduceMotionMode = "pause" | "static";

export interface OrbitGalleryProps {
  /** 环绕圆心的图片集合；数量任意，会按 360/n 均匀分布（参考站点为 8 张） */
  items: OrbitItem[];
  /** 圆心元素（任意 ReactNode）；缺省渲染一个上传占位方块（呼应原站点） */
  center?: ReactNode;
  /** 整体尺寸（直径，px），默认 680 */
  size?: number;
  /** 轨道半径（px），即图片中心到圆心的距离；缺省按 size * 0.33 计算 */
  radius?: number;
  /** 单张图片卡片尺寸（px），默认 { width: 104, height: 128 } */
  itemSize?: { width: number; height: number };
  /** 单张圆角（px），默认 16 */
  itemRadius?: number;
  /** 每圈旋转时长（秒），默认 32（与原站点一致） */
  speed?: number;
  /** 旋转方向，默认 clockwise（顺时针） */
  direction?: OrbitGalleryDirection;
  /** 起始角度（deg），默认 -90（首图在正上方） */
  startAngle?: number;
  /** 自定义每槽渲染；不传则用 items 渲染 <img> */
  renderItem?: (item: OrbitItem, index: number) => ReactNode;
  /** 透传到根容器的类名 */
  className?: string;
  /** 是否旋转；为 false 时静态展示（仍按角度分布），默认 true */
  spin?: boolean;
  /** 鼠标悬停时暂停旋转，便于看清某张图，默认 false */
  pauseOnHover?: boolean;
  /** 系统要求减少动态时的降级行为，默认 static（静态分布、不旋转） */
  reduceMotion?: ReduceMotionMode;
}
