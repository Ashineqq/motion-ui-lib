import type { Preview } from '@storybook/react';

// 引入组件库样式（Tailwind V4 编译入口）
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
