/**
 * UX/UI Agent — LessonScreen
 * Tela de exibição de lição: conteúdo + quiz inline + feedback + XP.
 * Skills: ui-ux-pro-max, sleek-design-mobile-apps, frontend-design
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows, animation } from '@/design-system/tokens';
import { SegmentedProgress } from '@/components/ProgressBar';
import { XPBadge } from '@/components/XPBadge';
import { PrimaryButton } from '@/components/PrimaryButton';

// ─── Tipos ────────────────────────────────────────────────
interface QuizOption {
  id: string;           // 'a' | 'b' | 'c' | 'd'
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

type LessonStep =
  | { type: 'content'; text: string; emoji?: string }
  | { type: 'callout'; text: string; variant: 'tip' | 'warning' | 'example' }
  | { type: 'quiz'; question: QuizQuestion };

// ─── Mock de dados (substituir por params da rota) ────────
const MOCK_LESSON = {
  id: '1.4',
  title: 'Inflação — o ladrão silencioso',
  emoji: '💸',
  xpReward: 40,
  durationMinutes: 5,
  steps: [
    {
      type: 'content' as const,
      emoji: '🍬',
      text: 'Imagina que hoje você pode comprar **10 balas** com R$ 1,00.\n\nDaqui a um ano, com o mesmo R$ 1,00 você consegue comprar só **9 balas**.\n\nVocê não gastou nada. O dinheiro está lá. Mas ele "compra menos". Isso é **inflação**.',
    },
    {
      type: 'callout' as const,
      variant: 'tip' as const,
      text: '💡 Inflação = os preços sobem com o tempo e seu dinheiro perde força.',
    },
    {
      type: 'content' as const,
      emoji: '📩',
      text: 'Carla juntou R$ 5.000 com muito esforço e deixou em casa, em um envelope, durante 1 ano.\n\nDepois de 1 ano, o envelope ainda tem R$ 5.000. Mas a inflação foi de 5%. Então, aquilo que custava R$ 5.000 agora custa **R$ 5.250**.\n\n**Carla perdeu R$ 250 sem gastar nada.** É como se um ladrão invisível levasse o dinheiro dela.',
    },
    {
      type: 'callout' as const,
      variant: 'warning' as const,
      text: '⚠️ Dinheiro guardado em casa perde valor todo ano por causa da inflação.',
    },
    {
      type: 'quiz' as const,
      question: {
        id: 'q1',
        question: 'O que acontece com R$ 1.000 deixados em casa por 1 ano se a inflação for 6%?',
        options: [
          { id: 'a', text: 'O dinheiro some — alguém pode roubar', isCorrect: false },
          { id: 'b', text: 'O dinheiro fica do mesmo jeito', isCorrect: false },
          { id: 'c', text: 'Compra menos coisas — vale "só" R$ 940 em poder de compra', isCorrect: true },
          { id: 'd', text: 'O dinheiro cresce — dinheiro parado não perde', isCorrect: false },
        ],
        explanation: 'O número não muda (ainda tem R$ 1.000), mas o que você compra com ele diminui. Com 6% de inflação, precisaria de R$ 1.060 para comprar o mesmo de antes. Você perdeu R$ 60 de poder de compra sem gastar nada.',
      },
    },
    {
      type: 'quiz' as const,
      question: {
        id: 'q2',
        question: 'A poupança rendeu 4% no ano. A inflação foi 5%. Você ficou:',
        options: [
          { id: 'a', text: 'Mais rico — ganhou 4%', isCorrect: false },
          { id: 'b', text: 'Igual — pelo menos não perdeu', isCorrect: false },
          { id: 'c', text: 'Mais pobre — o rendimento real foi -1%', isCorrect: true },
          { id: 'd', text: 'Muito mais rico — poupança sempre protege', isCorrect: false },
        ],
        explanation: 'Rendimento real = 4% − 5% = -1%. Mesmo ganhando 4%, a inflação comeu tudo isso e mais um pouco. O número na conta subiu, mas o que você compra caiu.',
      },
    },
  ] as LessonStep[],
};

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showXPCelebration, setShowXPCelebration] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = MOCK_LESSON.steps.length;
  const currentStepData = MOCK_LESSON.steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  // Conta apenas etapas de quiz
  const quizSteps = MOCK_LESSON.steps.filter((s) => s.type === 'quiz');
  const quizIndex = MOCK_LESSON.steps
    .slice(0, currentStep + 1)
    .filter((s) => s.type === 'quiz').length;

  const currentQuizQuestion =
    currentStepData.type === 'quiz' ? currentStepData.question : null;
  const currentAnswer = currentQuizQuestion
    ? quizAnswers[currentQuizQuestion.id]
    : null;
  const isAnswered = currentQuizQuestion ? !!currentAnswer : false;

  // ─── Animação de transição ────────────────────────────
  const goToStep = useCallback(
    (nextStep: number) => {
      AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (reduced) {
          setCurrentStep(nextStep);
          return;
        }

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: animation.fast,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: animation.fast,
            useNativeDriver: true,
          }),
        ]).start(() => setCurrentStep(nextStep));
      });
    },
    [slideAnim]
  );

  const handleNext = () => {
    if (isLastStep) {
      setShowXPCelebration(true);
      // TODO: marcar lição como completa na store
      return;
    }
    goToStep(currentStep + 1);
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (quizAnswers[questionId]) return; // já respondeu

    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setTimeout(() => {
      setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
    }, 500);
  };

  const canAdvance =
    currentStepData.type !== 'quiz' || isAnswered;

  // ─── Celebração de XP ─────────────────────────────────
  if (showXPCelebration) {
    return <XPCelebrationScreen xp={MOCK_LESSON.xpReward} lessonTitle={MOCK_LESSON.title} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Fechar lição"
          onPress={() => console.log('Fechar')}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <SegmentedProgress
          total={totalSteps}
          current={currentStep}
          color={colors.success}
          style={styles.progress}
        />

        <View style={styles.xpChip}>
          <Text style={styles.xpText}>⚡ {MOCK_LESSON.xpReward}</Text>
        </View>
      </View>

      {/* ── Conteúdo do step ──────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          {currentStepData.type === 'content' && (
            <ContentStep step={currentStepData} />
          )}
          {currentStepData.type === 'callout' && (
            <CalloutStep step={currentStepData} />
          )}
          {currentStepData.type === 'quiz' && (
            <QuizStep
              question={currentStepData.question}
              selectedOption={quizAnswers[currentStepData.question.id] ?? null}
              showExplanation={showExplanation[currentStepData.question.id] ?? false}
              onSelect={(optionId) =>
                handleAnswerSelect(currentStepData.question.id, optionId)
              }
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Botão de avanço ───────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={isLastStep ? '🎉 Concluir lição!' : 'Continuar →'}
          onPress={handleNext}
          variant={isLastStep ? 'success' : 'primary'}
          size="lg"
          fullWidth
          disabled={!canAdvance}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTES DE STEPS
// ─────────────────────────────────────────────────────────

const ContentStep: React.FC<{
  step: Extract<LessonStep, { type: 'content' }>;
}> = ({ step }) => (
  <View style={styles.contentStep}>
    {step.emoji && <Text style={styles.stepEmoji}>{step.emoji}</Text>}
    <FormattedText text={step.text} />
  </View>
);

const CalloutStep: React.FC<{
  step: Extract<LessonStep, { type: 'callout' }>;
}> = ({ step }) => {
  const variantStyles = {
    tip: { bg: colors.primaryMuted, border: colors.primary },
    warning: { bg: colors.warningMuted, border: colors.warning },
    example: { bg: colors.successMuted, border: colors.success },
  };
  const style = variantStyles[step.variant];

  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: style.bg, borderLeftColor: style.border },
      ]}
    >
      <Text style={styles.calloutText}>{step.text}</Text>
    </View>
  );
};

const QuizStep: React.FC<{
  question: QuizQuestion;
  selectedOption: string | null;
  showExplanation: boolean;
  onSelect: (optionId: string) => void;
}> = ({ question, selectedOption, showExplanation, onSelect }) => {
  const selectedIsCorrect = question.options.find(
    (o) => o.id === selectedOption
  )?.isCorrect;

  return (
    <View style={styles.quizStep}>
      <Text style={styles.quizLabel}>❓ Quiz</Text>
      <Text style={styles.quizQuestion}>{question.question}</Text>

      <View style={styles.optionsList}>
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isRevealed = !!selectedOption;

          let optionStyle = styles.optionDefault;
          let textStyle = styles.optionTextDefault;

          if (isRevealed) {
            if (option.isCorrect) {
              optionStyle = styles.optionCorrect;
              textStyle = styles.optionTextCorrect;
            } else if (isSelected && !option.isCorrect) {
              optionStyle = styles.optionWrong;
              textStyle = styles.optionTextWrong;
            } else {
              optionStyle = styles.optionDimmed;
            }
          } else if (isSelected) {
            optionStyle = styles.optionSelected;
          }

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, optionStyle]}
              onPress={() => onSelect(option.id)}
              disabled={!!selectedOption}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: !!selectedOption }}
              accessibilityLabel={`Opção ${option.id.toUpperCase()}: ${option.text}`}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{option.id.toUpperCase()}</Text>
              </View>
              <Text style={[styles.optionText, textStyle]}>{option.text}</Text>
              {isRevealed && option.isCorrect && (
                <Text style={styles.optionIcon}>✅</Text>
              )}
              {isRevealed && isSelected && !option.isCorrect && (
                <Text style={styles.optionIcon}>❌</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {showExplanation && (
        <View
          style={[
            styles.explanation,
            selectedIsCorrect ? styles.explanationCorrect : styles.explanationWrong,
          ]}
        >
          <Text style={styles.explanationTitle}>
            {selectedIsCorrect ? '🎉 Correto!' : '📚 Quase lá!'}
          </Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Tela de celebração de XP ─────────────────────────────
const XPCelebrationScreen: React.FC<{ xp: number; lessonTitle: string }> = ({
  xp,
  lessonTitle,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.celebration,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Parabéns! Você completou a lição ${lessonTitle} e ganhou ${xp} XP`}
    >
      <Text style={styles.celebrationEmoji}>🎉</Text>
      <Text style={styles.celebrationTitle}>Lição concluída!</Text>
      <Text style={styles.celebrationLesson}>{lessonTitle}</Text>

      <XPBadge value={xp} mode="gain" size="lg" animate />

      <PrimaryButton
        label="Continuar →"
        onPress={() => console.log('Voltar para home')}
        variant="success"
        size="lg"
        style={styles.celebrationButton}
      />
    </View>
  );
};

// ─── Texto formatado com markdown simples ─────────────────
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={styles.contentText}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={styles.contentBold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  closeButton: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  closeIcon: { fontSize: 16, color: colors.textSecondary },
  progress: { flex: 1 },
  xpChip: {
    backgroundColor: colors.xp,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  xpText: { ...typography.captionBold, color: '#1A1A00' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // Content step
  contentStep: { gap: spacing.lg },
  stepEmoji: { fontSize: 52, textAlign: 'center' },
  contentText: { ...typography.bodyLarge, color: colors.textPrimary, lineHeight: 30 },
  contentBold: { fontWeight: '700', color: colors.primary },

  // Callout
  callout: {
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  calloutText: { ...typography.body, color: colors.textPrimary },

  // Quiz
  quizStep: { gap: spacing.lg },
  quizLabel: { ...typography.overline, color: colors.primary },
  quizQuestion: { ...typography.h3, color: colors.textPrimary },
  optionsList: { gap: spacing.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, minHeight: 56,
  },
  optionDefault: { borderColor: colors.border, backgroundColor: colors.surface },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.successMuted },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.dangerMuted },
  optionDimmed: { borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.5 },
  optionLetter: {
    width: 28, height: 28, borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  optionLetterText: { ...typography.captionBold, color: colors.textSecondary },
  optionText: { ...typography.bodySmall, flex: 1 },
  optionTextDefault: { color: colors.textPrimary },
  optionTextCorrect: { color: colors.success, fontWeight: '600' },
  optionTextWrong: { color: colors.danger },
  optionIcon: { fontSize: 18, flexShrink: 0 },

  // Explicação
  explanation: {
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1,
  },
  explanationCorrect: { backgroundColor: colors.successMuted, borderColor: colors.success },
  explanationWrong: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  explanationTitle: { ...typography.bodyBold, color: colors.textPrimary },
  explanationText: { ...typography.body, color: colors.textSecondary },

  // Footer
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Celebração
  celebration: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg,
  },
  celebrationEmoji: { fontSize: 80 },
  celebrationTitle: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  celebrationLesson: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  celebrationButton: { marginTop: spacing.lg, width: '100%' },
});
