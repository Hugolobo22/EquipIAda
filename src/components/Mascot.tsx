"use client";

import { forwardRef } from "react";
import type { MascotEmotion, MascotGesture } from "@/types/mascot";

type Props = {
  emotion: MascotEmotion;
  gesture: MascotGesture;
};

/**
 * SVG vetorial próprio, em camadas independentes. 
 * Olhos leem --pupil-x e --pupil-y atualizados imperativamente por pointermove.
 * Braços respondem a classes CSS; partes podem ser exportadas a Rive futuramente.
 */
export const Mascot = forwardRef<SVGSVGElement, Props>(function Mascot({ emotion, gesture }, ref) {
  const normalEyes = emotion === "neutral" || emotion === "curious";
  const sarcastic = emotion === "sarcastic";
  const annoyed = emotion === "annoyed";
  const sleepy = emotion === "sleepy";

  return (
    <svg
      ref={ref}
      className={`iada-svg emotion-${emotion} gesture-${gesture}`}
      viewBox="0 0 310 305"
      role="img"
      aria-label={`IAda, mascote robô, expressão ${emotion}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="botShell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf3ff" />
          <stop offset="45%" stopColor="#c4a6ff" />
          <stop offset="100%" stopColor="#7541d6" />
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#33306b" />
          <stop offset="70%" stopColor="#171330" />
          <stop offset="100%" stopColor="#090a1b" />
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e5d5ff" />
          <stop offset="1" stopColor="#834be0" />
        </linearGradient>
        <linearGradient id="ear" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5e2fb6" />
          <stop offset="65%" stopColor="#a879f7" />
          <stop offset="100%" stopColor="#e1cbff" />
        </linearGradient>
        <radialGradient id="orb"><stop offset="0" stopColor="#fffce9"/><stop offset="40%" stopColor="#ffe59e"/><stop offset="100%" stopColor="#fc89f9"/></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="drop"><feDropShadow dx="0" dy="11" stdDeviation="11" floodColor="#49308f" floodOpacity="0.22" /></filter>
      </defs>
      <g className="mascot-float">
        {/* Braços atrás do corpo e da cabeça */}
        <g className="arm arm-left">
          <path d="M111 193 Q74 192 59 172" stroke="#7040c0" strokeWidth="24" fill="none" strokeLinecap="round"/>
          <path d="M59 173 Q40 164 41 145 Q48 134 57 146 L66 158 Q68 137 78 142 Q85 148 77 163 L69 177 Z" fill="#e9d9ff" stroke="#7342c7" strokeWidth="4"/>
          <path d="M45 150 L51 157" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".75"/>
        </g>
        <g className="arm arm-right">
          <path d="M201 192 Q235 194 250 169" stroke="#7040c0" strokeWidth="24" fill="none" strokeLinecap="round"/>
          <path d="M245 171 Q257 163 267 152 Q275 149 278 157 Q280 163 272 170 Q283 163 287 173 Q285 180 276 181 Q275 191 263 193 Q246 192 239 182 Z" fill="#e9d9ff" stroke="#7342c7" strokeWidth="4"/>
          <path d="M258 159 Q261 170 255 179" stroke="#b18de8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </g>
        {/* Peito e pernas */}
        <rect x="100" y="174" width="112" height="86" rx="39" fill="url(#body)" stroke="#7040ba" strokeWidth="5" />
        <path d="M114 188 Q156 211 199 186" stroke="#f9f0ff" strokeWidth="7" opacity=".5" fill="none"/>
        <ellipse cx="124" cy="259" rx="19" ry="11" fill="#7b43d3" transform="rotate(17 124 259)"/>
        <ellipse cx="193" cy="259" rx="19" ry="11" fill="#7b43d3" transform="rotate(-17 193 259)"/>
        <rect x="134" y="214" width="44" height="31" rx="13" fill="#f4eaff" stroke="#9c69ec" strokeWidth="3" />
        <text x="156" y="236" textAnchor="middle" fill="#7c42d5" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">IA</text>
        {/* Antena com brilho */}
        <g className="antenna">
          <path d="M156 54 L160 29" stroke="#8652d7" strokeWidth="8" strokeLinecap="round" />
          <circle cx="162" cy="24" r="16" fill="#fb91fb" opacity=".28" filter="url(#glow)"/>
          <circle cx="162" cy="24" r="14" fill="url(#orb)" stroke="#f8c2ff" strokeWidth="2" />
          <ellipse cx="156" cy="18" rx="5" ry="3" fill="white" opacity=".9" transform="rotate(-30 156 18)"/>
        </g>
        {/* Orelhas */}
        <rect x="31" y="95" width="37" height="66" rx="19" fill="url(#ear)" stroke="#6f3abd" strokeWidth="5"/>
        <rect x="242" y="95" width="37" height="66" rx="19" fill="url(#ear)" stroke="#6f3abd" strokeWidth="5"/>
        <rect x="38" y="107" width="18" height="43" rx="9" fill="#ceabff" opacity=".9"/>
        <rect x="254" y="107" width="18" height="43" rx="9" fill="#ceabff" opacity=".9"/>
        {/* Cabeça */}
        <rect x="49" y="49" width="211" height="155" rx="68" fill="url(#botShell)" stroke="#8b55de" strokeWidth="5" filter="url(#drop)"/>
        <path d="M73 71 Q110 47 180 57" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" opacity=".72" />
        <rect x="68" y="72" width="174" height="111" rx="46" fill="url(#face)" stroke="#5d3aa7" strokeWidth="3"/>
        <path d="M89 84 Q130 65 189 80" fill="none" stroke="#6560aa" strokeWidth="4" strokeLinecap="round" opacity=".34"/>
        <circle cx="100" cy="161" r="10" fill="#ff83c7" opacity=".18"/>
        <circle cx="208" cy="161" r="10" fill="#ff83c7" opacity=".18"/>
        {/* Cada emoção tem um desenho diferente para os olhos */}
        {normalEyes && (
          <g className="eyes-blink">
            <g>
              <ellipse cx="119" cy="125" rx={emotion === "curious" ? 19 : 16} ry={emotion === "curious" ? 24 : 20} fill="#a8eeff" opacity=".20" />
              <ellipse cx="119" cy="125" rx={emotion === "curious" ? 16 : 13} ry={emotion === "curious" ? 21 : 18} fill="#9ce5ff" />
              <circle cx="119" cy="124" r="7" fill="#304f9a" className="pupil"/>
              <circle cx="115" cy="117" r="4" fill="white" opacity=".9" className="pupil"/>
            </g>
            <g>
              <ellipse cx="192" cy="125" rx={emotion === "curious" ? 20 : 16} ry={emotion === "curious" ? 24 : 20} fill="#a8eeff" opacity=".20" />
              <ellipse cx="192" cy="125" rx={emotion === "curious" ? 17 : 13} ry={emotion === "curious" ? 21 : 18} fill="#9ce5ff" />
              <circle cx="192" cy="124" r="7" fill="#304f9a" className="pupil"/>
              <circle cx="188" cy="117" r="4" fill="white" opacity=".9" className="pupil"/>
            </g>
          </g>
        )}
        {sarcastic && (
          <g stroke="#9ce5ff" strokeWidth="8" fill="none" strokeLinecap="round">
            <path d="M102 128 Q117 108 133 128"/>
            <path d="M178 126 Q192 134 208 122"/>
            <path d="M102 104 L128 111" stroke="#d1f4ff" strokeWidth="4"/>
          </g>
        )}
        {annoyed && (
          <g stroke="#9ce5ff" strokeWidth="8" fill="none" strokeLinecap="round">
            <path d="M103 121 L132 132"/><path d="M178 132 L206 121"/>
            <path d="M105 107 L134 118 M175 118 L204 107" stroke="#fd9dbd" strokeWidth="4"/>
          </g>
        )}
        {sleepy && (
          <g stroke="#9ce5ff" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M103 129 Q118 138 133 128"/><path d="M177 128 Q193 138 209 128"/>
          </g>
        )}
        {/* Boca */}
        {annoyed ? <path d="M143 162 Q155 154 169 161" fill="none" stroke="#ffa1ca" strokeWidth="5" strokeLinecap="round"/> :
         sleepy ? <ellipse cx="157" cy="161" rx="5" ry="7" fill="#ffa1ca" /> :
         sarcastic ? <path d="M142 157 Q162 165 172 153" fill="none" stroke="#ffa1ca" strokeWidth="5" strokeLinecap="round"/> :
         <g><path d="M139 150 Q156 173 174 149 Q175 168 158 174 Q141 173 139 150" fill="#ff84cb"/><path d="M148 164 Q159 161 168 166" stroke="#ffd2eb" strokeWidth="3" fill="none"/></g>}
        <g aria-hidden="true" className="emotion-fx">
          {emotion === "curious" && <text x="236" y="85" fontSize="30" fontWeight="900" fill="#8a4be2">?</text>}
          {emotion === "annoyed" && <text x="225" y="75" fontSize="29" fontWeight="900" fill="#ff6383">!</text>}
          {emotion === "sleepy" && <text x="225" y="76" fontSize="22" fontWeight="900" fill="#aa80e7">Zz</text>}
          {emotion === "sarcastic" && <path d="M230 93 L241 79" stroke="#f4bb6e" strokeWidth="4" strokeLinecap="round" />}
        </g>
      </g>
    </svg>
  );
});
