'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import members from '@/lib/members.json';

function CheckInForm() {
  const searchParams = useSearchParams();
  const event = searchParams.get('event');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const trimmedName = name.trim();
    if (!members.includes(trimmedName)) {
      setMessage({ type: 'error', text: '등록되지 않은 이름입니다. 관리자에게 문의하세요.' });
      setLoading(false);
      return;
    }

    if (!event) {
      setMessage({ type: 'error', text: '이벤트가 선택되지 않았습니다. QR 코드를 다시 스캔해주세요.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, event }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `${trimmedName}님, ${event} 출석이 완료되었습니다!` });
        setName('');
      } else {
        setMessage({ type: 'error', text: data.error || '출석 체크 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버와의 통신에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {event && <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>진행 중인 이벤트: {event}</p>}
      
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>이름을 입력하세요</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" style={{ width: '100%' }} disabled={loading || !event}>
          {loading ? '처리 중...' : '출석하기'}
        </button>
      </form>
    </>
  );
}

export default function CheckInPage() {
  return (
    <div className="card">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>
      
      <h1>출석 체크</h1>
      <Suspense fallback={<div>로딩 중...</div>}>
        <CheckInForm />
      </Suspense>
    </div>
  );
}
