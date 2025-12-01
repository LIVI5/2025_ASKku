// Dummy AI responses for demonstration
// In production, this will be replaced with actual GPT API calls

const responses = [
    "산학협력관 건물번호는 85 입니다.",
    "반도체관은 학교 정문에서 들어와 왼쪽에 위치해 있습니다.",
    "제2공학관 건물번호는 25, 26, 27입니다.",
    "Grid는 2차원 레이아웃 시스템입니다. Flexbox는 1차원 레이아웃에 적합합니다.",
    "JavaScript 클로저란 함수가 그 함수가 선언된 렉시컬 환경에 대한 참조를 유지하는 것을 말합니다.",
    "CSS Grid와 Flexbox의 차이점은 Grid는 2차원, Flexbox는 1차원 레이아웃이라는 점입니다.",
    "성균관대학교 소프트웨어학과는 자연과학캠퍼스에 위치해 있습니다.",
    "학사 일정은 학교 홈페이지의 학사공지에서 확인하실 수 있습니다.",
    "도서관 이용시간은 평일 오전 9시부터 오후 10시까지입니다.",
    "수강신청 기간은 매 학기 시작 전 2주간 진행됩니다."
]

const greetings = [
    "안녕하세요! 무엇을 도와드릴까요?",
    "네, 질문해주세요!",
    "도움이 필요하신가요?"
]

export const generateDummyResponse = (userMessage: string): string => {
    // Simple keyword matching for more relevant responses
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('안녕') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return greetings[Math.floor(Math.random() * greetings.length)]
    }

    if (lowerMessage.includes('건물') || lowerMessage.includes('번호')) {
        return responses[Math.floor(Math.random() * 3)]
    }

    if (lowerMessage.includes('grid') || lowerMessage.includes('flexbox') || lowerMessage.includes('css')) {
        return responses[3]
    }

    if (lowerMessage.includes('javascript') || lowerMessage.includes('클로저')) {
        return responses[4]
    }

    if (lowerMessage.includes('학과') || lowerMessage.includes('위치')) {
        return responses[6]
    }

    if (lowerMessage.includes('도서관')) {
        return responses[8]
    }

    if (lowerMessage.includes('수강신청')) {
        return responses[9]
    }

    // Random response for other questions
    return responses[Math.floor(Math.random() * responses.length)]
}
