export default function App() {
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111',
        color: '#f5f5f5',
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        textAlign: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '4px',
          color: '#f0b429',
          marginBottom: '8px',
        }}
      >
        KAK ZONE
      </div>
      <div
        style={{
          width: '64px',
          height: '3px',
          backgroundColor: '#f0b429',
          borderRadius: '2px',
          marginBottom: '32px',
        }}
      />
      <h1 style={{ fontSize: '34px', fontWeight: 700, margin: '0 0 16px 0' }}>
        الموقع متوقف مؤقتاً
      </h1>
      <p style={{ fontSize: '18px', color: '#bbbbbb', margin: 0, lineHeight: 1.8 }}>
        هنرجع قريب جداً، شكراً لصبركم.
      </p>
    </div>
  );
}
