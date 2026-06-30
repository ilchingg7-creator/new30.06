import { DoorOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { createRoomSelectorItems } from '../../station/roomScenes';
import type { GameState, ModuleId } from '../../game/types';

interface RoomSelectorProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onSelectRoom(moduleId: ModuleId): void;
}

export function RoomSelector({ gameState, selectedRoomId, onSelectRoom }: RoomSelectorProps) {
  const items = createRoomSelectorItems(gameState);

  return (
    <nav className="room-selector" aria-label="Комнаты станции">
      {items.map((item) => {
        const isActive = item.unlocked && selectedRoomId === item.moduleId;

        return (
          <motion.button
            type="button"
            key={item.moduleId}
            className={isActive ? 'active' : undefined}
            disabled={!item.unlocked}
            onClick={() => onSelectRoom(item.moduleId)}
            whileTap={item.unlocked ? { scale: 0.96 } : undefined}
            animate={isActive ? { boxShadow: '0 0 0 1px var(--color-lamp-amber) inset' } : { boxShadow: '0 0 0 0 transparent inset' }}
            transition={{ duration: 0.18 }}
          >
            <DoorOpen aria-hidden="true" size={16} />
            <span>{item.name}</span>
            <small>{item.unlocked ? `ур. ${item.level}` : 'закрыто'}</small>
          </motion.button>
        );
      })}
    </nav>
  );
}
