import { teamMembers } from '@/lib/data';
import type { TeamMember } from '@/lib/types';

function childrenOf(parentId: string | null): TeamMember[] {
  return teamMembers.filter((m) => (m.reportsTo ?? null) === parentId);
}

function OrgNode({ member, isRoot = false }: { member: TeamMember; isRoot?: boolean }) {
  const children = childrenOf(member.id);

  return (
    <li className={`org-chart-node${isRoot ? ' org-chart-root' : ''}`}>
      <div className="org-chart-card">
        <p className="font-heading font-bold text-brand-900 text-sm sm:text-base leading-snug" dir="rtl">
          {member.name}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-brand-600" dir="rtl">
          {member.role}
        </p>
      </div>

      {children.length > 0 && (
        <ul className="org-chart-children">
          {children.map((child) => (
            <OrgNode key={child.id} member={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function OrgChart() {
  const roots = childrenOf(null);

  if (roots.length === 0) return null;

  return (
    <div className="org-chart w-full overflow-x-auto" dir="ltr" aria-label="چارت سازمانی">
      <ul className="org-chart-tree">
        {roots.map((root) => (
          <OrgNode key={root.id} member={root} isRoot />
        ))}
      </ul>
    </div>
  );
}
