export interface PersonaData {
  key: string;
  title: string;
  tagline: string;
  scenario: string;
  features: { label: string; desc: string }[];
  flow: string;
}

export interface PersonaCardMorphProps {
  personas?: PersonaData[];
  className?: string;
}
