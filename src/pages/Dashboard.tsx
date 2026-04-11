import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DashboardData {
  total_products: number
  low_stock_count: number
  expiring_soon_count: number
}

interface Product {
  id: number
  name: string
  quantity: number
  low_stock_threshold: number
  price: number
}

interface Transaction {
  id: number
  product_id: number
  type: string
  quantity: number
  created_at: string
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/alerts/dashboard').then(res => setData(res.data)).catch(() => navigate('/login'))
    API.get('/products/').then(res => setProducts(res.data))
    API.get('/transactions/').then(res => setTransactions(res.data))
  }, [])

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  const chartData = products.slice(0, 6).map(p => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + '...' : p.name,
    quantity: p.quantity,
    threshold: p.low_stock_threshold
  }))

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>I</div>
          <span style={styles.logoText}>Inventra</span>
        </div>
        <nav style={styles.nav}>
          <Link style={{ ...styles.navLink, ...styles.navLinkActive }} to="/dashboard">
            <span>📊</span> Dashboard
          </Link>
          <Link style={styles.navLink} to="/products">
            <span>📦</span> Products
          </Link>
          <Link style={styles.navLink} to="/transactions">
            <span>💳</span> Transactions
          </Link>
        </nav>
        <button style={styles.logout} onClick={logout}>↩ Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Dashboard</h1>
            <p style={styles.subheading}>Welcome back! Here's your inventory overview.</p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #16a34a' }}>
            <p style={styles.statLabel}>Total Products</p>
            <p style={styles.statValue}>{data?.total_products ?? '—'}</p>
            <p style={styles.statHint}>Active inventory items</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b' }}>
            <p style={styles.statLabel}>Low Stock</p>
            <p style={{ ...styles.statValue, color: '#f59e0b' }}>{data?.low_stock_count ?? '—'}</p>
            <p style={styles.statHint}>Below threshold</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #ef4444' }}>
            <p style={styles.statLabel}>Expiring Soon</p>
            <p style={{ ...styles.statValue, color: '#ef4444' }}>{data?.expiring_soon_count ?? '—'}</p>
            <p style={styles.statHint}>Within 7 days</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #6366f1' }}>
            <p style={styles.statLabel}>Recent Transactions</p>
            <p style={{ ...styles.statValue, color: '#6366f1' }}>{transactions.length}</p>
            <p style={styles.statHint}>Total recorded</p>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.chartCard}>
            <h2 style={styles.cardTitle}>Stock Levels</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.quantity <= entry.threshold ? '#ef4444' : '#16a34a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={styles.chartHint}>🟢 Sufficient &nbsp; 🔴 Low stock</p>
          </div>

          <div style={styles.recentCard}>
            <h2 style={styles.cardTitle}>Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '1rem' }}>No transactions yet</p>
            ) : (
              recentTransactions.map(t => (
                <div key={t.id} style={styles.txRow}>
                  <div style={styles.txLeft}>
                    <span style={{
                      ...styles.badge,
                      background: t.type === 'sale' ? '#fee2e2' : '#dcfce7',
                      color: t.type === 'sale' ? '#ef4444' : '#16a34a'
                    }}>{t.type}</span>
                    <span style={styles.txDetail}>Product #{t.product_id}</span>
                  </div>
                  <div style={styles.txRight}>
                    <span style={styles.txQty}>×{t.quantity}</span>
                    <span style={styles.txDate}>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  sidebar: { width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingLeft: '8px' },
  logoIcon: { width: '32px', height: '32px', background: '#16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px' },
  logoText: { fontSize: '18px', fontWeight: 700, color: '#1e293b' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navLink: { display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' },
  navLinkActive: { background: '#f0fdf4', color: '#16a34a' },
  logout: { background: 'transparent', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '14px', marginTop: 'auto' },
  main: { flex: 1, marginLeft: '240px', padding: '2rem' },
  header: { marginBottom: '1.5rem' },
  heading: { fontSize: '24px', fontWeight: 700, color: '#1e293b' },
  subheading: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 500 },
  statValue: { fontSize: '32px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' },
  statHint: { fontSize: '12px', color: '#94a3b8' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  chartCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  recentCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' },
  chartHint: { fontSize: '12px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  txLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  txRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 },
  txDetail: { fontSize: '13px', color: '#64748b' },
  txQty: { fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  txDate: { fontSize: '12px', color: '#94a3b8' },
}