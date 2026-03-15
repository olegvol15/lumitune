import { usePlayerStore } from '../store/playerStore';

export function usePlayer() {
  return usePlayerStore();
}
