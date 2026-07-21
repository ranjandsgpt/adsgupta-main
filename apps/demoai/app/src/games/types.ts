import type { ComponentType, ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

export type GameProps = {
  onScore: (text: string) => void;
};

/** Matches @tabler/icons-react outline icons (stroke may be numeric). */
export type GameIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'stroke' | 'ref'> & {
    size?: number | string;
    stroke?: number | string;
    title?: string;
  } & RefAttributes<SVGSVGElement>
>;

export type GameDefinition = {
  id: string;
  name: string;
  icon: GameIcon;
  color: string;
  component: ComponentType<GameProps>;
};
