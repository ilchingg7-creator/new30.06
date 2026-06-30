import { DoorOpen } from 'lucide-react';
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
          <button
            type="button"
            key={item.moduleId}
            className={isActive ? 'active' : undefined}
            disabled={!item.unlocked}
            onClick={() => onSelectRoom(item.moduleId)}
          >
            <DoorOpen aria-hidden="true" size={16} />
            <span>{item.name}</span>
            <small>{item.unlocked ? `ур. ${item.level}` : 'закрыто'}</small>
          </button>
        );
      })}
    </nav>
  );
}
