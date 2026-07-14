import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden">
          {/* Neon background blur glows */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl bg-red-600" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl bg-indigo-600" />

          <div className="w-full max-w-xl relative">
            <div className="bg-gray-900/60 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 shadow-2xl space-y-6">
              {/* Header Icon & Title */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-2">Application Error</h1>
                <p className="text-gray-400 text-sm max-w-md">
                  Something went wrong while rendering this page.
                </p>
              </div>

              {/* Error Message Summary */}
              {this.state.error && (
                <div className="bg-red-950/20 border border-red-500/10 rounded-xl p-4 space-y-2">
                  <div className="text-red-400 text-xs font-semibold uppercase tracking-wider">Error Details</div>
                  <div className="text-red-200 text-sm font-mono break-words leading-relaxed">
                    {this.state.error.toString()}
                  </div>
                </div>
              )}

              {/* Stack Trace (collapsed) */}
              {this.state.errorInfo && (
                <details className="group border border-gray-800 rounded-xl overflow-hidden bg-gray-950/40">
                  <summary className="flex items-center justify-between px-4 py-3 text-xs text-gray-500 font-medium cursor-pointer select-none hover:bg-gray-800/20">
                    <span>Component Stack Trace</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full group-open:hidden">Show</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full hidden group-open:inline">Hide</span>
                  </summary>
                  <div className="px-4 pb-4 text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre leading-relaxed border-t border-gray-800/40">
                    {this.state.errorInfo.componentStack}
                  </div>
                </details>
              )}

              {/* Controls */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
                >
                  <RefreshCw size={16} />
                  <span>Reload Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
