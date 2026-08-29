import { cn } from '@/lib/utils';

type ModeItem = {
  title: string;
  desc: string;
  selected?: boolean;
  glyph: React.ReactNode;
};

const FolderIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const LayersGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="m12 2 9 5-9 5-9-5 9-5z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </svg>
);

const CodeGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
);

const TerminalGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="m4 17 6-5-6-5" />
    <path d="M12 19h8" />
  </svg>
);

const SparklesGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MODE_ITEMS: ModeItem[] = [
  {
    title: '标准模式',
    desc: '功能完整的编码 Agent，内置全部工具与技能。',
    glyph: <LayersGlyph />,
  },
  {
    title: 'PTC 模式',
    desc: '具备标准模式的全部能力，通过 Code Mode SDK 组合多轮调用。',
    glyph: <CodeGlyph />,
  },
  {
    title: '极简模式',
    desc: '仅提供持久 bash 与 str_replace_editor，用于基准测试与可复现实验。',
    glyph: <TerminalGlyph />,
  },
  {
    title: '创造模式',
    desc: '用于创建自定义 Agent preset，运行时检查并在内存中试验插件。',
    selected: true,
    glyph: <SparklesGlyph />,
  },
];

export function ModeDropdownMockup() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#0c0c0e] text-neutral-200">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 font-mono text-[13px] text-neutral-300">
          <FolderIcon />
          <span>dsh-demo</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[13px] text-neutral-100"
        >
          <span>创造模式</span>
          <ChevronDown />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="w-full max-w-sm">
          <p className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
            切换运行模式
          </p>
          <div className="mt-3 w-80 rounded-xl border border-white/10 bg-[#101013] p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
            {MODE_ITEMS.map((item) => (
              <div
                key={item.title}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5',
                  item.selected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.05]',
                )}
              >
                <span className="mt-0.5 text-neutral-400">{item.glyph}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[13px]',
                      item.selected
                        ? 'font-semibold text-neutral-100'
                        : 'font-medium text-neutral-200',
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">
                    {item.desc}
                  </p>
                </div>
                {item.selected && (
                  <span className="mt-0.5 text-sky-400">
                    <CheckIcon />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
