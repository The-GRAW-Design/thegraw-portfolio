export const STUDIO_INFO = {
  founder: "André Gonçalves",
  developer: "Erik Elias",
  tagline: [
    "São Paulo Design &",
    "Digital Product Studio founded by Visual Director André Gonçalves",
  ],
  pitch: "a design for bussinnes company",
  code: "281118",
  since: "©2020",
  instagram: "@thegrawdesign",
  email: "thegrawdesign@gmail.com",
  phone: ["+(55)", "9-98", "42", "98", "59"],
} as const;

/** Site 2.0 footer (Figma home "Footer"), in Portuguese. */
export const STUDIO_INFO_PT = {
  about:
    "Estúdio de design e produtos digitais em São Paulo, fundado pelo diretor visual André Gonçalves",
  pitch: "uma empresa de design para negócios",
  founder: `por ${STUDIO_INFO.founder}`,
  developer: `desenvolvimento por ${STUDIO_INFO.developer}`,
  /** Phones show the number on one line, grouped like this. */
  phoneInline: "+(55) 9-9842 9859",
} as const;
