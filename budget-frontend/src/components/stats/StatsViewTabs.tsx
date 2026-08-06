// 통계 하위 탭 — 카테고리별 / 월별 / 연별
import './StatsViewTabs.css';

export type StatsView = 'category' | 'monthly' | 'yearly';

interface StatsViewTabsProps {
  active: StatsView;
  onChange: (view: StatsView) => void;
}

const TABS: { id: StatsView; label: string }[] = [
  { id: 'category', label: '카테고리별' },
  { id: 'monthly', label: '월별' },
  { id: 'yearly', label: '연별' },
];

export function StatsViewTabs({ active, onChange }: StatsViewTabsProps) {
  return (
    <div className="stats-view-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`stats-view-tabs__item${active === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
