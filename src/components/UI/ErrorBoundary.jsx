import React from 'react'

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
