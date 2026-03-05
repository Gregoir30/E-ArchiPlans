import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Header from './components/Header'
import { fetchPublicCategories } from './api/catalog'
import { createOrder } from './api/orders'
import { AUTH_EVENT, getAuthToken, getStoredUser } from './utils/authToken'
import AboutPage from './pages/AboutPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ContactPage from './pages/ContactPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import ManagePlansPage from './pages/ManagePlansPage'
import ModelsHubPage from './pages/ModelsHubPage'
import OrdersPage from './pages/OrdersPage'
import PlanDetailPage from './pages/PlanDetailPage'
import PlansPage from './pages/PlansPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import CategoriesModelPage from './pages/models/CategoriesModelPage'
import ContactMessagesModelPage from './pages/models/ContactMessagesModelPage'
import OrderItemsModelPage from './pages/models/OrderItemsModelPage'
import OrdersModelPage from './pages/models/OrdersModelPage'
import PlanDownloadsModelPage from './pages/models/PlanDownloadsModelPage'
import PlansModelPage from './pages/models/PlansModelPage'
import UsersModelPage from './pages/models/UsersModelPage'
import usePlans from './hooks/usePlans'
import useCartSummary from './hooks/useCartSummary'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const { plans, plansStatus, plansError, refreshPlans } = usePlans()
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [authUser, setAuthUser] = useState(getStoredUser())
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()))
  const cartSummary = useCartSummary({ enabled: isAuthenticated })

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    const onAuthChanged = () => {
      setIsAuthenticated(Boolean(getAuthToken()))
      setAuthUser(getStoredUser())
    }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('storage', onAuthChanged)
    window.addEventListener(AUTH_EVENT, onAuthChanged)

    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('storage', onAuthChanged)
      window.removeEventListener(AUTH_EVENT, onAuthChanged)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => refreshPlans())
  }, [refreshPlans])

  useEffect(() => {
    let isMounted = true
    async function loadCategories() {
      const result = await fetchPublicCategories()
      if (!isMounted) return
      if (result.ok) setCategories(result.categories)
    }
    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  function handleNavigate(event, nextPath) {
    event.preventDefault()
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
      setPath(nextPath)
    }
  }

  function navigateTo(nextPath) {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
      setPath(nextPath)
    }
  }

  function syncAuthState(user = null) {
    setIsAuthenticated(Boolean(getAuthToken()))
    setAuthUser(user ?? getStoredUser())
  }

  function redirectToProfile(user = null) {
    syncAuthState(user)
    window.history.pushState({}, '', '/profil')
    setPath('/profil')
  }

  function handleLoggedOut() {
    syncAuthState(null)
  }

  async function handleBuyPlan(planId) {
    const result = await createOrder([planId])
    setPurchaseMessage(result.message)
    if (result.ok) {
      cartSummary.refreshCart()
      window.history.pushState({}, '', '/commandes')
      setPath('/commandes')
    }
  }

  const appShellClassName = path === '/' ? 'app-shell app-shell-landing' : 'app-shell'

  let page = (
    <LandingPage
      onNavigate={handleNavigate}
      plans={plans}
      plansStatus={plansStatus}
      plansError={plansError}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onCategoryChange={setSelectedCategoryId}
      onBuyPlan={handleBuyPlan}
    />
  )

  if (path === '/a-propos') page = <AboutPage />
  if (path === '/contact') page = <ContactPage />
  if (path === '/login') page = <LoginPage onAuthSuccess={redirectToProfile} />
  if (path === '/register') page = <RegisterPage onAuthSuccess={redirectToProfile} />
  if (path === '/logout') page = <LogoutPage onLoggedOut={handleLoggedOut} />
  if (path === '/commandes') page = <OrdersPage />

  if (path === '/plans') {
    page = (
      <PlansPage
        plans={plans}
        plansStatus={plansStatus}
        plansError={plansError}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        onBuyPlan={handleBuyPlan}
        onViewPlan={(planId) => navigateTo(`/plans/${planId}`)}
      />
    )
  }

  if (path.startsWith('/plans/')) {
    const planId = Number(path.split('/')[2])
    const selectedPlan = plans.find((plan) => Number(plan.id) === planId)
    page = <PlanDetailPage plan={selectedPlan} onBuyPlan={handleBuyPlan} onNavigate={handleNavigate} />
  }

  if (path === '/profil') page = <ProfilePage onNavigate={handleNavigate} />

  if (path === '/dashboard') {
    if (authUser?.role === 'admin') {
      page = <AdminDashboardPage />
    } else if (authUser?.role === 'seller') {
      page = <SellerDashboardPage />
    } else {
      page = (
        <main className="page">
          <section className="section-intro">
            <p className="eyebrow">Dashboard</p>
            <h1>Acces reserve</h1>
            <p>Ce dashboard est disponible uniquement pour les vendeurs et les administrateurs.</p>
          </section>
        </main>
      )
    }
  }

  if (path === '/modeles') page = <ModelsHubPage onNavigate={handleNavigate} />
  if (path === '/modeles/users') page = <UsersModelPage />
  if (path === '/modeles/categories') page = <CategoriesModelPage />
  if (path === '/modeles/plans') page = <PlansModelPage />
  if (path === '/modeles/orders') page = <OrdersModelPage />
  if (path === '/modeles/order-items') page = <OrderItemsModelPage />
  if (path === '/modeles/plan-downloads') page = <PlanDownloadsModelPage />
  if (path === '/modeles/contact-messages') page = <ContactMessagesModelPage />

  if (path === '/gestion-plans') {
    page = (
      <ManagePlansPage
        plans={plans}
        plansStatus={plansStatus}
        plansError={plansError}
        onRefreshPlans={refreshPlans}
      />
    )
  }

  const handleCartNavigate = (event) => {
    if (isAuthenticated) {
      handleNavigate(event, '/commandes')
      return
    }
    handleNavigate(event, '/login')
  }

  return (
    <div className={appShellClassName}>
      <div className="ambient-shape shape-a" />
      <div className="ambient-shape shape-b" />
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      <Header
        key={path}
        currentPath={path}
        onNavigate={handleNavigate}
        user={authUser}
        isAuthenticated={isAuthenticated}
        cartCount={cartSummary.itemsCount}
        onCartNavigate={handleCartNavigate}
      />
      {purchaseMessage ? <p className="success">{purchaseMessage}</p> : null}
      {page}
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
