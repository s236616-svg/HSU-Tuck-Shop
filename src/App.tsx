import { useEffect, useMemo, useRef, useState } from 'react'
import { CopyKey, Lang, languageLabels, translator } from './i18n'
import { Mascot } from './Mascot'
import { Merch, merchandise } from './merch'
import { CatalogProduct, standardProducts } from './catalog'
import { AuthScreen, FeaturePage } from './SuitePages'
import { DemoNotification, DemoOrder, DemoSlot, DemoUser, Role, currentUser, ensureDemoSeed, initialNotifications, initialOrders, initialSlots, readStore, updateStoredUser, writeStore } from './demo'

type Page = 'home'|'shop'|'cart'|'orders'|'account'|'staff'|'admin'|'login'|'register'|'forgot-password'|'reset-password'|'favorites'|'notifications'|'loyalty'|'merch-drop'|'order-for-friend'|'search'|'developer'|'stock'|'slots'|'users'|'audit'
type Theme = 'light'|'dark'|'system'
type T = ReturnType<typeof translator>
type AnyProduct = (CatalogProduct | Merch) & {active?:boolean;threshold?:number}

const pagePaths:Record<Page,string>={home:'/',shop:'/shop',cart:'/cart',orders:'/orders',account:'/account',staff:'/staff',admin:'/admin',login:'/login',register:'/register','forgot-password':'/forgot-password','reset-password':'/reset-password',favorites:'/favorites',notifications:'/notifications',loyalty:'/loyalty','merch-drop':'/merch-drop','order-for-friend':'/order-for-friend',search:'/search',developer:'/developer',stock:'/stock',slots:'/slots',users:'/users',audit:'/audit'}
function pageFromPath(path:string):Page { const clean=path.split('?')[0];return (Object.entries(pagePaths).find(([,value])=>value===clean)?.[0] as Page)||'home' }

const icons: Record<string, React.ReactNode> = {
  home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  cart:<><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></>,
  orders:<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  account:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  heart:<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
  arrow:<><path d="M5 12h14M14 7l5 5-5 5"/></>,
  check:<path d="m5 12 4 4L19 6"/>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  package:<><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7v10l8 4 8-4V7M12 11v10"/></>,
  plus:<path d="M12 5v14M5 12h14"/>, minus:<path d="M5 12h14"/>,
  spark:<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/>,
  chart:<><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/><path d="M2 20h22"/></>,
  menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>
}

function Icon({name,size=22}:{name:string;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function ThemeControl({theme,setTheme,t}:{theme:Theme;setTheme:(v:Theme)=>void;t:T}) {
  const options:Theme[]=['light','dark','system']
  return <div className="theme-control" role="group" aria-label={t('appearance')}>{options.map(x=><button key={x} className={theme===x?'selected':''} onClick={()=>setTheme(x)}>{t(x)}</button>)}</div>
}

function LanguageControl({lang,setLang,t}:{lang:Lang;setLang:(v:Lang)=>void;t:T}) {
  return <div className="language-control" role="group" aria-label={t('language')}>{(['en','zh'] as Lang[]).map(x=><button key={x} lang={x==='zh'?'zh-Hant':'en'} className={lang===x?'selected':''} onClick={()=>setLang(x)}>{languageLabels[x]}</button>)}</div>
}

function Header({page,setPage,count,theme,setTheme,lang,setLang,t,loggedIn,onLogout,user,view,setView,notifications,setNotifications}:{page:Page;setPage:(v:Page)=>void;count:number;theme:Theme;setTheme:(v:Theme)=>void;lang:Lang;setLang:(v:Lang)=>void;t:T;loggedIn:boolean;onLogout:()=>void;user:DemoUser;view:Role;setView:(v:Role)=>void;notifications:DemoNotification[];setNotifications:(v:DemoNotification[])=>void}) {
  const [menu,setMenu]=useState(false);const [noteMenu,setNoteMenu]=useState(false)
  const notificationRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(!noteMenu)return;const close=(event:PointerEvent)=>{if(!notificationRef.current?.contains(event.target as Node))setNoteMenu(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[noteMenu])
  const switchView=(next:Role)=>{setView(next);setMenu(false);setPage(next==='student'?'home':next)}
  const roleLabel=(role:Role)=>t(role==='student'?'currentViewStudent':role==='staff'?'currentViewStaff':'currentViewAdmin')
  const saveNotes=(next:DemoNotification[])=>{setNotifications(next);writeStore('hsu-notifications',next)}
  const unread=notifications.filter(n=>!n.read).length
  const studentLinks:[Page,CopyKey,string][]=[['home','home','home'],['shop','merchandise','package'],['search','search','search'],['favorites','favourites','heart'],['loyalty','loyaltyTitle','spark'],['merch-drop','merchDropTitle','package'],['order-for-friend','orderForFriend','account'],['notifications','notificationsTitle','bell']]
  const staffLinks:[Page,CopyKey,string][]=[['staff','staffBoard','package'],['stock','stockTitle','chart'],['slots','slotsTitle','clock'],['notifications','notificationsTitle','bell']]
  const adminLinks:[Page,CopyKey,string][]=[['admin','adminAnalytics','chart'],['developer','apiTitle','package'],['stock','stockTitle','chart'],['slots','slotsTitle','clock'],['users','usersTitle','account'],['audit','auditTitle','orders'],['notifications','notificationsTitle','bell']]
  const links=view==='student'?studentLinks:view==='staff'?staffLinks:adminLinks
  const go=(next:Page)=>{setPage(next);setMenu(false)}
  return <header className="topbar"><div className="nav-wrap">
    <button className="brand" onClick={()=>setPage('home')} aria-label={t('home')}><span className="brand-img vector"><Mascot variant="shop"/></span><span>{t('brand')}</span></button>
    <nav className="desktop-links" aria-label={t('brand')}>
      <button className={page==='home'?'active':''} onClick={()=>setPage('home')}>{t('home')}</button>
      <button className={page==='shop'?'active':''} onClick={()=>setPage('shop')}>{t('merchandise')}</button>
    </nav>
    <div className="nav-actions">
      <label className="compact-nav-select" aria-label={t('language')}><select value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">EN</option><option value="zh">繁中</option></select></label>
      <label className="compact-nav-select theme-select" aria-label={t('theme')}><select value={theme} onChange={e=>setTheme(e.target.value as Theme)}><option value="light">{t('light')}</option><option value="dark">{t('dark')}</option><option value="system">{t('system')}</option></select></label>
      <div className="notification-trigger" ref={notificationRef}><button className="icon-btn desktop-only" aria-label={t('notifications')} aria-expanded={noteMenu} onClick={()=>setNoteMenu(!noteMenu)}><Icon name="bell"/>{unread>0&&<span className="dot"/>}</button>{noteMenu&&<div className="notification-dropdown"><header><b>{t('notificationsTitle')}</b><button onClick={()=>saveNotes(notifications.map(n=>({...n,read:true})))}>{t('markAllRead')}</button></header>{notifications.map(n=><button className={n.read?'read':''} key={n.id} onClick={()=>saveNotes(notifications.map(x=>x.id===n.id?{...x,read:true}:x))}><span>{n.kind==='order'?'✓':n.kind==='stock'?'□':'★'}</span><b>{lang==='en'?n.en:n.zh}</b>{!n.read&&<i/>}</button>)}<button className="view-all-notes" onClick={()=>{setPage('notifications');setNoteMenu(false)}}>{t('viewAllOrders').replace(t('orders'),t('notifications'))}</button></div>}</div>
      {view==='student'&&<button id="top-cart-target" className="icon-btn" onClick={()=>setPage('cart')} aria-label={t('cart')}><Icon name="cart"/>{count>0&&<span className="count">{count}</span>}</button>}
      {loggedIn?<button className="hamburger-button" onClick={()=>setMenu(true)} aria-expanded={menu} aria-label={t('accountMenu')}>{user.avatarUrl?<img className="header-account-avatar" src={user.avatarUrl} alt=""/>:<span className="header-account-avatar initials">KC</span>}<span>{roleLabel(view)}</span><Icon name="menu" size={18}/></button>:<button className="nav-login desktop-only" onClick={()=>setPage('login')}>{t('login')}</button>}
    </div>
  </div>{menu&&<div className="side-drawer-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMenu(false)}}><aside className="account-side-drawer" aria-label={t('accountMenu')}><header><div className="account-summary">{user.avatarUrl?<img src={user.avatarUrl} alt=""/>:<span>KC</span>}<div><b>{user.username} · {user.fullName}</b><small>{user.email}</small></div></div><button onClick={()=>setMenu(false)} aria-label={t('close')}>×</button></header><nav>
    <button className={page==='account'?'active':''} onClick={()=>go('account')}><Icon name="account"/><span>{t('profile')}</span></button>
    {view==='student'&&<button className={page==='orders'?'active':''} onClick={()=>go('orders')}><Icon name="orders"/><span>{t('orderHistory')}</span></button>}
    <div className="drawer-label">{roleLabel(view)}</div>{links.map(([target,key,icon])=><button className={page===target?'active':''} onClick={()=>go(target)} key={target}><Icon name={icon}/><span>{t(key)}</span><Icon name="arrow" size={15}/></button>)}
  </nav><div className="drawer-view-switch"><b>{t('viewAs')}</b>{(['student','staff','admin'] as Role[]).map(role=><button className={view===role?'active':''} key={role} onClick={()=>switchView(role)}><span>{roleLabel(role)}</span>{view===role&&<Icon name="check" size={15}/>}</button>)}</div><button className="drawer-logout" onClick={()=>{onLogout();setMenu(false)}}><Icon name="arrow"/>{t('logout')}</button></aside></div>}</header>
}

function MerchNotice({t}:{t:T}) {
  return <section className="merch-notice"><Icon name="spark"/><div><b>{t('merchandise')}</b><p>{t('merchNotice')}</p></div></section>
}

function PurchaseInfo({t,catalog=false}:{t:T;catalog?:boolean}) {
  return <section className="purchase-info"><div className="purchase-head"><Icon name="package"/><h2>{t('purchaseInfo')}</h2></div><div className="purchase-grid">
    <div><b>{t('purchaseLocation')}</b><p>{t(catalog?'purchaseLocationCatalog':'purchaseLocationValue')}</p></div><div><b>{t('officeHours')}</b><p>{t(catalog?'officeHoursCatalog':'officeHoursValue')}</p></div>
    <div><b>{t('paymentMethod')}</b><p>{t(catalog?'merchPaymentsCatalog':'merchPayments')}</p></div><div><b>{t('enquiry')}</b><p>su@hsu.edu.hk</p></div>
  </div><p className="bag-note">* {t('bringBag')}</p></section>
}

function isMerch(p:AnyProduct):p is Merch { return p.id>=100 }
function productName(p:AnyProduct,lang:Lang){return lang==='en'?p.en:p.zh}

function ProductCard({product,lang,t,add,open}:{product:AnyProduct;lang:Lang;t:T;add:(origin:DOMRect)=>void;open:()=>void}) {
  const [liked,setLiked]=useState(false)

  useEffect(() => {
    const loadFavs = () => {
      fetch('/api/favorites', { credentials: 'include' })
        .then(res => res.json())
        .then(favs => {
          if (Array.isArray(favs) && favs.map(Number).includes(Number(product.id))) {
            setLiked(true)
          } else {
            setLiked(false)
          }
        })
        .catch(err => console.error('Failed to load favs', err))
    }
    
    loadFavs() 
    window.addEventListener('refresh-favs', loadFavs)
    return () => window.removeEventListener('refresh-favs', loadFavs)
  }, [product.id])

  const toggleFavourite = async () => {
    const next = !liked
    setLiked(next)
    if (next) {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id })
      })
    } else {
      await fetch(`/api/favorites/${product.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    }
  }

  return <article className="product-card"><div className="product-image">
    <button className={`heart ${liked?'liked':''}`} onClick={toggleFavourite} aria-label={t('favourite')} aria-pressed={liked}><Icon name="heart" size={19}/></button>
    <button className="image-button" onClick={open}>{product.image?<img src={product.image} alt={productName(product,lang)}/>:<span className="product-placeholder"><Mascot variant="line"/></span>}</button>
    <span className={`badge ${product.stock<=3?'warning':''}`}>{product.stock<=3?t('onlyLeft',{n:product.stock}):t('new')}</span>
  </div><div className="product-info"><p className="eyebrow">{isMerch(product)?t('merchandise'):t(product.category)}</p>
    <button className="product-title" onClick={open}>{productName(product,lang)}</button><p className="zh">{lang==='en'?product.zh:product.en}</p>
    <div className="product-bottom"><span className="price">HK${product.price}</span><button className="add-btn" onClick={event=>add(event.currentTarget.getBoundingClientRect())}><Icon name="plus" size={18}/>{t('add')}</button></div>
  </div></article>
}

function Home({t,lang,setPage,selectCategory,add,open,products}:{t:T;lang:Lang;setPage:(v:Page)=>void;selectCategory:(v:CopyKey)=>void;add:(id:number,origin?:DOMRect)=>void;open:(p:AnyProduct)=>void;products:AnyProduct[]}) {
  const cats:[CopyKey,CopyKey,string][]=[['snacks','popularNow','S'],['drinks','ready15','D'],['iceCream','coldWarning','I'],['stationery','details','P'],['merchandise','limitedEdition','H']]
  const featured:AnyProduct[]=[...products.filter(p=>!isMerch(p)).slice(0,2),...products.filter(isMerch).slice(0,2)]
  return <main><section className="hero"><div className="hero-content"><span className="open-pill"><span className="pulse"/>{t('heroKicker')}</span>
    <h1>{t('heroTitle')}</h1><p>{t('tagline')}</p><div className="hero-actions"><button className="primary lg" onClick={()=>{selectCategory('all');setPage('shop')}}>{t('shopNow')}<Icon name="arrow"/></button><button className="secondary lg" onClick={()=>setPage('orders')}><Icon name="clock"/>{t('trackOrder')}</button></div>
    <div className="hero-note"><span className="avatar-stack"><i>KC</i><i>KM</i><i>+</i></span><span><b>{t('campusFavourite')}</b><br/>{t('noQueue')}</span></div>
  </div><div className="hero-visual"><div className="mascot-card vector home-mascot-card"><Mascot/><div className="bamboo-dots"/></div><div className="float-card pickup"><Icon name="clock"/><span><b>{t('pickupFast')}</b><small>{t('noQueue')}</small></span></div></div></section>
  <section className="content section"><div className="section-head"><div><p className="kicker">{t('categoriesKicker')}</p><h2>{t('categories')}</h2></div><button className="text-link" onClick={()=>{selectCategory('all');setPage('shop')}}>{t('browseAll')}<Icon name="arrow" size={18}/></button></div>
    <div className="categories">{cats.map(([name,sub,letter],i)=><button className={`category cat-${i}`} key={name} onClick={()=>{selectCategory(name);setPage('shop')}}><span className="category-art">{letter}<i/></span><span><b>{t(name)}</b><small>{t(sub)}</small></span><Icon name="arrow" size={18}/></button>)}</div>
  </section><section className="content section"><div className="section-head"><div><p className="kicker">{t('campusPicks')}</p><h2>{t('popular')}</h2></div><button className="text-link" onClick={()=>{selectCategory('all');setPage('shop')}}>{t('seeEverything')}<Icon name="arrow" size={18}/></button></div>
    <div className="product-grid featured">{featured.map(p=><ProductCard product={p} lang={lang} t={t} key={p.id} add={origin=>add(p.id,origin)} open={()=>open(p)}/>)}</div>
  </section><section className="content drop-banner"><div><span className="limited-pill">{t('limitedDrop')}</span><h2>{t('dropTitle')}</h2><p>{t('dropBody')}</p><div className="countdown"><span><b>02</b><small>{t('daysShort')}</small></span><i>:</i><span><b>14</b><small>{t('hoursShort')}</small></span><i>:</i><span><b>38</b><small>{t('minShort')}</small></span></div><button className="gold-btn" onClick={()=>{selectCategory('merchandise');setPage('shop')}}>{t('shopDrop')}<Icon name="arrow"/></button></div><div className="drop-art vector"><Mascot/><span>{t('onlyLeft',{n:3})}</span></div></section>
  <section className="content rewards rewards-compact"><div className="reward-panda vector"><Mascot variant="mark"/></div><div><p className="kicker">{t('rewards')}</p><h2>{t('rewardTitle')}</h2><p>{t('rewardBody')}</p></div><button className="secondary" onClick={()=>setPage('loyalty')}>{t('viewRewards')}</button></section>
  </main>
}

function Shop({t,lang,add,open,products,initialCategory}:{t:T;lang:Lang;add:(id:number,origin?:DOMRect)=>void;open:(p:AnyProduct)=>void;products:AnyProduct[];initialCategory:CopyKey}) {
  const [category,setCategory]=useState<CopyKey>(initialCategory); const [query,setQuery]=useState('')
  const categories:CopyKey[]=['all','merchandise','snacks','drinks','iceCream','stationery']
  const shown=products.filter(p=>p.active!==false&&(category==='all'||(category==='merchandise'?isMerch(p):!isMerch(p)&&p.category===category))&&productName(p,lang).toLowerCase().includes(query.toLowerCase()))
  return <main className="content shop-page"><div className="page-intro"><div><p className="kicker">{t('shelf')}</p><h1>{t('shopEverything')}</h1><p>{t('shopDescription')}</p></div><div className="search"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')}/></div></div>
    <div className="chips">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{t(c)}</button>)}</div>
    {(category==='merchandise'||category==='all')&&<MerchNotice t={t}/>}
    <div className="catalog-layout"><aside className="filters"><div className="filter-head"><b>{t('filters')}</b><button>{t('clear')}</button></div><label>{t('availability')}</label><button className="check-row"><span className="fake-check checked"><Icon name="check" size={14}/></span>{t('inStock')}</button><label>{t('priceRange')}</label><input type="range" min="0" max="400"/><div className="range-label"><span>HK$0</span><span>HK$400</span></div><label>{t('special')}</label>{(['popularNow','limitedEdition','favourites'] as CopyKey[]).map(x=><button className="check-row" key={x}><span className="fake-check"/>{t(x)}</button>)}</aside>
    <div className="catalog-main"><div className="result-bar"><span>{t('items',{n:shown.length})}</span><select aria-label={t('sortPopular')}><option>{t('sortPopular')}</option><option>{t('sortPrice')}</option><option>{t('sortNewest')}</option></select></div><div className="product-grid">{shown.map(p=><ProductCard key={p.id} product={p} lang={lang} t={t} add={origin=>add(p.id,origin)} open={()=>open(p)}/>)}</div>{!shown.length&&<Empty t={t}/>}</div></div>
    {(category==='merchandise'||category==='all')&&<PurchaseInfo t={t} catalog/>}
  </main>
}

function Empty({t}:{t:T}) { return <div className="empty vector"><Mascot/><h2>{t('noResults')}</h2><p>{t('trySearch')}</p></div> }

function ProductDetail({product,lang,t,add,close}:{product:AnyProduct;lang:Lang;t:T;add:(origin:DOMRect)=>void;close:()=>void}) {
  const [choice,setChoice]=useState('M'); 
  const [qty,setQty]=useState(1); 
  const [liked,setLiked]=useState(false)

  useEffect(() => {
    fetch('/api/favorites', { credentials: 'include' })
      .then(res => res.json())
      .then(favs => {
        if (Array.isArray(favs) && favs.map(Number).includes(Number(product.id))) setLiked(true)
      })
  }, [product.id])

  const toggleFavourite = async () => {
    const next = !liked
    setLiked(next)
    if (next) {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id })
      })
    } else {
      await fetch(`/api/favorites/${product.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    }
  }

  return (
    <div className="overlay product-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <article className={`product-modal ${isMerch(product)?'merch-modal':''}`}>
        <button className="modal-close" onClick={close}>{t('close')}</button>
        <div className="modal-image">
          {product.image?<img src={product.image} alt={productName(product,lang)}/>:<span className="product-placeholder"><Mascot/></span>}
          <span className="badge warning">{t('onlyLeft',{n:product.stock})}</span>
        </div>
        <div className="modal-copy">
          <p className="kicker">{isMerch(product)?t('merchandise'):t(product.category)}</p>
          <h1>{productName(product,lang)}</h1>
          <p className="zh">{lang==='en'?product.zh:product.en}</p>
          <b className="big-price">{t('priceBoth')} HK${product.price}</b>
          
          <div className="detail-section">
            <h3>{t('detailsBoth')}</h3>
            <p>{isMerch(product)?(lang==='en'?product.detailsEn:product.detailsZh):t('productIntro')}</p>
          </div>
          
          {isMerch(product) && (
            <>
              <div className="detail-section">
                <h3>{t('notesBoth')}</h3>
                <div className="tag-row">
                  <span>{t('limitedStock')}</span>
                  <span>{t('noRefund')}</span>
                  {product.pickupOnly&&<span>{t('pickupOnly')}</span>}
                </div>
              </div>
              {product.selector && (
                <div className="selector">
                  <b>{product.selector==='style'?t('style'):t('size')}</b>
                  <div className="option-row">
                    {(product.selector==='style'?['chic','preppy']:['XS','S','M','L','XL']).map(x=>(
                      <button className={choice===x?'selected':''} onClick={()=>setChoice(x)} key={x}>
                        {x==='chic'||x==='preppy'?t(x):x}
                      </button>
                    ))}
                  </div>
                  {product.selector==='size'&&<small>{t('sizeGuide')}</small>}
                </div>
              )}
            </>
          )}
          
          <div className="product-buy">
            <div>
              <label>{t('quantity')}</label>
              <div className="stepper">
                <button onClick={()=>setQty(Math.max(1,qty-1))}><Icon name="minus" size={16}/></button>
                <span>{qty}</span>
                <button onClick={()=>setQty(qty+1)}><Icon name="plus" size={16}/></button>
              </div>
            </div>
            <button className={`heart standalone ${liked?'liked':''}`} onClick={toggleFavourite} aria-label={t('favourite')} aria-pressed={liked}><Icon name="heart"/></button>
          </div>
          
          <div className="notice">
            <Icon name="spark"/>
            <span><b>{t('onlyToday',{n:product.stock})}</b><small>{t('maxTwo')}</small></span>
          </div>
          
          <button className="primary full lg" onClick={event=>add(event.currentTarget.getBoundingClientRect())}>
            {t('addToCart')} · HK${product.price*qty}<Icon name="cart"/>
          </button>
        </div>
        
        {isMerch(product) && (
          <div className="modal-purchase">
            <MerchNotice t={t}/><PurchaseInfo t={t}/>
          </div>
        )}
      </article>
    </div>
  )
}

function Cart({cart,t,lang,update,checkout,products}:{cart:Record<number,number>;t:T;lang:Lang;update:(id:number,n:number)=>void;checkout:()=>void;products:AnyProduct[]}) {
  const items=products.filter(p=>cart[p.id]).map(p=>({...p,qty:cart[p.id]})); const total=items.reduce((s,p)=>s+p.price*p.qty,0)
  return <main className="content cart-page"><div className="page-intro compact"><div><p className="kicker">{t('almostYours')}</p><h1>{t('yourCart')}</h1><p>{t('reserved',{n:items.length})}</p></div></div>{items.length?<div className="cart-layout"><div className="cart-items">{items.map(p=><article className="cart-row" key={p.id}>{p.image?<img src={p.image} alt={productName(p,lang)}/>:<span className="cart-mascot"><Mascot variant="mark"/></span>}<div className="cart-copy"><h3>{productName(p,lang)}</h3><small>{lang==='en'?p.zh:p.en}</small><button onClick={()=>update(p.id,0)}>{t('remove')}</button></div><div className="stepper"><button onClick={()=>update(p.id,p.qty-1)}><Icon name="minus" size={16}/></button><span>{p.qty}</span><button onClick={()=>update(p.id,p.qty+1)}><Icon name="plus" size={16}/></button></div><b className="line-price">HK${p.price*p.qty}</b></article>)}</div>
    <aside className="summary"><h2>{t('orderTotal')}</h2><div><span>{t('subtotal')}</span><b>HK${total}</b></div><div><span>{t('pickup')}</span><b>{t('free')}</b></div><hr/><div className="summary-total"><span>{t('total')}</span><b>HK${total}</b></div><div className="pickup-mini"><Icon name="clock"/><span><b>{t('choosePickup')}</b><small>{t('atCheckout')}</small></span></div><button className="primary full lg" onClick={checkout}>{t('checkout')}<Icon name="arrow"/></button><p className="safe"><Icon name="check" size={15}/>{t('safePayment')}</p></aside></div>:<div className="empty vector"><Mascot variant="line"/><h2>{t('emptyCart')}</h2><p>{t('emptyCartBody')}</p></div>}</main>
}

function Checkout({total,t,close,done,slots}:{total:number;t:T;close:()=>void;done:(slotId:string, method:string)=>Promise<void>;slots:DemoSlot[]}) {
  const available=slots.filter(s=>s.enabled&&s.booked<s.capacity)
  const [step,setStep]=useState(1); const [slot,setSlot]=useState(available[0]?.time||''); const [payment,setPayment]=useState<CopyKey>('wallet');const [termsAccepted,setTermsAccepted]=useState(true);const [termsError,setTermsError]=useState(false);const [cancelPayment,setCancelPayment]=useState(false);const [cancelled,setCancelled]=useState(false);const payments:CopyKey[]=['wallet','octopus','alipay','wechat','payme','visa','counter']
  const selectedSlot=slots.find(s=>s.time===slot)
  return <div className="overlay"><div className="checkout-shell"><div className="checkout-head"><button className="checkout-close" onClick={close}><span aria-hidden="true">×</span>{t('close')}</button><div className="checkout-logo"><span className="brand-img vector"><Mascot variant="shop"/></span><b>{t('secureCheckout')}</b></div><span>{t('step',{n:step})}</span></div><div className="checkout-progress"><i className="done"/><i className={step>1?'done':''}/><i className={step>2?'done':''}/></div>
    <div className="checkout-body"><section className="checkout-main">{step===1&&<><p className="kicker">{t('pickupDetails')}</p><h1>{t('pickupQuestion')}</h1><div className="location-card"><div className="location-icon"><Icon name="package"/></div><div><b>{t('shopLocation')}</b><p>{selectedSlot?.location||t('locationValue')}</p><small>{t('openToday')}</small></div><span className="open-tag">{t('open')}</span></div><h3 className="field-title">{t('today')}</h3><div className="slots">{slots.map(s=><button disabled={!s.enabled||s.booked>=s.capacity} className={slot===s.time?'selected':''} onClick={()=>setSlot(s.time)} key={s.id}><b>{s.time}</b><small>{s.booked>=s.capacity?t('full'):t('spots',{n:s.capacity-s.booked})}</small></button>)}</div>{!available.length&&<div className="error-banner" role="status">{t('noAvailableSlots')}</div>}<div className="notice"><Icon name="spark"/><span><b>{t('coldWarning')}</b><small>{t('coldBody')}</small></span></div></>}
    {step===2&&<><p className="kicker">{t('payment')}</p><h1>{t('payQuestion')}</h1><div className="demo-note"><b>{t('demoTitle')}</b><span>{t('demoBanner')}</span></div><div className="payment-grid">{payments.map(x=><button type="button" className={payment===x?'selected':''} aria-pressed={payment===x} onClick={()=>setPayment(x)} key={x}><span className="radio"/><b>{t(x)}</b><small>{x==='wallet'?'HK$99,999':t('simulated')}</small></button>)}</div><button className="cancel-payment-link" onClick={()=>setCancelPayment(true)}>{t('cancelPayment')}</button></>}
    {step===3&&<><p className="kicker">{t('review')}</p><h1>{t('reviewQuestion')}</h1><div className="review-card"><div><span>{t('pickupTime')}</span><b>{t('today')} · {slot}</b></div><div><span>{t('pickupPoint')}</span><b>{selectedSlot?.location||t('locationValue')}</b></div><div><span>{t('paymentMethod')}</span><b>{t(payment)}</b></div></div><label className="terms"><input type="checkbox" checked={termsAccepted} onChange={event=>{setTermsAccepted(event.target.checked);setTermsError(!event.target.checked)}}/><span>{t('termsConfirm')}</span></label>{termsError&&<p className="terms-error" role="alert">{t('termsRequired')}</p>}</>}
    <div className="checkout-actions">{step>1&&<button className="secondary" onClick={()=>setStep(step-1)}>{t('back')}</button>}<button className="primary lg" disabled={step===1&&!slot} onClick={()=>{
  if(step===3){
    if(!termsAccepted){setTermsError(true);return}
    const selectedSlot = slots.find(s => s.time === slot)
    done(selectedSlot?.id || '', payment as string)
  } else {
    setStep(step+1)
  }
}}>{step===3?t('placeOrder'):t('continue')}<Icon name="arrow"/></button></div></section>
    <aside className="checkout-summary"><span>{t('orderTotal')}</span><b>HK${total}</b><p>{t('pickupFree')}</p><hr/><small>{t('help')}</small></aside></div>{cancelPayment&&<div className="overlay nested-overlay"><section className="account-modal"><h2>{t('cancelPayment')}</h2><p>{t('cancelPaymentConfirm')}</p>{cancelled?<div className="recovery-success" role="status">✓ {t('cancelPaymentDone')}</div>:<div className="modal-actions"><button className="secondary" onClick={()=>setCancelPayment(false)}>{t('back')}</button><button className="danger-button" onClick={()=>setCancelled(true)}>{t('cancelPayment')}</button></div>}{cancelled&&<button className="primary full" onClick={close}>{t('close')}</button>}</section></div>}</div></div>
}

function Success({t, order, close}:{t:T; order: any; close:()=>void}) {
  if (!order) return null;
  return <div className="overlay"><div className="success-card"><div className="success-icon"><Icon name="check" size={38}/></div><p className="kicker">{t('orderConfirmed')}</p><h1>{t('successTitle')}</h1><p>{t('successBody')}</p><div className="order-number"><span>{t('orderNumber')}</span><b>{order.id}</b></div><div className="qr-card"><div className="qr" aria-label={t('successBody')}><span className="qr-image"><svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="8" fill="#fff"/><path d="M10 10h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7Zm4 11v23h23V21H14Zm65-11h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H79a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7Zm4 11v23h23V21H83ZM10 72h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V79a7 7 0 0 1 7-7Zm4 11v23h23V83H14Z" fill="#000"/><path d="M60 8a5 5 0 0 1 5 5v4a5 5 0 1 1-10 0v-4a5 5 0 0 1 5-5Zm13 0a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5h-8v13a5 5 0 1 1-10 0V35a5 5 0 0 1 5-5h8V13a5 5 0 0 1 5-5ZM60 58a5 5 0 0 1 5 5v8a5 5 0 1 1-10 0v-8a5 5 0 0 1 5-5Zm13 7a5 5 0 0 1 5 5v27a5 5 0 1 1-10 0V70a5 5 0 0 1 5-5ZM55 82a5 5 0 0 1 5 5v10a5 5 0 1 1-10 0V87a5 5 0 0 1 5-5Zm5 23a5 5 0 0 1 5 5v4a5 5 0 1 1-10 0v-4a5 5 0 0 1 5-5ZM86 65h23a5 5 0 1 1 0 10H86a5 5 0 1 1 0-10Zm0 17h14a5 5 0 1 1 0 10H86a5 5 0 1 1 0-10Zm-74-22h4a5 5 0 1 1 0 10h-4a5 5 0 1 1 0-10Zm17 0h17a5 5 0 1 1 0 10H29a5 5 0 1 1 0-10Zm-17 15h5a5 5 0 1 1 0 10h-5a5 5 0 1 1 0-10Zm20 0h14a5 5 0 0 1 5 5v13a5 5 0 1 1-10 0v-8h-9a5 5 0 1 1 0-10Zm52 22a5 5 0 0 1 5 5v5h17V87a5 5 0 1 1 10 0v25a5 5 0 0 1-5 5H84a5 5 0 0 1-5-5v-10a5 5 0 0 1 5-5Zm16-1a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm11-19a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#000"/></svg></span></div><div><span>{t('fallbackCode')}</span><b>{order.pickup_code.split('').join(' ')}</b></div></div><div className="success-pickup"><Icon name="clock"/><span><b>{order.slot_time}</b><small>{order.location}</small></span></div><button className="primary full lg" onClick={close}>{t('viewOrder')}<Icon name="arrow"/></button></div></div>
}

function PickupQrGraphic() {
  return <svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="8" fill="#fff"/><path d="M10 10h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7Zm4 11v23h23V21H14Zm65-11h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H79a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7Zm4 11v23h23V21H83ZM10 72h31a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V79a7 7 0 0 1 7-7Zm4 11v23h23V83H14Z" fill="#000"/><path d="M60 8a5 5 0 0 1 5 5v4a5 5 0 1 1-10 0v-4a5 5 0 0 1 5-5Zm13 0a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5h-8v13a5 5 0 1 1-10 0V35a5 5 0 0 1 5-5h8V13a5 5 0 0 1 5-5ZM60 58a5 5 0 0 1 5 5v8a5 5 0 1 1-10 0v-8a5 5 0 0 1 5-5Zm13 7a5 5 0 0 1 5 5v27a5 5 0 1 1-10 0V70a5 5 0 0 1 5-5ZM55 82a5 5 0 0 1 5 5v10a5 5 0 1 1-10 0V87a5 5 0 0 1 5-5Zm5 23a5 5 0 0 1 5 5v4a5 5 0 1 1-10 0v-4a5 5 0 0 1 5-5ZM86 65h23a5 5 0 1 1 0 10H86a5 5 0 1 1 0-10Zm0 17h14a5 5 0 1 1 0 10H86a5 5 0 1 1 0-10Zm-74-22h4a5 5 0 1 1 0 10h-4a5 5 0 1 1 0-10Zm17 0h17a5 5 0 1 1 0 10H29a5 5 0 1 1 0-10Zm-17 15h5a5 5 0 1 1 0 10h-5a5 5 0 1 1 0-10Zm20 0h14a5 5 0 0 1 5 5v13a5 5 0 1 1-10 0v-8h-9a5 5 0 1 1 0-10Zm52 22a5 5 0 0 1 5 5v5h17V87a5 5 0 1 1 10 0v25a5 5 0 0 1-5 5H84a5 5 0 0 1-5-5v-10a5 5 0 0 1 5-5Zm16-1a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm11-19a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#000"/></svg>
}

function Orders({t,onBuyAgain,navigate}:{t:T;onBuyAgain:(ids:number[])=>void;navigate:(p:Page)=>void}) {
  const [orders,setOrders]=useState<DemoOrder[]>([])
  const [loading,setLoading]=useState(true)
  const [showQr,setShowQr]=useState<DemoOrder|null>(null)
  const [tab,setTab]=useState<'active'|'all'|'completed'|'cancelled'>('active')
  const [cancel,setCancel]=useState<DemoOrder|null>(null)
  const [toast,setToast]=useState('')

  useEffect(() => {
    const load = () => {
      fetch('/api/orders', { credentials: 'include' })
        .then(r => r.json())
        .then(rows => {
          const mapped = rows.map((r:any) => ({
            id: r.id, status: r.status, slot: r.slot_time, studentId: '',
            total: r.total, itemIds: (r.items || []).map((i:any)=>i.product_id),
            payment: r.payment_method, code: '••••'
          }))
          setOrders(mapped)
          setLoading(false)
        })
    }
    load()
    window.addEventListener('refresh-orders', load)
    return () => window.removeEventListener('refresh-orders', load)
  }, [])

  const statusKey=(status:DemoOrder['status']):CopyKey=>status==='PAID'?'paid':status==='PREPARING'?'preparing':status==='READY'?'ready':status==='COLLECTED'?'collected':'cancelled'
  const visible=orders.filter(order=>tab==='all'||(tab==='active'?['PAID','PREPARING','READY'].includes(order.status):tab==='completed'?order.status==='COLLECTED':order.status==='CANCELLED'))

  const buyAgain=(order:DemoOrder)=>{onBuyAgain(order.itemIds);setToast(t('addedToCart'));window.setTimeout(()=>navigate('cart'),500)}
  
  const confirmCancel= async () => {
    if(!cancel) return
    try {
      await fetch(`/api/orders/${encodeURIComponent(cancel.id)}/status`, {
        method: 'PATCH', headers: {'Content-Type':'application/json'}, credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      setOrders(orders.map(order=>order.id===cancel.id?{...order,status:'CANCELLED'}:order))
      setCancel(null); setToast(t('refundIssued'))
    } catch { alert('Failed to cancel') }
  }

    return <main className="content orders-page"><div className="page-intro compact"><div><p className="kicker">{t('collectionCentre')}</p><h1>{t('myOrders')}</h1><p>{t('orderIntro')}</p></div></div><div className="tabs">{(['active','all','completed','cancelled'] as const).map(key=><button className={tab===key?'active':''} onClick={()=>setTab(key)} key={key}>{t(key==='all'?'allOrders':key)}<span>{orders.filter(o=>key==='all'||(key==='active'?['PAID','PREPARING','READY'].includes(o.status):key==='completed'?o.status==='COLLECTED':o.status==='CANCELLED')).length}</span></button>)}</div>
    <div className="order-list">{visible.map(order=><article className={`active-order compact-order ${order.status.toLowerCase()}`} key={order.id}><div className="order-top"><div><span>{t('orderNumber')} {order.id}</span><h2>{t(statusKey(order.status))}</h2><p>{order.slot} · HK${order.total}</p></div><span className={`status ${statusKey(order.status)}`}><Icon name="check" size={16}/>{t(statusKey(order.status))}</span></div><div className="order-card-actions">{order.status==='READY'&&<button className="secondary" onClick={()=>setShowQr(order)}>{t('viewPickup')}</button>}{order.status==='PAID'&&<button className="danger-button" onClick={()=>setCancel(order)}>{t('cancelOrder')}</button>}<button className="secondary" onClick={()=>buyAgain(order)}>{t('buyAgain')}</button></div>{order.status==='CANCELLED'&&<span className="badge-inline">{t('refunded')}</span>}</article>)}</div>
    {showQr&&<div className="overlay qr-popup-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setShowQr(null)}}><section className="pickup-qr-popup" role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setShowQr(null)}>{t('close')}</button><p className="kicker">{t('pickupToday')}</p><h2>{t('successBody')}</h2><div className="popup-order-number"><span>{t('orderNumber')}</span><b>{showQr.id}</b></div><div className="popup-qr"><PickupQrGraphic/></div><div className="popup-fallback"><span>{t('fallbackCode')}</span><b>{showQr.code.split('').join(' ')}</b></div><div className="success-pickup"><Icon name="clock"/><span><b>{showQr.slot}</b><small>{t('locationValue')}</small></span></div></section></div>}
    {cancel&&<div className="overlay"><section className="account-modal" role="dialog" aria-modal="true"><h2>{t('cancelOrder')}</h2><p>{t('cancelOrderBody',{order:cancel.id,amount:`HK$${cancel.total}`,method:cancel.payment})}</p><div className="modal-actions"><button className="secondary" onClick={()=>setCancel(null)}>{t('cancel')}</button><button className="danger-button" onClick={confirmCancel}>{t('cancelOrder')}</button></div></section></div>}
    {toast&&<div className="toast success" role="status">{toast}</div>}
  </main>
}

function Login({t,onLogin}:{t:T;onLogin:()=>void}) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')
  const submit=(event:React.FormEvent)=>{event.preventDefault();onLogin()}
  return <main className="login-page"><section className="login-visual"><div className="login-brand"><span className="brand-img vector"><Mascot variant="shop"/></span><b>{t('loginBrand')}</b></div><div className="login-mascot"><Mascot/></div><div><p className="kicker">{t('campusFavourite')}</p><h1>{t('loginTagline')}</h1><p>{t('noQueue')}</p></div></section>
    <section className="login-panel"><div className="login-form-wrap"><p className="kicker">{t('brand')}</p><h1>{t('signInTitle')}</h1><p className="login-intro">{t('signInBody')}</p>
      <form onSubmit={submit}><label className="form-field"><span>{t('email')}</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('emailPlaceholder')} autoComplete="email"/></label>
        <p className="field-hint"><Icon name="check" size={14}/>{t('hsuLoginHint')}</p>
        <label className="form-field"><span>{t('password')}</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} autoComplete="current-password"/></label>
        <div className="login-options"><label><input type="checkbox"/><span>{t('rememberMe')}</span></label><button type="button">{t('forgotPassword')}</button></div>
        <button className="primary full lg" type="submit">{t('signIn')}<Icon name="arrow"/></button>
      </form><div className="form-divider"><span>{t('or')}</span></div><button className="google-button" onClick={onLogin}><b>G</b>{t('continueGoogle')}</button><button className="guest-button" onClick={onLogin}>{t('guestLogin')}</button>
      <p className="create-account">{t('noAccount')} <button>{t('createAccount')}</button></p>
    </div></section>
  </main>
}

function Switch({label,on=true,storageKey,htmlClass}:{label:string;on?:boolean;storageKey?:string;htmlClass?:string}) {
  const [checked,setChecked]=useState(()=>storageKey?localStorage.getItem(storageKey)==='true'||(localStorage.getItem(storageKey)===null&&on):on)
  const change=()=>{const next=!checked;setChecked(next);if(storageKey)localStorage.setItem(storageKey,String(next));if(htmlClass)document.documentElement.classList.toggle(htmlClass,next)}
  useEffect(()=>{if(htmlClass)document.documentElement.classList.toggle(htmlClass,checked)},[checked,htmlClass])
  return <button className={`toggle ${checked?'on':''}`} aria-label={label} aria-pressed={checked} onClick={change}><i/></button>
}

function Account({t,lang,setLang,theme,setTheme,setPage,user,setUser,view,setView,onLogout}:{t:T;lang:Lang;setLang:(v:Lang)=>void;theme:Theme;setTheme:(v:Theme)=>void;setPage:(v:Page)=>void;user:DemoUser;setUser:(v:DemoUser)=>void;view:Role;setView:(v:Role)=>void;onLogout:()=>void}) {
  const [edit,setEdit]=useState(false);const [draft,setDraft]=useState(user);const [wallet,setWallet]=useState(user.walletBalance)
  const [modal,setModal]=useState<'password'|'sessions'|'delete'|null>(null);const [current,setCurrent]=useState('');const [nextPassword,setNextPassword]=useState('');const [confirm,setConfirm]=useState('');const [deleteText,setDeleteText]=useState('');const [sessions,setSessions]=useState<CopyKey[]>(['deviceChrome','deviceSafari'])
  const saveProfile=()=>{const users=readStore<DemoUser[]>('hsu-users',[user]);if(users.some(x=>x.id!==user.id&&x.username.toLowerCase()===draft.username.toLowerCase()))return;setUser(draft);updateStoredUser(draft);setEdit(false)}
  const upload=(file?:File)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>{const next={...user,avatarUrl:String(reader.result)};setUser(next);setDraft(next);updateStoredUser(next)};reader.readAsDataURL(file)}
  const roleLabel=(role:Role)=>t(role==='student'?'roleStudent':role==='staff'?'roleStaff':'roleAdmin')
  const changeView=(role:Role)=>{setView(role);localStorage.setItem('hsu-view',role);setPage(role==='student'?'home':role)}
  const savePassword=()=>{if(current!==user.password||nextPassword!==confirm||nextPassword.length<8)return;const updated={...user,password:nextPassword};setUser(updated);updateStoredUser(updated);setModal(null)}
  return <main className="content settings-page"><div className="settings-heading"><div><p className="kicker">{t('account')}</p><h1>{t('settingsTitle')}</h1><p>{t('settingsIntro')}</p></div><span><Icon name="check" size={15}/>{t('accountSaved')}</span></div>
    <section className="profile-hero"><div className="avatar-upload">{user.avatarUrl?<img src={user.avatarUrl}/>:<span>KC</span>}<label><input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/><Icon name="plus" size={15}/></label></div><div><h2>{user.fullName}</h2><p>@{user.username} · {user.email}</p><div className="role-chips">{user.roles.map(role=><span key={role}>✓ {roleLabel(role)}</span>)}</div><small>{t('roleNote')}</small></div><button className="secondary" onClick={()=>{setDraft(user);setEdit(!edit)}}>{edit?t('cancel'):t('editProfile')}</button></section>
    {edit&&<section className="suite-card profile-editor"><label>{t('username')}<input value={draft.username} onChange={e=>setDraft({...draft,username:e.target.value})}/><small>{t('usernameHint')}</small></label><label>{t('fullName')}<input value={draft.fullName} onChange={e=>setDraft({...draft,fullName:e.target.value})}/><small aria-hidden="true">&nbsp;</small></label><label>{t('phone')}<input value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})}/><small aria-hidden="true">&nbsp;</small></label><button className="primary" onClick={saveProfile}>{t('save')}</button></section>}
    <div className="account-overview"><section><span>{t('walletBalance')}</span><b>HK${wallet.toLocaleString()}</b><button onClick={()=>{const balance=wallet+50;setWallet(balance);const next={...user,walletBalance:balance};setUser(next);updateStoredUser(next)}}>{t('addDemoCredit')}</button></section><section><span>{t('loyaltyStamps')}</span><b>{user.loyaltyStamps} / 10</b><div className="mini-stamps">{Array.from({length:10},(_,i)=><i className={i<user.loyaltyStamps?'filled':''} key={i}/>)}</div></section><section><span>{t('personalDetails')}</span><b>{user.programme} · {user.yearOfEntrance}</b><small>{user.studentId}</small></section></div>
    <section className="role-switch-card"><div><h2>{t('viewAs')}</h2><p>{t('roleNote')}</p></div><div className="role-segments">{(['student','staff','admin'] as Role[]).map(role=><button className={view===role?'active':''} onClick={()=>changeView(role)} key={role}>{roleLabel(role)}</button>)}</div></section>
    <div className="settings-layout"><aside className="settings-profile">{user.avatarUrl?<img className="profile-avatar" src={user.avatarUrl}/>:<div className="profile-avatar">KC</div>}<h2>{user.username}</h2><p>{user.email}</p><div><span>{t('studentAccount')}</span><b>{user.programme} · {user.yearOfEntrance}</b><small>{user.studentId}</small></div><button className="secondary full" onClick={()=>setEdit(true)}>{t('viewProfile')}</button></aside>
    <div className="settings-sections"><section id="settings"><div className="settings-section-title"><span><Icon name="spark"/></span><div><h2>{t('appearance')}</h2><p>{t('appearanceBody')}</p></div></div><div className="setting"><span><b>{t('theme')}</b><small>{t('appearanceBody')}</small></span><ThemeControl theme={theme} setTheme={setTheme} t={t}/></div><div className="setting"><span><b>{t('language')}</b><small>{t('langLabel')}</small></span><LanguageControl lang={lang} setLang={setLang} t={t}/></div></section>
      <section><div className="settings-section-title"><span><Icon name="bell"/></span><div><h2>{t('communication')}</h2><p>{t('notifications')}</p></div></div>{([['orderUpdates','orderUpdatesBody','hsu-pref-orders'],['promotions','promotionsBody','hsu-pref-promo'],['pickupReminders','pickupRemindersBody','hsu-pref-pickup']] as [CopyKey,CopyKey,string][]).map(([a,b,key],i)=><div className="setting" key={a}><span><b>{t(a)}</b><small>{t(b)}</small></span><Switch label={t(a)} on={i!==1} storageKey={key}/></div>)}</section>
      <section><div className="settings-section-title"><span><Icon name="account"/></span><div><h2>{t('accessibility')}</h2><p>{t('preferences')}</p></div></div><div className="setting"><span><b>{t('reduceMotion')}</b><small>{t('reduceBody')}</small></span><Switch label={t('reduceMotion')} on={false} storageKey="hsu-reduce-motion" htmlClass="reduce-motion"/></div><div className="setting"><span><b>{t('highContrast')}</b><small>{t('highContrastBody')}</small></span><Switch label={t('highContrast')} on={false} storageKey="hsu-high-contrast" htmlClass="high-contrast"/></div></section>
      <section><div className="settings-section-title"><span><Icon name="orders"/></span><div><h2>{t('recentOrders')}</h2><p>{t('orderHistory')}</p></div></div>{[['#4821','ready' as CopyKey,'HK$46'],['#4766','collected' as CopyKey,'HK$31']].map(x=><div className="settings-order" key={x[0]}><span><b>{x[0]}</b><small>{t('today')}</small></span><span className={`status ${x[1]}`}><Icon name="check" size={14}/>{t(x[1])}</span><b>{x[2]}</b></div>)}<button className="text-link" onClick={()=>setPage('orders')}>{t('viewAllOrders')}<Icon name="arrow" size={17}/></button></section>
      <section><div className="settings-section-title"><span><Icon name="account"/></span><div><h2>{t('security')}</h2><p>{t('personalDetails')}</p></div></div><button className="settings-action" onClick={()=>setModal('password')}><span><b>{t('changePassword')}</b><small>••••••••••••</small></span><Icon name="arrow" size={18}/></button><button className="settings-action" onClick={()=>setModal('sessions')}><span><b>{t('sessions')}</b><small>{t('manage')}</small></span><Icon name="arrow" size={18}/></button></section>
      <section className="danger-zone"><h2>{t('dangerZone')}</h2><p>{t('deleteWarning')}</p><button className="danger-button" onClick={()=>setModal('delete')}>{t('deleteAccount')}</button></section>
    </div></div>
    {modal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className="account-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setModal(null)}>{t('close')}</button>{modal==='password'?<><h2>{t('changePassword')}</h2><label>{t('currentPassword')}<input type="password" value={current} onChange={e=>setCurrent(e.target.value)}/></label><label>{t('newPassword')}<input type="password" value={nextPassword} onChange={e=>setNextPassword(e.target.value)}/></label><label>{t('confirmPassword')}<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="primary full" onClick={savePassword}>{t('save')}</button></>:modal==='sessions'?<><h2>{t('sessions')}</h2>{sessions.map((x,i)=><div className="session-row" key={x}><span><b>{t(x)}</b><small>{i?t('yesterday'):t('currentSession')}</small></span><button onClick={()=>setSessions(sessions.filter(session=>session!==x))}>{t('revoke')}</button></div>)}</>:<><h2>{t('deleteAccount')}</h2><p>{t('deleteWarning')}</p><input value={deleteText} onChange={e=>setDeleteText(e.target.value)} placeholder="DELETE"/><button className="danger-button full" disabled={deleteText!=='DELETE'} onClick={()=>{writeStore('hsu-users',readStore<DemoUser[]>('hsu-users',[]).filter(x=>x.id!==user.id));onLogout()}}>{t('deleteAccount')}</button></>}</section></div>}
  </main>
}

function Dashboard({t,lang,admin=false,orders,setOrders,setPage,inventory,setInventory}:{t:T;lang:Lang;admin?:boolean;orders:DemoOrder[];setOrders:(v:DemoOrder[])=>void;setPage:(v:Page)=>void;inventory:AnyProduct[];setInventory:(v:AnyProduct[])=>void}) {
  const [toast,setToast]=useState('');const [restockId,setRestockId]=useState<number|null>(null);const [amount,setAmount]=useState(10)
  const [query,setQuery]=useState('');const [slot,setSlot]=useState('all');const [verify,setVerify]=useState<DemoOrder|null>(null);const [code,setCode]=useState('');const [error,setError]=useState('')
  
  // ADD THIS USE-EFFECT HERE:
  useEffect(() => {
    if (admin) return // Admin analytics doesn't need to fetch the kanban board
    fetch('/api/orders/all', { credentials: 'include' })
      .then(res => res.json())
      .then(rows => {
        if (!Array.isArray(rows)) return
        const mapped = rows.map((r:any) => ({
          id: r.id, status: r.status, slot: r.slot_time, studentId: '',
          total: r.total, itemIds: (r.items || []).map((i:any)=>i.product_id),
          payment: r.payment_method, code: '••••'
        }))
        setOrders(mapped)
      })
      .catch(err => console.error('Failed to load staff orders', err))
  }, [setOrders, admin])

  const stock=inventory.filter(p=>p.active!==false&&p.stock<=(p.threshold??4)).slice(0,5)
  const saveOrders=(next:DemoOrder[])=>{setOrders(next);writeStore('hsu-orders',next)}
  const transition = async (order: DemoOrder, next: DemoOrder['status']) => {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: next }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Update failed: ${err.error || res.status}`)
      return
    }
    saveOrders(orders.map(x => x.id === order.id ? { ...x, status: next } : x))
  } catch (err) {
    alert('Update failed: ' + (err as Error).message)
  }
}
  const resetOrders = async () => {
  // Re-fetch the demo orders from the server
  const url = admin ? '/api/orders/all' : '/api/orders/all'
  const res = await fetch(url, { credentials: 'include' })
  if (res.ok) {
    const rows = await res.json()
    const mapped = rows.map((r:any) => ({
      id: r.id, status: r.status, slot: r.slot_time, studentId: '',
      total: r.total, itemIds: (r.items || []).map((i:any)=>i.product_id),
      payment: r.payment_method, code: '••••'
    }))
    setOrders(mapped)
    setToast(t('ordersReset'))
  }
}
  const verifyCode = async () => {
  if (!verify) return
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(verify.id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
    if (!res.ok) { setError(t('wrongCode')); return }
    setOrders(orders.map(o => o.id === verify.id ? { ...o, status: 'COLLECTED' } : o))
    setVerify(null)
    setCode('')
    setToast(t('collected'))
  } catch { setError(t('wrongCode')) }
}
  if(admin) return <main className="content dashboard"><div className="dash-title"><div><p className="kicker">{t('adminOverview')}</p><h1>{t('campusPulse')}</h1><p>{t('updated')}</p></div><button className="secondary" onClick={()=>setPage('home')}>{t('backToStudent')}</button></div><div className="admin-kpis">{[['HK$38,420','revenue'],['1,284','orders'],['842','activeUsers'],['HK$29.92','avgOrder']].map(x=><article key={x[1]}><span>{t(x[1] as CopyKey)}</span><b>{x[0]}</b><small>+12.4%</small></article>)}</div><div className="charts"><article className="chart-card wide"><div><h2>{t('dailyRevenue')}</h2><span>{t('month')}</span></div><div className="line-chart"><svg viewBox="0 0 700 230" preserveAspectRatio="none"><path className="area" d="M0 190 C80 170 100 130 170 155 S260 95 330 125 S450 75 510 100 S620 30 700 55 L700 230 L0 230Z"/><path className="line" d="M0 190 C80 170 100 130 170 155 S260 95 330 125 S450 75 510 100 S620 30 700 55"/></svg></div></article><article className="chart-card"><div><h2>{t('salesCategory')}</h2><span>{t('revenueShare')}</span></div><div className="donut-wrap"><div className="donut"><b>HK$38k</b><span>{t('total')}</span></div></div></article></div><div className="admin-table"><div className="table-head"><h2>{t('lowStockReport')}</h2><button onClick={()=>setPage('stock')}>{t('viewInventory')}<Icon name="arrow" size={16}/></button></div>{stock.map(p=><div className="table-row" key={p.id}><img src={p.image}/><span><b>{productName(p,lang)}</b><small>{lang==='en'?p.zh:p.en}</small></span><span><small>{t('stock')}</small><b>{t('left',{n:p.stock})}</b></span><span className="status warning">{t('lowStock')}</span>{restockId===p.id?<span className="inline-restock"><input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><button onClick={()=>{setInventory(inventory.map(x=>x.id===p.id?{...x,stock:x.stock+amount}:x));setRestockId(null);setToast(t('restocked'))}}>{t('save')}</button></span>:<button className="secondary" onClick={()=>setRestockId(p.id)}>{t('restock')}</button>}</div>)}</div>{toast&&<div className="toast success">{toast}</div>}</main>
  const active=orders.filter(o=>['PAID','PREPARING','READY'].includes(o.status)&&(`${o.id} ${o.studentId}`.toLowerCase().includes(query.toLowerCase()))&&(slot==='all'||o.slot===slot))
  const columns:[DemoOrder['status'],CopyKey][]=[['PAID','paid'],['PREPARING','preparing'],['READY','ready']]
  return <main className="content dashboard"><div className="dash-title"><div><p className="kicker">{t('staffWorkspace')}</p><h1>{t('goodMorning')}</h1><p>{t('staffDate')}</p></div><button className="secondary" onClick={()=>setPage('home')}>{t('backToStudent')}</button></div><div className="dash-stats">{[[active.length,'activeOrders','clock'],[orders.filter(o=>o.status==='READY').length,'readyNow','package'],['6 min','avgPrep','spark'],[3,'lowStockItems','bell']].map(x=><div key={x[1]}><Icon name={x[2] as string}/><span><b>{x[0]}</b><small>{t(x[1] as CopyKey)}</small></span></div>)}</div><div className="board-head"><h2>{t('todaysBoard')}</h2><div><button className="secondary reset-orders-button" onClick={resetOrders}>{t('resetDemoOrders')}</button><select value={slot} onChange={e=>setSlot(e.target.value)}><option value="all">{t('allSlots')}</option>{[...new Set(orders.map(o=>o.slot))].map(x=><option key={x}>{x}</option>)}</select><div className="staff-search"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('findOrder')}/></div></div></div><div className="kanban">{columns.map(([status,key])=><section key={status}><header><span>{t(key)}</span><b>{active.filter(o=>o.status===status).length}</b></header>{active.filter(o=>o.status===status).map(order=><article className="order-ticket" key={order.id}><div><b>{order.id}</b><span className="status-time">{order.slot.split('–')[0]}</span></div><p>{order.itemIds.length} · HK${order.total}</p><small>KC823 · {order.studentId}</small><button className={status==='READY'?'collect-btn':'ticket-btn'} onClick={()=>status==='PAID'?transition(order,'PREPARING'):status==='PREPARING'?transition(order,'READY'):setVerify(order)}>{status==='PAID'?t('startPreparing'):status==='PREPARING'?t('markReady'):t('verifyCollect')}<Icon name="arrow" size={16}/></button></article>)}</section>)}</div>
    {verify&&<div className="overlay"><section className="account-modal"><h2>{t('verifyCode')}</h2><p>{verify.id} · {verify.studentId}</p><input maxLength={4} inputMode="numeric" value={code} onChange={e=>{setCode(e.target.value);setError('')}} placeholder="7249"/>{error&&<small className="field-error" role="alert">{error}</small>}<div className="verify-actions"><button className="secondary full">{t('scanQr')}</button><button className="primary full" onClick={verifyCode}>{t('verifyCollect')}</button><button className="danger-button full" onClick={()=>setVerify(null)}>{t('cancel')}</button></div></section></div>}{toast&&<div className="toast success">{toast}</div>}
  </main>
}

function BottomNav({page,setPage,count,t,loggedIn}:{page:Page;setPage:(v:Page)=>void;count:number;t:T;loggedIn:boolean}) {
  const items:[Page,CopyKey,string][]=[['home','home','home'],['shop','search','search'],['cart','cart','cart'],['orders','orders','orders'],['account','account','account']]
  return <nav className="bottom-nav" aria-label={t('brand')}>{items.map(([p,label,icon])=><button key={p} className={page===p?'active':''} onClick={()=>setPage(p==='account'&&!loggedIn?'login':p)}><span><Icon name={icon}/>{p==='cart'&&count>0&&<i>{count}</i>}</span><small>{t(label)}</small></button>)}</nav>
}

export default function App() {
  const [page,setPageState]=useState<Page>(()=>pageFromPath(window.location.pathname))
  const [lang,setLang]=useState<Lang>(()=>(localStorage.getItem('hsu-lang') as Lang)||'en')
  const [theme,setTheme]=useState<Theme>(()=>(localStorage.getItem('hsu-theme') as Theme)||'system')
  const [user,setUser]=useState<DemoUser>(()=>{ensureDemoSeed();return currentUser()})
  const [loggedIn,setLoggedIn]=useState(()=>!!localStorage.getItem('hsu-session'))
  const [view,setViewState]=useState<Role>(()=>(localStorage.getItem('hsu-view') as Role)||'student')
  const [orders,setOrders]=useState<DemoOrder[]>(()=>{const saved=readStore<DemoOrder[]>('hsu-orders',[]);return [...saved,...initialOrders.filter(item=>!saved.some(x=>x.id===item.id))]})
  const [slots,setSlots]=useState<DemoSlot[]>(()=>{const saved=readStore<DemoSlot[]>('hsu-slots',initialSlots);return saved.map(slot=>({...slot,location:slot.location||'Lee Quo Wei Academic Building, G/F'}))})
  const [notifications,setNotifications]=useState<DemoNotification[]>(()=>{const saved=readStore<DemoNotification[]>('hsu-notifications',[]);return [...saved,...initialNotifications.filter(item=>!saved.some(x=>x.id===item.id))]})
  const [inventory,setInventory]=useState<AnyProduct[]>(()=>{const base:AnyProduct[]=[...standardProducts,...merchandise].map(p=>({...p,active:true,threshold:4}));const saved=readStore<AnyProduct[]>('hsu-inventory',[]);return [...base.map(p=>({...p,...saved.find(x=>x.id===p.id)})),...saved.filter(p=>!base.some(x=>x.id===p.id))]})
  const [shopCategory,setShopCategory]=useState<CopyKey>('all')
  const [cart,setCart]=useState<Record<number,number>>({102:1,1:1})
  const [cartFlights,setCartFlights]=useState<{key:number;image?:string;left:number;top:number;dx:number;dy:number;mx:number;my:number}[]>([])
  const [selected,setSelected]=useState<AnyProduct|null>(null); const [checkout,setCheckout]=useState(false); const [success,setSuccess]=useState(false)
  const t=useMemo(()=>translator(lang),[lang]); const count=Object.values(cart).reduce((a,b)=>a+b,0)
  const [createdOrder,setCreatedOrder]=useState<any>(null)
  const all=inventory
  const total=all.reduce((sum,p)=>sum+(cart[p.id]||0)*p.price,0)
  const setPage=(next:Page)=>{setPageState(next);const path=pagePaths[next];if(window.location.pathname!==path)window.history.pushState({},'',path);window.scrollTo({top:0,behavior:'smooth'})}
  const setView=(next:Role)=>{setViewState(next);localStorage.setItem('hsu-view',next)}
  useEffect(()=>{localStorage.setItem('hsu-lang',lang);document.documentElement.lang=lang==='zh'?'zh-Hant':'en';document.documentElement.dataset.lang=lang},[lang])
  useEffect(()=>{localStorage.setItem('hsu-theme',theme);const set=()=>{document.documentElement.dataset.theme=theme==='dark'||(theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'};set();const mq=matchMedia('(prefers-color-scheme: dark)');mq.addEventListener('change',set);return()=>mq.removeEventListener('change',set)},[theme])
  useEffect(()=>{const pop=()=>setPageState(pageFromPath(window.location.pathname));window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop)},[])
  useEffect(()=>{writeStore('hsu-orders',orders)},[orders])
  useEffect(()=>{writeStore('hsu-notifications',notifications)},[notifications])
  useEffect(()=>{writeStore('hsu-inventory',inventory)},[inventory])
  useEffect(()=>{let next:Role|undefined;if(page==='staff')next='staff';else if(page==='admin'||['developer','users','audit'].includes(page))next='admin';else if(['home','shop','cart','orders','favorites','loyalty','merch-drop','order-for-friend','search'].includes(page))next='student';else if(['stock','slots'].includes(page)&&view==='student')next='staff';if(next){setViewState(next);localStorage.setItem('hsu-view',next)}},[page])
  const add=(id:number,origin?:DOMRect)=>{setCart(c=>({...c,[id]:(c[id]||0)+1}));const target=document.getElementById('top-cart-target')?.getBoundingClientRect();if(!target)return;const product=all.find(item=>item.id===id);const key=Date.now()+Math.random();const left=origin?origin.left+origin.width/2-22:window.innerWidth/2-22;const top=origin?origin.top+origin.height/2-22:window.innerHeight/2-22;const dx=target.left+target.width/2-22-left;const dy=target.top+target.height/2-22-top;setCartFlights(current=>[...current,{key,image:product?.image,left,top,dx,dy,mx:dx*.55,my:dy*.35-70}]);window.setTimeout(()=>setCartFlights(current=>current.filter(item=>item.key!==key)),850)}
  const update=(id:number,n:number)=>setCart(c=>{const next={...c};if(n<=0)delete next[id];else next[id]=n;return next})
  const login=(next:DemoUser)=>{localStorage.setItem('hsu-session',next.id);localStorage.setItem('hsu-auth','true');setUser(next);setLoggedIn(true);setView('student');setPage('home')}
  const logout=()=>{localStorage.removeItem('hsu-auth');localStorage.removeItem('hsu-session');setLoggedIn(false);setPage('login')}
  const featurePages:Page[]=['favorites','notifications','loyalty','merch-drop','order-for-friend','search','developer','stock','slots','users','audit']
  return <div className="app">{cartFlights.map(item=><span className="cart-fly-item" key={item.key} style={{left:item.left,top:item.top,'--cart-fly-x':`${item.dx}px`,'--cart-fly-y':`${item.dy}px`,'--cart-fly-mid-x':`${item.mx}px`,'--cart-fly-mid-y':`${item.my}px`} as React.CSSProperties}>{item.image?<img src={item.image} alt=""/>:<Icon name="package" size={18}/>}</span>)}<Header page={page} setPage={setPage} count={count} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} t={t} loggedIn={loggedIn} onLogout={logout} user={user} view={view} setView={setView} notifications={notifications} setNotifications={setNotifications}/>
    {page==='home'&&<Home t={t} lang={lang} setPage={setPage} selectCategory={setShopCategory} add={add} open={setSelected} products={all}/>}
    {page==='shop'&&<Shop t={t} lang={lang} add={add} open={setSelected} products={all} initialCategory={shopCategory}/>}
    {page==='cart'&&<Cart cart={cart} t={t} lang={lang} update={update} checkout={()=>setCheckout(true)} products={all}/>}
    {page==='orders'&&<Orders t={t} onBuyAgain={ids=>setCart(old=>ids.reduce((next,id)=>({...next,[id]:(next[id]||0)+1}),{...old}))} navigate={setPage}/>}
    {page==='account'&&<Account t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} setPage={setPage} user={user} setUser={setUser} view={view} setView={setView} onLogout={logout}/>}
    {page==='login'&&<AuthScreen mode="login" t={t} navigate={path=>setPage(pageFromPath(path))} onAuth={login}/>}
    {page==='register'&&<AuthScreen mode="register" t={t} navigate={path=>setPage(pageFromPath(path))} onAuth={login}/>}
    {page==='forgot-password'&&<AuthScreen mode="forgot" t={t} navigate={path=>setPage(pageFromPath(path))} onAuth={login}/>}
    {page==='reset-password'&&<AuthScreen mode="reset" t={t} navigate={path=>setPage(pageFromPath(path))} onAuth={login}/>}
    {page==='staff'&&<Dashboard t={t} lang={lang} orders={orders} setOrders={setOrders} setPage={setPage} inventory={inventory} setInventory={setInventory}/>}
    {page==='admin'&&<Dashboard t={t} lang={lang} admin orders={orders} setOrders={setOrders} setPage={setPage} inventory={inventory} setInventory={setInventory}/>}
    {featurePages.includes(page)&&<FeaturePage page={page as 'favorites'|'notifications'|'loyalty'|'merch-drop'|'order-for-friend'|'search'|'developer'|'stock'|'slots'|'users'|'audit'} t={t} lang={lang} navigate={path=>setPage(pageFromPath(path))} notifications={notifications} setNotifications={setNotifications} slots={slots} setSlots={setSlots} user={user} setUser={next=>{setUser(next);updateStoredUser(next)}} products={all} setProducts={next=>setInventory(next as AnyProduct[])}/>}
        {selected&&<ProductDetail 
      product={selected} 
      lang={lang} 
      t={t} 
      close={()=>{
        setSelected(null)
        // Trigger a re-render of the cards to fetch new fav state
        window.dispatchEvent(new Event('refresh-favs')) 
      }} 
      add={origin=>{add(selected.id,origin);setSelected(null)}}/>}
    {checkout&&<Checkout total={total} t={t} slots={slots} close={()=>setCheckout(false)} done={async (slotId, paymentMethod) => {
  try {
    const items = Object.entries(cart).map(([id, qty]) => ({ productId: Number(id), quantity: qty }))
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items, paymentMethod, slotId }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(`Order failed: ${err.error || res.statusText}`)
      return
    }
    const realOrder = await res.json()
    setCreatedOrder(realOrder) // Save the real order data
    setCheckout(false)
    setSuccess(true)
    setCart({})
    
    // Trigger a re-fetch of orders
    window.dispatchEvent(new Event('refresh-orders'))
  } catch (err) {
    alert('Network error placing order.')
  }
}}/>}
    {success&&<Success t={t} order={createdOrder} close={()=>{setSuccess(false);setPage('orders')}}/>}
    {!['login','register','forgot-password','reset-password'].includes(page)&&<BottomNav page={page} setPage={setPage} count={count} t={t} loggedIn={loggedIn}/>}
  </div>
}
