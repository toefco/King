import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Loader2 } from 'lucide-react';
import { isOwnerMode } from '../../store';
import {
  sendToDeepSeek,
  buildSystemPrompt,
  formatUserDataForAI,
  getRemainingMessages,
  canSendMessage,
} from '../../utils/deepseek';

/* ─── 页面配置表 ────────────────────────────────────────────────────────────── */

interface PageConfig {
  label: string;
  accent: string;
  charFont: string;
  charStyle: 'serif' | 'sans' | 'cursive' | 'elegant';
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  '/':        { label: '全局人格画像', accent: '#8b90b8', charFont: '"Ma Shan Zheng", cursive', charStyle: 'cursive' },
  '/fitness': { label: '体魄力量',    accent: '#d4856a', charFont: '"Noto Sans SC", "Microsoft YaHei", sans-serif', charStyle: 'sans' },
  '/wisdom':  { label: '智慧藏书',    accent: '#c9a96e', charFont: '"STSong", "Songti SC", serif', charStyle: 'serif' },
  '/spirit':  { label: '精神意识',    accent: '#9f9fd8', charFont: '"ZCOOL XiaoWei", serif', charStyle: 'elegant' },
  '/skills':  { label: '技艺磨练',    accent: '#6eb5c9', charFont: '"Noto Sans SC", sans-serif', charStyle: 'sans' },
  '/hobbies': { label: '爱好收集',    accent: '#c49fb4', charFont: '"Ma Shan Zheng", cursive', charStyle: 'cursive' },
  '/time':    { label: '时间记录',    accent: '#7ab89e', charFont: '"STSong", "Songti SC", serif', charStyle: 'serif' },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/* ─── 发光球体精灵组件 ───────────────────────────────────────────────────────── */

function OrbIcon({ accent, charFont, charStyle }: { accent: string; charFont: string; charStyle: string }) {
  const textStyle = {
    fontSize: 38,
    fontWeight: 900,
    letterSpacing: '0.15em',
    color: accent,
    fontFamily: charFont,
    transform: 'translateZ(20px)',
    fontVariationSettings: '"wght" 900',
    lineHeight: 1,
  };

  const getTextShadow = (style: string) => {
    switch (style) {
      case 'serif':
        return `
          0 0 12px ${accent}88,
          0 0 24px ${accent}66,
          0 0 48px ${accent}44,
          0 3px 8px rgba(0,0,0,0.95),
          0 1px 2px rgba(0,0,0,0.8)
        `;
      case 'sans':
        return `
          0 0 8px ${accent}66,
          0 0 16px ${accent}44,
          0 0 32px ${accent}33,
          0 4px 14px rgba(0,0,0,0.9)
        `;
      case 'cursive':
        return `
          0 0 20px ${accent}aa,
          0 0 40px ${accent}77,
          0 0 70px ${accent}55,
          0 0 100px ${accent}33,
          0 2px 6px rgba(0,0,0,0.85),
          0 -1px 3px rgba(255,255,255,0.15)
        `;
      case 'elegant':
        return `
          0 0 15px ${accent}99,
          0 0 30px ${accent}77,
          0 0 55px ${accent}55,
          0 0 80px ${accent}33,
          0 5px 18px rgba(0,0,0,0.92),
          0 2px 4px rgba(0,0,0,0.7),
          inset 0 1px 1px rgba(255,255,255,0.2)
        `;
      default:
        return `
          0 0 18px ${accent}ff,
          0 0 36px ${accent}ee,
          0 0 64px ${accent}cc,
          0 0 96px ${accent}88,
          0 4px 12px rgba(0,0,0,0.9)
        `;
    }
  };

  return (
    <div style={{ position: 'relative', width: 128, height: 128 }}>
      <div style={{
        position: 'absolute', inset: -20,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}20 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', left: 64, top: 64, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: 54, top: -5, width: 8, height: 8,
          borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}, 0 0 12px ${accent}50` }} />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 64, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: 44, top: -3, width: 5, height: 5,
          borderRadius: '50%', background: 'rgba(255,255,255,0.65)', boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 64, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: 50, top: -4, width: 6, height: 6,
          borderRadius: '50%', background: `${accent}aa`, boxShadow: `0 0 5px ${accent}70` }} />
      </div>
      <div style={{
        position: 'absolute', left: 16, top: 16,
        width: 96, height: 96, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.92) 25%, ${accent}15 45%, ${accent}30 70%, ${accent}25 100%)`,
        boxShadow: `
          0 0 40px ${accent}35,
          0 0 80px ${accent}20,
          inset 0 0 35px rgba(0,0,0,0.85),
          inset 0 0 20px ${accent}10
        `,
        border: `1.2px solid ${accent}45`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)',
        transformStyle: 'preserve-3d',
      }}>
        <div style={{
          ...textStyle,
          textShadow: getTextShadow(charStyle),
        }}>
          析
        </div>

        <div style={{
          position: 'absolute', bottom: '11%', right: '13%',
          width: '26%', height: '13%', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}65 0%, transparent 100%)`,
          transform: 'rotate(18deg)',
        }} />
      </div>
    </div>
  );
}

/* ─── 主组件 ─────────────────────────────────────────────────────────────────── */

export function AiSprite() {
  const { pathname } = useLocation();
  const config = PAGE_CONFIG[pathname] ?? PAGE_CONFIG['/'];
  const accent = config.accent;
  const isOwner = isOwnerMode();

  // 面板状态
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [hasWoken, setHasWoken] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 精灵位置与拖拽
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 初始化位置
  useEffect(() => {
    if (pathname === '/') {
      // 首页：中心位置
      setPos({
        x: (window.innerWidth / 2) - 64,
        y: (window.innerHeight / 2) - 64
      });
    } else {
      // 子系统页面：底部居中
      setPos({
        x: (window.innerWidth / 2) - 64,
        y: window.innerHeight - 160
      });
    }
  }, [pathname]);

  // 处理拖拽开始
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // 处理拖拽移动
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  // 首次唤醒处理
  const handleFirstWake = useCallback(() => {
    if (hasWoken) return;
    setHasWoken(true);

    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: isOwner
        ? '主人，全域资料库已完成对接，全部权限解锁，请下达指令。'
        : '金灵已就位，仅可查阅本站公开存档内容，本次对话共8次可用额度，现已可以随时发起问询。',
      timestamp: Date.now(),
    };

    setMessages([welcomeMessage]);
  }, [hasWoken, isOwner]);

  const handleOpen = useCallback(() => {
    // 如果正在拖拽，不触发打开
    if (isDragging) return;
    
    if (!isOpen) {
      setIsOpen(true);
      if (!hasWoken) {
        handleFirstWake();
      }
    } else {
      setIsOpen(false);
    }
  }, [isOpen, hasWoken, handleFirstWake, isDragging]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || loading) return;
    if (!canSendMessage()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '额度已用尽，今日对话终止。明日可再次发起问询。',
        timestamp: Date.now(),
      }]);
      setInputValue('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const userData = isOwner ? await formatUserDataForAI() : null;

      let apiMessages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      if (isOwner && userData) {
        apiMessages.push({ role: 'user', content: userData.text });
        apiMessages.push({ role: 'assistant', content: '已记录。' });
      }

      // 过滤掉欢迎消息再加入历史
      const historyMessages = messages.filter(m => !m.id.startsWith('welcome-'));
      historyMessages.forEach(m => {
        apiMessages.push({ role: m.role, content: m.content });
      });

      apiMessages.push({ role: 'user', content: trimmedValue });

      const response = await sendToDeepSeek(apiMessages);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '系统暂时无法响应，请稍后重试。',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, loading, messages, isOwner]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /* ─── JSX ────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .chat-panel {
          width: 420px;
          height: 550px;
          position: fixed;
          right: 16px;
          top: 16px;
          z-index: 9999;
        }
        
        @media (max-width: 768px) {
          .chat-panel {
            width: calc(100% - 32px);
            height: 55vh;
            max-height: 500px;
            left: 16px;
            right: 16px;
            bottom: 16px;
            top: auto;
          }
        }
      `}</style>

      {/* 悬浮触发按钮 */}
      {pos && (
        <button
          onClick={handleOpen}
          onPointerDown={handlePointerDown}
          className="fixed z-50 flex items-center justify-center"
          style={{
            left: pos.x,
            top: pos.y,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <OrbIcon accent={accent} charFont={config.charFont} charStyle={config.charStyle} />
        </button>
      )}

      {/* 对话面板 */}
      {isOpen && (
        <div
          className="chat-panel flex flex-col overflow-hidden"
          style={{
            background: 'rgba(5,5,14,0.93)',
            backdropFilter: 'blur(18px)',
            border: `1px solid ${accent}22`,
            borderRadius: '16px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
          }}
        >
          {/* 关闭按钮 */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-2">
              {!isOwner && (
                <span className="text-xs" style={{ color: `${accent}77` }}>
                  剩余 {getRemainingMessages()} 次
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{ color: `${accent}88`, background: `${accent}10`, border: `1px solid ${accent}20` }}
              >
                <X size={11} />
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto px-4 pt-14 pb-4 space-y-4" style={{ maxHeight: 'calc(100% - 100px)' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl"
                  style={{
                    background: msg.role === 'user' ? `${accent}25` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${msg.role === 'user' ? `${accent}40` : 'rgba(255,255,255,0.1)'}`,
                    color: msg.role === 'user' ? accent : 'rgba(255,255,255,0.85)',
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                  <span style={{ color: `${accent}aa`, fontSize: 13 }}>处理中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div
            className="p-4 border-t flex-shrink-0"
            style={{ borderColor: `${accent}15`, background: `${accent}08` }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={canSendMessage() ? "输入问询内容..." : "今日对话次数已用尽"}
                disabled={!canSendMessage() || loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-transparent outline-none text-sm transition-all"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  border: `1px solid ${canSendMessage() ? `${accent}35` : 'rgba(255,255,255,0.1)'}`,
                  background: `${accent}08`,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || !canSendMessage() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: inputValue.trim() && canSendMessage() ? accent : `${accent}20`,
                  color: inputValue.trim() && canSendMessage() ? '#000' : `${accent}66`,
                  border: `1px solid ${accent}40`,
                  cursor: inputValue.trim() && canSendMessage() ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
