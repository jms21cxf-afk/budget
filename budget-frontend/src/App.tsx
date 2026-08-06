// 앱 루트 — 가계부·통계 탭 전환
import { useState } from 'react';
import { BottomNav, type AppTab } from './components/layout/BottomNav';
import { StatisticsPage } from './pages/StatisticsPage';
import { TransactionListPage } from './pages/TransactionListPage';
import './App.css';

function App() {
  const [tab, setTab] = useState<AppTab>('ledger');

  return (
    <div className="app">
      <div className="app__content">
        {tab === 'ledger' ? <TransactionListPage /> : <StatisticsPage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
