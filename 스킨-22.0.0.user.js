// ==UserScript==
// @name         스킨
// @version      22.0.0
// @description  하이퍼챗 버튼 및 외곽선 버튼 색상 미적용 버그 (CSS 문법 오류) 해결
// @match        https://crack.wrtn.ai/*
// @grant        none
// @author       뤼튼 유저 & AI
// ==/UserScript==

(function () {
    'use strict';

    const styleId = 'custom-chat-skin-style-v22';
    const isChatPage = () => location.pathname.startsWith('/stories/');

    const slotsKey = 'customChatSkinSlots_v4.8';
    const bgImageUrlKey = 'bgImageUrl', bgImageEnabledKey = 'bgImageEnabled', bgSizeKey = 'bgImageSize', bgPositionKey = 'bgImagePosition', bgRepeatKey = 'bgImageRepeat', bgImageCustomSizeKey = 'bgImageCustomSize';
    const chatFontEnabledKey = 'chatFontEnabled', chatFontCustomCssKey = 'chatFontCustomCss', chatFontFamilyNameKey = 'chatFontFamilyName';
    const novelUiModeEnabledKey = 'novelUiModeEnabled_v4.8', removeBottomUiBgKey = 'removeBottomUiBg_v4.8';

    const decoImageKeys = [];
    for (let i = 1; i <= 3; i++) {
        decoImageKeys.push(`decoImage${i}_enabled`, `decoImage${i}_url`, `decoImage${i}_size`, `decoImage${i}_posX`, `decoImage${i}_posY`);
    }

    const presets = {
        sandstone: { myBg: '#F7F1E8', myText: '#3D342B', myItalic: '#8B7964', otherBg: '#EEE3D3', otherText: '#3D342B', otherItalic: '#9C8972', codeHeaderBg: '#2A211B', codeHeaderText: '#9E8F80', codeBg: '#332821', codeText: '#EDE4DA', codeHighlight: '#D4A373', uiBg: '#FDFBF7', uiTextPrimary: '#3D342B', uiTextSecondary: '#8B7964', uiHighlightBg: '#F5EFE6', uiBorder: '#EAE0D3', inputBg: '#FDFBF7', inputText: '#3D342B', inputBorder: '#EAE0D3', inputButtonBg: '#F5EFE6', chatBgColor: '#FDFBF7', scrollbarThumb: '#8B7964' },
        sakura: { myBg: '#FFF7F9', myText: '#3D2C2C', myItalic: '#A6787C', otherBg: '#FFEFF3', otherText: '#4A3A3A', otherItalic: '#B88A95', codeHeaderBg: '#4B2E3D', codeHeaderText: '#EFBBCF', codeBg: '#5C3B47', codeText: '#FCE7EF', codeHighlight: '#F28482', uiBg: '#FFF9FB', uiTextPrimary: '#4A3A3A', uiTextSecondary: '#A6787C', uiHighlightBg: '#FDEFF2', uiBorder: '#FADDE3', inputBg: '#FFF9FB', inputText: '#4A3A3A', inputBorder: '#FADDE3', inputButtonBg: '#FDEFF2', chatBgColor: '#FFF9FB', scrollbarThumb: '#A6787C' },
        obsidianSlate: { myBg: '#2B313A', myText: '#F0F6FC', myItalic: '#FDB863', otherBg: '#21262D', otherText: '#C9D1D9', otherItalic: '#A371F7', codeHeaderBg: '#010409', codeHeaderText: '#8B949E', codeBg: '#0D1117', codeText: '#F0F6FC', codeHighlight: '#FDB863', uiBg: '#161B22', uiTextPrimary: '#C9D1D9', uiTextSecondary: '#8B949E', uiHighlightBg: '#2A3039', uiBorder: '#30363D', inputBg: '#1A2027', inputText: '#C9D1D9', inputBorder: '#30363D', inputButtonBg: '#2A3039', chatBgColor: '#161B22', scrollbarThumb: '#8B949E' },
        surveyCorps: { myBg: '#1B2A47', myText: '#E6E9F0', myItalic: '#A5B5D9', otherBg: '#2C3E50', otherText: '#FFFFFF', otherItalic: '#B0C4DE', codeHeaderBg: '#0F172A', codeHeaderText: '#94A3B8', codeBg: '#1E293B', codeText: '#E2E8F0', codeHighlight: '#38BDF8', uiBg: '#0F172A', uiTextPrimary: '#F1F5F9', uiTextSecondary: '#94A3B8', uiHighlightBg: '#1E293B', uiBorder: '#334155', inputBg: '#1E293B', inputText: '#F1F5F9', inputBorder: '#334155', inputButtonBg: '#0F172A', chatBgColor: '#0B1120', scrollbarThumb: '#475569' },
        underground: { myBg: '#2A2A2A', myText: '#D1D1D1', myItalic: '#888888', otherBg: '#1E1E1E', otherText: '#B0B0B0', otherItalic: '#707070', codeHeaderBg: '#000000', codeHeaderText: '#666666', codeBg: '#111111', codeText: '#999999', codeHighlight: '#555555', uiBg: '#121212', uiTextPrimary: '#A0A0A0', uiTextSecondary: '#555555', uiHighlightBg: '#1A1A1A', uiBorder: '#222222', inputBg: '#1A1A1A', inputText: '#D1D1D1', inputBorder: '#333333', inputButtonBg: '#111111', chatBgColor: '#0A0A0A', scrollbarThumb: '#444444' },
        blackTea: { myBg: '#3E2723', myText: '#D7CCC8', myItalic: '#A1887F', otherBg: '#4E342E', otherText: '#EFEBE9', otherItalic: '#BCAAA4', codeHeaderBg: '#26140F', codeHeaderText: '#8D6E63', codeBg: '#36231C', codeText: '#BCAAA4', codeHighlight: '#FFB300', uiBg: '#26140F', uiTextPrimary: '#D7CCC8', uiTextSecondary: '#795548', uiHighlightBg: '#3E2723', uiBorder: '#4E342E', inputBg: '#3E2723', inputText: '#EFEBE9', inputBorder: '#5D4037', inputButtonBg: '#26140F', chatBgColor: '#1E0F0A', scrollbarThumb: '#5D4037' },
        cleanRoom: { myBg: '#FFFFFF', myText: '#333333', myItalic: '#777777', otherBg: '#F5F7FA', otherText: '#444444', otherItalic: '#888888', codeHeaderBg: '#E2E8F0', codeHeaderText: '#475569', codeBg: '#F1F5F9', codeText: '#334155', codeHighlight: '#2563EB', uiBg: '#FFFFFF', uiTextPrimary: '#1E293B', uiTextSecondary: '#94A3B8', uiHighlightBg: '#F8FAFC', uiBorder: '#E2E8F0', inputBg: '#FFFFFF', inputText: '#1E293B', inputBorder: '#CBD5E1', inputButtonBg: '#F1F5F9', chatBgColor: '#F8FAFC', scrollbarThumb: '#CBD5E1' },
        lavender: { myBg: '#F4EFFF', myText: '#4A3B69', myItalic: '#8473A8', otherBg: '#FAF7FF', otherText: '#4A3B69', otherItalic: '#8473A8', codeHeaderBg: '#E9DFFF', codeHeaderText: '#6B5B95', codeBg: '#F0E6FF', codeText: '#4A3B69', codeHighlight: '#9D84D2', uiBg: '#FCFAFF', uiTextPrimary: '#4A3B69', uiTextSecondary: '#8473A8', uiHighlightBg: '#F4EFFF', uiBorder: '#E9DFFF', inputBg: '#FCFAFF', inputText: '#4A3B69', inputBorder: '#E9DFFF', inputButtonBg: '#F4EFFF', chatBgColor: '#FCFAFF', scrollbarThumb: '#B39DDB' },
        mint: { myBg: '#E8F5E9', myText: '#2E4C31', myItalic: '#608564', otherBg: '#F1F8F2', otherText: '#2E4C31', otherItalic: '#608564', codeHeaderBg: '#C8E6C9', codeHeaderText: '#388E3C', codeBg: '#DCEDC8', codeText: '#2E4C31', codeHighlight: '#4CAF50', uiBg: '#F9FDF9', uiTextPrimary: '#2E4C31', uiTextSecondary: '#608564', uiHighlightBg: '#E8F5E9', uiBorder: '#C8E6C9', inputBg: '#F9FDF9', inputText: '#2E4C31', inputBorder: '#C8E6C9', inputButtonBg: '#E8F5E9', chatBgColor: '#F9FDF9', scrollbarThumb: '#A5D6A7' }
    };

    let s = JSON.parse(localStorage.getItem('wrtn_skin_config_v15')) || presets.sandstone;
    const defaultColors = presets.sandstone;
    const allSettingKeys = [...Object.keys(defaultColors), bgImageEnabledKey, bgImageUrlKey, bgSizeKey, bgPositionKey, bgRepeatKey, bgImageCustomSizeKey, ...decoImageKeys, chatFontEnabledKey, chatFontCustomCssKey, chatFontFamilyNameKey, novelUiModeEnabledKey, removeBottomUiBgKey];

    const getColor = (key) => {
        const inputEl = document.getElementById(key);
        if (inputEl && inputEl.type === 'color') return inputEl.value;
        return localStorage.getItem(key) || defaultColors[key];
    };

    const nukeShikiBackground = () => {
        if (!isChatPage()) return;
        const currentCodeBg = getColor('codeBg');
        document.querySelectorAll('pre.shiki, .wrtn-codeblock, .css-vhnxen').forEach(el => {
            el.style.setProperty('background-color', currentCodeBg, 'important');
            el.style.setProperty('background', currentCodeBg, 'important');
            if(el.tagName === 'PRE') {
                el.style.setProperty('--shiki-dark-bg', currentCodeBg, 'important');
                el.style.setProperty('--shiki-light-bg', currentCodeBg, 'important');
            }
        });
        document.querySelectorAll('pre.shiki *, pre.shiki span, pre.shiki .line').forEach(el => {
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
        });
    };

    const injectStyle = () => {
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
        if (!isChatPage()) return;

        const sizeMode = localStorage.getItem(bgSizeKey) || 'cover';
        let finalBgSize = sizeMode === 'custom' ? `${localStorage.getItem(bgImageCustomSizeKey) || '100'}%` : sizeMode;
        const isNovelMode = localStorage.getItem(novelUiModeEnabledKey) === 'true';
        const removeBottomBg = localStorage.getItem(removeBottomUiBgKey) !== 'false';
        const isBgEnabled = localStorage.getItem(bgImageEnabledKey) === 'true';
        const isFontEnabled = localStorage.getItem(chatFontEnabledKey) === 'true';
        const customFontCSS = isFontEnabled ? (localStorage.getItem(chatFontCustomCssKey) || '') : '';
        const chatFontFamily = isFontEnabled ? (localStorage.getItem(chatFontFamilyNameKey) || "'Noto Sans KR', '리디바탕', sans-serif") : "'Noto Sans KR', '리디바탕', sans-serif";

        const style = document.createElement('style');
        style.id = styleId;

        style.textContent = `
          ${customFontCSS}
          * { font-family: ${chatFontFamily} !important; }

          /* --- 최상단 메인 내비게이션 바 --- */
          div.relative.h-full.px-3.grid, header, nav { background-color: ${getColor('uiBg')} !important; }
          a[href="/"], a[href="/characters"], a[href="/my"], a[href="/image/generate"], span.text-text_tertiary { color: ${getColor('uiTextPrimary')} !important; }
          a.hover\\:bg-surface_tertiary:hover { background-color: ${getColor('uiHighlightBg')} !important; }
          div.relative.h-full.px-3.grid button, header button { background-color: transparent !important; }
          div.relative.h-full.px-3.grid button:hover, header button:hover { background-color: ${getColor('uiHighlightBg')} !important; }
          div.relative.h-full.px-3.grid svg, header svg { fill: ${getColor('uiTextPrimary')} !important; color: ${getColor('uiTextPrimary')} !important; }
          a[href="/"] svg[fill="#FF4432"] path { fill: #FF4432 !important; }
          input[placeholder="검색어를 입력해 주세요"] { background-color: ${getColor('inputBg')} !important; color: ${getColor('inputText')} !important; border-color: ${getColor('inputBorder')} !important; }
          input[placeholder="검색어를 입력해 주세요"]::placeholder { color: ${getColor('inputText')} !important; opacity: 0.6 !important; }

          /* --- 상단 타이틀/헤더 --- */
          div[class*="z-[5]"][class*="bg_screen"] { background-color: ${getColor('uiBg')} !important; border-bottom: 1px solid ${getColor('uiBorder')} !important; opacity: 1 !important; }
          div[class*="z-[5]"][class*="bg_screen"] * { color: ${getColor('uiTextPrimary')} !important; }
          div[class*="z-[5]"][class*="bg_screen"] svg { fill: ${getColor('uiTextPrimary')} !important; }

          /* --- 파티챗, 에피소드, 채팅내역 배경 및 텍스트 --- */
          div:has(> button[role="tab"]), div.css-ui1qcz { background-color: ${getColor('uiBg')} !important; }
          button[role="tab"] { background-color: ${getColor('uiBg')} !important; }
          button[role="tab"]:hover { background-color: ${getColor('uiHighlightBg')} !important; }
          button[role="tab"][data-state="active"] { border-bottom-color: ${getColor('uiTextPrimary')} !important; border-bottom: 2px solid ${getColor('uiTextPrimary')} !important; }
          button[role="tab"][data-state="active"] span, button[role="tab"][data-state="active"] div { color: ${getColor('uiTextPrimary')} !important; font-weight: bold !important; }
          button[role="tab"][data-state="inactive"] span, button[role="tab"][data-state="inactive"] div { color: ${getColor('uiTextSecondary')} !important; }
          span.text-line-gray-2, div.css-ui1qcz span { color: ${getColor('uiTextSecondary')} !important; }

          /* --- 채팅방 목록 (캐릭터 이름 & 메뉴 버튼) --- */
          div.css-mz5j7e { background-color: ${getColor('uiBg')} !important; border-radius: 6px; transition: background-color 0.2s; }
          div.css-mz5j7e:hover { background-color: ${getColor('uiHighlightBg')} !important; }
          span.chat-list-item-character-name { color: ${getColor('uiTextPrimary')} !important; }
          div.css-mz5j7e svg { fill: ${getColor('uiTextSecondary')} !important; color: ${getColor('uiTextSecondary')} !important; }
          div.css-mz5j7e button { background-color: transparent !important; }
          div.css-mz5j7e button:hover { background-color: ${getColor('uiHighlightBg')} !important; }

          /* --- 말풍선 및 본문 색상 --- */
          div[class*="rounded-[20px_20px_4px_20px]"], div[class*="bg-surface_chat_secondary"] { background-color: ${getColor('myBg')} !important; }
          div[class*="rounded-[20px_20px_4px_20px]"] p, div[class*="rounded-[20px_20px_4px_20px]"] span, div[class*="rounded-[20px_20px_4px_20px]"] strong { color: ${getColor('myText')} !important; }
          div[class*="rounded-[20px_20px_4px_20px]"] em { color: ${getColor('myItalic')} !important; }

          div[class*="rounded-[4px_20px_20px_20px]"] { background-color: ${isNovelMode ? 'transparent' : getColor('otherBg')} !important; box-shadow: ${isNovelMode ? 'none' : 'auto'} !important; }
          div[class*="rounded-[4px_20px_20px_20px]"] p, div[class*="rounded-[4px_20px_20px_20px]"] span, div[class*="rounded-[4px_20px_20px_20px]"] strong, div[class*="rounded-[4px_20px_20px_20px]"] li { color: ${getColor('otherText')} !important; }
          div[class*="rounded-[4px_20px_20px_20px]"] em { color: ${getColor('otherItalic')} !important; }

          /* ========================================= */
          /* 💡 하이퍼챗 및 툴바 버튼류 완벽 구출 영역 */
          /* ========================================= */
          button[class*="border-border"],
          button:has(img[alt*="하이퍼챗"]),
          button:has(img[src*="hyperchat"]) {
              background-color: ${getColor('inputButtonBg')} !important;
              border-color: ${getColor('uiBorder')} !important;
              color: ${getColor('uiTextPrimary')} !important;
          }
          button[class*="border-border"]:hover,
          button:has(img[alt*="하이퍼챗"]):hover,
          button:has(img[src*="hyperchat"]):hover {
              background-color: ${getColor('uiHighlightBg')} !important;
          }
          button[class*="border-border"] span,
          button:has(img[alt*="하이퍼챗"]) span,
          button:has(img[src*="hyperchat"]) span {
              color: ${getColor('uiTextPrimary')} !important;
          }
          button[class*="border-border"] svg,
          button:has(img[alt*="하이퍼챗"]) svg,
          button:has(img[src*="hyperchat"]) svg {
              fill: ${getColor('uiTextPrimary')} !important;
              color: ${getColor('uiTextPrimary')} !important;
          }

          /* 투명 아이콘 버튼들 (메시지 옵션 등) */
          button[aria-label*="메시지 옵션"], button.dropdown-button > button, button.size-7, button.h-6 { background-color: transparent !important; border: none !important; }
          button[aria-label*="메시지 옵션"]:hover, button.dropdown-button > button:hover { background-color: ${getColor('uiHighlightBg')} !important; }
          button[aria-label*="메시지 옵션"] svg, button.size-7 svg, button.h-6 svg { fill: ${getColor('uiTextSecondary')} !important; color: ${getColor('uiTextSecondary')} !important; }

          /* --- 상태창 (INFO) 헤더 및 본문 --- */
          .css-71xn2b, div:has(> span.css-1ywuktj) { background-color: ${getColor('codeHeaderBg')} !important; border-radius: 8px 8px 0 0 !important; }
          .css-1ywuktj, .css-71xn2b span { color: ${getColor('codeHeaderText')} !important; }
          .css-wi6y4n svg { fill: ${getColor('codeHeaderText')} !important; }

          .wrtn-codeblock, .css-vhnxen, pre.shiki { background-color: ${getColor('codeBg')} !important; background: ${getColor('codeBg')} !important; border-radius: 0 0 8px 8px !important; }
          pre.shiki { padding: 12px !important; }
          pre.shiki *, pre.shiki span, pre.shiki .line { background-color: transparent !important; background: transparent !important; }

          pre.shiki span[style*="#E1E4E8"], pre.shiki span[style*="#e1e4e8"] { color: ${getColor('codeText')} !important; }
          pre.shiki span[style*="#FFAB70"], pre.shiki span[style*="#ffab70"] { color: ${getColor('codeHighlight')} !important; font-weight: bold !important; }
          pre.shiki span[style*="--shiki-"]:not([style*="#E1E4E8"]):not([style*="#e1e4e8"]):not([style*="#FFAB70"]):not([style*="#ffab70"]) { color: ${getColor('codeText')} !important; }

          /* --- 하단 입력창 및 툴바 --- */
          .bg-bg_screen, div[class*="bg_screen"] { background-color: transparent !important; }
          div:has(> textarea.rc-textarea), div:has(> textarea[placeholder]) { background-color: ${getColor('inputBg')} !important; border: 1px solid ${getColor('inputBorder')} !important; border-radius: 12px !important; }
          textarea.rc-textarea, textarea[placeholder] { color: ${getColor('inputText')} !important; }
          textarea::placeholder { color: ${getColor('inputText')} !important; opacity: 0.6 !important; }
          div:has(> textarea) button:not([style*="rgb(255, 68, 50)"]) { background-color: transparent !important; border-color: ${getColor('inputBorder')} !important; }
          div:has(> textarea) button:not([style*="rgb(255, 68, 50)"]) svg { fill: ${getColor('inputText')} !important; }
          button[style*="rgb(255, 68, 50)"] { background-color: #ff6b6b !important; opacity: 0.9 !important; }
          button[style*="rgb(255, 68, 50)"] svg { fill: #fff !important; }

          /* --- 전체 뒷배경 (여백) --- */
          img, video, canvas, [style*="url"], [class*="Image"] { background-color: transparent !important; filter: none !important; border: none !important; }
          .css-dipbff, .css-1sfdc06, .css-j7qwjs, .css-uxwch2, .css-kvsjdq, .css-77lu4g { background-color: ${getColor('uiBg')} !important; }
          body, #root, div.flex.flex-col.w-full.px-5.sm\\:px-10.items-center, div.flex.flex-col.w-full.max-w-\\[768px\\] { background-color: transparent !important; }
          div.css-q11j3t, body {
            background-image: ${isBgEnabled ? `url('${localStorage.getItem(bgImageUrlKey) || ''}')` : 'none'};
            background-color: ${getColor('chatBgColor')} !important;
            background-size: ${finalBgSize}; background-position: ${localStorage.getItem(bgPositionKey) || '50% 50%'}; background-repeat: ${localStorage.getItem(bgRepeatKey) || 'no-repeat'}; background-attachment: fixed;
          }
          ::-webkit-scrollbar-thumb { background-color: ${getColor('scrollbarThumb')} !important; border-radius: 4px; }

          /* ========================================= */
          /* ✨ 추가 커스텀: 예쁘게 꾸미기 영역 ✨ */
          /* ========================================= */

          /* 1. 말풍선에 반투명 유리 효과 & 부드러운 그림자 넣기 */
          div[class*="rounded-[20px_20px_4px_20px]"],
          div[class*="rounded-[4px_20px_20px_20px]"] {
              backdrop-filter: blur(8px) !important; /* 배경을 살짝 흐리게 */
              -webkit-backdrop-filter: blur(8px) !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important; /* 입체감 그림자 */
              border: 1px solid rgba(255, 255, 255, 0.05) !important; /* 은은한 테두리 빛 반사 */
          }

          /* 2. 내 말풍선 모서리 더 둥글고 날렵하게 (메신저 스타일) */
          div[class*="rounded-[20px_20px_4px_20px]"] {
              border-radius: 20px 20px 4px 20px !important;
          }

          /* 3. 상대방 말풍선 모서리 설정 */
          div[class*="rounded-[4px_20px_20px_20px]"] {
              border-radius: 4px 20px 20px 20px !important;
          }

          /* 4. 맨 아래 텍스트 입력창 동글동글하게 만들기 */
          div:has(> textarea.rc-textarea), div:has(> textarea[placeholder]) {
              border-radius: 25px !important;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.05) !important;
          }

          /* 마우스 커서를 동그란 점 모양으로 변경 (예시) */
body, a, button {
    cursor: crosshair !important;
}

/* 입력창 클릭 시 테두리에 은은한 빛 효과 */
div:has(> textarea):focus-within {
    border-color: #ff6b6b !important; /* 강조하고 싶은 색상 */
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.3) !important;
    transition: all 0.3s ease;
}


@keyframes breathe {
    0% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
    50% { box-shadow: 0 0 15px rgba(255,255,255,0.5); }
    100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
}

div:has(> textarea):focus-within {
    animation: breathe 2s infinite ease-in-out;
}

/* 말풍선 공통 질감 설정 */
div[class*="rounded-[20px_20px_4px_20px]"],
div[class*="rounded-[4px_20px_20px_20px]"] {
    /* 1. 원하는 텍스처 이미지 주소 (아래 예시 중 골라보세요) */
    background-image: url('https://www.transparenttextures.com/patterns/paper-fibers.png') !important;

    /* 2. 배경색과 질감을 섞어주는 핵심 설정 */
    background-blend-mode: overlay !important;

    /* 3. 질감 크기 조절 (너무 크면 깨지니 적당히) */
    background-size: 200px !important;
    background-repeat: repeat !important;

    /* 4. 질감이 너무 튀지 않게 투명도 살짝 조절 */
    opacity: 0.95;
}

/* 내 말풍선에는 다른 질감을 넣고 싶다면? */
div[class*="rounded-[20px_20px_4px_20px]"] {
    background-image: url('https://www.transparenttextures.com/patterns/stardust.png') !important;
    background-blend-mode: soft-light !important;
}



        `;
        document.head.appendChild(style);
    };

    const injectDecoImages = () => {
        for (let i = 1; i <= 3; i++) {
            if (!document.getElementById(`deco-image-${i}`)) {
                const decoDiv = document.createElement('div');
                decoDiv.id = `deco-image-${i}`;
                Object.assign(decoDiv.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', backgroundRepeat: 'no-repeat', display: 'none' });
                document.body.appendChild(decoDiv);
            }
        }
    };

    const updateDecoImagesStyle = () => {
        for (let i = 1; i <= 3; i++) {
            const decoDiv = document.getElementById(`deco-image-${i}`);
            if (!decoDiv) continue;
            const enabled = localStorage.getItem(`decoImage${i}_enabled`) === 'true' && isChatPage();
            if (enabled) {
                Object.assign(decoDiv.style, {
                    display: 'block', backgroundImage: `url('${localStorage.getItem(`decoImage${i}_url`) || ''}')`,
                    backgroundSize: `${localStorage.getItem(`decoImage${i}_size`) || '100'}%`,
                    backgroundPosition: `${localStorage.getItem(`decoImage${i}_posX`) || '50'}% ${localStorage.getItem(`decoImage${i}_posY`) || '50'}%`, zIndex: '998'
                });
            } else decoDiv.style.display = 'none';
        }
    };

    const createSettingsPanel = () => {
        if (document.querySelector('#skinColorPanel')) return;
        const panel = document.createElement('div');
        panel.id = 'skinColorPanel';
        Object.assign(panel.style, {
            position: 'fixed', top: '80px', right: '20px', zIndex: '10002', background: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', display: 'none', fontFamily: 'sans-serif', fontSize: '14px', width: '380px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', color: '#333'
        });

        const colorInputHTML = (id, label) => `
            <label class="input-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;">
                <span>${label}</span>
                <div style="display:flex; align-items:center;">
                    <input type="color" id="${id}" style="width:30px; height:24px; padding:0; border:1px solid #ccc; cursor:pointer;">
                    <input type="text" id="${id}Hex" style="width:70px; height:22px; border:1px solid #ccc; border-left:none; padding-left:5px; text-transform:uppercase; font-size:12px; color:#333;" maxlength="7">
                </div>
            </label>`;

        panel.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;"><strong style="font-size: 16px;">🎨 스킨 커스텀 설정 (V22)</strong><button id="closeSkinPanel" style="border:none; background:transparent; font-size:16px; cursor:pointer; padding:0; color:#333;">❌</button></div>
          <details><summary style="font-weight:bold; cursor:pointer; color:#333; outline:none;">프리셋 테마 (9종)</summary>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding-top:10px;">
                <button class="preset-btn" data-preset="sandstone" style="cursor:pointer; font-size:12px; background:#f0f0f0; border:1px solid #ccc; border-radius:3px; padding:3px 0;">샌드스톤</button>
                <button class="preset-btn" data-preset="sakura" style="cursor:pointer; font-size:12px; background:#f0f0f0; border:1px solid #ccc; border-radius:3px; padding:3px 0;">사쿠라</button>
                <button class="preset-btn" data-preset="surveyCorps" style="cursor:pointer; font-size:12px; background:#e6e9f0; border:1px solid #ccc; border-radius:3px; padding:3px 0;">조사병단</button>
                <button class="preset-btn" data-preset="underground" style="cursor:pointer; font-size:12px; background:#d1d1d1; border:1px solid #ccc; border-radius:3px; padding:3px 0;">지하도시</button>
                <button class="preset-btn" data-preset="blackTea" style="cursor:pointer; font-size:12px; background:#d7ccc8; border:1px solid #ccc; border-radius:3px; padding:3px 0;">홍차</button>
                <button class="preset-btn" data-preset="cleanRoom" style="cursor:pointer; font-size:12px; background:#f8fafc; border:1px solid #ccc; border-radius:3px; padding:3px 0;">대청소</button>
                <button class="preset-btn" data-preset="lavender" style="cursor:pointer; font-size:12px; background:#F4EFFF; border:1px solid #ccc; border-radius:3px; padding:3px 0;">라벤더 (보라)</button>
                <button class="preset-btn" data-preset="mint" style="cursor:pointer; font-size:12px; background:#E8F5E9; border:1px solid #ccc; border-radius:3px; padding:3px 0;">민트 (초록)</button>
                <button class="preset-btn" data-preset="obsidianSlate" style="cursor:pointer; font-size:12px; background:#f0f0f0; border:1px solid #ccc; border-radius:3px; padding:3px 0;">옵시디언</button>
            </div>
          </details>
          <fieldset style="border:1px solid #ddd; padding:10px; margin-top:10px; border-radius:5px;"><legend style="font-weight:bold; padding:0 5px;">커스텀 슬롯</legend>
            ${[1, 2, 3].map(i => `<div style="display:flex; margin-bottom:4px;"><input type="text" class="slot-name-input" data-slot="${i}" placeholder="슬롯 ${i} 이름" style="flex-grow:1; border:1px solid #ccc; padding:4px;"><button class="slot-save" data-slot="${i}" style="margin-left:4px; cursor:pointer; font-size:12px; background:#f0f0f0; border:1px solid #ccc; border-radius:3px; padding:3px 6px;">저장</button><button class="slot-load" data-slot="${i}" style="margin-left:4px; cursor:pointer; font-size:12px; background:#f0f0f0; border:1px solid #ccc; border-radius:3px; padding:3px 6px;">로드</button></div>`).join('')}
          </fieldset>

          <details open style="margin-top:10px;"><summary style="font-weight:bold; cursor:pointer; color:#333; outline:none;">UI 및 글씨 (사이드바, 탭 포함)</summary>
            <div style="padding-top:10px;">
                ${colorInputHTML('uiBg', 'UI 및 상단 배경')}
                ${colorInputHTML('uiBorder', '구분선 및 버튼 테두리')}
                <hr style="margin:5px 0; border:0; border-top:1px dashed #ccc;">
                ${colorInputHTML('uiTextPrimary', '버튼 및 활성 탭 텍스트')}
                ${colorInputHTML('uiTextSecondary', '비활성 탭 및 서브 텍스트')}
                ${colorInputHTML('uiHighlightBg', '버튼/목록 호버 강조')}
                <hr style="margin:5px 0; border:0; border-top:1px dashed #ccc;">
                ${colorInputHTML('inputBg', '입력창 배경')}
                ${colorInputHTML('inputText', '입력창 텍스트')}
                ${colorInputHTML('inputBorder', '입력창 테두리')}
                ${colorInputHTML('inputButtonBg', '하이퍼챗 등 버튼 배경')}
                ${colorInputHTML('scrollbarThumb', '스크롤바')}
            </div>
          </details>

          <details style="margin-top:10px;"><summary style="font-weight:bold; cursor:pointer; color:#333; outline:none;">말풍선 & 상태창 (INFO)</summary>
            <div style="padding-top:10px;">
                <label style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;"><span>소설형 UI 모드</span><input type="checkbox" id="${novelUiModeEnabledKey}"></label>
                <hr style="margin:10px 0; border:0; border-top:1px solid #eee;">
                ${colorInputHTML('myBg', '내 배경')}${colorInputHTML('myText', '내 글씨')}${colorInputHTML('myItalic', '내 강조')}
                <hr style="margin:10px 0; border:0; border-top:1px solid #eee;">
                ${colorInputHTML('otherBg', 'AI 배경')}${colorInputHTML('otherText', 'AI 글씨')}${colorInputHTML('otherItalic', 'AI 강조')}
                <hr style="margin:10px 0; border:0; border-top:1px solid #eee;">
                ${colorInputHTML('codeHeaderBg', '상태창 헤더 배경')}${colorInputHTML('codeHeaderText', '상태창 헤더 글씨')}
                ${colorInputHTML('codeBg', '상태창 본문 배경')}
                ${colorInputHTML('codeText', '상태창 일반 글씨')}
                ${colorInputHTML('codeHighlight', '상태창 강조 글씨(수치)')}
                <hr style="margin:10px 0; border:0; border-top:1px solid #eee;">
                <label style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;"><span>커스텀 폰트 사용</span><input type="checkbox" id="${chatFontEnabledKey}"></label>
                <div id="custom-font-options" style="display:none; margin-top:5px;">
                    <textarea id="${chatFontCustomCssKey}" placeholder="@import url('...css');" style="width:100%; height:60px; border:1px solid #ccc; font-size:12px;"></textarea>
                    <input type="text" id="${chatFontFamilyNameKey}" placeholder="'폰트명', serif" style="width:100%; border:1px solid #ccc; padding:4px; margin-top:4px;">
                </div>
            </div>
          </details>

          <details style="margin-top:10px;"><summary style="font-weight:bold; cursor:pointer; color:#333; outline:none;">전체 배경 및 장식</summary>
            <div style="padding-top:10px;">
              ${colorInputHTML('chatBgColor', '전체 뒷배경 (여백 색상)')}
              <label style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;"><span>배경 이미지 사용</span><input type="checkbox" id="${bgImageEnabledKey}"></label>
              <input type="text" id="${bgImageUrlKey}" placeholder="배경 이미지 URL" style="width:100%; border:1px solid #ccc; padding:4px; margin-top:4px;">
              <select id="bgSizeSelect" style="width:100%; border:1px solid #ccc; padding:4px; margin-top:4px;"><option value="cover">화면 채우기</option><option value="contain">이미지 전체 보기</option><option value="custom">사용자 지정 (%)</option></select>
              <div id="bg-size-slider-container" style="display:none; align-items:center; margin-top:5px;"><input type="range" id="bgSizeSlider" min="10" max="200" style="flex-grow:1;"><span id="bgSizeValue" style="width:40px; text-align:right;">100%</span></div>
              <hr style="margin:15px 0 10px 0; border:0; border-top:1px solid #eee;">
              <strong style="display:block; margin-bottom:5px;">장식 이미지</strong>
              ${[1,2,3].map(i => `
              <details style="margin-bottom:5px; border:1px solid #eee; padding:5px;"><summary style="font-size:12px; cursor:pointer; outline:none;">장식 ${i}</summary>
                  <label style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:13px;"><span>사용</span><input type="checkbox" id="decoImage${i}_enabled"></label>
                  <input type="text" id="decoImage${i}_url" placeholder="이미지 URL" style="width:100%; border:1px solid #ccc; padding:4px; margin-top:4px;">
                  <div style="display:flex; align-items:center; margin-top:4px;"><span style="width:30px; font-size:13px;">크기</span><input type="range" id="decoImage${i}_size" min="10" max="300" style="flex-grow:1;"><span id="decoImage${i}_sizeValue" style="width:40px; text-align:right; font-size:13px;">100%</span></div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                      <span style="font-size:13px;">위치</span>
                      <div id="decoImage${i}_posPad" class="pos-pad" data-index="${i}" style="width:100px; height:60px; border:1px solid #999; cursor:crosshair; position:relative; background:#f0f0f0;"><div id="decoImage${i}_posIndicator" style="position:absolute; width:6px; height:6px; background:blue; border-radius:50%; transform:translate(-50%, -50%); pointer-events:none;"></div></div>
                  </div>
              </details>
              `).join('')}
            </div>
          </details>
          <button id="applyMainBtn" style="width:100%; padding:10px; background:#ff6b6b; color:white; border:none; border-radius:5px; margin-top:15px; font-weight:bold; cursor:pointer;">설정 저장 및 새로고침</button>
        `;
        document.body.appendChild(panel);

        Object.keys(defaultColors).forEach(key => {
            const colorPicker = document.getElementById(key);
            if (!colorPicker) return;
            const hexInput = document.getElementById(`${key}Hex`);
            colorPicker.addEventListener('input', () => hexInput.value = colorPicker.value.toUpperCase());
            hexInput.addEventListener('input', () => {
                let v = hexInput.value;
                if (!v.startsWith('#')) v = '#' + v;
                if (/^#[0-9A-F]{6}$/i.test(v)) colorPicker.value = v;
            });
        });

        const updatePanelValues = () => {
            allSettingKeys.forEach(k => {
                const el = document.getElementById(k);
                if(el) {
                    if (el.type === 'color') { el.value = localStorage.getItem(k) || defaultColors[k] || '#000000'; document.getElementById(`${k}Hex`).value = el.value.toUpperCase(); }
                    else if (el.type === 'checkbox') el.checked = (k === removeBottomUiBgKey) ? localStorage.getItem(k) !== 'false' : localStorage.getItem(k) === 'true';
                    else if (el.type === 'range') { el.value = localStorage.getItem(k) || '100'; const v = document.getElementById(`${k}Value`); if(v) v.textContent = `${el.value}%`; }
                    else el.value = localStorage.getItem(k) || '';
                }
            });
            document.getElementById('bgSizeSelect').value = localStorage.getItem(bgSizeKey) || 'cover';
            document.getElementById('bg-size-slider-container').style.display = localStorage.getItem(bgSizeKey) === 'custom' ? 'flex' : 'none';
            document.getElementById('custom-font-options').style.display = localStorage.getItem(chatFontEnabledKey) === 'true' ? 'block' : 'none';

            for(let i=1; i<=3; i++) {
                const x = parseFloat(localStorage.getItem(`decoImage${i}_posX`)||'50'), y = parseFloat(localStorage.getItem(`decoImage${i}_posY`)||'50');
                const pad = document.getElementById(`decoImage${i}_posPad`), ind = document.getElementById(`decoImage${i}_posIndicator`);
                if(pad && ind) { ind.style.left = `${x}%`; ind.style.top = `${y}%`; }
            }
            const slots = JSON.parse(localStorage.getItem(slotsKey) || '{}');
            for(let i=1; i<=3; i++) {
                const nameInput = document.querySelector(`.slot-name-input[data-slot="${i}"]`);
                if(nameInput) nameInput.value = (slots[`slot${i}`] && slots[`slot${i}`].name) ? slots[`slot${i}`].name : '';
            }
        };

        document.getElementById('closeSkinPanel').onclick = () => panel.style.display = 'none';
        document.getElementById('applyMainBtn').onclick = () => {
            allSettingKeys.forEach(k => { const el = document.getElementById(k); if(el) localStorage.setItem(k, el.type === 'checkbox' ? String(el.checked) : el.value); });
            localStorage.setItem(bgSizeKey, document.getElementById('bgSizeSelect').value);
            injectStyle(); updateDecoImagesStyle();
            nukeShikiBackground();
            alert('설정이 저장되었습니다! 새로고침합니다.'); location.reload();
        };

        panel.querySelectorAll('.preset-btn').forEach(b => {
            b.onclick = () => {
                const p = presets[b.dataset.preset];
                Object.keys(p).forEach(k => localStorage.setItem(k, p[k]));
                updatePanelValues(); injectStyle();
            };
        });

        panel.querySelectorAll('.s-save').forEach(b => {
            b.onclick = () => {
                const idx = b.dataset.slot;
                const name = document.querySelector(`.slot-name-input[data-slot="${idx}"]`).value || `슬롯 ${idx}`;
                const slots = JSON.parse(localStorage.getItem(slotsKey) || '{}');
                const settings = {};
                allSettingKeys.forEach(k => { const el=document.getElementById(k); if(el) settings[k] = el.type==='checkbox'?String(el.checked):el.value; });
                settings[bgSizeKey] = document.getElementById('bgSizeSelect').value;
                slots[`slot${idx}`] = { name, settings };
                localStorage.setItem(slotsKey, JSON.stringify(slots));
                alert(`'${name}'(으)로 슬롯 ${idx}에 저장되었습니다.`);
            };
        });

        panel.querySelectorAll('.s-load').forEach(b => {
            b.onclick = () => {
                const idx = b.dataset.slot;
                const slots = JSON.parse(localStorage.getItem(slotsKey) || '{}');
                if(slots[`slot${idx}`]) {
                    Object.keys(slots[`slot${idx}`].settings).forEach(k => localStorage.setItem(k, slots[`slot${idx}`].settings[k]));
                    updatePanelValues(); injectStyle(); updateDecoImagesStyle();
                    alert(`슬롯 ${idx}을(를) 불러왔습니다.`);
                } else alert('빈 슬롯입니다.');
            };
        });

        document.getElementById('bgSizeSelect').onchange = (e) => document.getElementById('bg-size-slider-container').style.display = e.target.value === 'custom' ? 'flex' : 'none';
        document.getElementById(chatFontEnabledKey).onchange = (e) => document.getElementById('custom-font-options').style.display = e.target.checked ? 'block' : 'none';

        let currentPad = null;
        document.addEventListener('mousemove', (e) => {
            if(!currentPad) return;
            const rect = currentPad.getBoundingClientRect();
            let x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            let y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
            const ind = currentPad.querySelector('div');
            ind.style.left = `${x}%`; ind.style.top = `${y}%`;
            localStorage.setItem(`decoImage${currentPad.dataset.index}_posX`, x.toFixed(2));
            localStorage.setItem(`decoImage${currentPad.dataset.index}_posY`, y.toFixed(2));
            updateDecoImagesStyle();
        });
        document.addEventListener('mouseup', () => currentPad = null);
        panel.querySelectorAll('.pos-pad').forEach(pad => pad.onmousedown = (e) => currentPad = pad);

        for (let i = 1; i <= 3; i++) {
            document.getElementById(`decoImage${i}_size`).oninput = (e) => {
                document.getElementById(`decoImage${i}_sizeValue`).textContent = `${e.target.value}%`;
                localStorage.setItem(`decoImage${i}_size`, e.target.value);
                updateDecoImagesStyle();
            };
        }
        updatePanelValues();
    };

    const insertBtn = () => {
        if (document.getElementById('fixed-toggle-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'fixed-toggle-btn';
        Object.assign(btn.style, {
            position: 'fixed', bottom: '20px', right: '20px', zIndex: '10001', width: '45px', height: '45px', backgroundColor: '#ff6b6b', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontSize: '24px'
        });
        btn.innerHTML = '🎨';
        btn.onclick = () => { const p = document.getElementById('skinColorPanel'); if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none'; };
        document.body.appendChild(btn);
    };

    const run = () => {
        injectStyle();
        injectDecoImages();
        updateDecoImagesStyle();
        createSettingsPanel();
        insertBtn();
    };



    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', run);
    else run();

    setInterval(nukeShikiBackground, 500);

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; setTimeout(run, 500); }
    }).observe(document.body, { subtree: true, childList: true });

})();