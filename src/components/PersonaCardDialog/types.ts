export interface PersonaData {
  key: string;
  title: string;
  tagline: string;
  scenario: string;
  features: { label: string; desc: string }[];
  flow: string;
}

export interface PersonaCardDialogProps {
  personas?: PersonaData[];
  className?: string;
}