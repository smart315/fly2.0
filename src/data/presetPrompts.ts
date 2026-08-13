import { PresetPrompt } from '../types';

export const presetPrompts: PresetPrompt[] = [
  {
    id: 'intro',
    title: 'Who is fly2.0?',
    category: 'Identity',
    iconName: 'Bot',
    prompt: 'fly2.0님, 당신의 고유한 양자 신경망 기능과 시각적 코어 시스템에 대해 자세히 설명해 주세요.',
  },
  {
    id: 'code_help',
    title: 'Code Refactoring',
    category: 'Development',
    iconName: 'Code',
    prompt: '리액트(React)와 타입스크립트(TypeScript) 최적화 및 성능 개선 가이드를 코드 예시와 함께 작성해 줘.',
  },
  {
    id: 'quantum_physics',
    title: 'Quantum Computing',
    category: 'Science',
    iconName: 'Atom',
    prompt: '양자 컴퓨터의 큐비트(Qubit) 원리와 슈퍼컴퓨터와의 차이점을 이해하기 쉽게 설명해 줘.',
  },
  {
    id: 'brainstorm',
    title: 'AI App Ideas',
    category: 'Innovation',
    iconName: 'Sparkles',
    prompt: '2026년에 차별성을 가질 수 있는 독창적인 AI 서비스 및 모바일 앱 아이디어 3가지를 제안해 줘.',
  },
  {
    id: 'productivity',
    title: 'Daily Workflow',
    category: 'Task Plan',
    iconName: 'CheckSquare',
    prompt: '오늘 하루 생산성을 최대로 끌어올리기 위한 스마트 시간 관리 시스템 및 일정 작성표를 짜 줘.',
  },
];
