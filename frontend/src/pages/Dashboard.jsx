import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStocks, getPortfolio, getPnL, getMarketStatus } from '../services/api'
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, ArrowRight } from 'lucide-react'
import './Dashboard.css'

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="stat-card card fade-in">
      <div className="stat-top">
        <span className="card-title">{label}</span>
        <div className="stat-icon" style={{ background: `${color}22`, color }}>
          <Icon size={16} />
        </div>
      </div>

      <div className="stat-value mono" style={{ color }}>{value}</div>

      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {

  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [stocks, setStocks] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [pnl, setPnl] = useState({})
  const [marketStatus, setMarketStatus] = useState('CLOSED')
  const [loading, setLoading] = useState(true)

  const loadData = () => {

    Promise.all([
      getStocks(),
      getPortfolio(),
      getPnL(),
      getMarketStatus()
    ])
      .then(([stocksRes, portfolioRes, pnlRes, marketRes]) => {

        setStocks(stocksRes.data)
        setPortfolio(portfolioRes.data)
        setPnl(pnlRes.data)
        setMarketStatus(marketRes.data)

      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {

    loadData()
    refreshUser()

    const interval = setInterval(() => {

      loadData()
      refreshUser()

    }, 8000)

    return () => clearInterval(interval)

  }, [])

  const totalPnl = pnl['TOTAL'] || 0

  const portfolioValue = portfolio.reduce((sum, p) => {

    return sum + (Number(p.stock?.price) || 0) * (Number(p.quantity) || 0)

  }, 0)

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"/>
      </div>
    )
  }

  return (

    <div className="page fade-in">

      <div className="dashboard-header">

        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user?.username} 👋
          </h1>
          <p className="muted small-text">
            Here's your trading overview
          </p>
        </div>

        <div className={`market-badge ${marketStatus === 'OPEN' ? 'open' : 'closed'}`}>
          <span className={`status-dot ${marketStatus === 'OPEN' ? 'open' : 'closed'}`}/>
          Market {marketStatus}
        </div>

      </div>


      {/* STAT CARDS */}

      <div className="grid-4">

        <StatCard
          label="Available Funds"
          value={`₹${Number(user?.balance || 0).toLocaleString('en-IN',{minimumFractionDigits:2})}`}
          icon={DollarSign}
          color="var(--accent)"
        />

        <StatCard
          label="Investment Value"
          value={`₹${portfolioValue.toLocaleString('en-IN',{minimumFractionDigits:2})}`}
          icon={Briefcase}
          color="var(--blue)"
        />

        <StatCard
          label="Net Profit / Loss"
          value={`${totalPnl >= 0 ? '+' : ''}₹${Number(totalPnl).toLocaleString('en-IN',{minimumFractionDigits:2})}`}
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={totalPnl >= 0 ? 'var(--green)' : 'var(--red)'}
        />

        <StatCard
          label="Positions"
          value={portfolio.length}
          sub={`${portfolio.length} active position${portfolio.length !== 1 ? 's' : ''}`}
          icon={Activity}
          color="var(--yellow)"
        />

      </div>


      <div className="grid-2">


        {/* MARKET WATCH */}

        <div className="card">

          <div className="card-header">

            <span className="card-title">Market Watch</span>

            <button
              className="btn-secondary small-btn"
              onClick={() => navigate('/trade')}
            >
              Place Order
              <ArrowRight size={12}/>
            </button>

          </div>


          <div className="table-wrap">

            <table>

              <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Price</th>
                <th>Trading Status</th>
              </tr>
              </thead>

              <tbody>

              {stocks
                .filter(s => s.symbol !== 'system' && s.companyName)
                .slice(0,8)
                .map(stock => (

                <tr
                  key={stock.id}
                  className="clickable-row"
                  onClick={() => navigate(`/trade/${stock.symbol}`)}
                >

                  <td>
                    <span className="mono symbol">
                      {stock.symbol}
                    </span>
                  </td>

                  <td className="company">
                    {stock.companyName}
                  </td>

                  <td className="mono">
                    ₹{Number(stock.price).toLocaleString('en-IN',{minimumFractionDigits:2})}
                  </td>

                  <td>

                    <span className={`tag ${stock.tradable ? 'tag-green' : 'tag-red'}`}>
                      {stock.tradable ? 'Active' : 'Halted'}
                    </span>

                  </td>

                </tr>

              ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* POSITIONS */}

        <div className="card">

          <div className="card-header">

            <span className="card-title">My Positions</span>

            <button
              className="btn-secondary small-btn"
              onClick={() => navigate('/portfolio')}
            >
              View Portfolio
              <ArrowRight size={12}/>
            </button>

          </div>

          {portfolio.length === 0 ? (

            <div className="empty-state">

              <Briefcase size={32} className="muted"/>

              <p className="muted">
                No positions yet
              </p>

              <button
                className="btn-primary"
                onClick={() => navigate('/trade')}
              >
                Start Trading
              </button>

            </div>

          ) : (

            <div className="table-wrap">

              <table>

                <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Avg Price</th>
                  <th>P/L</th>
                </tr>
                </thead>

                <tbody>

                {portfolio.slice(0,6).map(p => {

                  const pl = pnl[p.stock?.symbol] || 0

                  return (

                    <tr key={p.id}>

                      <td className="mono">
                        {p.stock?.symbol}
                      </td>

                      <td className="mono">
                        {p.quantity}
                      </td>

                      <td className="mono">
                        ₹{Number(p.averagePrice).toFixed(2)}
                      </td>

                      <td className={`mono ${pl >= 0 ? 'positive' : 'negative'}`}>

                        {pl >= 0 ? '+' : ''}
                        ₹{Number(pl).toFixed(2)}

                      </td>

                    </tr>

                  )

                })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

function getGreeting(){

  const h = new Date().getHours()

  if(h < 12) return 'morning'

  if(h < 17) return 'afternoon'

  return 'evening'

}