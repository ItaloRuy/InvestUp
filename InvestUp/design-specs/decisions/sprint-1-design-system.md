# Sprint 1 — Decisões de Design System
**Agente:** ux-ui-agent  
**Data:** 2026-05-28  
**Status:** ✅ Concluído

---

## 1. Paleta de Cores

### Decisão
- **Azul Confiança (#1E3A5F)** como cor primária — tom escuro e sólido que remete a instituições financeiras sólidas, mas sem ser corporativo.
- **Verde Crescimento (#00A86B)** para feedback positivo e progresso — cor universalmente associada a ganhos financeiros.
- **Laranja (#FF7B00)** para streaks e alertas — energético, motivacional, diferenciado do vermelho de erro.

### Alternativas descartadas
- Azul royal (#2563EB) — muito saturado, associado a apps genéricos
- Verde padrão (#22C55E) — sem distinção suficiente de outros apps

### Rationale pedagógico
Pesquisas de psicologia das cores em finanças mostram que azul escuro aumenta percepção de confiança e segurança — reduz ansiedade financeira em usuários iniciantes.

### Para o artigo
> "A escolha da paleta considerou a psicologia da cor aplicada à educação financeira: tons que transmitem segurança (azul profundo) sem intimidar, e verde que reforça positivamente o aprendizado progressivo."

---

## 2. Tipografia

### Decisão
- **Inter** como família tipográfica principal — excelente legibilidade em telas pequenas, suporte a números tabulares nativos (alinhamento de valores financeiros), open source.
- **fontVariant: ['tabular-nums']** para todos os componentes que exibem valores financeiros — garante alinhamento visual em listas de preços.

### Alternativas descartadas
- Roboto — muito genérico, sem distinção
- Custom font — penalidade de performance (carregamento assíncrono)

---

## 3. Spacing Scale (base 4px)

### Decisão
Grid de 4px alinhado com o sistema de design do Material e do Expo. Permite layouts consistentes sem necessidade de valores personalizados.

| Token | Valor | Uso |
|-------|-------|-----|
| xs | 4px | Gaps internos mínimos |
| sm | 8px | Padding de badges, gaps de ícones |
| md | 16px | Padding padrão de cards |
| lg | 24px | Separação entre seções |
| xl | 32px | Margens de tela |
| xxl | 48px | Espaçamento hero |

---

## 4. Touch Targets (WCAG)

### Decisão
Mínimo absoluto de **44×44px** em todos os elementos interativos (WCAG 2.1 SC 2.5.8). Implementado via `touchTarget.min = 44` no token.

### Por que importa
O público-alvo inclui usuários com mobilidade reduzida. Em apps financeiros, um tap errado pode ter consequências (mesmo que aqui seja simulado).

---

## 5. Animações

### Decisão
- `animation.fast = 150ms` — micro-interações (press, hover)
- `animation.normal = 250ms` — transições de estado
- Sempre verificar `AccessibilityInfo.isReduceMotionEnabled()` antes de animar

### Rationale
Animações muito longas (>400ms) prejudicam a sensação de responsividade, especialmente em dispositivos mid-range que são os mais usados pelo público universitário brasileiro.

---

## 6. Componentes Tier 1 — Decisões Específicas

### PrimaryButton
- Animação de `scale(0.97)` no pressionar — feedback tátil visual sem ser exagerado
- `Animated.View` wrapping `TouchableOpacity` — permite transformações no native driver
- `accessibilityState.busy` para loading — readers de tela anunciam "ocupado"

### ProgressBar
- `useNativeDriver: false` no width animation — limitação do React Native (transforms que afetam layout não suportam native driver)
- `SegmentedProgress` variante para quizzes — feedback granular questão a questão

### StreakCounter
- Animação de "flickering" na chama com `Animated.loop` — máx 4° de rotação, sutil
- Estado "quebrado" usa 🩶 em vez de ❌ — menos punitivo, mantém motivação

### LessonCard
- `BossCard` com fundo primário sólido — destaque visual na trilha, cria antecipação
- 4 estados explícitos (locked/available/in_progress/completed) — cada um com cor de borda e badge diferentes

---

## Checklist de Acessibilidade
- [x] Todos os elementos interativos têm `accessibilityRole`
- [x] Touch targets ≥ 44×44px
- [x] `accessibilityState` para loading e disabled
- [x] `accessibilityValue` em progress bars
- [x] Animações respeitam `isReduceMotionEnabled()`
- [x] Contraste de texto ≥ 4.5:1 (verificado nas combinações principais)
