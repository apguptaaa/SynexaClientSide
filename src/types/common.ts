export type Id = string | number

export type ApiResponse<T> = {
  data: T
  message?: string
  success: boolean
}
