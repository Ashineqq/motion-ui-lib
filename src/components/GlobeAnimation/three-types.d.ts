import type { ThreeElements } from '@react-three/fiber';
import type * as THREE from 'three';

// R3F v8 的 ThreeElements 未内置 `line`（仅含 lineSegments / lineLoop），
// 而 JSX 全局命名空间里的 `line` 会被解析为 SVG 的 line 元素，导致 frustumCulled 等属性报错。
// 这里补充声明 `line` 对应 THREE.Line，使 <line> 正确指向 3D 线对象。
type LineProps = ThreeElements['lineSegments'] & {
  ref?: React.Ref<THREE.Line>;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      line: LineProps;
    }
  }
}
