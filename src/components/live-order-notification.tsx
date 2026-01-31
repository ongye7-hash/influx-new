'use client';

import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

const orderNotifications = [
  { user: '김OO님', service: '인스타그램 팔로워 1,000명', location: '서울' },
  { user: '박OO님', service: '유튜브 구독자 5,000명', location: '부산' },
  { user: '이OO님', service: '틱톡 조회수 50,000', location: '인천' },
  { user: '최OO님', service: '인스타그램 좋아요 2,000개', location: '대구' },
  { user: '정OO님', service: '유튜브 조회수 10,000', location: '광주' },
  { user: '강OO님', service: '틱톡 팔로워 3,000명', location: '대전' },
  { user: '조OO님', service: '인스타그램 릴스 조회수 20,000', location: '울산' },
  { user: '윤OO님', service: '유튜브 구독자 1,000명', location: '수원' },
  { user: '장OO님', service: '틱톡 좋아요 5,000개', location: '성남' },
  { user: '임OO님', service: '인스타그램 팔로워 500명', location: '고양' },
];

export function LiveOrderNotification() {
  const [currentNotification, setCurrentNotification] = useState<typeof orderNotifications[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      // 랜덤 선택
      const random = orderNotifications[Math.floor(Math.random() * orderNotifications.length)];
      setCurrentNotification(random);
      setIsVisible(true);

      // 4초 후 숨기기
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // 첫 알림은 3초 후
    const firstTimer = setTimeout(showNotification, 3000);

    // 이후 10-20초 간격으로 랜덤 표시
    const interval = setInterval(() => {
      const randomDelay = 10000 + Math.random() * 10000; // 10-20초
      setTimeout(showNotification, randomDelay);
    }, 25000); // 평균 25초마다 체크

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  if (!currentNotification) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-[340px] flex items-start gap-3">
        {/* 체크 아이콘 */}
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <FaCheck className="text-emerald-600 text-sm" />
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{currentNotification.user}</span>
            <span className="text-xs text-gray-500">· {currentNotification.location}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-medium text-emerald-600">{currentNotification.service}</span>
            {' '}주문 완료
          </p>
          <p className="text-[10px] text-gray-400 mt-1">방금 전</p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
