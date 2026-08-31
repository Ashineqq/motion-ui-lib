import type { Meta, StoryObj } from "@storybook/react";
import { PersonaCardMorph } from "./PersonaCardMorph";
import { PERSONAS } from "./mockData";

const meta: Meta<typeof PersonaCardMorph> = {
  title: "Components/PersonaCardMorph",
  component: PersonaCardMorph,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PersonaCardMorph>;

export const Default: Story = {
  args: {
    personas: PERSONAS,
  },
  decorators: [
    (Story) => (
      <div className="w-[800px] p-8">
        <Story />
      </div>
    ),
  ],
};
