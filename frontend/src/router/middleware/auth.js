// router/middleware/auth.js
export const authMiddleware = (to, from, next) => {
    const store = useAppStore()
    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)
  
    if (authRequired && !store.isAuthenticated) {
      next('/login')
    } else if (!authRequired && store.isAuthenticated) {
      next('/home')
    } else {
      next()
    }
  }