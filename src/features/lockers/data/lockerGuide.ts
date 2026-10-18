import manualReturn from '@/assets/locker-guide/manual-return.png'
import rentalDetail from '@/assets/locker-guide/rental-detail.png'
import rentalLocation from '@/assets/locker-guide/rental-location.png'
import rentalSection from '@/assets/locker-guide/rental-section.png'
import rentalStatus from '@/assets/locker-guide/rental-status.png'
import returnPassword from '@/assets/locker-guide/return-password.png'
import returnPhoto from '@/assets/locker-guide/return-photo.png'
import returnStart from '@/assets/locker-guide/return-start.png'

export type GuideSection = 'rental' | 'return' | 'manual'

export const guideSectionLabels: Record<GuideSection, string> = {
  rental: '사물함 대여',
  return: '사물함 반납',
  manual: '수동 반납',
}

interface GuideStep {
  section: GuideSection
  title: string
  description: string
  emphasis?: string
  note?: string
  legend?: Array<{ color: string; label: string }>
  images: Array<{ src: string; alt: string }>
}

export const lockerGuideSteps: GuideStep[] = [
  {
    section: 'rental',
    title: '사물함 위치 확인',
    description: '사물함 페이지에서 원하는 층과 섹션을 선택하고 사물함 위치를 확인할 수 있습니다.',
    images: [
      { src: rentalLocation, alt: '사물함 페이지에서 층과 지도상의 섹션을 선택하는 화면' },
      { src: rentalSection, alt: '선택한 섹션의 사물함 위치와 번호를 확인하는 화면' },
    ],
  },
  {
    section: 'rental',
    title: '사물함 상태 확인',
    description: '사물함은 색상에 따라 현재 상태를 구분할 수 있습니다.',
    legend: [
      { color: 'green.400', label: '초록색: 대여 가능한 사물함' },
      { color: 'gray.500', label: '회색: 점검 또는 고장 등으로 사용할 수 없는 사물함' },
      { color: 'red.400', label: '빨간색 수박: 다른 사용자가 대여 중인 사물함' },
    ],
    note: '대여 중인 사물함은 주황색 배경에 빨간색 수박으로 표시됩니다. 파란색 테두리는 현재 선택한 사물함입니다.',
    images: [
      { src: rentalStatus, alt: '대여 가능(초록색), 사용 불가(회색), 대여 중(빨간색 수박) 예시' },
    ],
  },
  {
    section: 'rental',
    title: '사물함 상세 확인 및 대여',
    description:
      '원하는 사물함을 선택하면 상세 정보를 확인하고 대여할 수 있습니다. 대여한 사물함은 내 사물함 페이지에서 확인할 수 있습니다.',
    images: [{ src: rentalDetail, alt: '선택한 사물함의 상세 정보와 이 사물함 대여하기 버튼' }],
  },
  {
    section: 'return',
    title: '반납 시작',
    description: '내 사물함 페이지에서 반납하기 버튼을 선택합니다.',
    images: [{ src: returnStart, alt: '내 사물함 페이지에서 반납하기 버튼의 위치' }],
  },
  {
    section: 'return',
    title: '사물함 내부 사진 촬영 및 AI 검증',
    description:
      '사물함 내부의 모든 짐을 비운 후 사진을 촬영해주세요. 다음(AI 검증) 버튼을 누르면 AI가 사물함 상태를 확인합니다.',
    emphasis: '반납 시 사물함 내부 사진 촬영이 필요합니다.',
    images: [
      {
        src: returnPhoto,
        alt: '비어 있는 사물함 내부 사진을 촬영한 후 다음(AI 검증)을 선택하는 화면',
      },
    ],
  },
  {
    section: 'return',
    title: '비밀번호 확인 및 반납',
    description:
      'AI 검증에 성공하면 서비스의 안내에 따라 비밀번호를 입력하고 반납 요청을 진행합니다.',
    emphasis: '반납 전 사물함 비밀번호를 초기화해야 합니다.',
    note: '일반 반납: 사용 중 설정했던 비밀번호 4자리를 입력합니다. 수동 반납에서 입력하는 초기 비밀번호와 구분해주세요.',
    images: [
      {
        src: returnPassword,
        alt: 'AI 검증 성공 후 일반 반납 비밀번호 4자리 입력과 반납 요청 버튼',
      },
    ],
  },
  {
    section: 'manual',
    title: '수동 반납 방법',
    description:
      'AI 검증이 2회 실패한 경우 수동 반납을 진행할 수 있습니다. 수동 제출하기를 선택하고, 비밀번호 설정 전의 초기 비밀번호를 입력한 뒤 반납 사유를 작성하여 반납 요청을 진행합니다.',
    emphasis: '수동 반납 역시 반납 전 비밀번호 초기화가 필수입니다.',
    note: '수동 반납: 비밀번호 설정 전의 초기 비밀번호 4자리를 입력합니다. 일반 반납에서 입력하는 사용 중 설정했던 비밀번호와 다릅니다.',
    images: [
      {
        src: manualReturn,
        alt: '수동 반납에서 초기 비밀번호와 반납 사유를 입력하고 반납 요청하는 화면',
      },
    ],
  },
]
