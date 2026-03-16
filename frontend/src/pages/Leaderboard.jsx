import { useEffect, useState } from "react"
import { getLeaderboard } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Trophy, Medal } from "lucide-react"

import "./Leaderboard.css"

export default function Leaderboard() {

const [data,setData] = useState([])
const [loading,setLoading] = useState(true)

const { user } = useAuth()

useEffect(()=>{

getLeaderboard()
.then(r=>{

const entries = Object.entries(r.data)
.map(([username,value],index)=>({

rank:index+1,
username,
value

}))

setData(entries)

})
.finally(()=>setLoading(false))

},[])


if(loading){

return(
<div className="page">
<div className="spinner"/>
</div>
)

}


const top3 = data.slice(0,3)
const others = data.slice(3)


return(

<div className="leaderboard-page">


<h1 className="leaderboard-title">
<Trophy size={22}/>
 Trading Leaderboard
</h1>

<p className="leaderboard-sub">
Top traders ranked by portfolio value
</p>



{/* PODIUM */}

<div className="podium">

{top3[1] && (
<div className="podium-card second">

<div className="podium-rank">2</div>

<div className="podium-name">{top3[1].username}</div>

<div className="podium-value">
₹{Number(top3[1].value).toLocaleString("en-IN")}
</div>

</div>
)}


{top3[0] && (
<div className="podium-card first">

<Trophy size={26}/>

<div className="podium-name">{top3[0].username}</div>

<div className="podium-value">
₹{Number(top3[0].value).toLocaleString("en-IN")}
</div>

</div>
)}


{top3[2] && (
<div className="podium-card third">

<div className="podium-rank">3</div>

<div className="podium-name">{top3[2].username}</div>

<div className="podium-value">
₹{Number(top3[2].value).toLocaleString("en-IN")}
</div>

</div>
)}

</div>



{/* LIST */}

<div className="leaderboard-list">

{others.map(entry=>(

<div
key={entry.username}
className={`leaderboard-row ${entry.username===user?.username ? "you" : ""}`}
>

<div className="rank">

#{entry.rank}

</div>


<div className="trader">

<div className="avatar">

{entry.username[0].toUpperCase()}

</div>

<span>

{entry.username}

{entry.username===user?.username &&
<span className="you-tag">You</span>}

</span>

</div>


<div className="value">

₹{Number(entry.value).toLocaleString("en-IN",{minimumFractionDigits:2})}

</div>

</div>

))}

</div>


</div>

)

}