import type { Podcast } from "../types";
import bulbCover from "../assets/media/bulb.jpg";
import monsterCover from "../assets/media/monster.jpg";
import bunnyCover from "../assets/media/bunny.jpg";

export const podcasts: Podcast[] = [
  {
    id: "pod1",
    title: "Частина 1. Хроніки майбутнього",
    podcastName: "Епізод",
    coverUrl: bulbCover,
    description:
      "«Яким буде світ за 50 років? Чи станемо ми кіборгами? Чи можлива колонізація Марса? Ми розбираємо найновіші відкриття, дослідження та гіпотези, які можуть зробити майбутнє ще більш непередбачуваним.»",
    publishedAt: "Лип. 2024",
    duration: 19320,
  },
  {
    id: "pod2",
    title: "Частина 10. Тіньові справи",
    podcastName: "Епізод",
    coverUrl: monsterCover,
    description:
      "«Реальні кримінальні історії, що лякають своєю жорстокістю та загадковістю. Ми аналізуємо резонансні злочини, розбираємо деталі розслідувань і намагаємось зрозуміти, що рухає злочинцями. У кожному випуску — нова справа, нові факти.»",
    publishedAt: "Лип. 2024",
    duration: 19320,
  },
  {
    id: "pod3",
    title: "Частина 1. Теорії змови",
    podcastName: "Епізод",
    coverUrl: bunnyCover,
    description:
      "«Від таємного уряду до фейкової висадки на Місяць. Ми аналізуємо найпопулярніші теорії змови, шукаємо докази та розбираємося, що з цього — реальність, а що — вигадка.»",
    publishedAt: "Лип. 2024",
    duration: 19320,
  },
];
