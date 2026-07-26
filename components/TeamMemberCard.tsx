import Image from 'next/image';
import type { TeamMember } from '@/lib/types';

type TeamMemberCardVariant = 'preview' | 'leadership' | 'engineer';

interface TeamMemberCardProps {
  member: TeamMember;
  hasImage?: boolean;
  variant?: TeamMemberCardVariant;
}

const imageHeights: Record<TeamMemberCardVariant, string> = {
  preview: 'h-52',
  leadership: 'h-72',
  engineer: 'h-52',
};

export default function TeamMemberCard({
  member,
  hasImage = false,
  variant = 'preview',
}: TeamMemberCardProps) {
  if (hasImage) {
    const isLeadership = variant === 'leadership';
    const isEngineer = variant === 'engineer';

    return (
      <article
        className={
          isLeadership
            ? 'bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300'
            : 'group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow'
        }
      >
        <div
          className={`relative ${imageHeights[variant]} bg-brand-100 overflow-hidden`}
        >
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes={
              isLeadership
                ? '(max-width:768px) 100vw, 384px'
                : isEngineer
                  ? '(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw'
                  : '(max-width:640px) 100vw, (max-width:1024px) 33vw, 320px'
            }
          />
        </div>
        <div className={isLeadership ? 'p-7' : 'p-5'}>
          <h3
            className={
              isLeadership
                ? 'font-heading font-bold text-brand-900 text-xl mb-1'
                : isEngineer
                  ? 'font-heading font-bold text-brand-900 text-base mb-1'
                  : 'font-heading font-bold text-brand-900 text-lg'
            }
          >
            {member.name}
          </h3>
          <p
            className={
              isLeadership
                ? 'text-accent text-sm font-semibold mb-4'
                : isEngineer
                  ? 'text-accent text-xs font-semibold mb-2'
                  : 'text-accent font-medium text-sm mt-1'
            }
          >
            {member.role}
          </p>
          <p
            className={
              isLeadership
                ? 'text-muted-foreground text-sm leading-relaxed'
                : isEngineer
                  ? 'text-muted-foreground text-xs leading-relaxed'
                  : 'text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-2'
            }
          >
            {member.bio}
          </p>
        </div>
      </article>
    );
  }

  const isLeadership = variant === 'leadership';
  const isEngineer = variant === 'engineer';

  return (
    <article
      className={
        isLeadership
          ? 'group relative bg-card rounded-xl border border-border p-7 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/5 transition-all duration-300'
          : 'group relative bg-card rounded-xl border border-border p-6 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/5 transition-all duration-300'
      }
    >
      <div className="absolute top-0 right-0 w-1 h-full bg-accent rounded-r-xl opacity-80 group-hover:opacity-100 transition-opacity" />
      <p
        className={
          isEngineer
            ? 'text-accent font-semibold text-xs mb-2'
            : 'text-accent font-semibold text-sm mb-2'
        }
      >
        {member.role}
      </p>
      <h3
        className={
          isLeadership
            ? 'font-heading font-bold text-brand-900 text-xl'
            : isEngineer
              ? 'font-heading font-bold text-brand-900 text-base'
              : 'font-heading font-bold text-brand-900 text-lg'
        }
      >
        {member.name}
      </h3>
      <p
        className={
          isLeadership
            ? 'text-muted-foreground text-sm mt-4 leading-relaxed'
            : isEngineer
              ? 'text-muted-foreground text-sm mt-3 leading-relaxed'
              : 'text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-2'
        }
      >
        {member.bio}
      </p>
    </article>
  );
}
