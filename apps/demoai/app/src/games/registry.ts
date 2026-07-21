import {
  IconArrowsMaximize,
  IconBolt,
  IconBrain,
  IconCards,
  IconFeather,
  IconGridDots,
  IconHammer,
  IconPingPong,
  IconWall,
  IconX,
} from '@tabler/icons-react';
import { PlaceholderGame } from './PlaceholderGame';
import { PongGame } from './PongGame';
import { SnakeGame } from './SnakeGame';
import type { GameDefinition } from './types';

/**
 * Arcade registry — order matches the product grid.
 * Adding a real component here publishes that game.
 */
export const games: GameDefinition[] = [
  { id: 'snake', name: 'Snake', icon: IconArrowsMaximize, color: '#97C459', component: SnakeGame },
  { id: 'pong', name: 'Pong', icon: IconPingPong, color: '#378ADD', component: PongGame },
  { id: 'breakout', name: 'Breakout', icon: IconWall, color: '#E24B4A', component: PlaceholderGame },
  { id: 'flappy', name: 'Flappy', icon: IconFeather, color: '#0F6E56', component: PlaceholderGame },
  { id: 'memory-match', name: 'Memory match', icon: IconBrain, color: '#378ADD', component: PlaceholderGame },
  { id: '2048', name: '2048', icon: IconGridDots, color: '#7F77DD', component: PlaceholderGame },
  { id: 'tic-tac-toe', name: 'Tic-tac-toe', icon: IconX, color: '#EF9F27', component: PlaceholderGame },
  { id: 'whack-a-mole', name: 'Whack-a-mole', icon: IconHammer, color: '#EF9F27', component: PlaceholderGame },
  { id: 'reaction-test', name: 'Reaction test', icon: IconBolt, color: '#E24B4A', component: PlaceholderGame },
  { id: 'simon-says', name: 'Simon says', icon: IconCards, color: '#534AB7', component: PlaceholderGame },
];

export function getGame(gameId: string | undefined): GameDefinition | undefined {
  if (!gameId) return undefined;
  return games.find((game) => game.id === gameId);
}
