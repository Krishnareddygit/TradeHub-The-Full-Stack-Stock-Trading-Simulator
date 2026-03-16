import { useEffect, useState } from "react"
import {
getStocks,
adminCreateStock,
adminDeleteStock,
adminEnableTrading,
adminDisableTrading
} from "../services/api"

import { useToast } from "../context/ToastContext"

import {
Shield,
Plus,
Trash2,
Play,
Pause,
TrendingUp
} from "lucide-react"

import "./Admin.css"

const emptyForm = {
symbol:"",
companyName:"",
price:"",
totalShares:""
}

export default function Admin(){

const [stocks,setStocks] = useState([])
const [form,setForm] = useState(emptyForm)
const [loading,setLoading] = useState(true)
const [submitting,setSubmitting] = useState(false)
const [showForm,setShowForm] = useState(false)
const [deletingId,setDeletingId] = useState(null)

const toast = useToast()

const load = ()=>{

getStocks()
.then(r =>
setStocks(
r.data.filter(s => s.companyName && s.symbol !== "system")
)
)
.finally(()=>setLoading(false))

}

useEffect(()=>{ load() },[])


const handleCreate = async(e)=>{

e.preventDefault()

if(!form.symbol || !form.companyName || !form.price || !form.totalShares){
return toast.error("All fields are required")
}

setSubmitting(true)

try{

await adminCreateStock({
symbol:form.symbol.toUpperCase(),
companyName:form.companyName,
price:Number(form.price),
totalShares:Number(form.totalShares)
})

toast.success(`${form.symbol} created successfully`)

setForm(emptyForm)
setShowForm(false)
load()

}catch(err){
toast.error(err.response?.data || "Failed to create stock")
}finally{
setSubmitting(false)
}

}


const handleDelete = async(id,symbol)=>{

if(!window.confirm(`Delete ${symbol}?`)) return

setDeletingId(id)

try{

await adminDeleteStock(id)

toast.success(`${symbol} deleted`)

load()

}catch(err){
toast.error("Delete failed")
}finally{
setDeletingId(null)
}

}


const handleToggle = async(stock)=>{

try{

if(stock.tradable){
await adminDisableTrading(stock.id)
toast.success(`Trading halted for ${stock.symbol}`)
}else{
await adminEnableTrading(stock.id)
toast.success(`Trading enabled for ${stock.symbol}`)
}

load()

}catch(err){
toast.error("Toggle failed")
}

}


if(loading){
return <div className="page"><div className="spinner"/></div>
}


return(

<div className="admin-page">


{/* HEADER */}

<div className="admin-header">

<div className="admin-title">

<Shield size={22}/>

<h1>Admin Control Panel</h1>

</div>

<button
className="add-btn"
onClick={()=>setShowForm(p=>!p)}
>

<Plus size={14}/>
{showForm ? "Cancel" : "Add Stock"}

</button>

</div>



{/* STATS */}

<div className="admin-stats">

<div className="stat-box">

<span>Total Stocks</span>

<h2>{stocks.length}</h2>

</div>


<div className="stat-box green">

<span>Active</span>

<h2>{stocks.filter(s=>s.tradable).length}</h2>

</div>


<div className="stat-box red">

<span>Halted</span>

<h2>{stocks.filter(s=>!s.tradable).length}</h2>

</div>

</div>



{/* CREATE STOCK */}

{showForm && (

<div className="create-card">

<h3>Create New Stock</h3>

<form onSubmit={handleCreate}>

<input
placeholder="Symbol (RELIANCE)"
value={form.symbol}
onChange={e=>setForm(p=>({...p,symbol:e.target.value}))}
/>

<input
placeholder="Company Name"
value={form.companyName}
onChange={e=>setForm(p=>({...p,companyName:e.target.value}))}
/>

<input
type="number"
placeholder="Initial Price"
value={form.price}
onChange={e=>setForm(p=>({...p,price:e.target.value}))}
/>

<input
type="number"
placeholder="Total Shares"
value={form.totalShares}
onChange={e=>setForm(p=>({...p,totalShares:e.target.value}))}
/>

<button
type="submit"
className="create-btn"
disabled={submitting}
>

{submitting ? "Creating..." : "Create"}

</button>

</form>

</div>

)}



{/* STOCK LIST */}

<div className="stock-grid">

{stocks.map(stock=>(

<div key={stock.id} className="stock-card">

<div className="stock-header">

<span className="symbol">
{stock.symbol}
</span>

<span className={`status ${stock.tradable?"active":"halted"}`}>
{stock.tradable ? "Active" : "Halted"}
</span>

</div>

<div className="company">
{stock.companyName}
</div>

<div className="price">
₹{Number(stock.price).toFixed(2)}
</div>

<div className="shares">
Shares: {Number(stock.totalShares).toLocaleString()}
</div>

<div className="actions">

<button
onClick={()=>handleToggle(stock)}
className={stock.tradable ? "halt-btn" : "enable-btn"}
>

{stock.tradable ? <Pause size={14}/> : <Play size={14}/>}

</button>

<button
onClick={()=>handleDelete(stock.id,stock.symbol)}
disabled={deletingId===stock.id}
className="delete-btn"
>

<Trash2 size={14}/>

</button>

</div>

</div>

))}

</div>

</div>

)

}