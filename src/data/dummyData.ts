import { Notice, Timetable } from '../types'

export const dummyTimetables: Timetable[] = [
    {
        semester: '2024년 2학기',
        subjects: [
            { id: 'SWE2001', name: '소프트웨어공학', professor: '김교수' },
            { id: 'CSE3001', name: '자료구조', professor: '이교수' },
            { id: 'ALG4001', name: '알고리즘', professor: '박교수' }
        ]
    },
    {
        semester: '2025년 1학기',
        subjects: [
            { id: 'SWE3002', name: '객체지향프로그래밍', professor: '최교수' },
            { id: 'CSE4002', name: '운영체제', professor: '정교수' },
            { id: 'NET1001', name: '네트워크', professor: '조교수' }
        ]
    }
]

export const dummyNotices: Notice[] = [
    {
        id: 1,
        source: '소프트웨어융합대학',
        title: '2025-1학기 수강신청 일정 안내',
        content: '2025년 1학기 수강신청 일정 및 유의사항을 안내드립니다. 수강신청 기간은 2월 3일부터 2월 7일까지이며, 학년별로 시간이 다르니 반드시 확인하시기 바랍니다.',
        date: '2025-01-15',
        views: 2847,
        url: 'https://cs.skku.edu/notice/2025-1-course-registration'
    },
    {
        id: 2,
        source: '소프트웨어학과',
        title: '성균인재장학금 신청 안내',
        content: '2025학년도 성균인재장학금 신청 기간 및 자격 요건을 안내드립니다. 신청 기간은 1월 20일부터 2월 5일까지입니다.',
        date: '2025-01-14',
        views: 1523,
        url: 'https://sw.skku.edu/notice/scholarship-2025'
    },
    {
        id: 3,
        source: '글로벌융합학부',
        title: '2025 신입생 오리엔테이션',
        content: '신입생을 위한 오리엔테이션 프로그램 일정을 안내드립니다. 이 기회를 통해 학교 생활에 대한 다양한 정보를 확인하세요.',
        date: '2025-01-13',
        views: 3156,
        url: 'https://global.skku.edu/notice/orientation-2025'
    },
    {
        id: 4,
        source: '학사지원팀',
        title: '도서관 이용시간 변경 안내',
        content: '중앙학술정보관 이용시간이 변경됩니다. 평일 오전 9시부터 오후 10시까지 운영되며, 주말은 오전 10시부터 오후 6시까지입니다.',
        date: '2025-01-12',
        views: 892,
        url: 'https://lib.skku.edu/notice/hours-change'
    },
    {
        id: 5,
        source: '컴퓨터공학과',
        title: '캠퍼스 주차장 이용 안내',
        content: '2025학년도 캠퍼스 내 주차장 이용 방법 및 주차권 발급 절차를 안내드립니다.',
        date: '2025-01-12',
        views: 1247,
        url: 'https://cse.skku.edu/notice/parking-info'
    },
    {
        id: 6,
        source: '소프트웨어융합대학',
        title: '학생증 재발급 신청 안내',
        content: '학생증 분실 또는 훼손 시 재발급 신청 방법을 안내드립니다. 학생지원팀에서 신청 가능합니다.',
        date: '2025-01-11',
        views: 654,
        url: 'https://cs.skku.edu/notice/student-id-reissue'
    },
    {
        id: 7,
        source: '학사지원팀',
        title: '휴학원 제출 기한 안내',
        content: '2025학년도 1학기 휴학원 제출 기한은 2월 15일까지입니다. 기한 내 제출하지 않을 경우 자동 등록될 수 있습니다.',
        date: '2025-01-11',
        views: 1876,
        url: 'https://academic.skku.edu/notice/leave-of-absence'
    },
    {
        id: 8,
        source: '글로벌융합학부',
        title: '취업박람회 개최 안내',
        content: '2025 상반기 취업박람회가 3월 5일 학생회관에서 개최됩니다. 다양한 기업의 채용 정보를 확인하세요.',
        date: '2025-01-10',
        views: 2341,
        url: 'https://global.skku.edu/notice/job-fair-2025'
    },
    {
        id: 9,
        source: '생활관',
        title: '기숙사 입사 신청 안내',
        content: '2025학년도 1학기 기숙사 입사 신청을 받습니다. 신청 기간은 1월 25일부터 2월 10일까지입니다.',
        date: '2025-01-10',
        views: 3421,
        url: 'https://dorm.skku.edu/notice/application-2025-1'
    },
    {
        id: 10,
        source: '소프트웨어학과',
        title: '학생식당 운영시간 안내',
        content: '학생식당 운영시간이 변경되었습니다. 평일 오전 8시부터 오후 7시까지 운영됩니다.',
        date: '2025-01-10',
        views: 1123,
        url: 'https://sw.skku.edu/notice/cafeteria-hours'
    },
    {
        id: 11,
        source: '정보통신처',
        title: '시스템 점검 일정 안내 (2025.01.20)',
        content: '서비스 품질 향상을 위한 정기 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한됩니다.',
        date: '2025-01-12',
        views: 982,
        url: 'https://ict.skku.edu/notice/system-maintenance'
    },
    {
        id: 12,
        source: '학사지원팀',
        title: '전과 기회 고려 대상 특별 해택 안내',
        content: '2025년 1월 전과신청 기회 및 특별 해택을 안내드립니다. 이 기회를 놓치지 마세요!',
        date: '2025-01-10',
        views: 2158,
        url: 'https://academic.skku.edu/notice/major-change'
    },
    {
        id: 13,
        source: '컴퓨터공학과',
        title: '개인정보처리방침 개정 안내',
        content: '개인정보보호법 개정에 따른 개인정보처리방침 변경사항을 안내드립니다.',
        date: '2025-01-08',
        views: 658,
        url: 'https://cse.skku.edu/notice/privacy-policy'
    },
    {
        id: 14,
        source: '소프트웨어융합대학',
        title: '신규 서비스 출시 안내',
        content: '새로운 기능이 추가된 서비스를 출시합니다. 자세한 내용은 공지사항을 확인해주세요.',
        date: '2025-01-15',
        views: 1247,
        url: 'https://cs.skku.edu/notice/new-service-launch'
    },
    {
        id: 15,
        source: '소프트웨어학과',
        title: 'New Chat 버튼',
        content: '대화 내용 표시 영역 및 북마크 아이콘이 추가되었습니다.',
        date: '2025-01-12',
        views: 892,
        url: 'https://sw.skku.edu/notice/new-chat-feature'
    },
    {
        id: 16,
        source: '글로벌융합학부',
        title: '전체 보관함 목록',
        content: '채팅 보관함이 추가되었습니다. 북마크 일괄 삭제 기능도 제공됩니다.',
        date: '2025-01-10',
        views: 1523,
        url: 'https://global.skku.edu/notice/bookmark-feature'
    },
    {
        id: 17,
        source: '학사지원팀',
        title: '전체 삭제 버튼',
        content: '북마크 일괄 삭제 기능이 추가되었습니다.',
        date: '2025-01-11',
        views: 745,
        url: 'https://academic.skku.edu/notice/delete-all'
    },
    {
        id: 18,
        source: '정보통신처',
        title: '글로벌 네비게이션: 홈, 채팅, 마이페이지',
        content: '페이지 네비게이션이 개선되었습니다. 더욱 편리하게 이용하세요.',
        date: '2025-01-13',
        views: 1876,
        url: 'https://ict.skku.edu/notice/navigation-update'
    },
    {
        id: 19,
        source: '컴퓨터공학과',
        title: '특정 공지사항 클릭',
        content: '특정 공지사항 클릭 시 대화 내용 영역 초기화 후 새 세션 시작됩니다.',
        date: '2025-01-14',
        views: 2341,
        url: 'https://cse.skku.edu/notice/click-feature'
    },
    {
        id: 20,
        source: '생활관',
        title: '다음/이전 페이지, 특정 페이지 클릭',
        content: '공지사항 목록 페이지에서 페이지 이동이 가능합니다.',
        date: '2025-01-15',
        views: 1654,
        url: 'https://dorm.skku.edu/notice/pagination-feature'
    }
]
