import { useEffect, useState } from "react"
import { getPortfolio, getPnL, getMyTrades, depositMoney, withdrawMoney } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { TrendingUp, TrendingDown, Briefcase } from "lucide-react"
import { useNavigate } from "react-router-dom"

import "./Portfolio.css"

export default function Portfolio() {

const [portfolio,setPortfolio] = useState([])
const [pnl,setPnl] = useState({})
const [trades,setTrades] = useState([])
const [loading,setLoading] = useState(true)

const [amount,setAmount] = useState("")
const [processing,setProcessing] = useState(false)

const { user,refreshUser } = useAuth()
const navigate = useNavigate()


useEffect(()=>{

refreshUser()

Promise.all([
getPortfolio(),
getPnL(),
getMyTrades()
])

.then(([p,pnlRes,t])=>{
setPortfolio(p.data)
setPnl(pnlRes.data)
setTrades(t.data)
})

.finally(()=>setLoading(false))

},[])


const totalPnl = pnl["TOTAL"] || 0

const portfolioValue = portfolio.reduce((sum,p)=>
sum + Number(p.stock?.price||0) * Number(p.quantity||0),0)


/* ===============================
   WALLET FUNCTIONS
================================ */

const handleDeposit = async () => {

if(!amount || Number(amount) <= 0) return

setProcessing(true)

try{

await depositMoney(amount)

await refreshUser()

setAmount("")

}catch{

alert("Deposit failed")

}

setProcessing(false)

}


const handleWithdraw = async () => {

if(!amount || Number(amount) <= 0) return

setProcessing(true)

try{

await withdrawMoney(amount)

await refreshUser()

setAmount("")

}catch{

alert("Withdraw failed")

}

setProcessing(false)

}


/* ===============================
   LOADING SCREEN
================================ */

if(loading){
return(
<div className="page">
<div className="spinner"/>
</div>
)
}


/* ===============================
   UI
================================ */

return(

<div className="portfolio-page">

<h1 className="portfolio-title">
Portfolio
</h1>


{/* SUMMARY */}

<div className="summary-grid">

<div className="summary-card">

<span>Balance</span>

<div className="value">
₹{Number(user?.balance||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
</div>

</div>


<div className="summary-card">

<span>Portfolio Value</span>

<div className="value">
₹{portfolioValue.toLocaleString("en-IN",{minimumFractionDigits:2})}
</div>

</div>


<div className="summary-card">

<span>Total P&L</span>

<div className={`value ${totalPnl>=0?"positive":"negative"}`}>

{totalPnl>=0
? <TrendingUp size={18}/>
: <TrendingDown size={18}/>}

{totalPnl>=0?"+":""}
₹{Number(totalPnl).toLocaleString("en-IN",{minimumFractionDigits:2})}

</div>

</div>

</div>



{/* WALLET */}

<div className="wallet-box">

<h2>Wallet</h2>

<div className="wallet-input">

<input
type="number"
placeholder="Enter amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button
className="deposit-btn"
onClick={handleDeposit}
disabled={processing}
>
Add Money
</button>

<button
className="withdraw-btn"
onClick={handleWithdraw}
disabled={processing}
>
Withdraw
</button>

</div>

</div>



{/* HOLDINGS */}

<div className="section">

<h2>Holdings ({portfolio.length})</h2>

{portfolio.length===0 ? (

<div className="empty-holdings">

<Briefcase size={60} className="empty-icon"/>

<h3>No holdings yet</h3>

<p>
Your purchased stocks will appear here.
</p>

<button
className="start-trading-btn"
onClick={()=>navigate("/trade")}
>
Start Trading
</button>

</div>

) : (

<div className="holdings-grid">

{portfolio.map(p=>{

const pl = pnl[p.stock?.symbol] || 0

const currentValue =
Number(p.stock?.price||0)*Number(p.quantity||0)

const invested =
Number(p.averagePrice||0)*Number(p.quantity||0)

const pct = invested>0
? ((currentValue-invested)/invested)*100
: 0

return(

<div
key={p.id}
className="holding-card"
onClick={()=>navigate(`/trade/${p.stock?.symbol}`)}
>

<div className="holding-header">

<span className="symbol">
{p.stock?.symbol}
</span>

<span className={`tag ${pct>=0?"green":"red"}`}>
{pct>=0?"+":""}{pct.toFixed(2)}%
</span>

</div>

<div className="company">
{p.stock?.companyName}
</div>

<div className="holding-info">

<span>Qty {p.quantity}</span>

<span>
₹{Number(p.stock?.price).toFixed(2)}
</span>

</div>

<div className={`pnl ${pl>=0?"positive":"negative"}`}>
{pl>=0?"+":""}
₹{Number(pl).toFixed(2)}
</div>

</div>

)

})}

</div>

)}

</div>



{/* TRADE HISTORY */}

<div className="section">

<h2>Trade History</h2>

<div className="trade-list">

{trades.length===0 && (
<p className="muted">
No trades yet
</p>
)}

{trades.slice(0,30).map(t=>{

const isBuy = t.buyer?.username===user?.username

return(

<div key={t.id} className="trade-row">

<div className={`trade-type ${isBuy?"buy":"sell"}`}>
{isBuy?"BUY":"SELL"}
</div>

<div className="trade-symbol">
{t.stock?.symbol}
</div>

<div className="trade-details">
{t.quantity} × ₹{Number(t.price).toFixed(2)}
</div>

<div className="trade-time">
{t.executedAt
? new Date(t.executedAt).toLocaleString("en-IN")
: "-"}
</div>

</div>

)

})}

</div>

</div>

</div>

)

}