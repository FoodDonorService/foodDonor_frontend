import axios from "axios"
import { userManager } from "@/lib/auth" // 👈 우리가 만든 auth 설정 가져오기

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://fooddonor.kro.kr:3000"

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// 🔒 [핵심] 요청 인터셉터: Cognito 토큰 자동 주입
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // oidc-client-ts를 통해 현재 로그인된 사용자 정보 가져오기
      const user = await userManager.getUser()
      
      // 사용자가 있고, 토큰이 만료되지 않았다면 헤더에 추가
      if (user && user.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`
      }
    } catch (error) {
      console.log("[API] 토큰 가져오기 실패 (비로그인 상태일 수 있음):", error)
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터 (에러 로깅용)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.response?.status, error.config?.url, error.message)
    return Promise.reject(error)
  },
)

// 공통 응답 타입
export interface ApiResponse<T = any> {
  status: string
  message: string
  data: T
}


// 새로운 Lambda 서버용 API

// 1. 기부자 프로필 생성 (회원가입 2단계 - Donor)
export const createDonorProfile = async (profileData: { name: string }) => {
  // POST /donor/profile
  const response = await apiClient.post<ApiResponse>("/donor/profile", profileData)
  return response.data
}

// 2. 수혜자 프로필 생성 (회원가입 2단계 - Recipient)
export const createRecipientProfile = async (profileData: {
  name: string
  phone_number: string
  address: string
  post_number: string
  notes: string
  latitude: number
  longitude: number
}) => {
  // POST /recipient/profile
  const response = await apiClient.post<ApiResponse>("/recipient/profile", profileData)
  return response.data
}

// 3. 기부 등록 (Donor)
export const createDonation = async (donationData: {
  category: string
  item_name: string
  quantity: number
  expiration_date: string
}) => {
  // POST /donor/donation
  const response = await apiClient.post<ApiResponse>("/donor/donation", donationData)
  return response.data
}

// 4. 등록된 기부 목록 조회 (Volunteer/Recipient용)
export const getDonationList = async () => {
  // GET /donor/donationList
  const response = await apiClient.get<ApiResponse>("/donor/donationList")
  return response.data
}

// 5. 내 기부 내역 조회 (Donor용)
export const getMyDonationList = async () => {
  // GET /donor/donorList
  const response = await apiClient.get<ApiResponse>("/donor/donorList")
  return response.data
}

// 6. 매칭 작업 요청 (Volunteer -> SQS)
export const requestDonationTask = async (donationId: number) => {
  // POST /donor/tasks
  const response = await apiClient.post<ApiResponse>("/donor/tasks", { donation_id: donationId })
  return response.data
}

// 7. 매칭 결과 조회 (Polling)
export const getMatchResult = async (taskId: string) => {
  // GET /recipient/tasks/{task_id}
  const response = await apiClient.get<ApiResponse>(`/recipient/tasks/${taskId}`)
  return response.data
}

// 8. 역할별 사용자 검색 (회원가입 시 사용 - 기존 유지)
// (백엔드에 이 API(/users/search)가 여전히 존재하는지 확인 필요하지만, 일단 유지합니다)
export const searchUsersByRole = async (role: string, query: string) => {
  const response = await apiClient.get<ApiResponse>(`/users/search`, {
    params: { role, q: query },
  })
  return response.data
}

// 9. 내 정보 조회 (로그인 직후 역할 확인용)
// 🚨 주의: 팀장님이 주신 코드에는 /users/me가 없습니다.
// 일단 호출하도록 두되, 만약 404 에러가 나면 팀장님께 "내 정보 조회 API가 어디인가요?"라고 물어봐야 합니다.
export const getUserProfile = async () => {
  const response = await apiClient.get<ApiResponse>("/users/me")
  return response.data
}

// import axios from "axios"
// import { userManager } from "@/lib/auth"

// // API Base URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://fooddonor.kro.kr:3000"

// // Axios 인스턴스 생성
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000, // 10 seconds
// })

// // JWT 토큰을 헤더에 추가하는 인터셉터
// apiClient.interceptors.request.use(
//   (config) => {
//     // localStorage에서 JWT 토큰 가져오기
//     const token = localStorage.getItem('jwt_token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
    
//     console.log("[v0] API Request:", config.method?.toUpperCase(), config.url)
//     return config
//   },
//   (error) => {
//     console.error("[v0] API Request Error:", error)
//     return Promise.reject(error)
//   },
// )

// apiClient.interceptors.response.use(
//   (response) => {
//     console.log("[v0] API Response:", response.status, response.config.url)
//     return response
//   },
//   (error) => {
//     if (error.code === "ECONNABORTED") {
//       console.error("[v0] API Timeout:", error.config?.url)
//     } else if (error.message === "Network Error") {
//       console.error("[v0] Network Error - API 서버가 실행 중인지 확인하세요:", API_BASE_URL)
//     } else {
//       console.error("[v0] API Error:", error.response?.status, error.config?.url)
//     }
//     return Promise.reject(error)
//   },
// )

// // 응답 타입 정의
// export interface ApiResponse<T = any> {
//   status: string
//   message: string
//   data: T
// }

// // 회원가입 API
// export const signup = async (userData: {
//   id?: number
//   username: string
//   password: string
//   name: string
//   role: string
//   address: string
//   latitude: number
//   longitude: number
//   phone_number: string
// }) => {
//   const response = await apiClient.post<ApiResponse>("/users/signup", userData)
//   return response.data
// }

// // 로그인 API
// export const login = async (credentials: { username: string; password: string }) => {
//   const response = await apiClient.post<ApiResponse<{ token: string }>>("/users/login", credentials)
  
//   // JWT 토큰을 localStorage에 저장
//   if (response.data.status === "success" && response.data.data?.token) {
//     localStorage.setItem('jwt_token', response.data.data.token)
//   }
  
//   return response.data
// }

// // 사용자 프로필 조회 API
// export const getUserProfile = async () => {
//   const response = await apiClient.get<ApiResponse<{ role: string; username: string; name: string }>>("/users/me")
//   return response.data
// }

// // 로그아웃 API
// export const logout = async () => {
//   const response = await apiClient.post<ApiResponse>("/users/logout")
  
//   // JWT 토큰을 localStorage에서 제거
//   localStorage.removeItem('jwt_token')
  
//   return response.data
// }

// // Role에 따른 검색 조회 API (1.2.2)
// export const searchUsersByRole = async (role: string, query: string) => {
//   const response = await apiClient.get<ApiResponse<{ list: any[] }>>(`/users/search`, {
//     params: { role, q: query },
//   })
//   return response.data
// }

// // 기부 등록 API
// export const createDonation = async (donationData: {
//   category: string
//   item_name: string
//   quantity: number
//   expiration_date: string
// }) => {
//   const response = await apiClient.post<ApiResponse<{ donation_id: number }>>("/donation", donationData)
//   return response.data
// }

// // 기부 목록 조회 API (수혜자용)
// export const getDonationList = async () => {
//   const response =
//     await apiClient.get<
//       ApiResponse<{
//         list: Array<{
//           donation_id: number
//           restaurant_name: string
//           restaurant_address: string
//           item_name: string
//           category: string
//           quantity: number
//           expiration_date: string
//           status: string
//         }>
//       }>
//     >("/donation/list")
//   return response.data
// }

// // 기부자 기부 목록 조회 API
// export const getDonorDonations = async () => {
//   const response = await apiClient.get<ApiResponse<{
//     list: Array<{
//       donation_id: number
//       restaurant_name: string
//       restaurant_address: string
//       item_name: string
//       category: string
//       quantity: number
//       expiration_date: string
//       status: string
//       created_at: string
//     }>
//   }>>("/donation/my")
//   return response.data
// }

// // 매치 요청 API
// export const requestMatch = async (donationId: number) => {
//   const response = await apiClient.post<
//     ApiResponse<{
//       match_id: number
//       recipient_id: number
//       donation_id: number
//       food_bank_id: number
//       status: string
//     }>
//   >(`/donation/${donationId}/accept`, { donation_id: donationId })
//   return response.data
// }

// // 매치 요청 목록 조회 API (푸드뱅크용)
// export const getMatchList = async () => {
//   const response = await apiClient.get<ApiResponse<{ 
//     match_list: Array<{
//       match_id: number
//       recipient_id: number
//       recipient_name: string
//       recipient_address: string
//       restaurant_id: number
//       restaurant_name: string
//       restaurant_address: string
//       donation_id: number
//       donation_item_name: string
//       donation_category: string
//       donation_quantity: number
//       donation_expiration_date: string
//       status: string
//     }>
//   }>>("/match/list")
//   return response.data
// }

// // 매치 수락 API
// export const acceptMatch = async (matchId: number) => {
//   const response = await apiClient.post<ApiResponse<{ match_id: number }>>("/match/accept", {
//     match_id: matchId,
//   })
//   return response.data
// }

// // 매치 거절 API
// export const rejectMatch = async (matchId: number) => {
//   const response = await apiClient.post<ApiResponse<{ match_id: number }>>("/match/reject", {
//     match_id: matchId,
//   })
//   return response.data
// }

// // 매치 상세정보 조회 API (푸드뱅크용)
// export const getAcceptedMatches = async () => {
//   const response = await apiClient.get<ApiResponse<{ 
//     list: Array<{
//       match_id: number
//       recipient_id: number
//       recipient_name: string
//       recipient_address: string
//       recipient_phone_number: string
//       restaurant_id: number
//       restaurant_name: string
//       restaurant_address: string
//       donation_id: number
//       donation_item_name: string
//       donation_category: string
//       donation_quantity: number
//       donation_expiration_date: string
//     }>
//   }>>("/match/list/accepted")
//   return response.data
// }

