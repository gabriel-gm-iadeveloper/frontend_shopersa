import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary atrapó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5">
          <div className="alert alert-danger">
            <h4>¡Ups! Algo salió mal.</h4>
            <p>Intenta recargar la página. Si persiste, contáctanos.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;