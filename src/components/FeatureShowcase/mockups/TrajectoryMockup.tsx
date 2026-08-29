import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  SYSTEM: 'text-emerald-400',
  USER: 'text-sky-400',
  ASSISTANT: 'text-neutral-400',
  TOOL: 'text-amber-400',
};

type EventRow = {
  role: keyof typeof roleColors;
  summary: string;
  command?: string;
  expanded?: boolean;
};

const events: EventRow[] = [
  { role: 'SYSTEM', summary: '加载系统提示词与 Agent 预设' },
  { role: 'USER', summary: '实现插件市场搜索' },
  { role: 'ASSISTANT', summary: '规划实现步骤' },
  {
    role: 'TOOL',
    summary: '调用 bash — 执行 git clone ...',
    command: 'git clone https://github.com/example/plugin-market.git && pnpm i',
    expanded: true,
  },
  { role: 'TOOL', summary: '调用 fs — 读取 package.json' },
  { role: 'ASSISTANT', summary: '生成组件骨架' },
  { role: 'USER', summary: '调整配色与动画曲线' },
  {
    role: 'TOOL',
    summary: '调用 render — 预览构建产物',
    command: 'pnpm dev --filter web',
    expanded: true,
  },
];

export function TrajectoryMockup() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#0c0c0e] text-neutral-200">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-[13px] font-medium text-neutral-400 transition-colors"
          >
            对话
          </button>
          <button
            type="button"
            className="border-b-2 border-white px-0.5 pb-1 text-[13px] font-medium text-neutral-100"
          >
            轨迹
          </button>
        </div>
        <span className="text-[12px] text-neutral-500">会话 #a91f</span>
      </div>

      {/* Body split */}
      <div className="flex min-h-0 flex-1">
        {/* MAIN */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Time distribution strip */}
          <div className="px-3 pt-3">
            <div className="mb-1.5 flex items-end gap-1">
              <div className="h-3 rounded bg-[#a78bfa]" style={{ width: '18%' }} />
              <div className="h-3 rounded bg-[#fb923c]" style={{ width: '12%' }} />
              <div className="h-3 rounded bg-[#38bdf8]" style={{ width: '22%' }} />
              <div className="h-3 rounded bg-[#34d399]" style={{ width: '14%' }} />
              <div className="h-3 rounded bg-[#52525b]" style={{ width: '8%' }} />
              <div className="h-3 rounded bg-[#a78bfa]" style={{ width: '10%' }} />
              <div className="h-3 rounded bg-[#38bdf8]" style={{ width: '16%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>0s</span>
              <span>4s</span>
              <span>8s</span>
              <span>12s</span>
            </div>
          </div>

          {/* Event list */}
          <div className="mt-2 flex-1 overflow-y-auto px-2 pb-2">
            {events.map((ev, i) => {
              const selected =
                ev.role === 'TOOL' &&
                ev.command?.includes('git clone');
              return (
                <div
                  key={i}
                  className={cn(
                    'rounded px-2 py-1.5',
                    selected
                      ? 'border-l-2 border-amber-400 bg-white/[0.05]'
                      : 'border-l-2 border-transparent',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        roleColors[ev.role],
                      )}
                    >
                      {ev.role}
                    </span>
                    <span className="text-[13px] text-neutral-300">
                      {ev.summary}
                    </span>
                  </div>
                  {ev.expanded && ev.command && (
                    <div className="mt-1 pl-1 font-mono text-[12px] text-neutral-400">
                      {ev.command}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAIL sidebar */}
        <div className="w-64 shrink-0 border-l border-white/[0.07] p-3">
          <h3 className="mb-3 text-[13px] font-medium text-neutral-100">详情</h3>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Summary
              </div>
              <div className="text-[12px] text-neutral-300">
                调用 bash 克隆仓库并安装依赖
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Payload
              </div>
              <div className="whitespace-pre-wrap font-mono text-[12px] text-neutral-300">
                git clone https://github.com/example/plugin-market.git && pnpm i
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Result
              </div>
              <div className="font-mono text-[12px] text-neutral-300">
                exit 0 · 1.24s
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Schema
              </div>
              <div className="text-[12px] text-neutral-300">BashResult</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Timing
              </div>
              <div className="font-mono text-[12px] text-neutral-300">
                1240ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center gap-2 border-t border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[12px] text-neutral-500">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
        <span>任务 1 进行中 · 4 待处理</span>
      </div>
    </div>
  );
}
