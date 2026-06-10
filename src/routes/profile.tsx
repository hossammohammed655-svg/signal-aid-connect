import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [userType, setUserType] = useState('patient')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate({ to: '/login' }); return }
      setUser(user)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone_number || '')
        setUserType(data.user_type || 'patient')
      }
    }
    getUser()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, 
                phone_number: phone, user_type: userType })
    setLoading(false)
    setMessage(error ? 'حدث خطأ / Error occurred' : 
                       'تم الحفظ بنجاح / Saved successfully')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div style={{ background: '#0D1B2A', minHeight: '100vh', 
                  padding: '24px', color: '#FFFFEF' }}>
      <h1 style={{ color: '#398BC4', fontSize: '24px', 
                   marginBottom: '24px', textAlign: 'center' }}>
        الملف الشخصي / Profile
      </h1>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#90CA90', display: 'block', 
                          marginBottom: '6px' }}>
            الاسم / Full Name
          </label>
          <input value={fullName} onChange={e => setFullName(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px',
                     background: '#1A2A3A', border: '1px solid #398BC4',
                     color: '#FFFFEF', fontSize: '16px', boxSizing: 'border-box' }}/>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#90CA90', display: 'block', 
                          marginBottom: '6px' }}>
            البريد الإلكتروني / Email
          </label>
          <input value={user?.email || ''} disabled
            style={{ width: '100%', padding: '12px', borderRadius: '8px',
                     background: '#112233', border: '1px solid #334455',
                     color: '#8899AA', fontSize: '16px', boxSizing: 'border-box' }}/>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#90CA90', display: 'block', 
                          marginBottom: '6px' }}>
            رقم الهاتف / Phone Number
          </label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px',
                     background: '#1A2A3A', border: '1px solid #398BC4',
                     color: '#FFFFEF', fontSize: '16px', boxSizing: 'border-box' }}/>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#90CA90', display: 'block', 
                          marginBottom: '6px' }}>
            نوع المستخدم / User Type
          </label>
          <select value={userType} onChange={e => setUserType(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px',
                     background: '#1A2A3A', border: '1px solid #398BC4',
                     color: '#FFFFEF', fontSize: '16px' }}>
            <option value="patient">مريض / Patient</option>
            <option value="pharmacist">صيدلاني / Pharmacist</option>
          </select>
        </div>

        {message && (
          <div style={{ background: '#1A3A2A', border: '1px solid #90CA90',
                        borderRadius: '8px', padding: '12px', 
                        marginBottom: '16px', color: '#90CA90',
                        textAlign: 'center' }}>
            {message}
          </div>
        )}

        <button onClick={handleSave} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: '8px',
                   background: '#3656BB', color: 'white', border: 'none',
                   fontSize: '16px', cursor: 'pointer', marginBottom: '12px' }}>
          {loading ? 'جاري الحفظ...' : 'حفظ / Save'}
        </button>

        <button onClick={handleLogout}
          style={{ width: '100%', padding: '14px', borderRadius: '8px',
                   background: '#E74C3C', color: 'white', border: 'none',
                   fontSize: '16px', cursor: 'pointer' }}>
          تسجيل الخروج / Logout
        </button>
      </div>
    </div>
  )
}