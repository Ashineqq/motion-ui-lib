import { cn } from '@/lib/utils';

interface Plugin {
  name: string;
  description: string;
  enabled: boolean;
}

const PLUGINS: Plugin[] = [
  { name: 'include', description: '解析并内联局部文件引用', enabled: true },
  { name: 'timer', description: '计时与节流工具函数', enabled: true },
  { name: 'hmr', description: '模块热替换与增量重载', enabled: true },
  { name: 'llm', description: '大语言模型调用与流式输出', enabled: false },
  { name: 'puppeteer', description: '无头浏览器自动化渲染', enabled: true },
  { name: 'fs', description: '安全的文件系统读写接口', enabled: true },
  { name: 'git', description: '仓库状态与提交操作', enabled: false },
  { name: 'sandbox', description: '隔离执行沙箱环境', enabled: true },
  { name: 'mcp', description: '模型上下文协议桥接', enabled: true },
  { name: 'render', description: '服务端组件渲染管线', enabled: false },
];

function BreadcrumbIcon() {
  return (
    <svg
      className="size-3 text-neutral-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
      <path d="M12 22V8a4 4 0 0 0-4-4H4" />
      <path d="M4 12v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="size-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="size-3.5 text-neutral-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function GeneralIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 8v4l2 2" />
    </svg>
  );
}

function ModelIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h.01M15 9h.01M9 15h6" />
    </svg>
  );
}

function PluginIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function PresetIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: '通用设置', icon: <GeneralIcon />, active: false },
  { label: '模型', icon: <ModelIcon />, active: false },
  { label: '插件', icon: <PluginIcon />, active: true },
  { label: 'Agent 预设', icon: <PresetIcon />, active: false },
];

function PluginCard({ plugin }: { plugin: Plugin }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] text-neutral-200">{plugin.name}</span>
        <span
          className={cn(
            'flex items-center gap-1.5 text-[11px]',
            plugin.enabled ? 'text-emerald-400' : 'text-neutral-500',
          )}
        >
          <span
            className={cn(
              'rounded-full size-1.5',
              plugin.enabled ? 'bg-emerald-400' : 'bg-neutral-600',
            )}
          />
          {plugin.enabled ? '已启用' : '已停用'}
        </span>
      </div>
      <p className="text-[11px] text-neutral-500">{plugin.description}</p>
    </div>
  );
}

export function PluginPanelMockup() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#0c0c0e] text-neutral-200">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
          <BreadcrumbIcon />
          <span>设置 / 插件</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-neutral-300 hover:bg-white/[0.06]"
        >
          打开配置文件
          <ExternalLinkIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="w-44 shrink-0 border-r border-white/[0.07] p-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px]',
                    item.active
                      ? 'border-l-2 border-sky-400 bg-white/[0.06] text-neutral-100'
                      : 'border-l-2 border-transparent text-neutral-400 hover:bg-white/[0.03]',
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center gap-5 border-b border-white/[0.07] pb-2 text-[13px]">
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-200"
            >
              插件配置
            </button>
            <button
              type="button"
              className="border-b-2 border-white pb-2 text-neutral-100"
            >
              插件列表
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-neutral-300">
              <SearchIcon />
              <input
                type="text"
                placeholder="搜索插件…"
                className="w-40 bg-transparent outline-none placeholder:text-neutral-600"
              />
            </div>
            <span className="text-[12px] text-neutral-500">插件列表 132</span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1">
            {PLUGINS.map((plugin) => (
              <PluginCard key={plugin.name} plugin={plugin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
