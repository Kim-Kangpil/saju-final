"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const S = {
  cream: "#F5F1EA",
  ink: "#2C2417",
  ink3: "#6B5F4E",
  gold: "#8B7355",
};

export interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  price: string;
  redirectAfterLogin: string;
}

export default function PurchaseModal({
  open,
  onClose,
  productName,
  price,
  redirectAfterLogin,
}: PurchaseModalProps) {
  const router = useRouter();

  const handleKakao = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("purchase_redirect", redirectAfterLogin);
    }
    router.push("/start");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 1000,
            }}
          />

          {/* 모달 카드 */}
          <motion.div
            key="modal"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 340,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 36px",
              zIndex: 1001,
              fontFamily: "'Gmarket Sans', sans-serif",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* 아이콘 */}
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>

            {/* 제목 */}
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: S.ink,
                marginBottom: 8,
              }}
            >
              로그인하고 계속 볼게요
            </p>

            {/* 서브 */}
            <p
              style={{
                fontSize: 14,
                color: S.ink3,
                marginBottom: 16,
              }}
            >
              {productName} · {price}
            </p>

            {/* 안내 */}
            <p
              style={{
                fontSize: 13,
                color: S.ink,
                lineHeight: 1.7,
                marginBottom: 24,
                whiteSpace: "pre-line",
              }}
            >
              {"카카오 로그인 1초면 돼요.\n이미 가입하셨으면 바로 구매로 이어져요."}
            </p>

            {/* 카카오 버튼 */}
            <button
              type="button"
              onClick={handleKakao}
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                border: "none",
                background: "#FEE500",
                color: "#2C2417",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 12,
                fontFamily: "'Gmarket Sans', sans-serif",
              }}
            >
              카카오로 시작하기
            </button>

            {/* 취소 버튼 */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 14,
                color: S.ink3,
                cursor: "pointer",
                padding: "4px 8px",
                fontFamily: "'Gmarket Sans', sans-serif",
                marginBottom: 16,
              }}
            >
              취소
            </button>

            {/* 하단 안내 */}
            <p style={{ fontSize: 11, color: "#9A8A7A" }}>
              카드 정보 불필요 · 가입 후 바로 결제 가능
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
