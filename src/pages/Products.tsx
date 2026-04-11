import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  sku: string
  quantity: number
  costPrice: number
  price: number
  low_stock_threshold: number
  expiry_date: string | null
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [price, setPrice] = useState('')
  const [threshold, setThreshold] = useState('10')
  const [expiryDate, setExpiryDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => {
    API.get('/products/').then(res => setProducts(res.data)).catch(() => navigate('/login'))
  }

  useEffect(() => { load() }, [])

  const addProduct = async () => {
    setError('')
    try {
      await API.post('/products/', {
        name, sku,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        cost_price: parseFloat(costPrice) || 0,
        low_stock_threshold: parseInt(threshold),
        expiry_date: expiryDate || null
      })
      setName(''); setSku(''); setQuantity(''); setPrice(''); setCostPrice(''); setThreshold('10'); setExpiryDate('')
      setShowForm(false)
      load()
    } catch {
      setError('Failed to add product. SKU may already exist.')
    }
  }

  const deleteProduct = async (id: number) => {
    if (confirm('Delete this product?')) {
      await API.delete(`/products/${id}`)
      load()
    }
  }

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const lowStockCount = products.filter(p => p.quantity <= p.low_stock_threshold).length

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>I</div>
          <span style={styles.logoText}>Inventra</span>
        </div>
        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/dashboard"><span>📊</span> Dashboard</Link>
          <Link style={{ ...styles.navLink, ...styles.navLinkActive }} to="/products"><span>📦</span> Products</Link>
          <Link style={styles.navLink} to="/transactions"><span>💳</span> Transactions</Link>
        </nav>
        <button style={styles.logout} onClick={logout}>↩ Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Products</h1>
            <p style={styles.subheading}>{products.length} items · {lowStockCount} low stock · ${totalValue.toFixed(2)} total value</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ Add Product</button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>New Product</h2>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name</label>
                <input style={styles.input} placeholder="e.g. Apple Juice" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>SKU (unique product code)</label>
                <input style={styles.input} placeholder="e.g. AJ-001" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity</label>
                <input style={styles.input} placeholder="0" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cost Price ($) - what you paid</label>
                <input style={styles.input} placeholder="0.00" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Selling Price ($) - what you charge</label>
                <input style={styles.input} placeholder="0.00" type="number" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Low Stock Threshold</label>
                <input style={styles.input} placeholder="10" type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date (optional)</label>
                <input style={styles.input} type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button style={styles.saveBtn} onClick={addProduct}>Save Product</button>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Product', 'SKU', 'Stock', 'Price', 'Value', 'Expiry', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.productName}>{p.name}</div>
                  </td>
                  <td style={styles.td}><span style={styles.sku}>{p.sku}</span></td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.stockBadge,
                      background: p.quantity <= p.low_stock_threshold ? '#fee2e2' : '#dcfce7',
                      color: p.quantity <= p.low_stock_threshold ? '#ef4444' : '#16a34a'
                    }}>
                      {p.quantity} {p.quantity <= p.low_stock_threshold ? '⚠️' : ''}
                    </span>
                  </td>
                  <td style={styles.td}>${p.price.toFixed(2)}</td>
                  <td style={styles.td}>${(p.price * p.quantity).toFixed(2)}</td>
                  <td style={styles.td}>
                    {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => deleteProduct(p.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '14px' }}>
                    No products yet. Add your first product above.
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
  sku: { fontSize: '12px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b', fontFamily: 'monospace' },
  stockBadge: { padding: '3px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: 500 },
  deleteBtn: { padding: '5px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 },
}