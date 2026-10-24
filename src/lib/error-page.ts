export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เกิดข้อผิดพลาด - Songkhla SecureTrack</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .box { text-align: center; max-width: 480px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; }
    h1 { color: #f59e0b; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem; }
    button { background: #f59e0b; color: #0f172a; border: none; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #d97706; }
  </style>
</head>
<body>
  <div class="box">
    <h1>ระบบขัดข้องชั่วคราว</h1>
    <p>กำลังรีเฟรชหน้าเว็บหรือลองใหม่อีกครั้ง</p>
    <button onclick="window.location.reload()">โหลดใหม่</button>
  </div>
</body>
</html>`;
}
