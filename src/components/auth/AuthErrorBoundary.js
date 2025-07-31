import React from 'react';

class AuthErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Auth Error Boundary caught an error:', error, errorInfo);
        
        // Check if it's an auth-related error
        if (error.message?.includes('401') || 
            error.message?.includes('Unauthorized') ||
            error.response?.status === 401) {
            
            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('authEvent', {
                detail: { type: 'LOGOUT', data: { reason: 'error' } }
            }));
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Đã xảy ra lỗi
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Vui lòng tải lại trang hoặc đăng nhập lại
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AuthErrorBoundary;