export interface Badge {
  id: string
  emoji: string
  character: string
  title: string
  desc: string
  tip: string
  color: string
  bg: string
}

export interface UserStats {
  xp: number
  streak: number
  lessonsCompleted: number
  investorProfile: string
}

const ALL_BADGES: Badge[] = [
  {
    id: 'tio_patinhas',
    emoji: '🎩',
    character: 'Tio Patinhas',
    title: 'Cofre de Ouro',
    desc: 'Lenda dos investimentos — nível máximo atingido',
    tip: 'Você acumulou tanto conhecimento que o Tio Patinhas pediu sua consultoria.',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'gordon_gekko',
    emoji: '📈',
    character: 'Gordon Gekko',
    title: 'A Ganância é Boa',
    desc: 'Perfil arrojado com alto XP — você não tem medo de risco',
    tip: 'Wall Street ligou. Querem você no pregão.',
    color: 'text-gray-800',
    bg: 'bg-gray-50 border-gray-300',
  },
  {
    id: 'julius',
    emoji: '🧾',
    character: 'Julius',
    title: 'Mestre da Economia',
    desc: 'Conservador dedicado com streak alto — cada centavo conta',
    tip: 'Julius aprova. Você sabe exatamente quanto custa cada coisa e ainda investe o troco.',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'tartaruga',
    emoji: '🐢',
    character: 'A Tartaruga',
    title: 'Devagar e Sempre',
    desc: 'Streak alto mas ainda acumulando XP — constância é tudo',
    tip: 'A lebre dormiu. Você não. Todo mês no mesmo horário, sem falta.',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  {
    id: 'seu_madruga',
    emoji: '😅',
    character: 'Seu Madruga',
    title: 'Sem Fundos',
    desc: 'Cadastrado mas ainda sem investir — a jornada espera',
    tip: 'Não tem dinheiro? O Seu Madruga também não tinha. Mas ele pelo menos tentava.',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'iniciante',
    emoji: '🌱',
    character: 'Investidor Iniciante',
    title: 'Começando a Jornada',
    desc: 'Dando os primeiros passos no mundo dos investimentos',
    tip: 'Todo Tio Patinhas já foi um Seu Madruga. Continue aprendendo!',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
]

export function getUserBadge(stats: UserStats): Badge {
  const { xp, streak, investorProfile } = stats

  if (xp >= 10000) return ALL_BADGES.find(b => b.id === 'tio_patinhas')!
  if (xp >= 2500 && investorProfile === 'ARROJADO') return ALL_BADGES.find(b => b.id === 'gordon_gekko')!
  if (investorProfile === 'CONSERVADOR' && streak >= 7) return ALL_BADGES.find(b => b.id === 'julius')!
  if (streak >= 14 && xp < 1000) return ALL_BADGES.find(b => b.id === 'tartaruga')!
  if (xp < 100) return ALL_BADGES.find(b => b.id === 'seu_madruga')!

  return ALL_BADGES.find(b => b.id === 'iniciante')!
}

export function getAllBadges(): Badge[] {
  return ALL_BADGES
}
