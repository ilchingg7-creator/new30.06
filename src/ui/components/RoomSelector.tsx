import { DoorOpen } from 'lucide-react';
import { createRoomSelectorItems } from '../../station/roomScenes';
import type { GameState, ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface RoomSelectorProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onSelectRoom(moduleId: ModuleId): void;
  t: Translation;
}

export function RoomSelector({ gameState, selectedRoomId, onSelectRoom, t }: RoomSelectorProps) {
  const items = createRoomSelectorItems(gameState);

  return (
    <nav className="room-selector" aria-label={t.rooms}>
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
            <span>{t.content.modules[item.moduleId]?.name ?? item.name}</span>
            <small>{item.unlocked ? `${t.level.toLowerCase()} ${item.level}` : t.closed}</small>
          </button>
        );
      })}
    </nav>
  );
}
