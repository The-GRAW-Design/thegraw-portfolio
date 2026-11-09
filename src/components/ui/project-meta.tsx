import { LogoLayers } from "@/components/ui/logo-layers";
import { SHOWCASE_LABELS } from "@/constants/projects";
import type { ShowcaseInfo } from "@/types/project";
import { cn } from "@/utils/cn";

type ShowcaseProps = {
  info: ShowcaseInfo;
  className?: string;
};

/** Figma showcase meta: "Client …" and "year …", uppercase. */
export function ProjectMeta({ info, className }: ShowcaseProps) {
  return (
    <dl
      className={cn(
        "flex justify-between text-fine whitespace-nowrap uppercase",
        className,
      )}
    >
      <div className="flex gap-17.5">
        <dt>{SHOWCASE_LABELS.client}</dt>
        <dd className="font-medium">{info.client}</dd>
      </div>
      <div className="flex gap-11.5">
        <dt>{SHOWCASE_LABELS.year}</dt>
        <dd className="font-medium">{info.year}</dd>
      </div>
    </dl>
  );
}

/** Figma showcase brand: the client logo over a two-line description. */
export function ProjectBrand({ info, className }: ShowcaseProps) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      {info.logo && (
        <LogoLayers
          logo={info.logo}
          alt={info.client}
          className="max-w-[80vw]"
          style={{ width: `calc(var(--spacing) * ${info.logo.width})` }}
        />
      )}
      <p className="max-w-226 text-lead">{info.description}</p>
    </div>
  );
}

/** Figma showcase disciplines, one per line on desktop. */
export function ProjectDisciplines({ info, className }: ShowcaseProps) {
  return (
    <ul className={cn("flex flex-wrap gap-x-12 text-lead lg:block", className)}>
      {info.disciplines.map((discipline) => (
        <li key={discipline}>{discipline}</li>
      ))}
    </ul>
  );
}
