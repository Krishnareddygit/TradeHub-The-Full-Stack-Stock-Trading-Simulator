import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { login, getMe } from '../services/api'
import { Zap, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const { loginUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Please fill all fields')
    setLoading(true)

    try {
      const res = await login(form)
      const { token, username } = res.data

      localStorage.setItem('token', token)

      const meRes = await getMe()
      loginUser(token, meRes.data)

      toast.success(`Welcome back, ${username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-header">
          <div className="logo">
            <Zap size={28} />
            <span>TradeHub</span>
          </div>
          <h2>Sign In</h2>
          <p>Access your trading dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
            />
          </div>

          <div className="form-field">
            <label>Password</label>

            <div className="password-input">

              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />

              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?
            <Link to="/register"> Create one</Link>
          </p>
        </div>

      </div>

    </div>
  )
}