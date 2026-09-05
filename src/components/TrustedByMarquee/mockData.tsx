import type { ReactNode } from "react";

import type { LogoMarqueeItem } from "./types";

/**
 * 一组与 fourmula.ai「Trusted By」风格一致的占位 wordmark logo（虚构品牌，无商标风险）。
 * 全部使用 `fill="currentColor"`，颜色继承容器 `currentColor`（默认 neutral-900/60）。
 * 接入真实业务时，把 `items` 换成自己的品牌 SVG 即可——任意用 currentColor 着色的节点都行。
 */

function Logo({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 190 32" className="h-full w-auto" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

const Northwind = () => (
  <Logo>
    <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="3" />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Northwind
    </text>
  </Logo>
);

const Lumina = () => (
  <Logo>
    <path
      d="M16 4 L28 28 L4 28 Z"
      fill="currentColor"
      transform="translate(0 0)"
    />
    <text
      x="40"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Lumina
    </text>
  </Logo>
);

const Vertex = () => (
  <Logo>
    <rect x="5" y="5" width="22" height="22" rx="5" fill="currentColor" />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Vertex
    </text>
  </Logo>
);

const Cobalt = () => (
  <Logo>
    <path
      d="M16 4 a12 12 0 1 0 0.001 0 Z M16 10 a6 6 0 1 1 0.001 0 Z"
      fillRule="evenodd"
      fill="currentColor"
    />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Cobalt
    </text>
  </Logo>
);

const Meridian = () => (
  <Logo>
    <path d="M5 22 Q16 2 27 22" stroke="currentColor" strokeWidth="3" fill="none" />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Meridian
    </text>
  </Logo>
);

const Aperture = () => (
  <Logo>
    <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="3" />
    <path
      d="M16 5 L16 16 L24 22"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Aperture
    </text>
  </Logo>
);

const Halcyon = () => (
  <Logo>
    <path d="M6 16 L16 6 L26 16 L16 26 Z" fill="currentColor" />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Halcyon
    </text>
  </Logo>
);

const Onyx = () => (
  <Logo>
    <path d="M16 4 L28 16 L16 28 L4 16 Z" stroke="currentColor" strokeWidth="3" fill="none" />
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Onyx
    </text>
  </Logo>
);

const Solstice = () => (
  <Logo>
    <circle cx="16" cy="16" r="6" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M16 2 V7" />
      <path d="M16 25 V30" />
      <path d="M2 16 H7" />
      <path d="M25 16 H30" />
    </g>
    <text
      x="38"
      y="22"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight={700}
      fill="currentColor"
    >
      Solstice
    </text>
  </Logo>
);

export const trustedByItems: LogoMarqueeItem[] = [
  { id: "northwind", logo: <Northwind />, alt: "Northwind" },
  { id: "lumina", logo: <Lumina />, alt: "Lumina" },
  { id: "vertex", logo: <Vertex />, alt: "Vertex" },
  { id: "cobalt", logo: <Cobalt />, alt: "Cobalt" },
  { id: "meridian", logo: <Meridian />, alt: "Meridian" },
  { id: "aperture", logo: <Aperture />, alt: "Aperture" },
  { id: "halcyon", logo: <Halcyon />, alt: "Halcyon" },
  { id: "onyx", logo: <Onyx />, alt: "Onyx" },
  { id: "solstice", logo: <Solstice />, alt: "Solstice" },
];
