import axios from "axios"
import { fetchAuthSession } from "aws-amplify/auth" // Amplify 인증 함수 임포트

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://fooddonor.kro.kr:3000" // todo : 이거 뭐지ㅋ

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// 🔒 [핵심] 요청 인터셉터: Amplify(Cognito) 토큰 자동 주입
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Amplify를 통해 현재 세션 정보 가져오기
      const session = await fetchAuthSession()
      // 액세스 토큰 추출
      const token = session.tokens?.accessToken?.toString()

      // 토큰이 있다면 헤더에 추가
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
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


// Lambda 서버용 API 함수들

// 1. 기부자 프로필 생성 (회원가입 2단계 - Donor)
export const createDonorProfile = async (profileData: { name: string }) => {
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
  const response = await apiClient.post<ApiResponse>("/donor/donation", donationData)
  return response.data
}

// 4. 등록된 기부 목록 조회 (Volunteer/Recipient용)
export const getDonationList = async () => {
  const response = await apiClient.get<ApiResponse>("/donor/donationList")
  return response.data
}

// 5. 내 기부 내역 조회 (Donor용)
export const getMyDonationList = async () => {
  const response = await apiClient.get<ApiResponse>("/donor/donorList")
  return response.data
}

// 6. 매칭 작업 요청 (Volunteer -> SQS)
export const requestDonationTask = async (donationId: number) => {
  const response = await apiClient.post<ApiResponse>("/donor/tasks", { donation_id: donationId })
  return response.data
}

// 7. 매칭 결과 조회 (Polling)
export const getMatchResult = async (taskId: string) => {
  const response = await apiClient.get<ApiResponse>(`/recipient/tasks/${taskId}`)
  return response.data
}

// 8. 역할별 사용자 검색 (백엔드 지원 여부 확인 필요하지만 유지)
export const searchUsersByRole = async (role: string, query: string) => {
  const response = await apiClient.get<ApiResponse>(`/users/search`, {
    params: { role, q: query },
  })
  return response.data
}

// 9. 내 정보 조회 (로그인 직후 사용)
export const getUserProfile = async () => {
  // 스펙: { status, message, data: { id, email, name, role } }
  const response = await apiClient.get<ApiResponse<{
    id: string
    email: string
    name: string
    role: string
  }>>("/user/me")
  return response.data
}

// [FoodBank] 10. 전체 매칭 목록 조회 (대기/거절 등)
export const getMatchList = async () => {
  // 엔드포인트는 백엔드 상황에 맞춰 수정 필요 (일단 가상의 경로)
  const response = await apiClient.get<ApiResponse>("/foodbank/matches")
  return response.data
}

// [FoodBank] 11. 승인된 매칭 목록 조회
export const getAcceptedMatches = async () => {
  const response = await apiClient.get<ApiResponse>("/foodbank/matches/accepted")
  return response.data
}

// [FoodBank] 12. 매칭 승인/거절 처리
export const updateMatchStatus = async (matchId: number, status: "ACCEPTED" | "REJECTED") => {
  const response = await apiClient.post<ApiResponse>(`/foodbank/matches/${matchId}/status`, { status })
  return response.data
}

// 13. 자원봉사자 프로필 생성 (회원가입 2단계 - Volunteer)
export const createVolunteerProfile = async (profileData: {
  name: string;
  phone_number: string
}) => {
  // POST /volunteer/profile
  const response = await apiClient.post<ApiResponse>("/volunteer/profile", profileData)
  return response.data
}