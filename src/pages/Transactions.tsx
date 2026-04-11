import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

interface Transaction {
  id: number
  product_id: number
  type: string
  quantity: number
  note: string | null
  created_at: string
}

interface Product {
  id: number
  name: string
  price: number
  cost_price: number
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [type, setType] = useState('sale')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => {
    API.get('/transactions/').then(res => setTransactions(res.data)).catch(() => navigate('/login'))
    API.get('/products/').then(res => setProducts(res.data))
  }

  useEffect(() => { load() }, [])

  const addTransaction = async () => {
    setError('')
    try {
      await API.post('/transactions/', {
        product_id: parseInt(productId),
        type,
        quantity: parseInt(quantity),
        note: note || null
      })
      setProductId(''); setQuantity(''); setNote(''); setType('sale')
      setShowForm(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to record transaction')
    }
  }

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  const getProductName = (id: number) => {
    const p = products.find(p => p.id === id)
    return p ? p.name : `Product #${id}`
  }

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => {
    const p = products.find(p => p.id === t.product_id)
    return sum + (p ? p.price * t.quantity : 0)
  }, 0)

  const totalRestocks = transactions.filter(t => t.type === 'restock').length
  const totalSaleCount = transactions.filter(t => t.type === 'sale').length

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>I</div>
          <span style={styles.logoText}>Inventra</span>
        </div>
        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/dashboard"><span>📊</span> Dashboard</Link>
          <Link style={styles.navLink} to="/products"><span>📦</span> Products</Link>
          <Link style={{ ...styles.navLink, ...styles.navLinkActive }} to="/transactions"><span>💳</span> Transactions</Link>
        </nav>
        <button style={styles.logout} onClick={logout}>↩ Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Transactions</h1>
            <p style={styles.subheading}>{transactions.length} total · {totalSaleCount} sales · {totalRestocks} restocks</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ Record Transaction</button>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Revenue</p>
            <p style={{ ...styles.statValue, color: '#16a34a' }}>${totalSales.toFixed(2)}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Sales</p>
            <p style={styles.statValue}>{totalSaleCount}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Restocks</p>
            <p style={styles.statValue}>{totalRestocks}</p>
          </div>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Record Transaction</h2>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product</label>
                <select style={styles.input} value={productId} onChange={e => setProductId(e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
                  <option value="sale">Sale</option>
                  <option value="restock">Restock</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity</label>
                <input style={styles.input} placeholder="0" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Note (optional)</label>
                <input style={styles.input} placeholder="e.g. Morning sale" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button style={styles.saveBtn} onClick={addTransaction}>Save Transaction</button>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Product', 'Type', 'Quantity', 'Revenue', 'Profit', 'Note', 'Date'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const p = products.find(p => p.id === t.product_id)
                const revenue = p && t.type === 'sale' ? p.price * t.quantity : null
                return (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.productName}>{getProductName(t.product_id)}</span></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: t.type === 'sale' ? '#fee2e2' : '#dcfce7',
                        color: t.type === 'sale' ? '#ef4444' : '#16a34a'
                      }}>{t.type}</span>
                    </td>
                    <td style={styles.td}>{t.quantity}</td>
                    <td style={styles.td}>
                      {revenue !== null
                        ? <span style={{ color: '#16a34a', fontWeight: 500 }}>${revenue.toFixed(2)}</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td style={styles.td}>
                        {(() => {
                            if (t.type !== 'sale' || !p) return <span style={{ color: '#94a3b8' }}>-</span>
                            const profit = (p.price - (p.cost_price || 0)) * t.quantity
                            return <span style={{ color: profit >= 0 ? '#16a34a' : '#ef4444', fontWeight: 500 }}>${profit.toFixed(2)}</span>
                        })()}
                    </td>
                    <td style={styles.td}>{t.note || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '14px' }}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  logout: { background: 'transparent', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '14px' },
  main: { flex: 1, marginLeft: '240px', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  heading: { fontSize: '24px', fontWeight: 700, color: '#1e293b' },
  subheading: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  addBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: 500 },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  formTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#374151' },
  input: { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  saveBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
  cancelBtn: { background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' },
  error: { color: '#ef4444', fontSize: '13px', marginBottom: '12px' },
  tableCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#1e293b' },
  productName: { fontWeight: 500 },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 },
}