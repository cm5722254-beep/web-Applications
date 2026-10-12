import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'src/data/users.json')

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  roles: string[]
  subscribed: boolean
  subscription_plan: string | null
  subscription_expires_at: string | null
  status: 'active' | 'suspended'
  created_at: string
  login_provider: 'google' | 'email' | null
  last_login_at: string
  google_id?: string
}

// Read all users
export function getAllUsers(): User[] {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data) || []
  } catch {
    return []
  }
}

// Find user by email
export function findUserByEmail(email: string): User | null {
  const users = getAllUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

// Find user by ID
export function findUserById(id: number): User | null {
  const users = getAllUsers()
  return users.find(u => u.id === id) || null
}

// Create or update user
export function upsertUser(userData: Partial<User> & { email: string }): User {
  const users = getAllUsers()
  const email = userData.email.toLowerCase()
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === email)

  if (existingIndex >= 0) {
    // Update existing user
    users[existingIndex] = {
      ...users[existingIndex],
      ...userData,
      email,
      last_login_at: new Date().toISOString(),
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
    return users[existingIndex]
  } else {
    // Create new user
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: userData.name || 'Unknown',
      email,
      avatar: userData.avatar || null,
      roles: userData.roles || ['user'],
      subscribed: userData.subscribed || false,
      subscription_plan: userData.subscription_plan || null,
      subscription_expires_at: userData.subscription_expires_at || null,
      status: userData.status || 'active',
      created_at: new Date().toISOString(),
      login_provider: userData.login_provider || null,
      last_login_at: new Date().toISOString(),
      google_id: userData.google_id,
    }
    users.push(newUser)
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
    return newUser
  }
}

// Update user
export function updateUser(id: number, updates: Partial<User>): User | null {
  const users = getAllUsers()
  const index = users.findIndex(u => u.id === id)
  
  if (index >= 0) {
    users[index] = { ...users[index], ...updates }
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
    return users[index]
  }
  return null
}

// Delete user
export function deleteUser(id: number): boolean {
  const users = getAllUsers()
  const filtered = users.filter(u => u.id !== id)
  
  if (filtered.length < users.length) {
    fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2))
    return true
  }
  return false
}

// Get paginated users with filters
export function getPaginatedUsers(params: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  role?: string
  subscribed?: boolean
}) {
  let users = getAllUsers()

  // Apply filters
  if (params.search) {
    const search = params.search.toLowerCase()
    users = users.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search)
    )
  }
  if (params.status) {
    users = users.filter(u => u.status === params.status)
  }
  if (params.role) {
    users = users.filter(u => u.roles.includes(params.role))
  }
  if (params.subscribed !== undefined) {
    users = users.filter(u => u.subscribed === params.subscribed)
  }

  // Sort by last_login_at descending
  users.sort((a, b) => 
    new Date(b.last_login_at).getTime() - new Date(a.last_login_at).getTime()
  )

  // Pagination
  const page = params.page || 1
  const perPage = params.per_page || 20
  const total = users.length
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedUsers = users.slice(startIndex, endIndex)

  return {
    users: paginatedUsers,
    meta: {
      current_page: page,
      last_page: Math.ceil(total / perPage),
      per_page: perPage,
      total,
    },
  }
}
