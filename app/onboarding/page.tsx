'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

type TraderType = 'curious' | 'serious' | 'pro' | null

interface QuizQuestion {
  id: number
  question: string
  options: { label: string; isCorrect: boolean }[]
}

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: 'If you buy an asset and its price drops 20%, what is the percentage gain needed to break even?',
    options: [
      { label: '20%', isCorrect: false },
      { label: '25%', isCorrect: true },
      { label: '15%', isCorrect: false },
      { label: '30%', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: 'Which best describes a "stop-loss" order?',
    options: [
      { label: 'An order to buy at a target price', isCorrect: false },
      { label: 'An automatic sell when price falls below a threshold', isCorrect: true },
      { label: 'A guaranteed profit-taking mechanism', isCorrect: false },
      { label: 'A fee charged by exchanges', isCorrect: false },
    ],
  },
  {
    id: 3,
    question: 'What does "diversification" mean in trading?',
    options: [
      { label: 'Putting all capital into the best-performing asset', isCorrect: false },
      { label: 'Spreading capital across multiple assets to reduce risk', isCorrect: true },
      { label: 'Trading on multiple exchanges simultaneously', isCorrect: false },
      { label: 'Using leverage to amplify gains', isCorrect: false },
    ],
  },
]

const TRADER_TYPES = [
  {
    key: 'curious' as const,
    title: 'Curious',
    description: 'I want to learn how crypto trading works without risking real money.',
  },
  {
    key: 'serious' as const,
    title: 'Serious',
    description: 'I have some trading experience and want to sharpen my strategy.',
  },
  {
    key: 'pro' as const,
    title: 'Pro',
    description: 'I am preparing for a prop-firm challenge and need realistic practice.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<'welcome' | 'type' | 'quiz' | 'done'>('welcome')
  const [traderType, setTraderType] = useState<TraderType>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<(boolean | null)[]>([null, null, null])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const currentQuestion = QUIZ[quizIndex]

  const handleAnswer = (optionIdx: number) => {
    if (revealed) return
    setSelectedOption(optionIdx)
    setRevealed(true)
    const correct = QUIZ[quizIndex].options[optionIdx].isCorrect
    const updated = [...quizAnswers]
    updated[quizIndex] = correct
    setQuizAnswers(updated)
  }

  const handleNextQuestion = () => {
    if (quizIndex < QUIZ.length - 1) {
      setQuizIndex(quizIndex + 1)
      setSelectedOption(null)
      setRevealed(false)
    } else {
      setStep('done')
    }
  }

  const finishOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shahin_onboarding_complete', 'true')
    }
    router.push('/')
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div className="text-6xl mb-4">🦅</div>
          <h1 className="text-4xl font-bold">Welcome to Shahin</h1>
          <p className="text-gray-400 text-lg">
            Paper-trading platform for cryptocurrency markets. Practice with virtual capital.
            No real money at risk.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <p className="font-semibold mb-1">Important disclosures</p>
                <ul className="space-y-1 text-yellow-400/80">
                  <li>This is paper trading only — no real-money execution.</li>
                  <li>Crypto markets are highly volatile.</li>
                  <li>Past performance does not predict future returns.</li>
                  <li>This is not financial advice.</li>
                  <li>ADGM FSP application in progress — no real-money trading available until authorisation.</li>
                </ul>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStep('type')}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-lg transition"
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  if (step === 'type') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <h2 className="text-3xl font-bold text-center">What kind of trader are you?</h2>
          <p className="text-gray-400 text-center">This helps us surface the right features for you.</p>
          <div className="space-y-3">
            {TRADER_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTraderType(t.key)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  traderType === t.key
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <p className="font-bold text-lg">{t.title}</p>
                <p className="text-sm text-gray-400 mt-1">{t.description}</p>
              </button>
            ))}
          </div>
          <button
            disabled={!traderType}
            onClick={() => setStep('quiz')}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold rounded-xl transition"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'quiz') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Risk education — Question {quizIndex + 1} of {QUIZ.length}</p>
            <div className="flex gap-1">
              {QUIZ.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition ${
                    i < quizIndex
                      ? quizAnswers[i]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : i === quizIndex
                      ? 'bg-yellow-500'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              let style = 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
              if (revealed) {
                if (opt.isCorrect) {
                  style = 'border-green-500 bg-green-500/10'
                } else if (idx === selectedOption && !opt.isCorrect) {
                  style = 'border-red-500 bg-red-500/10'
                }
              } else if (selectedOption === idx) {
                style = 'border-yellow-500 bg-yellow-500/10'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition ${style}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {revealed && opt.isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {revealed && idx === selectedOption && !opt.isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {revealed && (
            <div className={`p-4 rounded-lg border ${quizAnswers[quizIndex] ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className={`font-semibold ${quizAnswers[quizIndex] ? 'text-green-400' : 'text-red-400'}`}>
                {quizAnswers[quizIndex] ? 'Correct!' : 'Not quite — the correct answer is highlighted.'}
              </p>
            </div>
          )}

          <button
            disabled={!revealed}
            onClick={handleNextQuestion}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold rounded-xl transition"
          >
            {quizIndex < QUIZ.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    )
  }

  // Done
  const score = quizAnswers.filter(Boolean).length
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="text-6xl mb-4">{score === 3 ? '🏆' : score >= 2 ? '👍' : '📚'}</div>
        <h2 className="text-3xl font-bold">Ready to trade</h2>
        <p className="text-gray-400">
          You scored {score}/{QUIZ.length} on the risk quiz.{' '}
          {score < 3 && 'Review the highlighted answers — understanding risk is essential before trading.'}
        </p>
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-left space-y-2">
          <p className="font-semibold text-sm text-gray-300">Your setup</p>
          <p className="text-sm text-gray-400">Trader type: <span className="text-white capitalize">{traderType}</span></p>
          <p className="text-sm text-gray-400">Starting balance: <span className="text-white">$100,000 (virtual)</span></p>
          <p className="text-sm text-gray-400">Mode: <span className="text-white">Paper trading only</span></p>
        </div>
        <button
          onClick={finishOnboarding}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-lg transition"
        >
          Start Trading
        </button>
      </div>
    </div>
  )
}
