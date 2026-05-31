import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { X, ChevronRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import type { User } from '../../types'

// ─── Banco de lições
const LESSONS: Record<string, any> = {
  '1.1': {
    id: '1.1', title: 'Dinheiro trabalhando por você', emoji: '💡', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '💡',
        text: [
          'Imagina dois amigos: Lucas e Pedro. Os dois ganham R$ 3.000 por mês.',
          'Lucas gasta tudo todo mês. Pedro poupa R$ 300 e **investe**.',
          'Depois de 20 anos, Lucas ainda ganha R$ 3.000. Pedro tem uma renda extra vinda dos investimentos — o dinheiro dele **trabalha enquanto ele dorme**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Investir = colocar dinheiro para trabalhar por você. Com o tempo, o retorno cresce sobre o retorno anterior — isso se chama juros compostos.',
      },
      {
        type: 'content', emoji: '🏦',
        text: [
          'Existem dois jeitos de ganhar dinheiro:',
          '**Ativo:** você troca seu tempo por dinheiro — trabalha, recebe salário.',
          '**Passivo:** seu dinheiro trabalha por você — rende juros, dividendos, aluguéis.',
          'Investir é construir renda passiva aos poucos, até ela complementar (ou substituir) seu salário.',
        ],
      },
      {
        type: 'content', emoji: '📅',
        text: [
          'O segredo não é ganhar muito — é **começar cedo e ser consistente**.',
          'R$ 200 por mês investidos a 10% a.a. durante 30 anos viram mais de **R$ 450.000**.',
          'Os mesmos R$ 200 durante só 10 anos viram apenas **R$ 40.000**. O tempo faz a diferença gigantesca.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⏰ O melhor momento para começar a investir era ontem. O segundo melhor momento é hoje.',
      },
      {
        type: 'quiz',
        question: 'O que significa "dinheiro trabalhando por você"?',
        options: [
          { id: 'a', text: 'Trabalhar horas extras para ganhar mais', correct: false },
          { id: 'b', text: 'Investir para gerar renda passiva sem precisar trocar tempo por dinheiro', correct: true },
          { id: 'c', text: 'Pedir dinheiro emprestado e pagar depois', correct: false },
          { id: 'd', text: 'Economizar guardando em casa', correct: false },
        ],
        explanation: 'Renda passiva é o que acontece quando você investe: o dinheiro gera retorno sem você trabalhar diretamente. Juros, dividendos e aluguéis são exemplos — você recebe enquanto dorme.',
      },
      {
        type: 'quiz',
        question: 'Por que começar a investir cedo faz tanta diferença?',
        options: [
          { id: 'a', text: 'Porque os juros são maiores para quem começa jovem', correct: false },
          { id: 'b', text: 'Porque quanto mais tempo, mais os juros compostos multiplicam o valor', correct: true },
          { id: 'c', text: 'Porque o governo dá benefício para quem investe cedo', correct: false },
          { id: 'd', text: 'Não faz diferença — o valor final é o mesmo', correct: false },
        ],
        explanation: 'Juros compostos são juros sobre juros. Quanto mais tempo o dinheiro fica investido, mais ciclos de crescimento ele passa. 30 anos geram mais de 10x o resultado de 10 anos com o mesmo aporte mensal.',
      },
    ],
  },

  '1.2': {
    id: '1.2', title: 'Risco x Retorno', emoji: '⚖️', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '⚖️',
        text: [
          'Existe uma regra de ouro no mercado financeiro: **maior retorno = maior risco**.',
          'Não existe investimento que pague muito e seja completamente seguro ao mesmo tempo.',
          'Quem promete 5% ao mês sem risco está mentindo — ou vai desaparecer com seu dinheiro.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🚨 Se parece bom demais para ser verdade, provavelmente é golpe. Desconfie de qualquer promessa de retorno extraordinário com "risco zero".',
      },
      {
        type: 'content', emoji: '📊',
        text: [
          'Pense em uma escada de risco x retorno:',
          '**Poupança / Tesouro Selic:** risco baixíssimo → retorno ~10% a.a.',
          '**CDB / LCI / LCA:** risco baixo → retorno ~10–13% a.a.',
          '**Ações / FIIs:** risco médio/alto → retorno potencial maior, mas pode cair.',
          '**Cripto / Day trade:** risco alto → pode dobrar ou perder tudo.',
        ],
      },
      {
        type: 'content', emoji: '🛡️',
        text: [
          'A chave é a **diversificação** — não colocar todos os ovos na mesma cesta.',
          'Combinando ativos de diferentes riscos, você reduz o impacto se um deles cair.',
          'Um carteira diversificada equilibra segurança e crescimento ao mesmo tempo.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🥚 Diversificação = distribuir o dinheiro entre vários ativos diferentes. Se um cair, os outros seguram.',
      },
      {
        type: 'quiz',
        question: 'Um investimento promete 8% ao mês com total segurança. O que você deve fazer?',
        options: [
          { id: 'a', text: 'Investir tudo imediatamente — oportunidade rara', correct: false },
          { id: 'b', text: 'Desconfiar — maior retorno sempre vem com maior risco', correct: true },
          { id: 'c', text: 'Investir metade para não perder a oportunidade', correct: false },
          { id: 'd', text: 'Esperar mais um mês para ter certeza', correct: false },
        ],
        explanation: '8% ao mês seria 150%+ ao ano — muito acima de qualquer investimento legítimo. A relação risco x retorno é universal: não existe retorno extraordinário sem risco correspondente.',
      },
      {
        type: 'quiz',
        question: 'Por que diversificar a carteira reduz o risco?',
        options: [
          { id: 'a', text: 'Porque você ganha mais quando tudo sobe', correct: false },
          { id: 'b', text: 'Porque a queda de um ativo é compensada pelos outros que estão estáveis ou subindo', correct: true },
          { id: 'c', text: 'Porque o governo garante carteiras diversificadas', correct: false },
          { id: 'd', text: 'Não reduz — diversificar só complica', correct: false },
        ],
        explanation: 'Ativos diferentes reagem de formas diferentes ao mercado. Quando ações caem, renda fixa pode estar subindo. Quando o Brasil vai mal, ativos internacionais podem compensar. Diversificar distribui o risco.',
      },
    ],
  },

  '1.3': {
    id: '1.3', title: 'O poder dos juros compostos', emoji: '📈', xpReward: 50,
    steps: [
      {
        type: 'content', emoji: '📈',
        text: [
          'Einstein teria chamado os juros compostos de "a oitava maravilha do mundo".',
          'A lógica é simples: você ganha juros. Esses juros entram no seu saldo. No mês seguinte, você ganha juros **sobre o valor maior**.',
          'É juros sobre juros — e o crescimento acelera com o tempo.',
        ],
      },
      {
        type: 'content', emoji: '🧮',
        text: [
          'Exemplo: R$ 1.000 a 10% ao ano.',
          '**Juros simples:** todo ano você ganha R$ 100. Em 10 anos: R$ 2.000.',
          '**Juros compostos:** ano 1 = R$ 1.100, ano 2 = R$ 1.210, ano 3 = R$ 1.331... Em 10 anos: **R$ 2.594**.',
          'A diferença? R$ 594 a mais — sem fazer nada, só pelo efeito dos juros sobre juros.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '📐 Fórmula: Valor Final = Principal × (1 + taxa)^tempo. Ex: R$ 1.000 × (1,10)^10 = R$ 2.594',
      },
      {
        type: 'content', emoji: '🚀',
        text: [
          'Agora com aportes mensais a história fica ainda melhor:',
          '**R$ 500/mês a 10% a.a. por 20 anos = R$ 382.000**',
          'Você colocou R$ 120.000 do seu bolso. Os juros geraram outros **R$ 262.000** — mais que o dobro do que você investiu.',
          'Quanto maior o prazo, mais a bola de neve cresce.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⏰ Regra dos 72: divida 72 pela taxa anual para saber em quantos anos seu dinheiro dobra. Taxa 10% → dobra em ~7,2 anos.',
      },
      {
        type: 'quiz',
        question: 'Qual é a diferença entre juros simples e compostos?',
        options: [
          { id: 'a', text: 'Simples é mais rápido; compostos são mais lentos', correct: false },
          { id: 'b', text: 'Compostos incidem sobre o saldo total (capital + juros anteriores); simples só sobre o capital inicial', correct: true },
          { id: 'c', text: 'São iguais no longo prazo', correct: false },
          { id: 'd', text: 'Simples é exclusivo de renda variável', correct: false },
        ],
        explanation: 'Juros simples: sempre calculados sobre o valor inicial. Juros compostos: calculados sobre o saldo atual (que já inclui os juros anteriores). Por isso os compostos crescem exponencialmente e os simples, linearmente.',
      },
      {
        type: 'quiz',
        question: 'Pela Regra dos 72, quanto tempo leva para R$ 10.000 dobrarem a 8% ao ano?',
        options: [
          { id: 'a', text: '8 anos', correct: false },
          { id: 'b', text: '12 anos', correct: false },
          { id: 'c', text: '9 anos', correct: true },
          { id: 'd', text: '72 anos', correct: false },
        ],
        explanation: '72 ÷ 8 = 9 anos. A Regra dos 72 é uma aproximação prática: divida 72 pela taxa anual para estimar o tempo de dobramento. A 8% ao ano, R$ 10.000 viram R$ 20.000 em ~9 anos.',
      },
      {
        type: 'quiz',
        question: 'Ana investe R$ 300/mês por 30 anos a 10% a.a. Ela colocou R$ 108.000 do bolso. Qual será o valor final aproximado?',
        options: [
          { id: 'a', text: 'R$ 120.000 — crescimento pequeno', correct: false },
          { id: 'b', text: 'R$ 216.000 — dobrou o investido', correct: false },
          { id: 'c', text: 'R$ 680.000 — juros compostos por 30 anos', correct: true },
          { id: 'd', text: 'R$ 108.000 — não rendeu nada', correct: false },
        ],
        explanation: 'Com juros compostos por 30 anos, o resultado é muito maior que o dobro. Ana colocou R$ 108.000 e os juros geraram aproximadamente R$ 572.000 — mais de 5x o que ela investiu. O tempo é o maior aliado do investidor.',
      },
    ],
  },

  '1.5': {
    id: '1.5', title: 'Seu perfil de investidor', emoji: '🪞', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '🪞',
        text: [
          'Antes de escolher onde investir, você precisa se conhecer como investidor.',
          'Não existe carteira certa para todo mundo — existe a carteira certa **para você**, considerando seu perfil, objetivos e tolerância a risco.',
          'Os três perfis clássicos são: **Conservador**, **Moderado** e **Arrojado**.',
        ],
      },
      {
        type: 'content', emoji: '🛡️',
        text: [
          '**Conservador 🛡️** — prioriza segurança acima de tudo.',
          'Prefere saber exatamente quanto vai receber. Aceita rentabilidade menor em troca de tranquilidade.',
          'Carteira típica: 80% renda fixa (Selic, CDB, LCI) + 20% renda variável de baixo risco.',
        ],
      },
      {
        type: 'content', emoji: '⚖️',
        text: [
          '**Moderado ⚖️** — equilibra segurança e crescimento.',
          'Aceita alguma volatilidade desde que o retorno compense no longo prazo.',
          'Carteira típica: 50% renda fixa + 30% ações/FIIs + 20% ETFs.',
        ],
      },
      {
        type: 'content', emoji: '🚀',
        text: [
          '**Arrojado 🚀** — foca em máximo crescimento no longo prazo.',
          'Aceita oscilações fortes, sabe que pode perder no curto prazo mas acredita no longo.',
          'Carteira típica: 20% renda fixa (só reserva de emergência) + 80% renda variável (ações, FIIs, ETFs, cripto).',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Seu perfil pode mudar com o tempo. Quem começa conservador tende a ficar mais arrojado conforme aprende e ganha confiança. Reavalie anualmente.',
      },
      {
        type: 'quiz',
        question: 'O mercado caiu 20% em um mês. Você tem ações. O que o perfil conservador faria?',
        options: [
          { id: 'a', text: 'Nada — conservadores não têm ações', correct: false },
          { id: 'b', text: 'Vender tudo para evitar mais perdas', correct: false },
          { id: 'c', text: 'Provavelmente já alocou pouco em ações — o impacto na carteira é limitado', correct: true },
          { id: 'd', text: 'Comprar mais aproveitando a queda', correct: false },
        ],
        explanation: 'O conservador protege o patrimônio alocando pouco em renda variável. Uma queda de 20% nas ações impacta muito menos quem tem só 10–20% da carteira em renda variável do que quem tem 80%.',
      },
      {
        type: 'quiz',
        question: 'Carlos tem 25 anos, emprego estável, sem dívidas e investe pensando em 30 anos. Qual perfil faz mais sentido?',
        options: [
          { id: 'a', text: 'Conservador — mais seguro', correct: false },
          { id: 'b', text: 'Moderado — equilíbrio sempre é bom', correct: false },
          { id: 'c', text: 'Arrojado — longo prazo e estabilidade permitem aceitar mais risco', correct: true },
          { id: 'd', text: 'Não precisa investir ainda', correct: false },
        ],
        explanation: 'Com 30 anos de horizonte e sem dependentes ou dívidas, Carlos pode atravessar crises sem precisar sacar. O tempo é o principal fator que permite ser arrojado — quedas de curto prazo não importam quando o objetivo está décadas à frente.',
      },
    ],
  },

  '1.boss': {
    id: '1.boss', title: 'BOSS: Monte sua primeira carteira', emoji: '🏆', xpReward: 100,
    steps: [
      {
        type: 'content', emoji: '⚔️',
        text: [
          'Chegou a hora do boss final da Trilha 1. Você aprendeu os fundamentos — agora vai montar uma carteira real.',
          'Uma boa primeira carteira tem três pilares: **reserva de emergência**, **proteção da inflação** e **crescimento de longo prazo**.',
          'Vamos passar por cada um.',
        ],
      },
      {
        type: 'content', emoji: '🏦',
        text: [
          '**Pilar 1 — Reserva de emergência (3 a 6 meses de gastos)**',
          'Antes de qualquer investimento, você precisa de uma reserva para imprevistos.',
          'Onde guardar: **Tesouro Selic** ou **CDB com liquidez diária**. Nada mais.',
          'Essa reserva não é investimento — é proteção. Ela não pode estar em ações ou qualquer coisa que oscile.',
        ],
      },
      {
        type: 'content', emoji: '🛡️',
        text: [
          '**Pilar 2 — Proteção da inflação (médio/longo prazo)**',
          'Dinheiro parado perde valor com a inflação. Depois da reserva, proteja o restante.',
          'Opções: **Tesouro IPCA+** para longo prazo, **LCI/LCA** para 1–3 anos.',
          'Objetivo: fazer seu dinheiro crescer pelo menos acima da inflação.',
        ],
      },
      {
        type: 'content', emoji: '📈',
        text: [
          '**Pilar 3 — Crescimento (longo prazo)**',
          'Com reserva e proteção feitas, é hora de buscar retorno maior.',
          '**ETFs** (BOVA11, IVVB11) para diversificação automática.',
          '**FIIs** para renda passiva mensal isenta de IR.',
          'Comece pequeno — 10 a 20% da carteira — e aumente conforme aprende.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🏆 Carteira sugerida para iniciante: 30% Tesouro Selic (reserva) + 30% Tesouro IPCA+ + 25% BOVA11/IVVB11 + 15% FIIs. Simples, diversificada e eficiente.',
      },
      {
        type: 'quiz',
        question: 'Qual deve ser o PRIMEIRO passo antes de qualquer investimento?',
        options: [
          { id: 'a', text: 'Comprar ações da empresa que você mais usa', correct: false },
          { id: 'b', text: 'Montar a reserva de emergência em liquidez diária', correct: true },
          { id: 'c', text: 'Investir em cripto para ganhar rápido e depois montar a base', correct: false },
          { id: 'd', text: 'Abrir conta em vários bancos', correct: false },
        ],
        explanation: 'A reserva de emergência é a base de tudo. Sem ela, qualquer imprevisto (perda de emprego, doença, conserto do carro) vai forçar você a vender investimentos na hora errada — possivelmente no prejuízo.',
      },
      {
        type: 'quiz',
        question: 'Fernanda tem R$ 5.000 de reserva, R$ 2.000 sobrando e perfil moderado. Como distribuir os R$ 2.000?',
        options: [
          { id: 'a', text: 'Tudo em cripto — maior potencial', correct: false },
          { id: 'b', text: 'Tudo na poupança — mais seguro', correct: false },
          { id: 'c', text: 'R$ 1.000 Tesouro IPCA+ + R$ 600 BOVA11 + R$ 400 FII', correct: true },
          { id: 'd', text: 'Guardar em casa — não confia no mercado', correct: false },
        ],
        explanation: 'Com reserva já feita e perfil moderado, Fernanda pode dividir: parte em renda fixa de longo prazo (proteção da inflação) e parte em renda variável diversificada (ETF + FII). Simples e equilibrado.',
      },
      {
        type: 'quiz',
        question: 'Por que FIIs são bons para uma primeira carteira de renda variável?',
        options: [
          { id: 'a', text: 'Porque têm risco zero', correct: false },
          { id: 'b', text: 'Porque pagam dividendos mensais isentos de IR e custam poucos reais por cota', correct: true },
          { id: 'c', text: 'Porque são garantidos pelo governo', correct: false },
          { id: 'd', text: 'Porque o preço nunca cai', correct: false },
        ],
        explanation: 'FIIs têm dividendos mensais isentos de IR (ótimo para renda passiva), cotas acessíveis (geralmente abaixo de R$ 150) e diversificação automática dentro do fundo. São um ótimo primeiro passo em renda variável.',
      },
    ],
  },

  '1.4': {
    id: '1.4',
    title: 'Inflação — o ladrão silencioso',
    emoji: '💸',
    xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '🍬',
        text: [
          'Imagina que hoje você pode comprar **10 balas** com R$ 1,00.',
          'Daqui a um ano, com o mesmo R$ 1,00 você consegue comprar só **9 balas**.',
          'Você não gastou nada. O dinheiro está lá. Mas ele compra menos. Isso é **inflação**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Inflação = os preços sobem com o tempo e seu dinheiro perde força.',
      },
      {
        type: 'content', emoji: '📩',
        text: [
          'Carla juntou R$ 5.000 e deixou em casa por 1 ano.',
          'O envelope ainda tem R$ 5.000. Mas a inflação foi de 5%.',
          'Aquilo que custava R$ 5.000 agora custa **R$ 5.250**.',
          '**Carla perdeu R$ 250 sem gastar nada!**',
        ],
      },
      {
        type: 'quiz',
        question: 'O que acontece com R$ 1.000 em casa por 1 ano com inflação de 6%?',
        options: [
          { id: 'a', text: 'O dinheiro some — alguém pode roubar', correct: false },
          { id: 'b', text: 'Fica do mesmo jeito — R$ 1.000 é R$ 1.000', correct: false },
          { id: 'c', text: 'Compra menos — vale só R$ 940 em poder de compra', correct: true },
          { id: 'd', text: 'Cresce — dinheiro parado não perde', correct: false },
        ],
        explanation: 'O número não muda, mas o que você compra com ele diminui. Com 6% de inflação, precisaria de R$ 1.060 para comprar o mesmo de antes. Perdeu R$ 60 de poder de compra sem gastar nada.',
      },
      {
        type: 'quiz',
        question: 'A poupança rendeu 4% e a inflação foi 5%. Você ficou:',
        options: [
          { id: 'a', text: 'Mais rico — ganhou 4%', correct: false },
          { id: 'b', text: 'Igual — pelo menos não perdeu', correct: false },
          { id: 'c', text: 'Mais pobre — rendimento real foi -1%', correct: true },
          { id: 'd', text: 'Muito rico — poupança sempre protege', correct: false },
        ],
        explanation: 'Rendimento real = 4% − 5% = -1%. Mesmo ganhando 4%, a inflação comeu tudo e mais um pouco. O número subiu, mas o que você compra caiu.',
      },
    ],
  },

  '1.6': {
    id: '1.6',
    title: 'O número mágico dos dividendos',
    emoji: '🔄',
    xpReward: 60,
    steps: [
      {
        type: 'content', emoji: '🏢',
        text: [
          'Imagine que você compra uma pequena fatia de uma empresa. Essa fatia se chama **ação** (ou **cota**, no caso de fundos).',
          'Quando a empresa lucra, ela divide parte desse lucro com os donos. Esse dinheiro que cai na sua conta se chama **dividendo**.',
          'É como ser sócio de uma pizzaria e receber parte do lucro todo mês — sem precisar trabalhar lá.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Dividendo = parte do lucro da empresa que vai direto para o seu bolso, só por ser dono de ações ou cotas.',
      },
      {
        type: 'content', emoji: '🔢',
        text: [
          'Aqui começa o jogo interessante. Imagine o **MXRF11**, um fundo imobiliário que custa R$ 10 por cota e paga R$ 0,10 de dividendo por cota todo mês.',
          'Se você tem **100 cotas**, recebe: 100 × R$ 0,10 = **R$ 10,00** de dividendo.',
          'Esse R$ 10,00 é exatamente o preço de **1 nova cota**.',
          'Ou seja: com 100 cotas, o dividendo mensal já paga **1 cota nova por mês** — sem você colocar mais dinheiro!',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🔢 Número mágico = Preço da cota ÷ Dividendo mensal por cota. Se custa R$ 10 e paga R$ 0,10 → número mágico = 100.',
      },
      {
        type: 'content', emoji: '📊',
        text: [
          '**HGLG11** — cota R$ 160, dividendo R$ 1,60/mês → número mágico = **100 cotas** → dividendo compra 1 cota/mês.',
          '**TAEE11** — cota R$ 40, dividendo R$ 0,40/mês → número mágico = **100 cotas** → dividendo compra 1 cota/mês.',
          '**BBAS3** — ação R$ 25, dividendo R$ 0,25/trimestre → número mágico = **100 ações** → dividendo compra 1 ação por trimestre.',
          'Percebeu? Quando o dividend yield é **1% ao mês**, o número mágico é sempre 100 — não importa o preço.',
        ],
      },
      {
        type: 'content', emoji: '❄️',
        text: [
          'Agora imagine o que acontece quando você **reinveste** esses dividendos em vez de gastar.',
          '**Mês 1:** 100 cotas → R$ 10 de dividendo → compra 1 cota → agora tem **101 cotas**.',
          '**Mês 2:** 101 cotas → R$ 10,10 de dividendo → compra 1 cota → agora tem **102 cotas**.',
          'Com o tempo, os dividendos pagam **mais de 1 cota por mês automaticamente**. Isso é o **efeito bola de neve**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⚡ Dividendo reinvestido → mais cotas → mais dividendo → mais cotas. O tempo faz o trabalho pesado por você.',
      },
      {
        type: 'quiz',
        question: 'Uma cota custa R$ 20 e paga R$ 0,20 de dividendo por mês. Quantas cotas você precisa para o dividendo comprar 1 cota nova todo mês?',
        options: [
          { id: 'a', text: '20 cotas', correct: false },
          { id: 'b', text: '50 cotas', correct: false },
          { id: 'c', text: '100 cotas', correct: true },
          { id: 'd', text: '200 cotas', correct: false },
        ],
        explanation: 'Número mágico = R$ 20 ÷ R$ 0,20 = 100. Com 100 cotas você recebe 100 × R$ 0,20 = R$ 20 de dividendo — exatamente o preço de 1 nova cota.',
      },
      {
        type: 'quiz',
        question: 'Pedro tem 100 cotas do MXRF11 (R$ 10 cada, dividendo R$ 0,10/mês) e reinveste tudo. Após 2 meses, quantas cotas ele tem?',
        options: [
          { id: 'a', text: '100 cotas — dividendo não compra cota', correct: false },
          { id: 'b', text: '101 cotas — só ganhou no primeiro mês', correct: false },
          { id: 'c', text: '102 cotas', correct: true },
          { id: 'd', text: '110 cotas', correct: false },
        ],
        explanation: 'Mês 1: 100 cotas → R$ 10 de dividendo → compra 1 cota → 101 cotas. Mês 2: 101 cotas → R$ 10,10 de dividendo → compra 1 cota → 102 cotas. A bola de neve começa devagar, mas acelera com o tempo.',
      },
      {
        type: 'quiz',
        question: 'TAEE11 custa R$ 40 e paga R$ 0,40/mês. Qual é o número mágico e o que ele significa?',
        options: [
          { id: 'a', text: '40 cotas — com 40 cotas você recebe R$ 40 de dividendo', correct: false },
          { id: 'b', text: '100 cotas — com 100 cotas o dividendo paga 1 cota nova por mês', correct: true },
          { id: 'c', text: '400 cotas — precisa de muito mais para fazer diferença', correct: false },
          { id: 'd', text: '10 cotas — basta pouco para reinvestir', correct: false },
        ],
        explanation: 'Número mágico = R$ 40 ÷ R$ 0,40 = 100. Com 100 cotas → dividendo de R$ 40/mês → compra exatamente 1 nova cota. O padrão é sempre 100 quando o yield é 1% ao mês.',
      },
      {
        type: 'quiz',
        question: 'O que significa "reinvestir dividendos"?',
        options: [
          { id: 'a', text: 'Guardar o dinheiro do dividendo na poupança', correct: false },
          { id: 'b', text: 'Pagar imposto sobre o dividendo recebido', correct: false },
          { id: 'c', text: 'Usar o dividendo para comprar mais cotas do mesmo ativo', correct: true },
          { id: 'd', text: 'Esperar 1 ano para receber o dividendo acumulado', correct: false },
        ],
        explanation: 'Reinvestir = usar o dividendo recebido para comprar mais cotas. Mais cotas geram mais dividendo no próximo mês. Com o tempo, o efeito bola de neve acelera o crescimento da sua carteira sem você precisar aportar mais.',
      },
    ],
  },

  // ─── Trilha 2 — Renda Fixa

  '2.1': {
    id: '2.1', title: 'O que é Renda Fixa?', emoji: '🤝', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '🤝',
        text: [
          'Imagina que seu amigo precisa de R$ 1.000 emprestado e promete te devolver R$ 1.100 em 1 ano.',
          'Você emprestou dinheiro, correu um risco calculado, e vai receber o seu de volta **com juros**.',
          'Renda fixa funciona assim — mas em vez de um amigo, você empresta para o **governo, bancos ou empresas**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Renda Fixa = você empresta dinheiro e sabe quanto vai receber de volta. O retorno é previsível desde o início.',
      },
      {
        type: 'content', emoji: '🏛️',
        text: [
          '**Tesouro Direto** — você empresta para o governo federal. É o investimento mais seguro do Brasil.',
          '**CDB** — você empresta para um banco. Rende mais que poupança e tem garantia do FGC.',
          '**LCI / LCA** — você empresta para bancos financiarem imóveis ou agronegócio. **Isento de Imposto de Renda.**',
        ],
      },
      {
        type: 'content', emoji: '📊',
        text: [
          'A grande vantagem da renda fixa é a **previsibilidade**. Você sabe antes de investir quanto vai receber.',
          'Na renda variável (ações), o retorno depende do mercado — pode subir muito ou cair.',
          'Para começar, a renda fixa é o lugar certo: **segurança + retorno melhor que a poupança**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🏦 A poupança rende cerca de 6% a.a. Um bom CDB rende 100% do CDI — hoje em torno de 10,5% a.a. Quase o dobro.',
      },
      {
        type: 'quiz',
        question: 'O que define um investimento como "renda fixa"?',
        options: [
          { id: 'a', text: 'O dinheiro não rende nada — fica parado', correct: false },
          { id: 'b', text: 'O retorno é previsível — você sabe quanto vai ganhar antes de investir', correct: true },
          { id: 'c', text: 'Só bancos grandes podem oferecer', correct: false },
          { id: 'd', text: 'O dinheiro fica preso por pelo menos 5 anos', correct: false },
        ],
        explanation: 'Em renda fixa, a "regra do jogo" é definida no momento da aplicação. Você sabe a taxa, o prazo e quanto vai receber. É o oposto da renda variável, onde o retorno depende do mercado.',
      },
      {
        type: 'quiz',
        question: 'Ana quer emprestar dinheiro ao governo federal. Qual produto ela deve usar?',
        options: [
          { id: 'a', text: 'CDB', correct: false },
          { id: 'b', text: 'LCI', correct: false },
          { id: 'c', text: 'Tesouro Direto', correct: true },
          { id: 'd', text: 'Poupança', correct: false },
        ],
        explanation: 'Tesouro Direto é o programa do governo federal para vender seus títulos diretamente ao investidor. Quando você compra, está literalmente emprestando dinheiro para o Brasil.',
      },
    ],
  },

  '2.2': {
    id: '2.2', title: 'Tesouro Direto', emoji: '🇧🇷', xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '🇧🇷',
        text: [
          'O **Tesouro Direto** é um programa criado em 2002 para que pessoas físicas possam emprestar dinheiro ao governo federal.',
          'Em troca, o governo te devolve o dinheiro com juros no prazo combinado.',
          'É considerado o investimento **mais seguro do Brasil** — o mesmo governo que imprime o dinheiro.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🛡️ Tesouro Direto é garantido pelo Governo Federal. Tecnicamente o risco mais baixo possível em território brasileiro.',
      },
      {
        type: 'content', emoji: '3️⃣',
        text: [
          '**Tesouro Selic** — rende a taxa Selic (~10,5% a.a.). Liquidez diária. Ideal para **reserva de emergência**.',
          '**Tesouro IPCA+** — rende inflação + taxa fixa (ex: IPCA + 6%). Protege da inflação. Ideal para **longo prazo**.',
          '**Tesouro Prefixado** — taxa fixa travada na compra (ex: 12% a.a.). Você sabe exatamente quanto vai receber.',
        ],
      },
      {
        type: 'content', emoji: '🎯',
        text: [
          '**Reserva de emergência?** Tesouro Selic. Liquidez diária — você resgata amanhã sem perder rendimento.',
          '**Aposentadoria?** Tesouro IPCA+. Garante crescimento acima da inflação por décadas.',
          '**Apostando na queda de juros?** Tesouro Prefixado. Trava a taxa alta antes que ela caia.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⚠️ Tesouro Prefixado e IPCA+ podem ter rentabilidade negativa se vendidos antes do vencimento. O Selic não — por isso é o mais indicado para quem pode precisar do dinheiro.',
      },
      {
        type: 'quiz',
        question: 'Maria quer montar sua reserva de emergência no Tesouro. Qual tipo ela deve escolher?',
        options: [
          { id: 'a', text: 'Tesouro Prefixado — taxa garantida', correct: false },
          { id: 'b', text: 'Tesouro IPCA+ — protege da inflação', correct: false },
          { id: 'c', text: 'Tesouro Selic — liquidez diária sem risco de perda', correct: true },
          { id: 'd', text: 'Qualquer um — todos têm liquidez diária', correct: false },
        ],
        explanation: 'O Tesouro Selic é o único que garante liquidez diária sem risco de rentabilidade negativa. Para reserva de emergência você precisa do dinheiro a qualquer momento — o Selic é ideal para isso.',
      },
      {
        type: 'quiz',
        question: 'João quer proteger R$ 50.000 da inflação pelos próximos 20 anos. Qual Tesouro é mais indicado?',
        options: [
          { id: 'a', text: 'Tesouro Selic — mais seguro', correct: false },
          { id: 'b', text: 'Tesouro IPCA+ — garante retorno real acima da inflação', correct: true },
          { id: 'c', text: 'Tesouro Prefixado — taxa fixa garantida', correct: false },
          { id: 'd', text: 'Nenhum — melhor na poupança', correct: false },
        ],
        explanation: 'O Tesouro IPCA+ paga inflação + taxa real. Não importa se a inflação for 3% ou 15%, seu dinheiro sempre cresce acima dela. Perfeito para objetivos de longo prazo.',
      },
    ],
  },

  '2.3': {
    id: '2.3', title: 'CDB — o banco te pagando', emoji: '🏦', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '🏦',
        text: [
          '**CDB** significa Certificado de Depósito Bancário. Quando você compra, está **emprestando dinheiro para o banco**.',
          'O banco usa esse dinheiro para fazer empréstimos — e te paga juros por isso.',
          'É como se você fosse o banco da pessoa física: recebe juros de quem pega emprestado.',
        ],
      },
      {
        type: 'content', emoji: '📈',
        text: [
          'A maioria dos CDBs rende um **percentual do CDI**. O CDI fica muito próximo da Selic (~10,5%).',
          '**CDB 100% CDI** → rende ~10,5% a.a.',
          '**CDB 110% CDI** → rende ~11,55% a.a. (bancos menores pagam mais para atrair clientes)',
          '**CDB 80% CDI** → rende ~8,4% a.a. — pior que o Tesouro Selic, evite.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🛡️ FGC (Fundo Garantidor de Créditos): garante até R$ 250.000 por CPF por instituição em caso de falência. Seu dinheiro está protegido mesmo em banco menor.',
      },
      {
        type: 'content', emoji: '💸',
        text: [
          'O CDB tem **Imposto de Renda** na tabela regressiva:',
          'Até 180 dias → **22,5%** | Até 360 dias → **20%** | Até 720 dias → **17,5%** | Acima → **15%**',
          'Quanto mais tempo investido, menos IR você paga. Prefira CDBs com prazo acima de 2 anos.',
        ],
      },
      {
        type: 'quiz',
        question: 'Um CDB paga 110% do CDI e o CDI está em 10%. Qual é o retorno bruto anual?',
        options: [
          { id: 'a', text: '10% a.a.', correct: false },
          { id: 'b', text: '11% a.a.', correct: true },
          { id: 'c', text: '110% a.a.', correct: false },
          { id: 'd', text: '1,1% a.a.', correct: false },
        ],
        explanation: '110% de 10% = 11%. Bancos menores costumam pagar mais que 100% do CDI para atrair clientes — e ainda têm a proteção do FGC até R$ 250 mil.',
      },
      {
        type: 'quiz',
        question: 'Pedro investiu num CDB e precisa resgatar após 6 meses. Qual alíquota de IR ele vai pagar?',
        options: [
          { id: 'a', text: '15%', correct: false },
          { id: 'b', text: '17,5%', correct: false },
          { id: 'c', text: '20%', correct: false },
          { id: 'd', text: '22,5%', correct: true },
        ],
        explanation: 'Até 180 dias (6 meses) o IR é de 22,5% — a alíquota mais alta. Por isso CDBs são mais vantajosos no longo prazo: acima de 720 dias a alíquota cai para 15%.',
      },
    ],
  },

  '2.4': {
    id: '2.4', title: 'LCI e LCA — sem pagar imposto', emoji: '🏠', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '🏠',
        text: [
          '**LCI** = Letra de Crédito Imobiliário. O banco usa seu dinheiro para financiar imóveis.',
          '**LCA** = Letra de Crédito do Agronegócio. O banco usa para financiar o setor agrícola.',
          'Para o investidor são muito parecidas — a diferença é apenas o destino do dinheiro.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🎯 A grande vantagem: LCI e LCA são isentas de Imposto de Renda para pessoa física. Você recebe o rendimento 100% líquido.',
      },
      {
        type: 'content', emoji: '⚖️',
        text: [
          'Um CDB 100% CDI (10,5% bruto) vira ~8,9% líquido após 15% de IR.',
          'Uma LCI 88% CDI (9,24% bruto) = **9,24% líquido** — mais que o CDB!',
          'Regra prática: se a LCI/LCA pagar pelo menos **85% do CDI**, já bate um CDB 100% CDI no longo prazo.',
        ],
      },
      {
        type: 'content', emoji: '⏳',
        text: [
          'A desvantagem: LCI e LCA têm **prazo de carência mínimo** — geralmente 90 dias.',
          'Você não pode resgatar antes desse prazo. Por isso, **não use para reserva de emergência**.',
          'Para dinheiro que você não vai precisar por pelo menos 3 meses, são excelentes.',
        ],
      },
      {
        type: 'quiz',
        question: 'Por que LCI pode ser mais vantajosa que CDB mesmo pagando uma taxa menor?',
        options: [
          { id: 'a', text: 'Porque tem prazo menor', correct: false },
          { id: 'b', text: 'Porque é isenta de IR — o rendimento líquido pode ser maior', correct: true },
          { id: 'c', text: 'Porque é garantida pelo governo', correct: false },
          { id: 'd', text: 'Porque rende acima do CDI sempre', correct: false },
        ],
        explanation: 'CDB 100% CDI paga ~10,5% bruto, mas após 15% de IR vira ~8,9% líquido. Uma LCI 88% CDI paga ~9,24% — já isento. Mesmo com taxa menor no papel, o LCI vence no bolso.',
      },
      {
        type: 'quiz',
        question: 'Carlos quer montar sua reserva de emergência. Por que LCI/LCA NÃO é a melhor opção?',
        options: [
          { id: 'a', text: 'Porque rende menos que a poupança', correct: false },
          { id: 'b', text: 'Porque tem carência mínima — pode não conseguir resgatar quando precisar', correct: true },
          { id: 'c', text: 'Porque não tem proteção do FGC', correct: false },
          { id: 'd', text: 'Porque é muito arriscado', correct: false },
        ],
        explanation: 'LCI e LCA têm carência mínima (geralmente 90 dias). Reserva de emergência precisa estar disponível a qualquer momento — Tesouro Selic ou CDB com liquidez diária são melhores para esse fim.',
      },
    ],
  },

  '2.5': {
    id: '2.5', title: 'Como comparar e escolher', emoji: '⚖️', xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '🧮',
        text: [
          'Você está na corretora e vê: **CDB 108% CDI** vs **LCI 90% CDI**. Qual escolher?',
          'Parece que o CDB ganha — mas precisa descontar o IR antes de comparar.',
          'A fórmula é simples: **Taxa líquida CDB = taxa bruta × (1 − alíquota IR)**',
        ],
      },
      {
        type: 'content', emoji: '📊',
        text: [
          'Exemplo com CDI em 10,5% e IR de 15% (prazo > 2 anos):',
          '**CDB 108% CDI** → 11,34% bruto → × 0,85 = **9,64% líquido**',
          '**LCI 90% CDI** → 9,45% bruto → já líquido = **9,45% líquido**',
          'Nesse caso o **CDB ganha** mesmo após o IR. Compare sempre no líquido!',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '📐 LCI equivalente ao CDB = taxa do CDB × (1 − IR). CDB 108% com IR 15%: 108% × 0,85 = 91,8% CDI. Qualquer LCI acima de 91,8% já é melhor.',
      },
      {
        type: 'content', emoji: '🗓️',
        text: [
          'O IR também muda com o **prazo**: até 180 dias = 22,5% | até 360 dias = 20% | até 720 dias = 17,5% | acima = 15%',
          'Para prazos curtos (menos de 6 meses), o IR é tão alto que a LCI quase sempre ganha.',
          'Para prazos longos (2+ anos), o CDB começa a competir melhor com a LCI.',
        ],
      },
      {
        type: 'quiz',
        question: 'CDI em 10%. CDB paga 105% CDI com IR de 20% (prazo 1 ano). Qual é o retorno líquido?',
        options: [
          { id: 'a', text: '10,5%', correct: false },
          { id: 'b', text: '8,4%', correct: true },
          { id: 'c', text: '10%', correct: false },
          { id: 'd', text: '7,35%', correct: false },
        ],
        explanation: 'CDB 105% do CDI = 10,5% bruto. Com IR de 20%: 10,5% × (1 - 0,20) = 10,5% × 0,80 = 8,4% líquido.',
      },
      {
        type: 'quiz',
        question: 'Para investimento de 6 meses, por que a LCI costuma ganhar do CDB mesmo pagando taxa menor?',
        options: [
          { id: 'a', text: 'Porque a LCI não tem risco de crédito', correct: false },
          { id: 'b', text: 'Porque em 6 meses o CDB paga 22,5% de IR — o maior percentual da tabela', correct: true },
          { id: 'c', text: 'Porque a LCI tem liquidez diária', correct: false },
          { id: 'd', text: 'Porque o CDB tem IOF nos primeiros meses', correct: false },
        ],
        explanation: 'Em até 180 dias, o IR do CDB é 22,5% — a alíquota máxima. Isso corrói muito o rendimento. Uma LCI isenta de IR, mesmo pagando taxa menor, costuma sair na frente no líquido.',
      },
    ],
  },

  '2.boss': {
    id: '2.boss', title: 'BOSS: Monte sua carteira de renda fixa', emoji: '🏆', xpReward: 100,
    steps: [
      {
        type: 'content', emoji: '⚔️',
        text: [
          'Você chegou ao boss da trilha de Renda Fixa. Hora de testar tudo que aprendeu!',
          'Uma boa carteira de renda fixa combina **segurança, liquidez e rentabilidade** — cada produto tem seu papel.',
          'Regra de ouro: **primeiro a reserva de emergência, depois os investimentos**.',
        ],
      },
      {
        type: 'content', emoji: '🗂️',
        text: [
          '**Reserva de emergência (3-6 meses de gastos):** Tesouro Selic ou CDB com liquidez diária.',
          '**Médio prazo (1-3 anos):** LCI/LCA com boa taxa ou CDB acima de 100% do CDI.',
          '**Longo prazo (5+ anos):** Tesouro IPCA+ para crescer acima da inflação sempre.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🏆 Estratégia do investidor esperto: 1) monta reserva no Selic, 2) aproveita LCI/LCA para médio prazo, 3) Tesouro IPCA+ para objetivos longos.',
      },
      {
        type: 'quiz',
        question: 'Joana tem R$ 5.000 de reserva de emergência e R$ 3.000 sobrando que não vai precisar por 2 anos. Como distribuir?',
        options: [
          { id: 'a', text: 'Tudo no Tesouro IPCA+ — maior retorno', correct: false },
          { id: 'b', text: 'R$ 5.000 no Tesouro Selic + R$ 3.000 numa LCI de 2 anos', correct: true },
          { id: 'c', text: 'Tudo na poupança — mais seguro', correct: false },
          { id: 'd', text: 'Tudo no CDB de 5 anos — maior rentabilidade', correct: false },
        ],
        explanation: 'Reserva de emergência precisa de liquidez imediata → Tesouro Selic. O dinheiro que pode ficar parado por 2 anos vai melhor numa LCI (isenta de IR, sem necessidade de liquidez).',
      },
      {
        type: 'quiz',
        question: 'Pedro tem 30 anos e quer investir para a aposentadoria em 30 anos. Qual renda fixa faz mais sentido?',
        options: [
          { id: 'a', text: 'CDB de 6 meses renovando sempre', correct: false },
          { id: 'b', text: 'Tesouro Selic — mais seguro', correct: false },
          { id: 'c', text: 'Tesouro IPCA+ — garante retorno real acima da inflação por décadas', correct: true },
          { id: 'd', text: 'LCI de 1 ano renovando sempre', correct: false },
        ],
        explanation: 'Para 30 anos, a inflação é o maior risco. O Tesouro IPCA+ garante crescimento acima da inflação não importa o que aconteça — é o produto ideal para objetivos de muito longo prazo.',
      },
      {
        type: 'quiz',
        question: 'Qual investimento de renda fixa você NUNCA deve usar para reserva de emergência?',
        options: [
          { id: 'a', text: 'Tesouro Selic', correct: false },
          { id: 'b', text: 'CDB com liquidez diária', correct: false },
          { id: 'c', text: 'LCI com carência de 90 dias', correct: true },
          { id: 'd', text: 'Conta com rendimento diário', correct: false },
        ],
        explanation: 'LCI e LCA têm carência — você não consegue resgatar antes do prazo mínimo. Se uma emergência acontecer nos primeiros 90 dias, fica sem acesso ao dinheiro. Reserva de emergência precisa ser acessível sempre.',
      },
    ],
  },

  // ─── Trilha 3 — Renda Variável

  '3.1': {
    id: '3.1', title: 'O que são ações?', emoji: '🏢', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '🏢',
        text: [
          'Imagine que a Magazine Luiza precisa de dinheiro para abrir 200 novas lojas.',
          'Em vez de pegar emprestado no banco, ela divide a empresa em **milhões de pedaços** e vende para quem quiser.',
          'Cada pedaço é uma **ação**. Quem compra vira sócio da empresa.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Ação = fração de uma empresa. Comprar uma ação é se tornar sócio — pequeno, mas sócio.',
      },
      {
        type: 'content', emoji: '💰',
        text: [
          'Como sócio, você ganha de dois jeitos:',
          '**Valorização:** a ação sobe quando a empresa vai bem. Comprou por R$ 10, vendeu por R$ 15 → lucro de 50%.',
          '**Dividendos:** parte do lucro da empresa é distribuída para os acionistas — dinheiro caindo na conta.',
        ],
      },
      {
        type: 'content', emoji: '⚠️',
        text: [
          'Mas atenção: ações são **renda variável**. O preço sobe E cai.',
          'A empresa pode ir mal, o mercado pode entrar em pânico — e a ação cai.',
          'Por isso ações são para **longo prazo**: no curto prazo oscilam, no longo prazo empresas boas tendem a subir.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '📅 Historicamente, quem investiu no Ibovespa por 10+ anos nunca perdeu dinheiro. No curto prazo é diferente — volatilidade é o preço que você paga pela rentabilidade maior.',
      },
      {
        type: 'quiz',
        question: 'O que significa comprar uma ação de uma empresa?',
        options: [
          { id: 'a', text: 'Emprestar dinheiro para a empresa pagar depois', correct: false },
          { id: 'b', text: 'Se tornar sócio — ter uma fração da empresa', correct: true },
          { id: 'c', text: 'Contratar a empresa para trabalhar para você', correct: false },
          { id: 'd', text: 'Garantir um salário mensal da empresa', correct: false },
        ],
        explanation: 'Ação é participação societária. Você não empresta — você é dono de uma parte. Isso significa que participa dos lucros (dividendos) e também das perdas (queda de valor).',
      },
      {
        type: 'quiz',
        question: 'Carlos comprou ações da Petrobras por R$ 30 e vendeu por R$ 27. O que aconteceu?',
        options: [
          { id: 'a', text: 'Ganhou dividendos e ficou no lucro', correct: false },
          { id: 'b', text: 'Perdeu R$ 3 por ação — renda variável pode cair', correct: true },
          { id: 'c', text: 'A empresa vai à falência', correct: false },
          { id: 'd', text: 'Carlos vai receber a diferença de volta', correct: false },
        ],
        explanation: 'Em renda variável não há garantia. Carlos teve prejuízo de R$ 3 por ação (10% de perda). Por isso ações são investimento de longo prazo — no curto prazo a volatilidade pode gerar perdas.',
      },
    ],
  },

  '3.2': {
    id: '3.2', title: 'Como funciona a bolsa', emoji: '🏛️', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '🏛️',
        text: [
          'A **B3** é a bolsa de valores brasileira — a única do Brasil. Fica em São Paulo.',
          'É lá que compradores e vendedores de ações se encontram — como um mercado gigante, mas digital.',
          'Você não vai lá pessoalmente: tudo é feito pela internet, através de uma **corretora**.',
        ],
      },
      {
        type: 'content', emoji: '🔤',
        text: [
          'Cada empresa tem um **ticker** — um código de 4 letras. Ex: **PETR4** (Petrobras), **VALE3** (Vale), **ITUB4** (Itaú).',
          'O número indica o tipo: **3** = ação ordinária (ON), **4** = ação preferencial (PN), **11** = fundo (FII/ETF).',
          'Você usa o ticker para buscar e comprar na sua corretora.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⏰ O pregão (horário de funcionamento da B3) é das 10h às 17h em dias úteis. Fora desse horário você pode enviar ordens, mas só são executadas quando o mercado abre.',
      },
      {
        type: 'content', emoji: '📋',
        text: [
          '**Ordem a mercado** — compra pelo preço atual, executada imediatamente.',
          '**Ordem limitada** — você define o preço máximo que aceita pagar. Só executa se o preço chegar lá.',
          'Para iniciantes: ordem a mercado é mais simples. Ordem limitada é para quem quer controlar o preço de entrada.',
        ],
      },
      {
        type: 'quiz',
        question: 'Joana quer comprar ações do Itaú. Qual ticker ela deve pesquisar?',
        options: [
          { id: 'a', text: 'ITAU', correct: false },
          { id: 'b', text: 'ITUB4', correct: true },
          { id: 'c', text: 'BANCO4', correct: false },
          { id: 'd', text: 'BBITB3', correct: false },
        ],
        explanation: 'O ticker do Itaú Unibanco é ITUB4 — 4 letras da empresa + número do tipo (4 = preferencial). Tickers têm sempre 4 letras + 1 ou 2 números.',
      },
      {
        type: 'quiz',
        question: 'Pedro quer comprar PETR4 mas só se o preço for R$ 35 ou menos (hoje está R$ 37). O que ele deve usar?',
        options: [
          { id: 'a', text: 'Ordem a mercado — compra agora', correct: false },
          { id: 'b', text: 'Ordem limitada em R$ 35 — só executa se chegar no preço', correct: true },
          { id: 'c', text: 'Ordem stop', correct: false },
          { id: 'd', text: 'Não é possível fazer isso', correct: false },
        ],
        explanation: 'Ordem limitada permite definir o preço máximo que você aceita pagar. Se PETR4 cair para R$ 35, a ordem é executada automaticamente. Se não chegar, ela fica aguardando.',
      },
    ],
  },

  '3.3': {
    id: '3.3', title: 'FIIs — o tijolo que paga dividendo', emoji: '🏗️', xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '🏢',
        text: [
          '**FII** = Fundo de Investimento Imobiliário. É como comprar uma fração de um shopping, galpão ou edifício.',
          'Você não precisa comprar o imóvel inteiro — compra cotas por R$ 10, R$ 50 ou R$ 100.',
          'Os aluguéis recebidos pelo fundo são distribuídos **mensalmente** entre os cotistas.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🏠 FIIs são obrigados por lei a distribuir pelo menos 95% do lucro todo mês. É renda passiva mensal — como receber aluguel sem dor de cabeça de inquilino.',
      },
      {
        type: 'content', emoji: '📊',
        text: [
          '**Tijolo** — possui imóveis físicos (shoppings, galpões, hospitais). Renda vem dos aluguéis.',
          '**Papel** — investe em títulos financeiros do setor imobiliário (CRI, LCI). Renda vem dos juros.',
          '**Híbrido** — mistura dos dois tipos.',
        ],
      },
      {
        type: 'content', emoji: '🔢',
        text: [
          '**Dividend Yield (DY):** dividendo anual ÷ preço da cota. Ex: R$ 0,80/mês × 12 = R$ 9,60/ano. Cota a R$ 100 → DY = 9,6%.',
          '**P/VP:** preço da cota ÷ valor patrimonial. Abaixo de 1 = cota "barata" em relação aos ativos do fundo.',
          'FIIs com DY acima de 8% e P/VP abaixo de 1 costumam ser boas oportunidades.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🎯 Os dividendos dos FIIs são isentos de IR para pessoa física — assim como LCI/LCA, você recebe o rendimento mensal 100% líquido.',
      },
      {
        type: 'quiz',
        question: 'Um FII tem cotas a R$ 100 e paga R$ 0,90 por cota todo mês. Qual é o Dividend Yield anual?',
        options: [
          { id: 'a', text: '0,9%', correct: false },
          { id: 'b', text: '9%', correct: false },
          { id: 'c', text: '10,8%', correct: true },
          { id: 'd', text: '90%', correct: false },
        ],
        explanation: 'DY = (dividendo mensal × 12) ÷ preço da cota = (R$ 0,90 × 12) ÷ R$ 100 = R$ 10,80 ÷ R$ 100 = 10,8% ao ano.',
      },
      {
        type: 'quiz',
        question: 'Por que FIIs são vantajosos para quem quer renda passiva mensal?',
        options: [
          { id: 'a', text: 'Porque o preço das cotas nunca cai', correct: false },
          { id: 'b', text: 'Porque distribuem mensalmente e os dividendos são isentos de IR', correct: true },
          { id: 'c', text: 'Porque são garantidos pelo FGC', correct: false },
          { id: 'd', text: 'Porque rendem mais que qualquer outro investimento', correct: false },
        ],
        explanation: 'FIIs são obrigados a distribuir 95% do lucro todo mês e esses dividendos são isentos de IR para pessoa física. Uma fonte de renda passiva mensal previsível e eficiente do ponto de vista tributário.',
      },
    ],
  },

  '3.4': {
    id: '3.4', title: 'ETFs — a cesta de ações', emoji: '🧺', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '🧺',
        text: [
          'Escolher ações individuais é difícil — você precisa analisar cada empresa.',
          '**ETF** (Exchange Traded Fund) resolve isso: é um **fundo que replica um índice**, negociado na bolsa como uma ação.',
          'Comprar 1 cota de BOVA11 é como comprar um pedacinho das **87 maiores empresas do Brasil** de uma vez.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 ETF = diversificação automática. Em vez de escolher entre Petrobras, Vale e Itaú, você compra as três (e mais 84) com uma única compra.',
      },
      {
        type: 'content', emoji: '🌍',
        text: [
          '**BOVA11** — replica o Ibovespa (maiores empresas brasileiras). Exposição ao Brasil.',
          '**IVVB11** — replica o S&P 500 (500 maiores empresas americanas). Exposição aos EUA em reais.',
          '**SMAL11** — small caps brasileiras, empresas menores com mais potencial de crescimento.',
        ],
      },
      {
        type: 'content', emoji: '💰',
        text: [
          '**Baixo custo** — taxa de administração de 0,2% a 0,5% a.a. (muito menos que fundos ativos)',
          '**Diversificação automática** — você não depende de uma empresa ir bem',
          '**Acessível** — uma cota do BOVA11 custa cerca de R$ 100',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '📊 Estudos mostram que a maioria dos fundos geridos por profissionais perde para o índice no longo prazo. Comprar o índice via ETF costuma bater os "especialistas".',
      },
      {
        type: 'quiz',
        question: 'O que acontece com seu BOVA11 se a Petrobras, uma das maiores do Ibovespa, tiver um mês ruim?',
        options: [
          { id: 'a', text: 'Você perde tudo — Petrobras domina o índice', correct: false },
          { id: 'b', text: 'Impacto parcial — a queda é diluída pelas outras 86 empresas do índice', correct: true },
          { id: 'c', text: 'Não acontece nada — ETFs são protegidos de quedas', correct: false },
          { id: 'd', text: 'O ETF para de existir', correct: false },
        ],
        explanation: 'Diversificação é o superpoder do ETF. Mesmo que uma empresa caia 20%, ela representa apenas uma fração do índice. As outras empresas compensam parte da queda.',
      },
      {
        type: 'quiz',
        question: 'Ana quer investir no mercado americano sem precisar de conta no exterior. O que ela pode comprar na B3?',
        options: [
          { id: 'a', text: 'Ações da Apple diretamente', correct: false },
          { id: 'b', text: 'IVVB11 — ETF que replica o S&P 500, negociado em reais na B3', correct: true },
          { id: 'c', text: 'Dólar físico', correct: false },
          { id: 'd', text: 'Não é possível investir nos EUA pela B3', correct: false },
        ],
        explanation: 'IVVB11 é um ETF brasileiro que investe nas 500 maiores empresas americanas. Você compra em reais na B3 e tem exposição ao mercado americano — sem conta internacional.',
      },
    ],
  },

  '3.5': {
    id: '3.5', title: 'Como analisar uma ação', emoji: '🔍', xpReward: 50,
    steps: [
      {
        type: 'content', emoji: '🔍',
        text: [
          'Antes de comprar uma ação, você precisa entender se ela está **cara ou barata**.',
          'Não é o preço absoluto que importa — uma ação a R$ 5 pode ser cara, uma a R$ 200 pode ser barata.',
          'O que importa é o preço em **relação ao valor da empresa**.',
        ],
      },
      {
        type: 'content', emoji: '📊',
        text: [
          '**P/L (Preço/Lucro):** preço da ação ÷ lucro por ação. Diz em quantos anos a empresa pagaria seu investimento com o lucro atual.',
          'P/L 10 → empresa lucra 10% ao ano sobre o preço. P/L 30 → só 3,3% ao ano.',
          'Média histórica do Ibovespa: ~12. Quanto menor, mais barata em relação ao lucro.',
        ],
      },
      {
        type: 'content', emoji: '🏦',
        text: [
          '**P/VP (Preço/Valor Patrimonial):** preço ÷ patrimônio líquido por ação.',
          'P/VP = 1 → você paga exatamente o que a empresa vale "no papel".',
          'P/VP < 1 → comprando R$ 1 de patrimônio por menos de R$ 1. Pode ser oportunidade ou armadilha.',
        ],
      },
      {
        type: 'content', emoji: '💵',
        text: [
          '**Dividend Yield (DY):** dividendo anual ÷ preço da ação.',
          'DY 6% → para cada R$ 100 investidos, recebe R$ 6 em dividendos por ano.',
          'Empresas maduras e lucrativas (bancos, elétricas) tendem a ter DY mais alto.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⚠️ Nenhum indicador funciona isolado. Uma ação com P/L baixo pode estar barata porque a empresa está quebrando. Analise os indicadores juntos e entenda o negócio.',
      },
      {
        type: 'quiz',
        question: 'WEGE3 tem P/L de 35. PETR4 tem P/L de 8. O que isso indica?',
        options: [
          { id: 'a', text: 'Petrobras é melhor investimento que WEG', correct: false },
          { id: 'b', text: 'WEG é mais cara em relação ao lucro atual — mercado espera crescimento maior', correct: true },
          { id: 'c', text: 'Petrobras vai falir', correct: false },
          { id: 'd', text: 'WEG está com problemas financeiros', correct: false },
        ],
        explanation: 'P/L alto não significa empresa ruim — significa que o mercado paga um prêmio esperando crescimento futuro. WEG tem histórico de crescimento consistente. Contexto importa.',
      },
      {
        type: 'quiz',
        question: 'Um banco tem DY de 8% e P/VP de 1,2. O que esses números dizem?',
        options: [
          { id: 'a', text: 'O banco está quebrado e deve ser evitado', correct: false },
          { id: 'b', text: 'Paga 8% ao ano em dividendos e está 20% acima do valor contábil', correct: true },
          { id: 'c', text: 'O banco não tem lucro', correct: false },
          { id: 'd', text: 'Os dividendos serão cortados em breve', correct: false },
        ],
        explanation: 'DY 8% = R$ 8 em dividendos para cada R$ 100 investidos por ano. P/VP 1,2 = você paga R$ 1,20 por cada R$ 1,00 de patrimônio — um pequeno prêmio, comum em bancos sólidos.',
      },
      {
        type: 'quiz',
        question: 'Qual indicador compara o preço da ação com o lucro gerado pela empresa?',
        options: [
          { id: 'a', text: 'DY — Dividend Yield', correct: false },
          { id: 'b', text: 'P/VP — Preço sobre Valor Patrimonial', correct: false },
          { id: 'c', text: 'P/L — Preço sobre Lucro', correct: true },
          { id: 'd', text: 'CDI', correct: false },
        ],
        explanation: 'P/L (Preço/Lucro) diz quantos anos de lucro atual você está pagando pelo preço da ação. É o ponto de partida de qualquer análise fundamentalista.',
      },
    ],
  },

  '3.boss': {
    id: '3.boss', title: 'BOSS: Carteira diversificada', emoji: '🏆', xpReward: 120,
    steps: [
      {
        type: 'content', emoji: '⚔️',
        text: [
          'Boss final da trilha de Renda Variável. Aqui o buraco é mais embaixo.',
          'Uma carteira bem montada **diversifica entre classes, setores e geografias** — reduz risco sem sacrificar retorno.',
          'Nenhuma empresa, nenhum setor, nenhum país concentrado: se um travar, os outros continuam.',
        ],
      },
      {
        type: 'content', emoji: '🗂️',
        text: [
          'Exemplo de carteira para iniciante:',
          '**40% Renda Fixa** (Selic + IPCA+) — a âncora que protege',
          '**30% ETF Brasil** (BOVA11) — exposição ao crescimento brasileiro',
          '**20% FIIs** — renda passiva mensal isenta de IR',
          '**10% ETF Internacional** (IVVB11) — proteção cambial e acesso ao mercado americano',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🎯 Não existe carteira perfeita — existe a carteira certa para o SEU perfil, prazo e objetivo. O importante é começar e manter consistência.',
      },
      {
        type: 'quiz',
        question: 'Por que diversificar entre Brasil e exterior (IVVB11) protege sua carteira?',
        options: [
          { id: 'a', text: 'Porque ações americanas sempre sobem', correct: false },
          { id: 'b', text: 'Porque quando o Brasil vai mal, o exterior pode compensar — e vice-versa', correct: true },
          { id: 'c', text: 'Porque IVVB11 não paga IR', correct: false },
          { id: 'd', text: 'Porque a B3 é menos segura que bolsas internacionais', correct: false },
        ],
        explanation: 'Diversificação geográfica reduz o risco de concentração. Brasil e EUA não andam sempre juntos — quando a economia brasileira passa por crises, o mercado americano pode estar indo bem.',
      },
      {
        type: 'quiz',
        question: 'Ana tem perfil conservador mas quer começar em renda variável. Qual alocação faz mais sentido?',
        options: [
          { id: 'a', text: '100% ações individuais de alto risco', correct: false },
          { id: 'b', text: '80% renda fixa + 10% BOVA11 + 10% IVVB11 — exposição gradual', correct: true },
          { id: 'c', text: '100% cripto — maior potencial', correct: false },
          { id: 'd', text: '50% FIIs + 50% ações individuais', correct: false },
        ],
        explanation: 'Perfil conservador não significa zero renda variável — significa menos risco. Uma pequena fatia em ETFs (bem diversificados) adiciona potencial de retorno sem concentrar riscos.',
      },
      {
        type: 'quiz',
        question: 'O que é rebalanceamento de carteira?',
        options: [
          { id: 'a', text: 'Vender tudo e recomeçar do zero periodicamente', correct: false },
          { id: 'b', text: 'Ajustar as proporções para voltar à alocação original quando um ativo se distancia', correct: true },
          { id: 'c', text: 'Só comprar o ativo que mais subiu', correct: false },
          { id: 'd', text: 'Mudar a estratégia a cada mês', correct: false },
        ],
        explanation: 'Se sua meta é 40% renda fixa e ela cai para 30% (porque renda variável subiu), você rebalanceia: compra mais renda fixa para voltar aos 40%. Disciplina de rebalanceamento separa investidores sérios de especuladores.',
      },
    ],
  },

  // ─── Trilha 4 — Cripto

  '4.1': {
    id: '4.1', title: 'O que é cripto?', emoji: '₿', xpReward: 30,
    steps: [
      {
        type: 'content', emoji: '₿',
        text: [
          'Criptomoeda é um **dinheiro digital** que não depende de banco central ou governo.',
          'Existe só na internet, funciona em uma rede descentralizada e as transações são registradas publicamente.',
          'A primeira e mais famosa é o **Bitcoin**, criada em 2009 por uma pessoa (ou grupo) com o pseudônimo Satoshi Nakamoto.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Cripto = moeda digital descentralizada. Nenhum banco ou governo controla — a rede de computadores ao redor do mundo é quem valida as transações.',
      },
      {
        type: 'content', emoji: '🌍',
        text: [
          'Por que as pessoas se interessam por cripto?',
          '**Descentralização:** nenhum governo pode confiscar ou bloquear.',
          '**Escassez programada:** o Bitcoin tem um limite de 21 milhões de unidades — nunca existirão mais que isso.',
          '**Transferências globais:** você manda valor para qualquer lugar do mundo em minutos, sem intermediários.',
        ],
      },
      {
        type: 'content', emoji: '📊',
        text: [
          'Mas cripto também tem riscos sérios:',
          '**Volatilidade extrema:** Bitcoin já caiu 80% em um ano e subiu 1000% em outro.',
          '**Sem garantia:** não tem FGC como os bancos. Se perder o acesso, perdeu tudo.',
          '**Regulação incerta:** governos podem mudar regras a qualquer momento.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⚠️ Cripto é renda variável de alto risco. Nunca invista mais do que você está disposto a perder completamente. Para iniciantes: máximo 5-10% da carteira.',
      },
      {
        type: 'quiz',
        question: 'O que torna o Bitcoin diferente do Real ou do Dólar?',
        options: [
          { id: 'a', text: 'Bitcoin rende mais que qualquer investimento', correct: false },
          { id: 'b', text: 'Bitcoin é descentralizado — nenhum governo ou banco o controla', correct: true },
          { id: 'c', text: 'Bitcoin tem garantia do governo brasileiro', correct: false },
          { id: 'd', text: 'Bitcoin não pode ser comprado por brasileiros', correct: false },
        ],
        explanation: 'A descentralização é a principal inovação do Bitcoin. O Real é emitido e controlado pelo Banco Central. O Bitcoin é emitido por um protocolo matemático e validado por uma rede global — sem autoridade central.',
      },
      {
        type: 'quiz',
        question: 'Qual percentual máximo da carteira faz sentido para cripto em um perfil iniciante?',
        options: [
          { id: 'a', text: '50% — alto potencial de retorno', correct: false },
          { id: 'b', text: '100% — cripto é o futuro', correct: false },
          { id: 'c', text: '5-10% — alto risco exige exposição limitada', correct: true },
          { id: 'd', text: '0% — nunca deve entrar na carteira', correct: false },
        ],
        explanation: 'Cripto tem volatilidade extrema. Uma alocação pequena (5-10%) permite participar do potencial de valorização sem colocar em risco o patrimônio principal. Nunca invista o que você não pode perder.',
      },
    ],
  },

  '4.2': {
    id: '4.2', title: 'Bitcoin e Ethereum', emoji: '🔶', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '₿',
        text: [
          '**Bitcoin (BTC)** é o ouro digital. Foi criado como uma reserva de valor — como o ouro, é escasso (máximo 21 milhões) e resistente à censura.',
          'É a cripto mais antiga, mais conhecida e mais adotada institucionalmente.',
          'Seu principal caso de uso: **guardar valor** fora do sistema financeiro tradicional.',
        ],
      },
      {
        type: 'content', emoji: '🔶',
        text: [
          '**Ethereum (ETH)** é diferente: é uma plataforma de programação.',
          'Permite criar **contratos inteligentes** — programas que executam automaticamente quando condições são cumpridas.',
          'Em cima do Ethereum foram construídos: DeFi (finanças descentralizadas), NFTs, tokens de projetos.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🔑 Bitcoin = reserva de valor (ouro digital). Ethereum = plataforma de aplicações (internet do valor). São as duas maiores e mais consolidadas criptomoedas.',
      },
      {
        type: 'content', emoji: '📊',
        text: [
          'Juntos, BTC e ETH representam mais de 60% do mercado total de criptomoedas.',
          'O restante são **altcoins** — moedas alternativas. Algumas têm utilidade real, muitas são especulação pura.',
          'Regra prática: para iniciantes, só BTC e ETH. Altcoins têm risco muito maior.',
        ],
      },
      {
        type: 'quiz',
        question: 'Qual é a principal diferença entre Bitcoin e Ethereum?',
        options: [
          { id: 'a', text: 'Bitcoin é mais barato que Ethereum', correct: false },
          { id: 'b', text: 'Bitcoin é reserva de valor; Ethereum é plataforma para contratos e aplicações', correct: true },
          { id: 'c', text: 'Ethereum foi criado antes do Bitcoin', correct: false },
          { id: 'd', text: 'São idênticos — só o nome muda', correct: false },
        ],
        explanation: 'Bitcoin nasceu como dinheiro digital descentralizado e reserva de valor. Ethereum nasceu como plataforma de computação descentralizada — você pode programar aplicativos que rodam sem servidores centrais.',
      },
      {
        type: 'quiz',
        question: 'Por que altcoins têm mais risco que BTC e ETH para iniciantes?',
        options: [
          { id: 'a', text: 'Porque são ilegais no Brasil', correct: false },
          { id: 'b', text: 'Porque têm menor liquidez, menos adoção e maior chance de ir a zero', correct: true },
          { id: 'c', text: 'Porque não são aceitas em exchanges', correct: false },
          { id: 'd', text: 'Porque rendem menos', correct: false },
        ],
        explanation: 'BTC e ETH têm anos de histórico, bilhões em liquidez e adoção global. Altcoins menores podem perder 99% do valor ou simplesmente desaparecer. Para iniciantes, a segurança relativa de BTC/ETH é muito melhor.',
      },
    ],
  },

  '4.3': {
    id: '4.3', title: 'Como funciona o blockchain', emoji: '⛓️', xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '📒',
        text: [
          'Imagine um livro-caixa que registra todas as transações. Mas em vez de um banco guardar esse livro, **milhares de computadores ao redor do mundo** têm uma cópia idêntica.',
          'Toda nova transação é verificada por esses computadores e adicionada ao livro — de forma permanente e imutável.',
          'Esse livro descentralizado é o **blockchain**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⛓️ Blockchain = cadeia de blocos. Cada bloco contém um conjunto de transações. Uma vez registrado, ninguém consegue apagar ou alterar sem refazer toda a cadeia — computacionalmente impossível.',
      },
      {
        type: 'content', emoji: '🔒',
        text: [
          'Por que é seguro?',
          '**Descentralização:** não tem um servidor central para hackear. Atacar o Bitcoin exigiria controlar mais de 50% de toda a rede mundial.',
          '**Criptografia:** cada bloco está matematicamente ligado ao anterior. Alterar um bloco invalidaria todos os seguintes.',
          '**Transparência:** qualquer pessoa pode verificar qualquer transação — tudo é público.',
        ],
      },
      {
        type: 'content', emoji: '⛏️',
        text: [
          'Quem valida as transações são os **mineradores** — computadores que resolvem problemas matemáticos complexos.',
          'O primeiro a resolver recebe uma recompensa em Bitcoin. Esse processo é chamado de **Proof of Work**.',
          'Ethereum migrou para **Proof of Stake** — validadores "apostam" suas moedas como garantia, consumindo 99% menos energia.',
        ],
      },
      {
        type: 'quiz',
        question: 'O que torna o blockchain praticamente impossível de hackear?',
        options: [
          { id: 'a', text: 'Porque é propriedade de uma empresa de segurança', correct: false },
          { id: 'b', text: 'Porque é descentralizado e cada bloco está criptograficamente ligado ao anterior', correct: true },
          { id: 'c', text: 'Porque usa senhas muito longas', correct: false },
          { id: 'd', text: 'Porque o governo protege', correct: false },
        ],
        explanation: 'Para alterar uma transação no blockchain você precisaria refazer todos os blocos seguintes E controlar mais de 50% da rede mundial simultaneamente. Com bilhões em poder computacional na rede, isso é economicamente inviável.',
      },
      {
        type: 'quiz',
        question: 'Qual é o papel dos mineradores no Bitcoin?',
        options: [
          { id: 'a', text: 'Criar novos Bitcoins do zero quando quiserem', correct: false },
          { id: 'b', text: 'Validar transações resolvendo problemas matemáticos e receber BTC como recompensa', correct: true },
          { id: 'c', text: 'Guardar os Bitcoins dos usuários', correct: false },
          { id: 'd', text: 'Definir o preço do Bitcoin', correct: false },
        ],
        explanation: 'Mineradores são o "sistema nervoso" do Bitcoin. Eles competem para validar blocos de transações — quem resolve primeiro ganha uma recompensa em BTC. Isso incentiva a segurança da rede sem precisar de uma autoridade central.',
      },
    ],
  },

  '4.4': {
    id: '4.4', title: 'Carteiras e exchanges', emoji: '🔐', xpReward: 35,
    steps: [
      {
        type: 'content', emoji: '🏪',
        text: [
          '**Exchange** é onde você compra e vende criptomoedas — como uma corretora, mas para cripto.',
          'No Brasil as mais usadas são: **Mercado Bitcoin**, **Binance**, **Foxbit**.',
          'Você cria conta, faz depósito em reais e compra Bitcoin, Ethereum ou outras moedas.',
        ],
      },
      {
        type: 'content', emoji: '👜',
        text: [
          'Depois de comprar, suas criptos ficam na **carteira** da exchange.',
          'Carteiras têm duas chaves: a **chave pública** (seu endereço — pode compartilhar) e a **chave privada** (sua senha — nunca compartilhe).',
          'Quem tem a chave privada tem o controle total das criptos. Perdeu a chave privada? Perdeu tudo.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🔑 "Not your keys, not your coins." Se a exchange for hackeada ou falir, você pode perder tudo. Para valores maiores, use uma carteira própria (hardware wallet).',
      },
      {
        type: 'content', emoji: '🔒',
        text: [
          'Tipos de carteira:',
          '**Custodial (exchange):** a exchange guarda sua chave privada. Mais fácil, mas depende da empresa.',
          '**Software wallet:** app no celular/computador. Você tem sua chave privada. Ex: MetaMask, Trust Wallet.',
          '**Hardware wallet:** dispositivo físico (como um pen drive). O mais seguro para valores grandes. Ex: Ledger, Trezor.',
        ],
      },
      {
        type: 'quiz',
        question: 'O que é a chave privada de uma carteira de cripto?',
        options: [
          { id: 'a', text: 'Seu endereço público para receber criptos', correct: false },
          { id: 'b', text: 'A senha que dá controle total sobre suas criptomoedas — nunca compartilhe', correct: true },
          { id: 'c', text: 'O código da exchange onde você opera', correct: false },
          { id: 'd', text: 'O número da sua conta bancária', correct: false },
        ],
        explanation: 'A chave privada é o único acesso real às suas criptomoedas. Quem tem ela pode mover todos os fundos. Perdeu a chave? Perdeu as criptos — não tem suporte, não tem recuperação. Guarde em local seguro, offline.',
      },
      {
        type: 'quiz',
        question: 'Para um iniciante com pequeno valor em cripto, qual solução é mais prática?',
        options: [
          { id: 'a', text: 'Hardware wallet — única opção segura', correct: false },
          { id: 'b', text: 'Exchange confiável — prática e suficiente para valores pequenos', correct: true },
          { id: 'c', text: 'Guardar em papel impresso em casa', correct: false },
          { id: 'd', text: 'Não existe solução segura para cripto', correct: false },
        ],
        explanation: 'Para começar com valores pequenos, uma exchange confiável e regulada é suficiente e muito mais prática. Hardware wallets (Ledger, Trezor) fazem mais sentido quando o valor justifica o investimento no dispositivo (~R$ 500).',
      },
    ],
  },

  '4.5': {
    id: '4.5', title: 'Riscos e como investir com segurança', emoji: '⚠️', xpReward: 45,
    steps: [
      {
        type: 'content', emoji: '📉',
        text: [
          'Cripto é o ativo mais volátil do mercado financeiro. Em 2021 o Bitcoin chegou a US$ 69.000. Em 2022 caiu para US$ 16.000. Em 2024 voltou para US$ 100.000.',
          'Quem comprou no pico em 2021 ficou no prejuízo por anos antes de recuperar.',
          'Isso é normal em cripto — mas poucos aguentam emocionalmente.',
        ],
      },
      {
        type: 'content', emoji: '🚨',
        text: [
          'Principais riscos em cripto:',
          '**Volatilidade:** quedas de 50-80% em meses são comuns e esperadas.',
          '**Golpes:** pirâmides, projetos fraudulentos, "influencers" promovendo moedas para ganhar comissão.',
          '**Perda de acesso:** esquecer senha, perder chave privada, exchange falindo.',
          '**Regulação:** governos podem restringir ou proibir — já aconteceu em vários países.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🚩 Red flags em cripto: promessa de retorno garantido, pressão para investir agora, influencer pedindo para comprar uma moeda específica, projeto sem whitepaper ou time identificado.',
      },
      {
        type: 'content', emoji: '✅',
        text: [
          'Como investir em cripto com mais segurança:',
          '**Alocação pequena:** máximo 5-10% da carteira. Nunca dinheiro que você precisa.',
          '**Bitcoin e Ethereum apenas:** as mais consolidadas. Fuja de altcoins desconhecidas.',
          '**DCA (Dollar Cost Average):** comprar um valor fixo todo mês, independente do preço. Reduz o risco de comprar no pico.',
          '**Exchange regulada:** use plataformas com histórico e regulação. No Brasil: Mercado Bitcoin.',
        ],
      },
      {
        type: 'quiz',
        question: 'O Bitcoin caiu 40% em 3 meses. O que a estratégia DCA sugere fazer?',
        options: [
          { id: 'a', text: 'Vender tudo antes de cair mais', correct: false },
          { id: 'b', text: 'Continuar comprando o valor fixo mensal — a queda é parte do plano', correct: true },
          { id: 'c', text: 'Dobrar o aporte para compensar a perda', correct: false },
          { id: 'd', text: 'Parar de investir até o preço recuperar', correct: false },
        ],
        explanation: 'DCA (Dollar Cost Average) é comprar um valor fixo regularmente, independente do preço. Quando o preço cai, você compra mais unidades pelo mesmo valor. No longo prazo, o preço médio tende a ser melhor que comprar tudo de uma vez.',
      },
      {
        type: 'quiz',
        question: 'Um influencer diz que uma moeda vai "10x em 30 dias" e pede para você comprar agora. O que isso é?',
        options: [
          { id: 'a', text: 'Uma oportunidade real que você não deve perder', correct: false },
          { id: 'b', text: 'Provavelmente um esquema pump-and-dump — fuja', correct: true },
          { id: 'c', text: 'Uma análise técnica legítima', correct: false },
          { id: 'd', text: 'Um sinal de que a moeda é garantida pelo governo', correct: false },
        ],
        explanation: 'Pump-and-dump é um esquema clássico: influencers compram uma moeda barata, promovem para seguidores, o preço sobe (pump), eles vendem no topo (dump) e os seguidores ficam com o prejuízo. Nenhum ativo legítimo precisa de pressão para comprar.',
      },
    ],
  },

  '4.boss': {
    id: '4.boss', title: 'BOSS: Cripto na sua carteira', emoji: '🏆', xpReward: 120,
    steps: [
      {
        type: 'content', emoji: '⚔️',
        text: [
          'Boss final da trilha de Cripto. Hora de integrar tudo.',
          'Cripto é a classe de ativo mais arriscada — mas também a que mais cresceu nas últimas décadas.',
          'O segredo é usar com **consciência, limitação e estratégia** — não com euforia.',
        ],
      },
      {
        type: 'content', emoji: '🗂️',
        text: [
          'Posição saudável de cripto numa carteira equilibrada:',
          '**Perfil conservador:** 0-3% — pode ignorar completamente sem problema.',
          '**Perfil moderado:** 3-7% — só BTC e/ou ETH, via DCA mensal.',
          '**Perfil arrojado:** 7-15% — BTC + ETH + no máximo 1-2 altcoins de alto cap.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🎯 Regra simples para cripto: invista só o que você aceita perder 100%. Se uma queda de 80% te faria perder o sono, sua alocação está alta demais.',
      },
      {
        type: 'quiz',
        question: 'Qual é a estratégia mais indicada para comprar Bitcoin ao longo do tempo?',
        options: [
          { id: 'a', text: 'Comprar tudo de uma vez quando achar que está barato', correct: false },
          { id: 'b', text: 'DCA — valor fixo todo mês, independente do preço', correct: true },
          { id: 'c', text: 'Esperar o preço cair 50% e então comprar', correct: false },
          { id: 'd', text: 'Só comprar quando influencers recomendam', correct: false },
        ],
        explanation: 'DCA remove a necessidade de "acertar o timing" — algo que nem profissionais conseguem consistentemente. Comprando todo mês, você tem um preço médio equilibrado e evita o erro de comprar no pico.',
      },
      {
        type: 'quiz',
        question: 'Ana tem perfil moderado e uma carteira de R$ 10.000. Quanto faz sentido alocar em cripto?',
        options: [
          { id: 'a', text: 'R$ 5.000 — metade da carteira para crescimento', correct: false },
          { id: 'b', text: 'R$ 0 — cripto não serve para moderados', correct: false },
          { id: 'c', text: 'R$ 300-700 (3-7%) — só BTC/ETH via DCA', correct: true },
          { id: 'd', text: 'R$ 10.000 — todo o dinheiro em cripto', correct: false },
        ],
        explanation: 'Para perfil moderado, 3-7% em cripto é o range adequado. Isso permite participar do potencial de crescimento sem colocar em risco o patrimônio principal. Com R$ 10.000, isso significa R$ 300 a R$ 700.',
      },
      {
        type: 'quiz',
        question: 'Qual desses é o sinal mais confiável para identificar um golpe em cripto?',
        options: [
          { id: 'a', text: 'O projeto está listado em exchanges conhecidas', correct: false },
          { id: 'b', text: 'Promete retorno garantido e pressiona para investir agora', correct: true },
          { id: 'c', text: 'O preço caiu 30% no último mês', correct: false },
          { id: 'd', text: 'Não tem app no celular ainda', correct: false },
        ],
        explanation: '"Retorno garantido" e "urgência para comprar" são as duas maiores red flags em cripto. Nenhum investimento legítimo garante retorno. A urgência é uma técnica de manipulação para impedir que você pense antes de agir.',
      },
    ],
  },
}

const FALLBACK_ID = '1.4'

export default function LessonPage() {
  const { lessonId }     = useParams()
  const [searchParams]   = useSearchParams()
  const isReview         = searchParams.get('review') === 'true'
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const lesson = LESSONS[lessonId ?? ''] ?? LESSONS[FALLBACK_ID]

  const [step,       setStep]       = useState(0)
  const [answers,    setAnswers]    = useState<Record<number, string>>({})
  const [showExpl,   setShowExpl]   = useState<Record<number, boolean>>({})
  const [finished,   setFinished]   = useState(false)
  const [completing, setCompleting] = useState(false)

  const current = lesson.steps[step]
  const total   = lesson.steps.length
  const isLast  = step === total - 1
  const isQuiz  = current.type === 'quiz'
  const canNext = !isQuiz || !!answers[step]

  const handleAnswer = (optId: string) => {
    if (answers[step]) return
    setAnswers(p => ({ ...p, [step]: optId }))
    setTimeout(() => setShowExpl(p => ({ ...p, [step]: true })), 400)
  }

  const handleNext = async () => {
    if (isLast) {
      if (completing) return
      setCompleting(true)
      // Modo revisão: não registra conclusão nem XP
      if (!isReview) {
        try {
          const { data } = await api.post<User>(
            `/user/lessons/${lessonId ?? lesson.id}/complete`,
            { xpReward: lesson.xpReward, trailNumber: 1 }
          )
          updateUser(data)
        } catch {
          updateUser({
            totalXp: (user?.totalXp ?? 0) + lesson.xpReward,
            lessonsCompleted: (user?.lessonsCompleted ?? 0) + 1,
          })
        }
      }
      setFinished(true)
      return
    }
    setStep(s => s + 1)
  }

  if (finished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <span className="text-7xl animate-bounce">{isReview ? '✅' : '🎉'}</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {isReview ? 'Revisão concluída!' : 'Lição concluída!'}
        </h1>
        <p className="text-gray-500">{lesson.title}</p>
        {!isReview && <div className="badge-xp text-base px-4 py-2">⚡ +{lesson.xpReward} XP</div>}
        {isReview && <p className="text-sm text-gray-400">Modo revisão — XP não contabilizado</p>}
        <button
          onClick={() => {
            if (!isReview) toast.success(`+${lesson.xpReward} XP ganhos!`)
            navigate('/app/trilhas')
          }}
          className="btn-primary px-8"
        >
          Voltar às trilhas →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/trilhas')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Fechar">
          <X size={20} className="text-gray-400" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {lesson.steps.map((_: any, i: number) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < step ? 'bg-success' : i === step ? 'bg-primary' : 'bg-gray-200'
            }`} />
          ))}
        </div>
        {isReview
          ? <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full"><RotateCcw size={12} /> Revisão</span>
          : <span className="badge-xp">⚡ {lesson.xpReward}</span>
        }
      </div>

      {/* Conteúdo */}
      <div className="card space-y-4 min-h-[300px]">
        {current.type === 'content' && (
          <>
            {'emoji' in current && (
              <div className="text-5xl text-center py-2">{current.emoji as string}</div>
            )}
            <div className="space-y-3">
              {(current.text as string[]).map((line: string, i: number) => (
                <p key={i} className="text-base text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary">$1</strong>')
                  }} />
              ))}
            </div>
          </>
        )}

        {current.type === 'callout' && (
          <div className="bg-primary-muted border-l-4 border-primary rounded-xl p-4">
            <p className="text-sm font-medium text-gray-800">{current.text as string}</p>
          </div>
        )}

        {current.type === 'quiz' && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">❓ Quiz</p>
            <p className="text-lg font-semibold text-gray-900">{current.question as string}</p>
            <div className="space-y-2">
              {(current.options as any[]).map((opt) => {
                const selected   = answers[step]
                const isSelected = selected === opt.id
                const revealed   = !!selected

                let cls = 'border border-gray-200 bg-white hover:bg-gray-50'
                if (revealed) {
                  if (opt.correct)       cls = 'border-2 border-success bg-success-muted'
                  else if (isSelected)   cls = 'border-2 border-danger bg-danger-muted'
                  else                   cls = 'border border-gray-100 bg-gray-50 opacity-50'
                } else if (isSelected) {
                  cls = 'border-2 border-primary bg-primary-muted'
                }

                return (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)}
                    disabled={!!selected}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${cls}`}
                    aria-pressed={isSelected}
                  >
                    <span className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100
                      flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-800">{opt.text}</span>
                    {revealed && opt.correct  && <span className="ml-auto">✅</span>}
                    {revealed && isSelected && !opt.correct && <span className="ml-auto">❌</span>}
                  </button>
                )
              })}
            </div>

            {showExpl[step] && (
              <div className={`p-4 rounded-xl border ${
                (current.options as any[]).find((o: any) => o.id === answers[step])?.correct
                  ? 'bg-success-muted border-success/30'
                  : 'bg-primary-muted border-primary/30'
              }`}>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {(current.options as any[]).find((o: any) => o.id === answers[step])?.correct
                    ? '🎉 Correto!' : '📚 Quase lá!'}
                </p>
                <p className="text-sm text-gray-700">{current.explanation as string}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão */}
      <button onClick={handleNext} disabled={!canNext || completing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
        {completing ? 'Salvando...' : isLast ? '🎉 Concluir lição' : 'Continuar'}
        {!isLast && !completing && <ChevronRight size={18} />}
      </button>
    </div>
  )
}
