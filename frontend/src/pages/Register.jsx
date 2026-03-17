import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { register, getMe } from "../services/api"
import { Zap, Eye, EyeOff } from "lucide-react"

import "./Auth.css"

export default function Register(){

const [form,setForm] = useState({
username:"",
email:"",
password:""
})

const [loading,setLoading] = useState(false)
const [showPw,setShowPw] = useState(false)

const { loginUser } = useAuth()
const toast = useToast()
const navigate = useNavigate()


const handleSubmit = async(e)=>{

e.preventDefault()

if(!form.username || !form.email || !form.password)
return toast.error("Please fill all fields")

if(form.password.length < 6)
return toast.error("Password must be at least 6 characters")

setLoading(true)

try{

const res = await register(form)

const { token, username } = res.data

localStorage.setItem("token",token)

const meRes = await getMe()

loginUser(token,meRes.data)

toast.success(`Welcome to TradeHub, ${username}!`)

navigate("/dashboard")

}catch(err){

toast.error(err.response?.data || "User already exists. Please choose a different username.")

}finally{
setLoading(false)
}

}


return(

<div className="auth-page">


{/* LEFT BRANDING */}

<div className="auth-brand">

<div className="brand-logo">

<Zap size={28}/>

TradEx

</div>

<h1>Start trading today</h1>

<p>

Join thousands of traders using TradeHub
to track markets, manage portfolios
and compete on the leaderboard.

</p>

</div>



{/* REGISTER CARD */}

<div className="auth-container">

<div className="auth-card">

<h2>Create Account</h2>

<p className="subtitle">

Create your TradeHub account

</p>


<form onSubmit={handleSubmit} className="auth-form">


<div className="form-field">

<label>Username</label>

<input
type="text"
placeholder="Choose username"
value={form.username}
onChange={(e)=>
setForm(p=>({...p,username:e.target.value}))
}
/>

</div>



<div className="form-field">

<label>Email</label>

<input
type="email"
placeholder="your@email.com"
value={form.email}
onChange={(e)=>
setForm(p=>({...p,email:e.target.value}))
}
/>

</div>



<div className="form-field">

<label>Password</label>

<div className="password-input">

<input
type={showPw?"text":"password"}
placeholder="Minimum 6 characters"
value={form.password}
onChange={(e)=>
setForm(p=>({...p,password:e.target.value}))
}
/>

<button
type="button"
className="toggle-btn"
onClick={()=>setShowPw(!showPw)}
>

{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}

</button>

</div>

</div>



<button
type="submit"
className="login-btn"
disabled={loading}
>

{loading ? "Creating account..." : "Create Account"}

</button>

</form>


<div className="auth-footer">

<p>

Already have an account?

<Link to="/login"> Sign in</Link>

</p>

</div>

</div>

</div>

</div>

)

}