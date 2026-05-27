import { Outlet } from "react-router-dom";
export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {
        <div className="auth-container">
          {
            <div className="auth-header">
              {
                <h1 className="auth-title">
                  MERN Boilerplate
                </h1>
              }
              {
                <p className="auth-subtitle">
                  Sign in to your account to continue
                </p>
              }
            </div>
          }
          {<Outlet />}
        </div>
      }
    </div>
  );
};
