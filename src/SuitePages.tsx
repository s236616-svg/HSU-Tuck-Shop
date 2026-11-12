import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { DemoNotification, DemoSlot, DemoUser, Role, demoUser, readStore, updateStoredUser, writeStore } from './demo'
import { CopyKey, Lang, translator } from './i18n'
import { Mascot } from './Mascot'
import { merchandise } from './merch'

type T = ReturnType<typeof translator>
type Navigate = (path: string) => void

function getInitials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const id = `field-${label.replace(/\W/g, '').toLowerCase()}`
  return <label className="suite-field"><span>{label}</span>{children}{error&&<small id={id} role="alert">{error}</small>}</label>
}

function Spinner() { return <i className="button-spinner" aria-hidden="true"/> }
function EyeIcon({open}:{open:boolean}){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{open?<><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></>:<><path d="m3 3 18 18M10.6 6.2A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 3.1M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a9 9 0 0 0 3-.5M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>}</svg>}

function PasswordRules({ password, t }: { password: string; t: T }) {
  const rules = [
    [t('ruleLength'), password.length >= 8],
    [t('ruleLower'), /[a-z]/.test(password)],
    [t('ruleUpper'), /[A-Z]/.test(password)],
    [t('ruleNumber'), /\d/.test(password)],
  ] as const
  return <div className="password-rules"><b>{t('passwordRules')}</b>{rules.map(([label, pass])=><span className={pass?'pass':''} key={label}>{pass?'✓':'○'} {label}</span>)}</div>
}

function GooglePicker({ t, onChoose, onClose }: { t: T; onChoose: () => void; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])
  return <div className="overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="google-picker" role="dialog" aria-modal="true" aria-labelledby="google-title">
    <button className="modal-close" onClick={onClose}>{t('close')}</button><b className="google-g">G</b><h2 id="google-title">{t('chooseAccount')}</h2><p>{t('googleDemo')}</p>
    <button ref={ref} className="google-account-row" onClick={onChoose}><span>KC</span><div><b>{demoUser.fullName}</b><small>{demoUser.email}</small></div></button>
    <button className="text-link" onClick={onClose}>{t('useAnotherAccount')}</button>
  </section></div>
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

export function AuthScreen({ mode, t, navigate, onAuth }: { mode: AuthMode; t: T; navigate: Navigate; onAuth: (user: DemoUser) => void }) {
  const [google,setGoogle]=useState(false)
  if (mode === 'register') return <RegisterScreen t={t} navigate={navigate} onAuth={onAuth} google={()=>setGoogle(true)} picker={google?<GooglePicker t={t} onClose={()=>setGoogle(false)} onChoose={()=>{setGoogle(false);onAuth(demoUser)}}/>:null}/>
  if (mode === 'forgot' || mode === 'reset') return <PasswordRecovery reset={mode==='reset'} t={t} navigate={navigate}/>
  return <LoginScreen t={t} navigate={navigate} onAuth={onAuth} google={()=>setGoogle(true)} picker={google?<GooglePicker t={t} onClose={()=>setGoogle(false)} onChoose={()=>{setGoogle(false);onAuth(demoUser)}}/>:null}/>
}

function AuthShell({ t, children }: { t: T; children: React.ReactNode }) {
  return <main className="login-page"><section className="login-visual"><div className="login-brand"><span className="brand-img vector"><Mascot variant="shop"/></span><b>{t('loginBrand')}</b></div><div className="login-mascot"><Mascot/></div><div><p className="kicker">{t('campusFavourite')}</p><h1>{t('loginTagline')}</h1><p>{t('noQueue')}</p></div></section><section className="login-panel">{children}</section></main>
}

function LoginScreen({ t, navigate, onAuth, google, picker }: { t:T; navigate:Navigate; onAuth:(user:DemoUser)=>void; google:()=>void; picker:React.ReactNode }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false)
  const [errors,setErrors]=useState<Record<string,string>>({}); const [busy,setBusy]=useState(false); const [banner,setBanner]=useState('')
  const submit = async (event: FormEvent) => {
  event.preventDefault()
  const next: Record<string,string> = {}
  if (!email) next.email = t('emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('emailInvalid')
  if (!password) next.password = t('passwordRequired')
  setErrors(next)
  if (Object.keys(next).length) return

  setBusy(true)
  setBanner('')

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setBusy(false)
      setBanner(t('incorrectCredentials'))
      return
    }
    const data = await res.json()
    // data shape: { id, username, fullName, email, roles, programme,
    //               yearOfEntrance, studentId, walletBalance,
    //               loyaltyStamps, avatarUrl, lastLoginAt }
    const signed: DemoUser = {
      ...demoUser,          // shape fallback
      ...data,
      password: '',         // never trust client-side password
    }
    setBusy(false)
    onAuth(signed)
  } catch {
    setBusy(false)
    setBanner(t('incorrectCredentials'))
  }
}
  return <AuthShell t={t}><div className="login-form-wrap"><p className="kicker">{t('brand')}</p><h1>{t('signInTitle')}</h1><p className="login-intro">{t('signInBody')}</p>
    {banner&&<div className="error-banner" role="alert">{banner}</div>}<form onSubmit={submit}>
      <Field label={t('email')} error={errors.email}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder={t('emailPlaceholder')} aria-invalid={!!errors.email}/></Field>
      <p className="field-hint">{t('hsuLoginHint')}</p>
      <Field label={t('password')} error={errors.password}><div className="password-input"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder={t('passwordPlaceholder')} aria-invalid={!!errors.password}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?t('hidePassword'):t('showPassword')}><EyeIcon open={show}/></button></div></Field>
      <div className="login-options"><label><input type="checkbox"/><span>{t('rememberMe')}</span></label><button type="button" onClick={()=>navigate('/forgot-password')}>{t('forgotPassword')}</button></div>
      <button className="primary full lg" disabled={busy} aria-busy={busy}>{busy&&<Spinner/>}{t('signIn')}</button>
    </form><div className="form-divider"><span>{t('or')}</span></div><button className="google-button" onClick={google}><b>G</b>{t('continueWithGoogle')}</button>
    <button className="guest-button" onClick={()=>navigate('/')}>{t('guestLogin')}</button>
    <p className="demo-hint">{t('demoAccountHint')}</p><p className="create-account">{t('noAccount')} <button onClick={()=>navigate('/register')}>{t('createAccount')}</button></p>
  </div>{picker}</AuthShell>
}

function RegisterScreen({ t,navigate,onAuth,google,picker }:{t:T;navigate:Navigate;onAuth:(user:DemoUser)=>void;google:()=>void;picker:React.ReactNode}) {
  const [form,setForm]=useState({fullName:'',email:'',username:'',password:'',confirm:'',phone:'',programme:'BA-AC',year:'2023',studentId:'',terms:false})
  const [hsu,setHsu]=useState(false);const [busy,setBusy]=useState(false);const [errors,setErrors]=useState<Record<string,string>>({})
  const update=(key:string,value:string|boolean)=>{setForm(old=>({...old,[key]:value}));if(key==='email'&&typeof value==='string'&&value.endsWith('.edu.hk'))setHsu(true)}
    const submit = async (event: FormEvent) => {
    event.preventDefault()
    const e: Record<string,string> = {}
    
    if(!form.fullName) e.fullName = t('fullName')
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('emailInvalid')
    if(!/^[A-Za-z0-9_]{3,20}$/.test(form.username)) e.username = t('usernameHint')
    if(!(form.password.length>=8 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /\d/.test(form.password))) e.password = t('passwordRules')
    if(form.confirm !== form.password) e.confirm = t('passwordsDoNotMatch')
    if(hsu && !/^s\d{6}$/.test(form.studentId)) e.studentId = 's123456'
    if(!form.terms) e.terms = t('termsRegister')
    
    setErrors(e)
    if(Object.keys(e).length) return
    
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          username: form.username,
          password: form.password,
          phone: form.phone,
          isHsu: hsu,
          programme: hsu ? form.programme : null,
          yearOfEntrance: hsu ? Number(form.year) : null,
          studentId: hsu ? form.studentId : null
        }),
      })
      if (!res.ok) {
        setBusy(false)
        alert('Registration failed. Username or email might be taken.')
        return
      }
      const user = await res.json()
      setBusy(false)
      onAuth({ ...user, password: '', roles: user.roles || ['student'] })
    } catch {
      setBusy(false)
      alert('Registration failed. Check connection.')
    }
  }
  return <AuthShell t={t}><div className="login-form-wrap register-wrap"><h1>{t('registerTitle')}</h1><p className="login-intro">{t('registerBody')}</p><form onSubmit={submit}>
    <Field label={t('fullName')} error={errors.fullName}><input value={form.fullName} onChange={e=>update('fullName',e.target.value)} autoComplete="name"/></Field>
    <Field label={t('email')} error={errors.email}><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} autoComplete="email"/></Field>
    <Field label={t('username')} error={errors.username}><input value={form.username} onChange={e=>update('username',e.target.value)}/><em>{t('usernameHint')}</em></Field>
    <Field label={t('password')} error={errors.password}><input type="password" value={form.password} onChange={e=>update('password',e.target.value)} autoComplete="new-password"/></Field><PasswordRules password={form.password} t={t}/>
    <Field label={t('confirmPassword')} error={errors.confirm}><input type="password" value={form.confirm} onChange={e=>update('confirm',e.target.value)} autoComplete="new-password"/></Field>
    <Field label={t('phone')}><input value={form.phone} onChange={e=>update('phone',e.target.value)} type="tel"/></Field>
    <label className="suite-check"><input type="checkbox" checked={hsu} onChange={e=>setHsu(e.target.checked)}/><span>{t('hsuMember')}</span></label>
    {hsu&&<div className="hsu-fields"><Field label={t('programme')}><select value={form.programme} onChange={e=>update('programme',e.target.value)}>{['BA-AC','BA-AHCC','BBA','BSc-CS','BA-ENG','Other'].map(x=><option key={x}>{x}</option>)}</select></Field><Field label={t('entranceYear')}><input value={form.year} onChange={e=>update('year',e.target.value)} inputMode="numeric"/></Field><Field label={t('studentIdLabel')} error={errors.studentId}><input value={form.studentId} onChange={e=>update('studentId',e.target.value)} placeholder="s123456"/></Field></div>}
    <label className="suite-check"><input type="checkbox" checked={form.terms} onChange={e=>update('terms',e.target.checked)}/><span>{t('termsRegister')}</span></label>{errors.terms&&<small className="field-error">{errors.terms}</small>}
    <button className="primary full lg" disabled={busy} aria-busy={busy}>{busy&&<Spinner/>}{t('createAccount')}</button>
  </form><div className="form-divider"><span>{t('or')}</span></div><button className="google-button" onClick={google}><b>G</b>{t('continueWithGoogle')}</button><p className="create-account">{t('alreadyHaveAccount')} <button onClick={()=>navigate('/login')}>{t('signIn')}</button></p></div>{picker}</AuthShell>
}

function PasswordRecovery({ reset,t,navigate }:{reset:boolean;t:T;navigate:Navigate}) {
  const [step,setStep]=useState(reset?3:1);const [email,setEmail]=useState('');const [busy,setBusy]=useState(false);const [cooldown,setCooldown]=useState(30)
  const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [done,setDone]=useState(false)
  useEffect(()=>{if(step!==2||cooldown<=0)return;const id=window.setInterval(()=>setCooldown(n=>n-1),1000);return()=>clearInterval(id)},[step,cooldown])
  const send=(event:FormEvent)=>{event.preventDefault();if(!email)return;setBusy(true);window.setTimeout(()=>{setBusy(false);setStep(2)},800)}
  const updatePassword=(event:FormEvent)=>{event.preventDefault();if(password!==confirm||password.length<8)return;setBusy(true);window.setTimeout(()=>{const users=readStore<DemoUser[]>('hsu-users',[demoUser]);writeStore('hsu-users',users.map(user=>user.email===demoUser.email?{...user,password}:user));setBusy(false);setDone(true)},800)}
  return <AuthShell t={t}><div className="login-form-wrap recovery-wrap">{done?<div className="recovery-success" role="status"><span>✓</span><h1>{t('passwordUpdated')}</h1><button className="primary full" onClick={()=>navigate('/login')}>{t('backToSignIn')}</button></div>:step===1?<><h1>{t('forgotPasswordTitle')}</h1><p className="login-intro">{t('forgotPasswordBody')}</p><form onSubmit={send}><Field label={t('email')}><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></Field><button className="primary full lg" aria-busy={busy}>{busy&&<Spinner/>}{t('sendResetLink')}</button></form></>:step===2?<div className="recovery-success" role="status"><span>✓</span><h1>{t('checkInbox')}</h1><p>{t('resetSentTo',{email})}</p><button disabled={cooldown>0} onClick={()=>setCooldown(30)} className="text-link">{cooldown?t('resendIn',{n:cooldown}):t('resend')}</button><button className="secondary full" onClick={()=>navigate('/login')}>{t('backToSignIn')}</button><button className="demo-reset-link" onClick={()=>{setStep(3);navigate('/reset-password?token=demo')}}>{t('openResetFormDemo')}</button></div>:<><h1>{t('chooseNewPassword')}</h1><form onSubmit={updatePassword}><Field label={t('newPassword')}><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></Field><PasswordRules password={password} t={t}/><Field label={t('confirmPassword')} error={confirm&&confirm!==password?t('passwordsDoNotMatch'):''}><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></Field><button className="primary full lg" disabled={password!==confirm||password.length<8}>{t('save')}</button></form></>}</div></AuthShell>
}

type Feature = 'favorites'|'notifications'|'loyalty'|'merch-drop'|'order-for-friend'|'search'|'developer'|'stock'|'slots'|'users'|'audit'

type FavouriteProduct={id:number;en:string;zh:string;price:number;stock:number;image?:string;active?:boolean;threshold?:number}
export function FeaturePage({ page,t,lang,navigate,notifications,setNotifications,slots,setSlots,user,setUser,products,setProducts }:{page:Feature;t:T;lang:Lang;navigate:Navigate;notifications:DemoNotification[];setNotifications:(v:DemoNotification[])=>void;slots:DemoSlot[];setSlots:(v:DemoSlot[])=>void;user:DemoUser;setUser:(v:DemoUser)=>void;products:FavouriteProduct[];setProducts:(v:FavouriteProduct[])=>void}) {
  if(page==='notifications')return <NotificationsPage t={t} lang={lang} items={notifications} setItems={setNotifications}/>
  if(page==='loyalty')return <LoyaltyPage t={t} user={user}/>
  if(page==='merch-drop')return <MerchDrop t={t} lang={lang}/>
  if(page==='order-for-friend')return <FriendOrder t={t}/>
  if(page==='developer')return <DeveloperPage t={t} user={user}/>
  if(page==='stock')return <StockPage t={t} lang={lang} products={products} setProducts={setProducts}/>
  if(page==='slots')return <SlotsPage t={t} slots={slots} setSlots={setSlots}/>
  if(page==='users')return <UsersPage t={t} lang={lang}/>
  if(page==='audit')return <AuditPage t={t} user={user}/>
  return <CatalogUtility page={page} t={t} lang={lang} navigate={navigate} products={products}/>
}

function PageHead({kicker,title,body}:{kicker:string;title:string;body?:string}){return <div className="page-intro compact"><div><p className="kicker">{kicker}</p><h1>{title}</h1>{body&&<p>{body}</p>}</div></div>}

function CatalogUtility({page,t,lang,navigate,products}:{page:'favorites'|'search';t:T;lang:Lang;navigate:Navigate;products:FavouriteProduct[]}){
  const [query,setQuery]=useState('')
  const [favs,setFavs]=useState<number[]>([])

  useEffect(() => {
    if (page === 'favorites') {
      fetch('/api/favorites', { credentials: 'include' })
        .then(res => res.json())
        .then(data => { 
          if(Array.isArray(data)) setFavs(data.map(Number)) // Convert strings to numbers
        })
    }
  }, [page])

  const filtered=products.filter(p=>p.en.toLowerCase().includes(query.toLowerCase())||p.zh.includes(query))
  // Use Number(p.id) to ensure type match
  const shown=page==='favorites'?filtered.filter(p=>favs.includes(Number(p.id))):filtered
  
  const remove=async (id:number)=>{
    await fetch(`/api/favorites/${id}`, { method: 'DELETE', credentials: 'include' })
    setFavs(favs.filter(x=>x!==id))
  }

  return <main className="content suite-page">
    <PageHead kicker={t('brand')} title={page==='favorites'?t('favouritesTitle'):t('searchResults')}/>
    {page==='search'&&<div className="search suite-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('searchPlaceholder')}/></div>}
    {shown.length?<div className="suite-product-grid">
      {shown.map(p=><article key={p.id}>{p.image?<img src={p.image}/>:<Mascot variant="line"/>}<div><b>{lang==='en'?p.en:p.zh}</b><small>{lang==='en'?p.zh:p.en}</small><strong>HK${p.price}</strong>{page==='favorites'&&<button onClick={()=>remove(p.id)}>{t('remove')}</button>}</div></article>)}
    </div>:<div className="empty vector"><Mascot variant="line"/><h2>{page==='favorites'?t('favoritesEmpty'):t('noResults')}</h2><button className="primary" onClick={()=>navigate('/shop')}>{t('shopNow')}</button></div>}
  </main>
}

function NotificationsPage({t,lang,items,setItems}:{t:T;lang:Lang;items:DemoNotification[];setItems:(v:DemoNotification[])=>void}){
  const [tab,setTab]=useState<'all'|'unread'>('all');const shown=items.filter(item=>tab==='all'||!item.read)
  const save=(next:DemoNotification[])=>{setItems(next);writeStore('hsu-notifications',next)}
  return <main className="content suite-page"><PageHead kicker={t('account')} title={t('notificationsTitle')}/><div className="tabs notification-tabs"><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>{t('allNotifications')}</button><button className={tab==='unread'?'active':''} onClick={()=>setTab('unread')}>{t('unread')}</button><button onClick={()=>save(items.map(i=>({...i,read:true})))}>{t('markAllRead')}</button><button onClick={()=>save(items.map(i=>({...i,read:false})))}>{t('markAllUnread')}</button></div><div className="notification-list">{shown.map(item=><button className={item.read?'read':''} key={item.id} onClick={()=>save(items.map(i=>i.id===item.id?{...i,read:!i.read}:i))}><span>{item.kind==='order'?'✓':item.kind==='stock'?'□':'★'}</span><b>{lang==='en'?item.en:item.zh}</b>{!item.read&&<i/>}</button>)}</div></main>
}

function LoyaltyPage({t,user}:{t:T;user:DemoUser}){return <main className="content suite-page"><PageHead kicker={t('brand')} title={t('loyaltyTitle')} body={t('loyaltyBody')}/><section className="loyalty-large"><div><b>{user.loyaltyStamps} / 10</b><span>{t('loyaltyStamps')}</span></div><div className="stamps panda-stamps">{Array.from({length:10},(_,i)=><i className={i<user.loyaltyStamps?'filled':''} key={i}>{i<user.loyaltyStamps&&<Mascot variant="mark"/>}</i>)}</div></section><h2>{t('badges')}</h2><div className="badge-grid">{([['iceCreamFanatic',true],['firstOrder',true],['tenOrders',false],['merchCollector',false]] as [CopyKey,boolean][]).map(([name,earned])=><article key={name}><span>{earned?'★':'○'}</span><b>{t(name)}</b><small>{earned?t('earned'):t('locked')}</small></article>)}</div><section className="suite-card"><h2>{t('howItWorks')}</h2><p>{t('loyaltyBody')}</p><h3>{t('pointsHistory')}</h3><p>{t('spendProgress')}</p></section></main>}

function MerchDrop({t,lang}:{t:T;lang:Lang}){const [left,setLeft]=useState(2*86400+14*3600+38*60);useEffect(()=>{const id=setInterval(()=>setLeft(x=>Math.max(0,x-1)),1000);return()=>clearInterval(id)},[]);const d=Math.floor(left/86400),h=Math.floor(left%86400/3600),m=Math.floor(left%3600/60);return <main className="content suite-page"><section className="drop-banner suite-drop"><div><p className="kicker">{t('merchDropTitle')}</p><h1>{t('dropTitle')}</h1><p>{t('purchaseLimit')}</p><div className="countdown"><span><b>{String(d).padStart(2,'0')}</b><small>{t('daysShort')}</small></span><span><b>{String(h).padStart(2,'0')}</b><small>{t('hoursShort')}</small></span><span><b>{String(m).padStart(2,'0')}</b><small>{t('minShort')}</small></span></div></div><Mascot/></section><div className="suite-product-grid">{merchandise.filter(p=>p.stock<=3).map(p=><article key={p.id}><img src={p.image}/><div><b>{lang==='en'?p.en:p.zh}</b><small>{t('onlyLeft',{n:p.stock})}</small><strong>HK${p.price}</strong></div></article>)}</div><section className="suite-card"><h2>{t('dropsHistory')}</h2><p>Spring 2025 · Campus Blocks</p></section></main>}

function FriendOrder({t}:{t:T}){const [made,setMade]=useState(false);const [name,setName]=useState('');const [email,setEmail]=useState('');const [note,setNote]=useState('');return <main className="content suite-page"><PageHead kicker={t('orders')} title={t('orderForFriend')}/><div className="friend-layout"><form className="suite-card" onSubmit={e=>{e.preventDefault();setMade(true)}}><Field label={t('friendName')}><input required value={name} onChange={e=>setName(e.target.value)}/></Field><Field label={t('friendEmail')}><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></Field><Field label={t('note')}><textarea value={note} onChange={e=>setNote(e.target.value)}/></Field><button className="primary full">{t('continue')}</button></form>{made&&<section className="share-card"><Mascot variant="mark"/><h2>#4821</h2><p>{name} · {email}</p><b>7249</b><div className="gift-email-preview" role="status"><strong>{t('giftEmailTitle')}</strong><p>{t('giftEmailBody',{name})}</p><small>{t('giftEmailSent',{email})}</small>{note&&<em>{note}</em>}</div><button className="secondary" onClick={()=>navigator.clipboard?.writeText(`${t('giftEmailTitle')} ${t('giftEmailBody',{name})}`)}>{t('copyShare')}</button></section>}</div></main>}

function DeveloperPage({t,user}:{t:T;user:DemoUser}){
  const [token,setToken]=useState('9ebe2303f609e908fbde3867e1cbdf016dee1129c5837d6074d196790114061f') // <-- YOUR REAL TOKEN
  const [tested,setTested]=useState(false)
  const [response,setResponse]=useState<any>(null)
  const [error,setError]=useState('')

  const testApi = async () => {
    setTested(true)
    setError('')
    setResponse(null)
    try {
      const res = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        setError(`Error: ${res.status} ${res.statusText}`)
        return
      }
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError('Failed to fetch')
    }
  }

  return <main className="content suite-page"><PageHead kicker={t('adminView')} title={t('apiTitle')}/><div className="demo-note">{t('protectedApiBanner')}</div><section className="suite-card"><label>{t('apiToken')}</label><div className="token-row"><input type="text" value={token} onChange={e=>setToken(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--surface-2)', color:'var(--text)'}}/><button className="primary" onClick={testApi}>{t('testApi')}</button></div></section><div className="api-panels"><section><b>{t('withoutToken')}</b><pre>{`{ "error": "missing_token" }`}</pre></section><section><b>{t('withToken')}</b><pre>{error ? error : (tested ? JSON.stringify(response, null, 2) : 'Click "Test API" to see data')}</pre></section></div><pre className="curl-block">curl -H "Authorization: Bearer {token}" http://localhost:4000/api/students</pre></main>
}

function StockPage({t,lang,products,setProducts}:{t:T;lang:Lang;products:FavouriteProduct[];setProducts:(v:FavouriteProduct[])=>void}){const [items,setItems]=useState(()=>products.map(p=>({...p,active:p.active!==false,threshold:p.threshold??4})));const [filter,setFilter]=useState('all');const [adding,setAdding]=useState(false);const [saved,setSaved]=useState(false);const [newItem,setNewItem]=useState({name:'',price:0,stock:0});const shown=items.filter(p=>filter==='all'||(filter==='low'?p.stock<=(p.threshold??4):p.stock===0));const add=()=>{if(!newItem.name)return;setItems([...items,{...products[0],id:Date.now(),en:newItem.name,zh:newItem.name,price:newItem.price,stock:newItem.stock,active:true,threshold:4}]);setAdding(false)};const upload=(id:number,file?:File)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>setItems(current=>current.map(x=>x.id===id?{...x,image:String(reader.result)}:x));reader.readAsDataURL(file)};const save=()=>{setProducts(items);setSaved(true);window.setTimeout(()=>setSaved(false),1800)};return <main className="content suite-page"><PageHead kicker={t('adminView')} title={t('stockTitle')}/><div className="suite-toolbar"><div className="chips">{[['all',t('all')],['low',t('lowStockFilter')],['out',t('outOfStockFilter')]].map(([id,label])=><button className={filter===id?'active':''} onClick={()=>setFilter(id)} key={id}>{label}</button>)}</div><button className="secondary" onClick={()=>setItems(items.map(p=>({...p,stock:p.stock+10})))}>{t('bulkRestock')}</button><button className="secondary" onClick={()=>setAdding(true)}>{t('addProduct')}</button><button className="primary" onClick={save}>{t('save')}</button></div>{saved&&<div className="save-banner" role="status">{t('inventorySaved')}</div>}<div className="data-table stock-table">{shown.map(p=><div className={p.stock<=(p.threshold??4)?'low-row':''} key={p.id}><label className="stock-image-editor"><img src={p.image}/><span>{t('changeImage')}</span><input type="file" accept="image/*" onChange={e=>upload(p.id,e.target.files?.[0])}/></label><span><b>{lang==='en'?p.en:p.zh}</b><small>{lang==='en'?p.zh:p.en}</small></span><label>HK$ <input type="number" value={p.price} onChange={e=>setItems(items.map(x=>x.id===p.id?{...x,price:Number(e.target.value)}:x))}/></label><label>{t('stock')} <input type="number" value={p.stock} onChange={e=>setItems(items.map(x=>x.id===p.id?{...x,stock:Number(e.target.value)}:x))}/></label><span className="table-actions"><button onClick={()=>setItems(items.map(x=>x.id===p.id?{...x,active:!x.active}:x))}>{p.active?t('disable'):t('enable')}</button><button onClick={()=>setItems(items.map(x=>x.id===p.id?{...x,stock:0}:x))}>{t('outOfStock')}</button><button className="danger-text" onClick={()=>{if(window.confirm(t('confirmDeleteProduct')))setItems(items.filter(x=>x.id!==p.id))}}>{t('deleteProduct')}</button></span></div>)}</div>{adding&&<div className="overlay"><section className="account-modal"><h2>{t('addProduct')}</h2><Field label={t('fullName')}><input value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/></Field><Field label={t('price')}><input type="number" value={newItem.price} onChange={e=>setNewItem({...newItem,price:Number(e.target.value)})}/></Field><Field label={t('stock')}><input type="number" value={newItem.stock} onChange={e=>setNewItem({...newItem,stock:Number(e.target.value)})}/></Field><div className="modal-actions"><button onClick={()=>setAdding(false)}>{t('cancel')}</button><button className="primary" onClick={add}>{t('save')}</button></div></section></div>}</main>}

function SlotsPage({t,slots,setSlots}:{t:T;slots:DemoSlot[];setSlots:(v:DemoSlot[])=>void}){const [start,setStart]=useState('16:00');const [end,setEnd]=useState('16:30');const [location,setLocation]=useState('Lee Quo Wei Academic Building, G/F');const save=(next:DemoSlot[])=>{setSlots(next);writeStore('hsu-slots',next)};const add=()=>{if(!start||!end)return;save([...slots,{id:`s${Date.now()}`,time:`${start}–${end}`,location,booked:0,capacity:8,enabled:true}])};return <main className="content suite-page"><PageHead kicker={t('staffView')} title={t('slotsTitle')}/><div className="suite-toolbar slot-creator"><input type="date" defaultValue={new Date().toISOString().slice(0,10)}/><label>{t('startTime')}<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>{t('endTime')}<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label><label>{t('pickupPoint')}<input value={location} onChange={e=>setLocation(e.target.value)}/></label><button className="primary" onClick={add}>{t('addSlot')}</button></div><div className="data-table slot-table">{slots.map(slot=><div key={slot.id}><input className="slot-time-input" value={slot.time} onChange={e=>save(slots.map(x=>x.id===slot.id?{...x,time:e.target.value}:x))}/><input className="slot-location-input" value={slot.location||''} onChange={e=>save(slots.map(x=>x.id===slot.id?{...x,location:e.target.value}:x))}/><label>{t('capacity')} <input type="number" value={slot.capacity} min={slot.booked} onChange={e=>save(slots.map(x=>x.id===slot.id?{...x,capacity:Number(e.target.value)}:x))}/></label><span>{t('booked')}: {slot.booked}</span><span className={`status ${slot.booked>=slot.capacity?'warning':'ready'}`}>{slot.booked>=slot.capacity?t('full'):t('activeLabel')}</span><button className="danger-text" onClick={()=>save(slots.filter(x=>x.id!==slot.id))}>{t('deleteSlot')}</button></div>)}</div></main>}

function UsersPage({t, lang}:{t:T; lang:Lang}){
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/students/all')
      .then(res => res.json())
      .then(data => { 
        setUsers(data); 
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleRole = async (userId: string, currentRoles: string[], role: string) => {
    const nextRoles = currentRoles.includes(role) 
      ? currentRoles.filter(r => r !== role) 
      : [...currentRoles, role]
    
    if (nextRoles.length === 0) return 

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: nextRoles } : u))
  }

  const shown = users.filter(u => 
    u.fullName.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  )

  return <main className="content suite-page">
    <PageHead kicker={t('adminView')} title={t('usersTitle')}/>
    <input className="suite-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('search')}/>
    
    {loading ? <p>Loading users...</p> : (
      <div className="data-table users-table">
        {shown.map(u => (
          <div key={u.id}>
            {u.avatarUrl ? <img className="profile-avatar" src={u.avatarUrl}/> : <span className="profile-avatar">{getInitials(u.fullName)}</span>}
            
            <span>
              <b>{u.fullName}</b>
              <small>{u.username} · {u.email}</small>
            </span>
            
            <fieldset className="role-selector">
              <legend>{t('changeRole')}</legend>
              {(['student','staff','admin'] as Role[]).map(role => (
                <label key={role}>
                  <input type="checkbox" checked={u.roles.includes(role)} onChange={()=>toggleRole(u.id, u.roles, role)}/>
                  {t(`role${role[0].toUpperCase()}${role.slice(1)}` as CopyKey)}
                </label>
              ))}
            </fieldset>
            
            <span>{u.programme || 'Public'}<small>{u.studentId || '—'}</small></span>
            <span>{u.lastLoginAt?.slice(0,10) || '—'}</span>
          </div>
        ))}
        {shown.length === 0 && <p style={{padding: '20px'}}>{t('noItems')}</p>}
      </div>
    )}
  </main>
}

function AuditPage({t,user}:{t:T;user:DemoUser}){const actions:CopyKey[]=['auditLogin','auditDashboard','auditPreparing','auditReady','auditCollect','auditRestock','auditPassword','auditSwitch'];const [filter,setFilter]=useState('');return <main className="content suite-page"><PageHead kicker={t('adminView')} title={t('auditTitle')}/><input className="suite-search-input" placeholder={t('auditFilter')} value={filter} onChange={e=>setFilter(e.target.value)}/><div className="audit-table"><header><b>{t('timestamp')}</b><b>{t('usersTitle')}</b><b>{t('action')}</b><b>{t('target')}</b><b>{t('ipAddress')}</b></header>{actions.filter(x=>t(x).toLowerCase().includes(filter.toLowerCase())).map((action,i)=><div key={action}><span>2025-05-28 1{i}:20</span><span>{user.username}</span><b>{t(action)}</b><span>{i%2?'#4821':'HSU Tuck Shop'}</span><span>10.0.0.{i+2}</span></div>)}</div></main>}
