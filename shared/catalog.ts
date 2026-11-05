// Catálogo da roleta e regra da pontuação final. Usado pelo servidor e pela interface.

export type SlotId =
  | 'placa-mae'
  | 'processador'
  | 'memoria'
  | 'armazenamento'
  | 'fonte'
  | 'monitor'
  | 'cooler'
  | 'gabinete'
  | 'sistema'
  | 'video'
  | 'teclado'
  | 'mouse'
  | 'extra';

export interface Slot {
  id: SlotId;
  name: string;
  weight: number; // pontos que a peça vale no "Computador funcional" (soma = 100)
  why: string; // aparece só na apresentação final, quando a peça faltou
}

export const SLOTS: Slot[] = [
  { id: 'placa-mae', name: 'Placa-mãe', weight: 13, why: 'liga todas as peças entre si' },
  { id: 'processador', name: 'Processador', weight: 13, why: 'é o cérebro do computador' },
  { id: 'memoria', name: 'Memória RAM', weight: 10, why: 'sem ela o PC nem inicia' },
  { id: 'armazenamento', name: 'HD ou SSD', weight: 10, why: 'guarda o sistema e os arquivos' },
  { id: 'fonte', name: 'Fonte', weight: 10, why: 'leva energia para tudo' },
  { id: 'monitor', name: 'Monitor', weight: 10, why: 'sem ele não dá para ver nada' },
  { id: 'cooler', name: 'Cooler', weight: 6, why: 'evita que o processador esquente demais' },
  { id: 'gabinete', name: 'Gabinete', weight: 6, why: 'protege e organiza as peças' },
  { id: 'sistema', name: 'Sistema operacional', weight: 6, why: 'sem sistema o PC não tem o que rodar' },
  { id: 'video', name: 'Placa de vídeo', weight: 6, why: 'sem ela o vídeo fica fraco' },
  { id: 'teclado', name: 'Teclado', weight: 5, why: 'sem ele não dá para digitar' },
  { id: 'mouse', name: 'Mouse', weight: 5, why: 'sem ele não dá para clicar' },
  { id: 'extra', name: 'Acessório', weight: 0, why: '' },
];

export const SLOT_BY_ID = Object.fromEntries(SLOTS.map((s) => [s.id, s])) as Record<SlotId, Slot>;
export const PC_SLOTS = SLOTS.filter((s) => s.weight > 0);

export interface Item {
  id: string;
  name: string;
  brand: string;
  slot: SlotId;
  tag?: string; // selo curto sobre a imagem (ex.: "8GB")
  quality: number; // 0.88 a 1: peça melhor vale mais pontos no mesmo slot
  price: number; // lance inicial (nunca passa de R$ 700)
}

const i = (
  id: string,
  name: string,
  brand: string,
  slot: SlotId,
  quality: number,
  price: number,
  tag?: string,
): Item => ({ id, name, brand, slot, quality, price, tag });

// A ordem segue as folhas de imagens (6 folhas de 3x3) para o script de recorte.
export const ITEMS: Item[] = [
  i('mb-basica', 'Placa-mãe básica', 'Gigabyte', 'placa-mae', 0.9, 250),
  i('mb-media', 'Placa-mãe intermediária', 'ASUS', 'placa-mae', 0.95, 400),
  i('mb-gamer', 'Placa-mãe gamer', 'MSI', 'placa-mae', 1, 600, 'Gamer'),
  i('cpu-i3', 'Processador Core i3', 'Intel', 'processador', 0.9, 300, 'Básico'),
  i('cpu-r5', 'Processador Ryzen 5', 'AMD', 'processador', 0.95, 450, 'Médio'),
  i('cpu-i7', 'Processador Core i7', 'Intel', 'processador', 0.97, 600, 'Forte'),
  i('cpu-r9', 'Processador Ryzen 9', 'AMD', 'processador', 1, 700, 'Gamer'),
  i('ram-2', 'Memória RAM 2GB', 'Kingston', 'memoria', 0.88, 60, '2GB'),
  i('ram-4', 'Memória RAM 4GB', 'Crucial', 'memoria', 0.91, 100, '4GB'),

  i('ram-8', 'Memória RAM 8GB', 'Kingston', 'memoria', 0.94, 180, '8GB'),
  i('ram-16', 'Memória RAM 16GB', 'Corsair', 'memoria', 0.97, 300, '16GB'),
  i('ram-16g', 'Memória RAM 16GB Gamer', 'XPG', 'memoria', 0.98, 380, '16GB'),
  i('ram-32g', 'Memória RAM 32GB Gamer', 'Corsair', 'memoria', 1, 520, '32GB'),
  i('hd-500', 'HD 500GB', 'Seagate', 'armazenamento', 0.88, 120, '500GB'),
  i('hd-1t', 'HD 1TB', 'Western Digital', 'armazenamento', 0.9, 180, '1TB'),
  i('hd-2t', 'HD 2TB', 'Toshiba', 'armazenamento', 0.92, 250, '2TB'),
  i('ssd-240', 'SSD 240GB', 'Kingston', 'armazenamento', 0.94, 200, '240GB'),
  i('ssd-480', 'SSD 480GB', 'Crucial', 'armazenamento', 0.96, 280, '480GB'),

  i('nvme-1t', 'SSD NVMe 1TB (super rápido)', 'Samsung', 'armazenamento', 1, 450, '1TB'),
  i('psu-400', 'Fonte 400W', 'PCYes', 'fonte', 0.9, 150, '400W'),
  i('psu-600', 'Fonte 600W', 'Corsair', 'fonte', 0.95, 280, '600W'),
  i('psu-850', 'Fonte 850W Gamer', 'EVGA', 'fonte', 1, 420, '850W'),
  i('gpu-basica', 'Placa de vídeo básica', 'NVIDIA', 'video', 0.9, 300, 'Básica'),
  i('gpu-media', 'Placa de vídeo intermediária', 'AMD Radeon', 'video', 0.95, 500, 'Média'),
  i('gpu-gamer', 'Placa de vídeo gamer RTX', 'NVIDIA', 'video', 1, 700, 'Gamer'),
  i('cooler-box', 'Cooler simples', 'DeepCool', 'cooler', 0.9, 50),
  i('cooler-torre', 'Cooler torre', 'Cooler Master', 'cooler', 0.95, 120),

  i('water', 'Water cooler RGB', 'Rise Mode', 'cooler', 1, 250, 'RGB'),
  i('case-simples', 'Gabinete simples', 'C3Tech', 'gabinete', 0.9, 100),
  i('case-vidro', 'Gabinete com vidro', 'Pichau', 'gabinete', 0.95, 180),
  i('case-gamer', 'Gabinete gamer RGB', 'NZXT', 'gabinete', 1, 300, 'RGB'),
  i('so-linux', 'Pendrive com Linux', 'Ubuntu', 'sistema', 1, 40, 'Grátis'),
  i('so-windows', 'Pendrive com Windows 11', 'Microsoft', 'sistema', 1, 250),
  i('mon-19', 'Monitor 19 polegadas', 'AOC', 'monitor', 0.9, 200, '19"'),
  i('mon-24', 'Monitor 24 polegadas', 'LG', 'monitor', 0.95, 350, '24"'),
  i('mon-27g', 'Monitor gamer curvo 27"', 'Samsung', 'monitor', 1, 550, '27"'),

  i('kb-simples', 'Teclado simples', 'Multilaser', 'teclado', 0.9, 30),
  i('kb-sem-fio', 'Teclado sem fio', 'Logitech', 'teclado', 0.95, 90),
  i('kb-gamer', 'Teclado mecânico gamer', 'Redragon', 'teclado', 1, 200, 'RGB'),
  i('mouse-simples', 'Mouse simples', 'Multilaser', 'mouse', 0.9, 20),
  i('mouse-sem-fio', 'Mouse sem fio', 'Logitech', 'mouse', 0.95, 70),
  i('mouse-gamer', 'Mouse gamer RGB', 'HyperX', 'mouse', 1, 150, 'RGB'),
  i('headset', 'Headset gamer', 'HyperX', 'extra', 0, 180),
  i('caixa-som', 'Caixa de som', 'JBL', 'extra', 0, 120),
  i('webcam', 'Webcam', 'Logitech', 'extra', 0, 150),

  i('impressora', 'Impressora', 'Epson', 'extra', 0, 400),
  i('roteador', 'Roteador Wi-Fi', 'TP-Link', 'extra', 0, 150),
  i('nobreak', 'Nobreak', 'SMS', 'extra', 0, 350),
  i('cadeira', 'Cadeira gamer', 'ThunderX3', 'extra', 0, 500),
  i('mousepad', 'Mousepad RGB', 'Redragon', 'extra', 0, 60),
  i('controle', 'Controle de videogame', '8BitDo', 'extra', 0, 200),
  i('pendrive', 'Pendrive 64GB', 'SanDisk', 'extra', 0, 50),
  i('microfone', 'Microfone', 'Fifine', 'extra', 0, 150),
  i('fita-led', 'Fita de LED RGB', 'Elgin', 'extra', 0, 60),
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it])) as Record<string, Item>;

export interface SlotResult {
  slot: Slot;
  item?: Item; // melhor peça do aluno nesse slot
  points: number;
}

export interface Score {
  percent: number; // 0 a 100, com 1 casa decimal
  slots: SlotResult[];
  missing: Slot[];
  upgrades: Slot[]; // slots preenchidos com peça que não é a melhor
  extras: Item[];
}

// Cada slot vale peso × qualidade da melhor peça que o aluno tem; peças repetidas não somam.
export function scoreBuild(itemIds: string[]): Score {
  const owned = itemIds.map((id) => ITEM_BY_ID[id]).filter(Boolean);
  const slots = PC_SLOTS.map((slot) => {
    const best = owned
      .filter((it) => it.slot === slot.id)
      .sort((a, b) => b.quality - a.quality)[0];
    return { slot, item: best, points: best ? slot.weight * best.quality : 0 };
  });
  const percent = Math.round(slots.reduce((sum, s) => sum + s.points, 0) * 10) / 10;
  return {
    percent,
    slots,
    missing: slots.filter((s) => !s.item).map((s) => s.slot),
    upgrades: slots.filter((s) => s.item && s.item.quality < 1).map((s) => s.slot),
    extras: owned.filter((it) => it.slot === 'extra'),
  };
}

export const brl = (value: number) =>
  'R$ ' + Math.round(value).toLocaleString('pt-BR');
