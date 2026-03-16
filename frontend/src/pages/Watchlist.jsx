import { useEffect, useState } from "react"
import { getWatchlist, addToWatchlist, removeFromWatchlist, getStocks } from "../services/api"
import { useToast } from "../context/ToastContext"
import { useNavigate } from "react-router-dom"
import { Star, StarOff, Plus, TrendingUp, TrendingDown, Search } from "lucide-react"

import "./Watchlist.css"

export default function Watchlist() {

const [watchlist,setWatchlist] = useState([])
const [stocks,setStocks] = useState([])
const [search,setSearch] = useState("")
const [loading,setLoading] = useState(true)

const toast = useToast()
const navigate = useNavigate()


const load = () => {

Promise.all([getWatchlist(),getStocks()])
.then(([w,s])=>{
setWatchlist(w.data)
setStocks(s.data)
})
.finally(()=>setLoading(false))

}

useEffect(()=>{load()},[])


const watchedSymbols = new Set(watchlist.map(w=>w.stock?.symbol))


const handleAdd = async(symbol)=>{

try{

await addToWatchlist(symbol)
toast.success(`${symbol} added to watchlist`)
load()

}catch{
toast.error("Already in watchlist")
}

}


const handleRemove = async(symbol)=>{

try{

await removeFromWatchlist(symbol)
toast.success(`${symbol} removed`)
load()

}catch{
toast.error("Failed to remove")
}

}


const filteredStocks = stocks.filter(s=>

s.symbol.toLowerCase().includes(search.toLowerCase()) ||
s.companyName?.toLowerCase().includes(search.toLowerCase())

)


if(loading){

return(
<div className="page">
<div className="spinner"/>
</div>
)

}


return(

<div className="watchlist-page">


{/* SEARCH */}

<div className="watchlist-header">

<h1>Watchlist</h1>

<div className="search-box">

<Search size={14}/>

<input
type="text"
placeholder="Search stocks..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</div>

</div>



{/* MY WATCHLIST */}

{watchlist.length > 0 && (

<div className="section">

<h2>My Watchlist ({watchlist.length})</h2>

<div className="watchlist-grid">

{watchlist.map(w=>{

const stock = w.stock
const priceChange = Math.random()*4 - 2

return(

<div
key={w.id}
className="stock-card"
onClick={()=>navigate(`/trade/${stock?.symbol}`)}
>

<div className="card-top">

<span className="symbol">
{stock?.symbol}
</span>

<button
className="star-btn"
onClick={(e)=>{
e.stopPropagation()
handleRemove(stock?.symbol)
}}
>

<StarOff size={16}/>

</button>

</div>


<div className="company">
{stock?.companyName}
</div>


<div className="price-row">

<span className="price">
₹{Number(stock?.price).toFixed(2)}
</span>

<span className={priceChange>=0?"positive":"negative"}>

{priceChange>=0
? <TrendingUp size={14}/>
: <TrendingDown size={14}/>}

{priceChange.toFixed(2)}%

</span>

</div>

</div>

)

})}

</div>

</div>

)}



{/* ALL STOCKS */}

<div className="section">

<h2>All Stocks</h2>

<div className="watchlist-grid">

{filteredStocks.map(stock=>(

<div key={stock.id} className="stock-card">

<div className="card-top">

<span className="symbol">
{stock.symbol}
</span>

{watchedSymbols.has(stock.symbol)

? (

<span className="watching">

<Star size={14}/>
Watching

</span>

)

: (

<button
className="watch-btn"
onClick={()=>handleAdd(stock.symbol)}
>

<Plus size={14}/>
Watch

</button>

)

}

</div>


<div className="company">
{stock.companyName}
</div>


<div className="price-row">

<span className="price">

₹{Number(stock.price).toFixed(2)}

</span>

</div>

</div>

))}

</div>

</div>

</div>

)

}