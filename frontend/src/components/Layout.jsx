import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { getMarketStatus, getNotifications } from "../services/api"

import {
LayoutDashboard,
TrendingUp,
Briefcase,
Star,
Trophy,
Bell,
Shield,
LogOut,
Zap
} from "lucide-react"

import "./Layout.css"

const navItems = [
{ path: "/dashboard", label: "Overview", icon: LayoutDashboard },
{ path: "/trade", label: "Market", icon: TrendingUp },
{ path: "/portfolio", label: "Holdings", icon: Briefcase },
{ path: "/watchlist", label: "Favorites", icon: Star },
{ path: "/leaderboard", label: "Top Traders", icon: Trophy },
{ path: "/notifications", label: "Alerts", icon: Bell }
]

export default function Layout() {

const { user, logoutUser } = useAuth()
const navigate = useNavigate()

const [marketStatus,setMarketStatus] = useState("CLOSED")
const [unreadCount,setUnreadCount] = useState(0)

useEffect(()=>{

getMarketStatus().then(r=>setMarketStatus(r.data)).catch(()=>{})
getNotifications().then(r=>setUnreadCount(r.data.filter(n=>!n.read).length)).catch(()=>{})

const interval=setInterval(()=>{

getMarketStatus().then(r=>setMarketStatus(r.data)).catch(()=>{})
getNotifications().then(r=>setUnreadCount(r.data.filter(n=>!n.read).length)).catch(()=>{})

},10000)

return()=>clearInterval(interval)

},[])


const handleLogout=()=>{
logoutUser()
navigate("/login")
}

const visibleNavItems =
user?.role==="ADMIN"
? navItems.filter(item =>
item.label==="Favorites" || item.label==="Top Traders")
: navItems


return(

<div className="layout">


{/* SIDEBAR */}

<aside className="sidebar">


<div className="sidebar-logo">

<div className="logo-circle">
<Zap size={18}/>
</div>

<span className="logo-text">
TradeHub
</span>

</div>



<div className={`market-pill ${marketStatus==="OPEN"?"open":"closed"}`}>

<span className={`pulse ${marketStatus==="OPEN"?"green":"red"}`} />

Market {marketStatus}

</div>



<nav className="sidebar-nav">

{visibleNavItems.map(({path,label,icon:Icon})=>(

<NavLink
key={path}
to={path}
className={({isActive})=>`nav-item ${isActive?"active":""}`}
>

<Icon size={18}/>

<span>{label}</span>

{label==="Alerts" && unreadCount>0 && (
<span className="badge">{unreadCount}</span>
)}

</NavLink>

))}


{user?.role==="ADMIN" && (

<NavLink
to="/admin"
className={({isActive})=>`nav-item ${isActive?"active":""}`}
>

<Shield size={18}/>
<span>Control Panel</span>

</NavLink>

)}

</nav>



<div className="sidebar-footer">

<div className="user-card">

<div className="avatar">
{user?.username?.[0]?.toUpperCase()}
</div>

<div>

<div className="username">
{user?.username}
</div>

<div className="balance">
₹{Number(user?.balance||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
</div>

</div>

</div>


<button
className="logout-btn"
onClick={handleLogout}
>

<LogOut size={16}/>

Logout

</button>

</div>

</aside>



{/* MAIN */}

<main className="main-content">

<Outlet/>

</main>


</div>

)

}