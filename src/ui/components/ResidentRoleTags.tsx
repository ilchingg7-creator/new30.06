import { getResidentRoleProfile } from '../../game/residents';
import type { ResidentId, ResidentRole } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ResidentRoleTagsProps {
  residentId: ResidentId;
  t: Translation;
}

function getResidentRoleLabel(role: ResidentRole, t: Translation): string {
  switch (role) {
    case 'income':
      return t.residentRoleIncome;
    case 'comfort':
      return t.residentRoleComfort;
    case 'maintenance':
      return t.residentRoleMaintenance;
    case 'visitor':
      return t.residentRoleVisitor;
    case 'renovation':
      return t.residentRoleRenovation;
  }
}

export function ResidentRoleTags({ residentId, t }: ResidentRoleTagsProps) {
  const profile = getResidentRoleProfile(residentId);
  const roles = profile.secondary ? [profile.primary, profile.secondary] : [profile.primary];

  return (
    <span className="resident-role-list" aria-label="resident roles">
      {roles.map((role) => (
        <span className={`resident-role-tag role-${role}`} key={role}>
          {getResidentRoleLabel(role, t)}
        </span>
      ))}
    </span>
  );
}
