import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../services/authService'

interface RegisterFormProps {
    onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        email: '',
        studentId: '',
        department: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const departments = [
        '소프트웨어학과',
        '컴퓨터공학과',
        '전자전기공학부',
        '글로벌경제학과',
        '글로벌경영학과',
        '기타',
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // 이메일 검증 (최대 254자)
        if (!formData.email) {
            newErrors.email = '이메일을 입력해주세요'
        } else if (formData.email.length > 254) {
            newErrors.email = '이메일은 최대 254자까지 입력 가능합니다'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다'
        }

        // 학번 검증 (숫자 10자리)
        if (!formData.studentId) {
            newErrors.studentId = '학번을 입력해주세요'
        } else if (!/^\d{10}$/.test(formData.studentId)) {
            newErrors.studentId = '학번은 10자리 숫자여야 합니다'
        }

        // 비밀번호 검증 (8자 이상, 특수문자 포함)
        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요'
        } else if (formData.password.length < 8) {
            newErrors.password = '비밀번호는 8자 이상이어야 합니다'
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            newErrors.password = '비밀번호는 특수문자를 포함해야 합니다'
        }

        // 비밀번호 확인
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
        }

        // 약관 동의
        if (!formData.agreedToTerms) {
            newErrors.agreedToTerms = '이용약관 및 개인정보 처리방침에 동의해주세요'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            setLoading(true)
            setErrors({})

            try {
                const response = await register({
                    lastName: formData.lastName,
                    firstName: formData.firstName,
                    email: formData.email,
                    studentId: formData.studentId,
                    department: formData.department,
                    password: formData.password
                })

                if (response.success) {
                    navigate('/home')
                } else {
                    setErrors({ submit: response.message || '회원가입에 실패했습니다' })
                }
            } catch (err) {
                setErrors({ submit: '회원가입 중 오류가 발생했습니다' })
            } finally {
                setLoading(false)
            }
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">회원가입</h2>
                <p className="text-gray-500 text-sm">
                    플랫폼 이용을 시작하려면 회원가입을 진행하세요.
                </p>
            </div>

            {/* Error Message */}
            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 성/이름 */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">성</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="김"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">이름</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="철수"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* 이메일 주소 */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        이메일 주소
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                {/* 학번 */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">학번</label>
                    <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="2025310000"
                        maxLength={10}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm ${errors.studentId ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.studentId && (
                        <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>
                    )}
                </div>

                {/* 학과 */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">학과</label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent bg-white text-sm"
                    >
                        <option value="">소프트웨어학과</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 비밀번호 */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        비밀번호
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">8자 이상, 특수문자 포함</p>
                </div>

                {/* 비밀번호 확인 */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        비밀번호 확인
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* 약관 동의 */}
                <div>
                    <label className="flex items-start cursor-pointer">
                        <input
                            type="checkbox"
                            name="agreedToTerms"
                            checked={formData.agreedToTerms}
                            onChange={handleChange}
                            className="w-4 h-4 mt-0.5 text-askku-primary border-gray-300 rounded focus:ring-askku-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            이용약관 및 개인정보 처리방침에 동의합니다.
                        </span>
                    </label>
                    {errors.agreedToTerms && (
                        <p className="text-red-500 text-xs mt-1">{errors.agreedToTerms}</p>
                    )}
                </div>

                {/* 회원가입 버튼 */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-askku-primary text-white py-2.5 rounded-md font-medium hover:bg-askku-secondary transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '회원가입 중...' : '회원가입'}
                </button>

                {/* 로그인 링크 */}
                <div className="text-center text-sm pt-2">
                    <span className="text-gray-600">이미 계정이 있으신가요? </span>
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-askku-primary font-semibold hover:underline"
                    >
                        로그인
                    </button>
                </div>
            </form>
        </div>
    )
}
