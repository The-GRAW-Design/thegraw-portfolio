import { asset } from "@/utils/asset";

export const HOME_PAGE = {
  hero: {
    title: "Criamos valor pelo design",
    lines: [
      "marcas, estratégia e produtos digitais",
      "há 5 anos ajudamos marcas a crescer",
    ],
  },
  projects: {
    title: "Projetos",
    body: "Um olhar sobre como estratégia, design e desenvolvimento dão forma a cada projeto.",
  },
  casesLabel: "Cases",
  /** Home "Cases" collages, in order (Figma 01 is Grupo Penguin). */
  cases: [
    "grupo-penguin",
    "allce",
    "lorena-lourenco",
    "tati-hotelzinho-pet",
    "elle-fanning",
    "conexao-duo",
  ],
  viewAllCases: "Ver todos os projetos",
  /** Figma "Frame 81": the call to work together. */
  contact: {
    title: "Vamos criar juntos",
    copy: "Queremos entender os detalhes do seu próximo projeto! Será um prazer co-criar com o seu time.",
    cta: "Solicite sua proposta",
  },
  viewAllImage: asset("/images/home/view-all-band.webp"),
} as const;

export const NOT_FOUND_PAGE = {
  title: "Página não encontrada",
  code: "erro 404",
  back: "voltar para o início",
} as const;

/** Site 2.0 project page (Figma "Project Open", "Mobile - overview"). */
export const PROJECT_PAGE = {
  overview: "visão geral",
  /** Phones: the overview opens and closes under its first lines. */
  more: "ver mais  +",
  less: "ver menos  −",
  end: "FIM",
  viewAll: "ver todos",
} as const;

const teamPhoto = (slug: string) => asset(`/images/studio/team-${slug}.webp`);

/**
 * Site 2.0 team frames (Figma ANDRÉ, ALAN, TATÁ, ERIK, 1920×950; phones
 * "Mobile - Estúdio"): the photo as Figma crops it, the card's place and the
 * role sized to fill the frame width.
 */
export const TEAM_MEMBERS = [
  {
    name: "André Gonçalves",
    role: "Diretor criativo",
    bio: "À frente da direção criativa do estúdio, conduz conceitos, define linguagens visuais e transforma ideias em projetos com identidade. Responsável por conectar criatividade, estratégia e design em cada entrega.",
    photo: teamPhoto("andre-goncalves"),
    photoClassName: "object-center",
    cardClassName: "lg:left-1231 lg:w-489",
    roleClassName: "text-role-director-sm lg:text-role-director",
  },
  {
    name: "Alan Erick",
    role: "Motion designer",
    bio: "Responsável por dar movimento às ideias, transformando conceitos em experiências visuais dinâmicas. Une criatividade e técnica para construir narrativas que prendem a atenção.",
    photo: teamPhoto("alan-erick"),
    photoClassName: "object-center lg:object-[50%_25%]",
    cardClassName: "lg:left-1210 lg:w-594",
    roleClassName: "text-role-motion-sm lg:text-role-motion",
  },
  {
    name: "Tatá Gomes",
    role: "Gestora de projetos",
    bio: "Conecta pessoas, ideias e processos para fazer tudo acontecer. À frente da gestão de projetos, organiza fluxos, coordena equipes e garante que cada projeto siga seu caminho com propósito.",
    photo: teamPhoto("tata-gomes"),
    photoClassName: "object-center",
    cardClassName: "lg:left-1210 lg:w-594",
    roleClassName: "text-role-manager-sm lg:text-role-manager",
  },
  {
    name: "Erik Elias",
    role: "Desenvolvedor",
    bio: "Responsável por transformar ideias em experiências digitais. Conecta tecnologia, funcionalidade e criatividade para desenvolver soluções que dão vida aos projetos da THE GRAW.",
    photo: teamPhoto("erik-elias"),
    photoClassName: "object-center",
    cardClassName: "lg:left-1210 lg:w-594",
    roleClassName: "text-role-developer-sm lg:text-role-developer",
  },
] as const;

export const STUDIO_PAGE = {
  title: "Estúdio",
  /**
   * Figma "Frame 35052/35053/35054": side by side, each on its own
   * background, shown one at a time as the page scrolls.
   */
  sections: [
    {
      id: "purpose",
      heading: "Propósito",
      body: "Impulsionamos marcas com clareza, design autêntico e experiências digitais criadas com propósito.",
      // Desktop: the row's top (173, 415 and 740 of the 1069px frame) and
      // the text's x in the 1920 frame; phones: the block's top.
      className: "lg:top-[16.18%]",
      textClassName: "lg:left-1014",
      mobileClassName: "top-329",
    },
    {
      id: "pillars",
      heading: "Pilares",
      items: [
        {
          label: "Clareza:",
          text: "Transformamos ideias complexas em experiências claras e objetivas.",
        },
        {
          label: "Identidade:",
          text: "Criamos linguagens visuais únicas que tornam cada marca reconhecível.",
        },
        {
          label: "Cuidado:",
          text: "Unimos estratégia, design e desenvolvimento com atenção aos detalhes.",
        },
      ],
      className: "lg:top-[38.82%]",
      textClassName: "lg:left-1021",
      mobileClassName: "top-318",
    },
    {
      id: "foundations",
      heading: "Fundamentos",
      body: "Um bom trabalho começa pela escuta. Fazemos as perguntas certas, entendemos o desafio e tomamos decisões conscientes em cada etapa da primeira ideia ao último detalhe.",
      className: "lg:top-[69.22%]",
      textClassName: "lg:left-1018",
      mobileClassName: "top-324",
    },
  ],
} as const;
