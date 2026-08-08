import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { AnimateButton } from './index';

const meta = {
  title: 'Components/AnimateButton',
  component: AnimateButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    children: 'Animate Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof AnimateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Loading: Story = {
  args: { loading: true, children: 'Submitting…' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const VariantRow: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AnimateButton>Primary</AnimateButton>
      <AnimateButton variant="secondary">Secondary</AnimateButton>
      <AnimateButton variant="ghost">Ghost</AnimateButton>
    </div>
  ),
};
