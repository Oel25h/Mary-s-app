import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export class ProfileService {
  // Get current user's profile
  static async getProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this shouldn't happen with the trigger
          return null
        }
        console.error('Error fetching profile:', error)
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in getProfile:', error)
      throw error
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>): Promise<Profile> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateProfile:', error)
      throw error
    }
  }

  // Create profile (usually called by the trigger, but can be used manually)
  static async createProfile(userId: string, email: string, fullName?: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email,
          full_name: fullName || null
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw new Error(`Failed to create profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in createProfile:', error)
      throw error
    }
  }

  // Delete profile (this will cascade delete all user data)
  static async deleteProfile(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) {
        console.error('Error deleting profile:', error)
        throw new Error(`Failed to delete profile: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteProfile:', error)
      throw error
    }
  }
}
