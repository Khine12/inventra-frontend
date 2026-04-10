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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={styles.heading}>Transactions</h1>
          <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Record Transaction</button>
        </div>
        {showForm && (
          <div style={styles.form}>
            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}
            <select style={styles.input} value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
              <option value="sale">Sale</option>
              <option value="restock">Restock</option>
            </select>
            <input style={styles.input} placeholder="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
            <input style={styles.input} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <button style={styles.button} onClick={addTransaction}>Save Transaction</button>
          </div>
        )}
        <table style={styles.table}>
          <thead>
            <tr>{['Product ID', 'Type', 'Quantity', 'Note', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td style={styles.td}>{t.product_id}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: t.type === 'sale' ? '#fee2e2' : '#dcfce7', color: t.type === 'sale' ? '#ef4444' : '#16a34a' }}>
                    {t.type}
                  </span>
                </td>
                <td style={styles.td}>{t.quantity}</td>
                <td style={styles.td}>{t.note || '-'}</td>
                <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  heading: { fontSize: '24px', fontWeight: 600, margin: 0 },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
  button: { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', borderBottom: '1px solid #eee' },
  td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #eee' },
  badge: { padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }
}