import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  sku: string
  quantity: number
  price: number
  low_stock_threshold: number
  expiry_date: string | null
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [threshold, setThreshold] = useState('10')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    API.get('/products/').then(res => setProducts(res.data)).catch(() => navigate('/login'))
  }

  useEffect(() => { load() }, [])

  const addProduct = async () => {
    try {
      await API.post('/products/', {
        name, sku,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        low_stock_threshold: parseInt(threshold)
      })
      setName(''); setSku(''); setQuantity(''); setPrice(''); setThreshold('10')
      setShowForm(false)
      load()
    } catch {
      alert('Failed to add product. SKU may already exist.')
    }
  }

  const deleteProduct = async (id: number) => {
    await API.delete(`/products/${id}`)
    load()
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
          <h1 style={styles.heading}>Products</h1>
          <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Add Product</button>
        </div>
        {showForm && (
          <div style={styles.form}>
            <input style={styles.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input style={styles.input} placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} />
            <input style={styles.input} placeholder="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
            <input style={styles.input} placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <input style={styles.input} placeholder="Low Stock Threshold" type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
            <button style={styles.button} onClick={addProduct}>Save Product</button>
          </div>
        )}
        <table style={styles.table}>
          <thead>
            <tr>{['Name', 'SKU', 'Quantity', 'Price', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.sku}</td>
                <td style={{ ...styles.td, color: p.quantity <= p.low_stock_threshold ? '#ef4444' : 'inherit', fontWeight: p.quantity <= p.low_stock_threshold ? 600 : 400 }}>{p.quantity}</td>
                <td style={styles.td}>${p.price.toFixed(2)}</td>
                <td style={styles.td}><button onClick={() => deleteProduct(p.id)} style={styles.deleteBtn}>Delete</button></td>
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
  deleteBtn: { padding: '4px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
}