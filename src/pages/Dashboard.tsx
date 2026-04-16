                      import { useEffect, useState } from 'react'
                      import API from '../api'
                      import { useNavigate, Link } from 'react-router-dom'
                      import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'

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

                      interface AnalyticsSummary {
                        total_revenue: number
                        total_cost: number
                        total_profit: number
                        profit_margin: number
                      }

                      interface DailyData {
                        date: string
                        revenue: number
                        cost: number
                        profit: number
                        sales: number
                      }

                      export default function Dashboard() {
                        const [data, setData] = useState<DashboardData | null>(null)
                        const [products, setProducts] = useState<Product[]>([])
                        const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([])
                        const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily')
                        const [chartFrom, setChartFrom] = useState('')
                        const [chartTo, setChartTo] = useState('')
                        const [analytics, setAnalytics] = useState<{ daily: DailyData[], summary: AnalyticsSummary } | null>(null)
                        const navigate = useNavigate()

                        useEffect(() => {
                          API.get('/alerts/dashboard').then(res => setData(res.data)).catch(() => navigate('/login'))
                          API.get('/products/').then(res => setProducts(res.data))
                          API.get('/transactions/').then(res => {
                              const all = res.data
                              const today = new Date().toLocaleDateString()
                              setTodayTransactions(all.filter((t: Transaction) =>
                                  new Date(t.created_at).toLocaleDateString() === today
                              ))
                          })
                          API.get('/alerts/analytics/revenue').then(res => setAnalytics(res.data))
                        }, [])

                        const logout = () => { localStorage.removeItem('token'); navigate('/login') }

                        const stockChartData = products.slice(0, 6).map(p => ({
                          name: p.name.length > 10 ? p.name.slice(0, 10) + '...' : p.name,
                          quantity: p.quantity,
                          threshold: p.low_stock_threshold
                        }))

                        const chartData = (() => {
                        if (!analytics) return []
                        let data = analytics.daily

                        // Apply date filter
                        if (chartFrom) data = data.filter(d => d.date >= chartFrom)
                        if (chartTo) data = data.filter(d => d.date <= chartTo)

                        // Group by month if monthly view
                        if (chartView === 'monthly') {
                          const grouped: Record<string, { date: string, revenue: number, cost: number, profit: number }> = {}
                          data.forEach(d => {
                            const month = d.date.slice(0, 7) // "2026-04"
                            if (!grouped[month]) grouped[month] = { date: month, revenue: 0, cost: 0, profit: 0 }
                            grouped[month].revenue += d.revenue
                            grouped[month].cost += d.cost
                            grouped[month].profit += d.profit
                          })
                          return Object.values(grouped)
                        }
                        return data
                        })()

                        const monthlyBreakdown = (() => {
                        if (!analytics) return []
                        const grouped: Record<string, { month: string, revenue: number, cost: number, profit: number }> = {}
                        analytics.daily.forEach(d => {
                          const month = d.date.slice(0, 7).replace(/\//g, '-')
                          const label = new Date(month + '-15').toLocaleString('default', { month: 'long', year: 'numeric' })
                          if (!grouped[month]) grouped[month] = { month: label, revenue: 0, cost: 0, profit: 0 }
                          grouped[month].revenue += d.revenue
                          grouped[month].cost += d.cost
                          grouped[month].profit += d.profit
                        })
                        return Object.values(grouped).reverse()
                      })()

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

                              {/* Top stat cards */}
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
                                  <p style={styles.statLabel}>Today's Transactions</p>
                                  <p style={{ ...styles.statValue, color: '#6366f1' }}>{todayTransactions.length}</p>
                                  <p style={styles.statHint}>Recorded today</p>
                                </div>
                              </div>

                              {/* Revenue summary cards */}
                              {analytics && (
                                <div style={styles.revenueGrid}>
                        <div style={{ ...styles.revenueCard, borderTop: '4px solid #16a34a' }}>
                          <p style={styles.statLabel}>Total Revenue</p>
                          <p style={{ ...styles.statValue, color: '#16a34a' }}>${analytics.summary.total_revenue.toFixed(2)}</p>
                          <p style={styles.statHint}>From all sales</p>
                        </div>
                        <div style={{ ...styles.revenueCard, borderTop: '4px solid #ef4444' }}>
                          <p style={styles.statLabel}>Total Cost</p>
                          <p style={{ ...styles.statValue, color: '#ef4444' }}>${analytics.summary.total_cost.toFixed(2)}</p>
                          <p style={styles.statHint}>Cost of goods sold</p>
                        </div>
                        <div style={{ ...styles.revenueCard, borderTop: '4px solid #16a34a' }}>
                          <p style={styles.statLabel}>Total Profit</p>
                          <p style={{ ...styles.statValue, color: analytics.summary.total_profit >= 0 ? '#16a34a' : '#ef4444' }}>
                            ${analytics.summary.total_profit.toFixed(2)}
                          </p>
                          <p style={styles.statHint}>Revenue minus cost</p>
                        </div>
                        <div style={{ ...styles.revenueCard }}>
                          <p style={styles.statLabel}>Profit Margin</p>
                          <p style={{ ...styles.statValue, color: '#6366f1' }}>{analytics.summary.profit_margin}%</p>
                          <p style={styles.statHint}>Overall margin</p>
                        </div>
                      </div>
                              )}

                              {monthlyBreakdown.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ ...styles.cardTitle, marginBottom: '0.75rem' }}>Monthly Breakdown</h2>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {monthlyBreakdown.map(m => (
                              <div key={m.month} style={{ ...styles.revenueCard, borderTop: '4px solid #6366f1' }}>
                                <p style={{ ...styles.statLabel, color: '#6366f1', fontWeight: 600 }}>{m.month}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                  <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Revenue</p>
                                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>${m.revenue.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Cost</p>
                                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>${m.cost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Profit</p>
                                    <p style={{ fontSize: '16px', fontWeight: 700, color: m.profit >= 0 ? '#16a34a' : '#ef4444' }}>${m.profit.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                              {/* Charts row */}
                              <div style={styles.chartsRow}>
                                {/* Revenue & Profit Line Chart */}
                                {analytics && (
                                  <div style={styles.chartCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                      <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Revenue & Profit Over Time</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {/* Daily/Monthly toggle */}
                                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                      {(['daily', 'monthly'] as const).map(v => (
                                        <button key={v} onClick={() => setChartView(v)} style={{
                                          padding: '5px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none',
                                          background: chartView === v ? '#16a34a' : '#fff',
                                          color: chartView === v ? '#fff' : '#64748b'
                                      }}>
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                      </button>
                                  ))}
                              </div>
                              {/* Date range */}
                              <input type="date" value={chartFrom} onChange={e => setChartFrom(e.target.value)}
                                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>to</span>
                              <input type="date" value={chartTo} onChange={e => setChartTo(e.target.value)}
                                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                              {(chartFrom || chartTo) && (
                                <button onClick={() => { setChartFrom(''); setChartTo('') }}
                                  style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                              <Legend />
                              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue" />
                              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} dot={false} name="Profit" />
                              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={false} name="Cost" />
                            </LineChart>
                                    </ResponsiveContainer>
                        </div>
                      )}

                                {/* Stock Level Bar Chart */}
                                <div style={styles.chartCard}>
                                  <h2 style={styles.cardTitle}>Stock Levels</h2>
                                  <ResponsiveContainer width="100%" height={220}>
                                      <BarChart data={stockChartData} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                          <YAxis tick={{ fontSize: 11 }} />
                                          <Tooltip />
                                          <Bar dataKey="quantity" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                  </ResponsiveContainer>
                                  <p style={styles.chartHint}>🟢 Sufficient &nbsp; 🔴 Low stock</p>
                                </div>
                              </div>

                              {/* Recent Transactions */}
                              <div style={styles.recentCard}>
                                <h2 style={styles.cardTitle}>Today's Transactions</h2>
                                {todayTransactions.length === 0 ? (
                                  <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '1rem' }}>No transactions yet</p>
                                ) : (
                                  todayTransactions.map(t => (
                                    <div key={t.id} style={styles.txRow}>
                                      <div style={styles.txLeft}>
                                        <span style={{
                                          ...styles.badge,
                                          background: t.type === 'sale' ? '#fee2e2' : '#dcfce7',
                                          color: t.type === 'sale' ? '#ef4444' : '#16a34a'
                                        }}>{t.type}</span>
                                        <span style={styles.txDetail}>{products.find(p => p.id === t.product_id)?.name ?? `Product #${t.product_id}`}</span>
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
                        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
                        revenueGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
                        statCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
                        revenueCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderTop: '4px solid #16a34a' },
                        statLabel: { fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 500 },
                        statValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' },
                        statHint: { fontSize: '12px', color: '#94a3b8' },
                        chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
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