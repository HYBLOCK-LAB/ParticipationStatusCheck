'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';

interface AttendanceRow {
  [key: string]: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<{ events: string[], attendanceData: AttendanceRow[] } | null>(null);
  const [newEventName, setNewEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || '데이터를 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('서비와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEventName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: newEventName.trim() }),
      });
      if (response.ok) {
        setNewEventName('');
        await fetchData();
      } else {
        const result = await response.json();
        setError(result.error || '이벤트 추가 실패');
      }
    } catch (err) {
      setError('서버 통신 실패');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div>로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>
      
      <h1>관리자 대시보드</h1>

      <div className="card">
        <h3>새 이벤트 추가</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            placeholder="이벤트 이름 (예: Basic5)"
            style={{ marginBottom: 0 }}
          />
          <button onClick={handleAddEvent} disabled={loading}>추가</button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>출석 현황</h3>
        {data && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>이름</th>
                {data.events.map(event => (
                  <th key={event} style={{ padding: '10px', border: '1px solid #ddd' }}>{event}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.attendanceData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{Object.values(row)[0]}</td>
                  {data.events.map(event => (
                    <td key={event} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {row[event] === 'Attendence' ? '✅' : row[event] === 'Late' ? '⏰' : row[event] === 'Absence' ? '❌' : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>이벤트별 QR 코드</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {data?.events.map(event => (
            <div key={event} style={{ textAlign: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{event}</p>
              <QRCodeSVG
                value={`${baseUrl}/?event=${encodeURIComponent(event)}`}
                size={150}
                includeMargin={true}
              />
              <div style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
                <a href={`https://api.qr-server.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${baseUrl}/?event=${encodeURIComponent(event)}`)}`} target="_blank" rel="noopener noreferrer">
                  고화질 QR 다운로드 (QR Server)
                </a>
              </div>
              <div style={{ marginTop: '5px', fontSize: '12px' }}>
                <a href={`${baseUrl}/?event=${encodeURIComponent(event)}`} target="_blank" rel="noopener noreferrer">
                  페이지 열기
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
