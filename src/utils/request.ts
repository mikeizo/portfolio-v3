type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const toast = useToast()

export const adminRequest = async (
  method: RequestMethod,
  endpoint: string,
  data: any,
  description?: string
) => {
  // Submit the form data to the API endpoint for settings
  try {
    const response = await fetch(`/api/admin/${endpoint}`, {
      method,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      toast.add({
        title: 'Error',
        description: errorData.error || 'Failed to update settings.',
        color: 'red'
      })
      return
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'An unexpected error occurred.',
      color: 'red'
    })
    return
  }

  if (description) {
    toast.add({
      title: 'Success',
      description: description,
      color: 'success'
    })
  }
}
