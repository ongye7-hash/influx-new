"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaTwitter, FaTelegram } from "react-icons/fa";

// 실시간 주문 알림 - Social Proof
// 심리학: "다른 사람들도 사용 중" → 신뢰도 상승

interface OrderNotification {
  id: number;
  username: string;
  service: string;
  platform: "instagram" | "youtube" | "tiktok" | "facebook" | "twitter" | "telegram";
  quantity: number;
  timeAgo: string;
}

const platformIcons = {
  instagram: { icon: FaInstagram, color: "text-pink-500", bg: "bg-pink-500/10" },
  youtube: { icon: FaYoutube, color: "text-red-500", bg: "bg-red-500/10" },
  tiktok: { icon: FaTiktok, color: "text-foreground", bg: "bg-foreground/10" },
  facebook: { icon: FaFacebook, color: "text-blue-600", bg: "bg-blue-600/10" },
  twitter: { icon: FaTwitter, color: "text-sky-500", bg: "bg-sky-500/10" },
  telegram: { icon: FaTelegram, color: "text-blue-500", bg: "bg-blue-500/10" },
};

const services = {
  instagram: ["팔로워", "좋아요", "댓글", "릴스 조회수", "스토리 조회수"],
  youtube: ["구독자", "조회수", "좋아요", "시청시간", "댓글"],
  tiktok: ["팔로워", "좋아요", "조회수", "공유", "저장"],
  facebook: ["팔로워", "좋아요", "공유", "페이지 좋아요"],
  twitter: ["팔로워", "리트윗", "좋아요", "조회수"],
  telegram: ["멤버", "조회수", "반응"],
};

// 한국 이름 생성
const firstNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍"];
const generateUsername = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const stars = "*".repeat(Math.floor(Math.random() * 2) + 1);
  const last = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `${first}${stars}${last}`;
};

const generateOrder = (): OrderNotification => {
  const platforms = Object.keys(services) as Array<keyof typeof services>;
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const platformServices = services[platform];
  const service = platformServices[Math.floor(Math.random() * platformServices.length)];

  // 서비스별 적절한 수량 범위
  const quantityRanges: Record<string, [number, number]> = {
    "팔로워": [100, 5000],
    "구독자": [50, 2000],
    "좋아요": [50, 3000],
    "조회수": [500, 50000],
    "댓글": [10, 200],
    "시청시간": [100, 4000],
    "멤버": [100, 3000],
    "기타": [50, 1000],
  };

  const range = quantityRanges[service] || quantityRanges["기타"];
  const quantity = Math.floor(Math.random() * (range[1] - range[0])) + range[0];

  const timeAgos = ["방금 전", "1분 전", "2분 전", "3분 전", "5분 전"];

  return {
    id: Date.now() + Math.random(),
    username: generateUsername(),
    service,
    platform,
    quantity,
    timeAgo: timeAgos[Math.floor(Math.random() * timeAgos.length)],
  };
};

interface LiveOrderTickerProps {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  showOnMobile?: boolean;
}

export function LiveOrderTicker({
  position = "bottom-left",
  showOnMobile = false,
}: LiveOrderTickerProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 첫 알림은 3초 후
    const initialDelay = setTimeout(() => {
      showNewOrder();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNewOrder = () => {
    const order = generateOrder();
    setCurrentOrder(order);
    setIsVisible(true);

    // 5초 후 숨기기
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // 8-15초 후 다음 알림
    const nextDelay = Math.floor(Math.random() * 7000) + 8000;
    setTimeout(showNewOrder, nextDelay);
  };

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-20 left-4",
    "top-right": "top-20 right-4",
  };

  if (!currentOrder) return null;

  const PlatformIcon = platformIcons[currentOrder.platform].icon;
  const platformStyle = platformIcons[currentOrder.platform];

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 ${
        showOnMobile ? "" : "hidden md:block"
      }`}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              {/* 플랫폼 아이콘 */}
              <div className={`w-10 h-10 rounded-full ${platformStyle.bg} flex items-center justify-center flex-shrink-0`}>
                <PlatformIcon className={`h-5 w-5 ${platformStyle.color}`} />
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">주문 완료</span>
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-medium">{currentOrder.username}</span>님이{" "}
                  <span className="font-semibold text-primary">
                    {currentOrder.service} {currentOrder.quantity.toLocaleString()}개
                  </span>
                  를 주문했습니다
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentOrder.timeAgo}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
