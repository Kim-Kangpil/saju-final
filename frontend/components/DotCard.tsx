'use client';

import React from 'react';

type DotCardProps = {
    children: React.ReactNode;
    className?: string;
    padding?: string | number;
    radius?: number;
    opacity?: number;
    dotColor?: string; // rgba or hex 가능
    dotSize?: number;  // 점 간격
    dotRadius?: number; // 점 크기(반지름)
};

export default function DotCard({
    children,
    className = '',
    padding = '24px',
    radius = 24,
    opacity = 0.06,
    dotColor = 'rgba(0,0,0,0.22)',
    dotSize = 10,
    dotRadius = 1,
}: DotCardProps) {
    return (
        <div
            className={`relative overflow-hidden bg-white ${className}`}
            style={{ borderRadius: radius }}
        >
            {/* 도트 레이어: 무조건 뒤(z-0) */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 0,
                    opacity,
                    backgroundImage: `radial-gradient(circle, ${dotColor} ${dotRadius}px, transparent ${dotRadius}px)`,
                    backgroundSize: `${dotSize}px ${dotSize}px`,
                }}
            />

            {/* 콘텐츠 레이어: 무조건 위(z-10) */}
            <div className="relative" style={{ zIndex: 10, padding }}>
                {children}
            </div>
        </div>
    );
}