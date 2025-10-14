import axios from "axios"

// API Base URL - 환경변수로 설정 가능
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

apiClient.interceptors.request.use(
  (config) => {
    console.log("[v0] API Request:", config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error("[v0] API Request Error:", error)
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    console.log("[v0] API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("[v0] API Timeout:", error.config?.url)
    } else if (error.message === "Network Error") {
      console.error("[v0] Network Error - API 서버가 실행 중인지 확인하세요:", API_BASE_URL)
    } else {
      console.error("[v0] API Error:", error.response?.status, error.config?.url)
    }
    return Promise.reject(error)
  },
)

// 응답 타입 정의
export interface ApiResponse<T = any> {
  status: string
  message: string
  data: T
}

// 회원가입 API
export const signup = async (userData: {
  id?: number
  username: string
  password: string
  name: string
  role: string
  address: string
  latitude: number
  longitude: number
  phone_number: string
}) => {
  const response = await apiClient.post<ApiResponse>("/users/signup", userData)
  return response.data
}

// 로그인 API
export const login = async (credentials: { username: string; password: string }) => {
  const response = await apiClient.post<ApiResponse>("/users/login", credentials)
  return response.data
}

// 로그아웃 API
export const logout = async () => {
  const response = await apiClient.post<ApiResponse>("/users/logout")
  return response.data
}

// Role에 따른 검색 조회 API (1.2.2)
export const searchUsersByRole = async (role: string, query: string) => {
  const response = await apiClient.get<ApiResponse<{ list: any[] }>>(`/users/search`, {
    params: { role, q: query },
  })
  return response.data
}

// 기부 등록 API
export const createDonation = async (donationData: {
  category: string
  item_name: string
  quantity: number
  expiration_date: string
}) => {
  const response = await apiClient.post<ApiResponse<{ donation_id: number }>>("/donation", donationData)
  return response.data
}

// 기부 목록 조회 API (수혜자용)
export const getDonationList = async () => {
  const response =
    await apiClient.get<
      ApiResponse<{
        list: Array<{
          donation_id: number
          restaurant_name: string
          restaurant_address: string
          item_name: string
          category: string
          quantity: number
          expiration_date: string
          status: string
        }>
      }>
    >("/donation/list")
  return response.data
}

// 매치 요청 API
export const requestMatch = async (donationId: number) => {
  const response = await apiClient.post<
    ApiResponse<{
      match_id: number
      recipient_id: number
      donation_id: number
      food_bank_id: number
      status: string
    }>
  >(`/donation/${donationId}/accept`, { donation_id: donationId })
  return response.data
}

// 매치 요청 목록 조회 API (푸드뱅크용)
export const getMatchList = async () => {
  const response = await apiClient.get<ApiResponse<{ 
    match_list: Array<{
      match_id: number
      recipient_id: number
      recipient_name: string
      recipient_address: string
      restaurant_id: number
      restaurant_name: string
      restaurant_address: string
      donation_id: number
      donation_item_name: string
      donation_category: string
      donation_quantity: number
      donation_expiration_date: string
      status: string
    }>
  }>>("/match/list")
  return response.data
}

// 매치 수락 API
export const acceptMatch = async (matchId: number) => {
  const response = await apiClient.post<ApiResponse<{ match_id: number }>>("/match/accept", {
    match_id: matchId,
  })
  return response.data
}

// 매치 거절 API
export const rejectMatch = async (matchId: number) => {
  const response = await apiClient.post<ApiResponse<{ match_id: number }>>("/match/reject", {
    match_id: matchId,
  })
  return response.data
}

// 매치 상세정보 조회 API (푸드뱅크용)
export const getAcceptedMatches = async () => {
  const response = await apiClient.get<ApiResponse<{ 
    list: Array<{
      match_id: number
      recipient_id: number
      recipient_name: string
      recipient_address: string
      recipient_phone_number: string
      restaurant_id: number
      restaurant_name: string
      restaurant_address: string
      donation_id: number
      donation_item_name: string
      donation_category: string
      donation_quantity: number
      donation_expiration_date: string
    }>
  }>>("/match/list/accepted")
  return response.data
}

