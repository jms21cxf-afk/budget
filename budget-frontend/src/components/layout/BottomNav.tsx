// 하단 탭 — 가계부 / 통계 화면 전환
import './BottomNav.css';

export type AppTab = 'ledger' | 'stats';

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'ledger', label: '가계부' },
  { id: 'stats', label: '통계' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="메인 메뉴">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item${active === tab.id ? ' is-active' : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
