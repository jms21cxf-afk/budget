// 뷰 탭 — 목록 / 달력 / 월별 / 메모
import type { ViewMode } from '../../utils/constants';
import { VIEW_LABELS } from '../../utils/constants';
import './ViewTabs.css';

const VIEW_MODES: ViewMode[] = ['list', 'calendar', 'monthly', 'memo'];

interface ViewTabsProps {
  active: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className="view-tabs" role="tablist" aria-label="보기 방식">
      {VIEW_MODES.map((view) => (
        <button
          key={view}
          type="button"
          role="tab"
          aria-selected={active === view}
          className={`view-tabs__item${active === view ? ' is-active' : ''}`}
          onClick={() => onChange(view)}
        >
          {VIEW_LABELS[view]}
        </button>
      ))}
    </div>
  );
}
