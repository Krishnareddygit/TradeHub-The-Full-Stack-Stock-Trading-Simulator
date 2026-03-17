import { useEffect, useState } from "react"
import {
  getStocks,
  adminCreateStock,
  adminDeleteStock,
  adminEnableTrading,
  adminDisableTrading,
  getUsers,
  adminDeleteUser,
  adminPauseUser,
  adminResumeUser
} from "../services/api"

import { useToast } from "../context/ToastContext"

import {
  Shield,
  Plus,
  Trash2,
  Play,
  Pause
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
  const [users,setUsers] = useState([])

  const [form,setForm] = useState(emptyForm)

  const [loading,setLoading] = useState(true)
  const [loadingUsers,setLoadingUsers] = useState(true)

  const [submitting,setSubmitting] = useState(false)
  const [showForm,setShowForm] = useState(false)

  const toast = useToast()

  // LOAD STOCKS
  const load = ()=>{
    getStocks()
      .then(r =>
        setStocks(r.data.filter(s => s.companyName && s.symbol !== "system"))
      )
      .finally(()=>setLoading(false))
  }

  // LOAD USERS
  const loadUsers = ()=>{
    getUsers()
      .then(r => setUsers(r.data))
      .finally(()=>setLoadingUsers(false))
  }

  useEffect(()=>{
    load()
    loadUsers()
  },[])

  // CREATE STOCK
  const handleCreate = async(e)=>{
    e.preventDefault()

    if(!form.symbol || !form.companyName || !form.price || !form.totalShares){
      return toast.error("All fields required")
    }

    setSubmitting(true)

    try{
      await adminCreateStock({
        symbol:form.symbol.toUpperCase(),
        companyName:form.companyName,
        price:Number(form.price),
        totalShares:Number(form.totalShares)
      })

      toast.success(`${form.symbol} created`)
      setForm(emptyForm)
      setShowForm(false)
      load()

    }catch{
      toast.error("Failed")
    }finally{
      setSubmitting(false)
    }
  }

  // DELETE STOCK
  const handleDelete = async(id,symbol)=>{
    if(!window.confirm(`Delete ${symbol}?`)) return

    try{
      await adminDeleteStock(id)
      toast.success(`${symbol} deleted`)
      load()
    }catch{
      toast.error("Delete failed")
    }
  }

  // TOGGLE STOCK
  const handleToggle = async(stock)=>{
    try{
      if(stock.tradable){
        await adminDisableTrading(stock.id)
      }else{
        await adminEnableTrading(stock.id)
      }
      load()
    }catch{
      toast.error("Failed")
    }
  }

  // DELETE USER
  const handleDeleteUser = async(id,username,role)=>{
    if(role==="ADMIN") return toast.error("Cannot delete admin")

    if(!window.confirm(`Delete ${username}?`)) return

    try{
      await adminDeleteUser(id)
      toast.success(`${username} deleted`)
      loadUsers()
    }catch{
      toast.error("Delete failed")
    }
  }

  // TOGGLE USER
  const handleToggleUser = async(user)=>{
    try{
      if(user.tradingEnabled){
        await adminPauseUser(user.id)
      }else{
        await adminResumeUser(user.id)
      }
      loadUsers()
    }catch{
      toast.error("Failed")
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
          <h1>Admin Panel</h1>
        </div>

        <button className="add-btn" onClick={()=>setShowForm(p=>!p)}>
          <Plus size={14}/>
          {showForm ? "Cancel" : "Add Stock"}
        </button>
      </div>

      {/* STATS */}
      <div className="admin-stats">
        <div className="stat-box">
          <span>Total</span>
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

      {/* CREATE */}
      {showForm && (
        <div className="create-card">
          <form onSubmit={handleCreate}>
            <input placeholder="Symbol"
              value={form.symbol}
              onChange={e=>setForm(p=>({...p,symbol:e.target.value}))}
            />
            <input placeholder="Company"
              value={form.companyName}
              onChange={e=>setForm(p=>({...p,companyName:e.target.value}))}
            />
            <input type="number" placeholder="Price"
              value={form.price}
              onChange={e=>setForm(p=>({...p,price:e.target.value}))}
            />
            <input type="number" placeholder="Shares"
              value={form.totalShares}
              onChange={e=>setForm(p=>({...p,totalShares:e.target.value}))}
            />
            <button>{submitting ? "Creating..." : "Create"}</button>
          </form>
        </div>
      )}

      {/* STOCKS */}
      <div className="stock-grid">
        {stocks.map(stock=>(
          <div key={stock.id} className="stock-card">

            <div className="stock-header">
              <span className="symbol">{stock.symbol}</span>
              <span className={`status ${stock.tradable ? "active":"halted"}`}>
                {stock.tradable ? "Active":"Halted"}
              </span>
            </div>

            <div className="company">{stock.companyName}</div>
            <div className="price">₹{stock.price}</div>

            <div className="actions">
              <button onClick={()=>handleToggle(stock)} className="halt-btn">
                {stock.tradable ? <Pause size={14}/> : <Play size={14}/>}
              </button>

              <button onClick={()=>handleDelete(stock.id,stock.symbol)} className="delete-btn">
                <Trash2 size={14}/>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* USERS */}
      <div className="user-section">

        <h2>User Management</h2>

        {loadingUsers ? <div className="spinner"/> : (

          <div className="user-grid">

            {users.map(user=>(
                <div key={user.id} className="user-card">

                <div className="user-header">
                  <div>
                    <div className="username">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
              
                  <span className={`user-status ${user.tradingEnabled ? "active":"halted"}`}>
                    {user.tradingEnabled ? "Active" : "Paused"}
                  </span>
                </div>
            
              
                <div className="actions">
                  <button
                    onClick={()=>handleToggleUser(user)}
                    className="halt-btn"
                  >
                    {user.tradingEnabled ? <Pause size={14}/> : <Play size={14}/>}
                  </button>
              
                  <button
                    onClick={()=>handleDeleteUser(user.id,user.username,user.role)}
                    className="delete-btn"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              
              </div>
            ))}

          </div>

        )}

      </div>

    </div>
  )
}