'use server'

// import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

export async function setRole(formData) {
  
    const { sessionClaims } = await auth()
    if(sessionClaims?.metadata.role !== 'admin'){
        return { message: 'Not Authorized' }
    }

  try {
    const res = await (await clerkClient()).users.updateUser(formData.get('id'), {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    console.log(err)
    return { message: err }
  }
}

export async function removeRole(formData) {
  try {
    const res = await (await clerkClient()).users.updateUser(formData.get('id'), {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}