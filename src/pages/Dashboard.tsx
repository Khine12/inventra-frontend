import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

interface DashboardData {
  total_products: number
  low_stock_count: number
  expiring_soon_count: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/alerts/dashboard')
      .then(res => setData(res.data))
      .catch(() => navigate('/login'))
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Inventra</h2>
        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/dashboard">Dashboard</Link>
          <Link style={styles.navLink} to="/products">Products</Link>
          <Link style={styles.navLink} to="/transactions">Transactions</Link>
        </nav>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>
      <div style={styles.main}>
        <h1 style={styles.heading}>Dashboard</h1>
        {data ? (
          <div style={styles.grid}>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Products</p>
              <p style={styles.cardValue}>{data.total_products}</p>
            </div>
            <div style={{ ...styles.card, borderLeft: '4px solid #f59e0b' }}>
              <p style={styles.cardLabel}>Low Stock</p>
              <p style={styles.cardValue}>{data.low_stock_count}</p>
            </div>
            <div style={{ ...styles.card, borderLeft: '4px solid #ef4444' }}>
              <p style={styles.cardLabel}>Expiring Soon</p>
              <p style={styles.cardValue}>{data.expiring_soon_count}</p>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh', background: '#f5f5f5' },
  sidebar: { width: '220px', background: '#1e293b', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' },
  logo: { color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 2rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navLink: { color: '#94a3b8', textDecoration: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' },
  logout: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { flex: 1, padding: '2rem' },
  heading: { fontSize: '24px', fontWeight: 600, marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #2563eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardLabel: { fontSize: '13px', color: '#666', margin: '0 0 8px' },
  cardValue: { fontSize: '32px', fontWeight: 700, margin: 0 }
}