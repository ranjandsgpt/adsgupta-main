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
import { BreakoutGame } from './BreakoutGame';
import { Game2048 } from './Game2048';
import { FlappyGame } from './FlappyGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { PlaceholderGame } from './PlaceholderGame';
import { PongGame } from './PongGame';
import { SnakeGame } from './SnakeGame';
import { TicTacToeGame } from './TicTacToeGame';
import { WhackAMoleGame } from './WhackAMoleGame';
import type { GameDefinition } from './types';

/**
 * Arcade registry — order matches the product grid.
 * Adding a real component here publishes that game.
 */
export const games: GameDefinition[] = [
  { id: 'snake', name: 'Snake', icon: IconArrowsMaximize, color: '#97C459', component: SnakeGame },
  { id: 'pong', name: 'Pong', icon: IconPingPong, color: '#378ADD', component: PongGame },
  { id: 'breakout', name: 'Breakout', icon: IconWall, color: '#E24B4A', component: BreakoutGame },
  { id: 'flappy', name: 'Flappy', icon: IconFeather, color: '#0F6E56', component: FlappyGame },
  { id: 'memory-match', name: 'Memory match', icon: IconBrain, color: '#378ADD', component: MemoryMatchGame },
  { id: '2048', name: '2048', icon: IconGridDots, color: '#7F77DD', component: Game2048 },
  { id: 'tic-tac-toe', name: 'Tic-tac-toe', icon: IconX, color: '#EF9F27', component: TicTacToeGame },
  { id: 'whack-a-mole', name: 'Whack-a-mole', icon: IconHammer, color: '#EF9F27', component: WhackAMoleGame },
  { id: 'reaction-test', name: 'Reaction test', icon: IconBolt, color: '#E24B4A', component: PlaceholderGame },
  { id: 'simon-says', name: 'Simon says', icon: IconCards, color: '#534AB7', component: PlaceholderGame },
];

export function getGame(gameId: string | undefined): GameDefinition | undefined {
  if (!gameId) return undefined;
  return games.find((game) => game.id === gameId);
}
