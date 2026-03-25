'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import members from '@/lib/members.json';
import { decodeEvent } from '@/lib/utils';

const translateEvent = (eventName: string | null) => {
  if (!eventName) return '';
  // BasicN -> 기본세션 N주차
  if (eventName.startsWith('Basic')) {
    const week = eventName.replace('Basic', '');
    return `기본세션 ${week}주차`;
  }
  // AdvancedN -> 심화세션 N주차
  if (eventName.startsWith('Advanced')) {
    const week = eventName.replace('Advanced', '');
    return `심화세션 ${week}주차`;
  }
  return eventName;
};

export default function CheckInForm() {
  const searchParams = useSearchParams();
  const encodedParam = searchParams.get('event');
  const event = encodedParam ? decodeEvent(encodedParam) : null;
  
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchEventStatus = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        if (response.ok) {
          setActiveEvent(data.activeEvent);
        }
      } catch (error) {
        console.error('Failed to fetch event status:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEventStatus();
  }, []);

  const isEventOpen = event && activeEvent && event === activeEvent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isEventOpen) {
      setMessage({ type: 'error', text: '현재 세션 또는 이벤트가 존재하지 않습니다.' });
      setLoading(false);
      return;
    }

    const trimmedName = name.trim();
    if (!members.includes(trimmedName)) {
      setMessage({ type: 'error', text: '등록되지 않은 이름입니다. 관리자에게 문의하세요.' });
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
        if (data.alreadyCheckedIn) {
          setMessage({ type: 'error', text: '이미 출석 완료되었습니다.' });
        } else {
          setMessage({ type: 'success', text: `${trimmedName}님, 출석이 완료되었습니다!` });
          setName('');
        }
      } else {
        setMessage({ type: 'error', text: data.error || '출석 체크 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버와의 통신에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvents) return <div style={{ textAlign: 'center', padding: '20px' }}>이벤트 정보 확인 중...</div>;

  return (
    <>
      {!isEventOpen ? (
        <div className="error">
          현재 세션 또는 이벤트가 존재하지 않습니다.
        </div>
      ) : (
        <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>
          <span className="event-label">{translateEvent(event)}</span>
        </p>
      )}
      
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
            disabled={loading || !isEventOpen}
          />
        </div>
        <button type="submit" style={{ width: '100%' }} disabled={loading || !isEventOpen}>
          {loading ? '처리 중...' : '출석하기'}
        </button>
      </form>
    </>
  );
}
