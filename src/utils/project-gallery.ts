import type { ProjectGallery, ProjectMedia, ProjectRow } from "@/types/project";

/** A case's gallery boxes in page order: one per row, or side by side. */
export function galleryItems(
  gallery: ProjectGallery,
): readonly (ProjectMedia | ProjectRow)[] {
  return [
    ...gallery.lead,
    gallery.split,
    ...gallery.middle.flatMap(
      (group): readonly (ProjectMedia | ProjectRow)[] =>
        "row" in group ? [group] : group,
    ),
    ...gallery.closing,
    gallery.final,
  ];
}

/** The first box of the gallery (the first of a row). */
export function firstGalleryMedia(gallery: ProjectGallery): ProjectMedia {
  const first = galleryItems(gallery)[0];
  return "row" in first ? first.row[0] : first;
}
