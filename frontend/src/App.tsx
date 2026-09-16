import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { InstituteRegistry } from './pages/InstituteRegistry';
import { InstituteDetail } from './pages/InstituteDetail';
import { RandomInspectionPage } from './pages/RandomInspectionPage';
import { InspectionAssignmentPage } from './pages/InspectionAssignmentPage';
import { AssignmentsList } from './pages/AssignmentsList';
import { InspectorDashboard } from './pages/inspector/InspectorDashboard';
import { FieldInspectionWizard } from './pages/inspector/FieldInspectionWizard';
import { InspectionConfirmation } from './pages/inspector/InspectionConfirmation';
import { AiDemoPage } from './pages/ai/AiDemoPage';
import { HumanVerificationPage } from './pages/ai/HumanVerificationPage';
import { CctvDemoPage } from './pages/cctv/CctvDemoPage';
import { RandomVcPage } from './pages/vc/RandomVcPage';
import { InspectionReportPage } from './pages/reports/InspectionReportPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="institutes" element={<InstituteRegistry />} />
            <Route path="institutes/:id" element={<InstituteDetail />} />
            <Route path="random-inspection" element={<RandomInspectionPage />} />
            <Route path="assignments" element={<AssignmentsList />} />
            <Route path="assignments/:id" element={<InspectionAssignmentPage />} />
            
            {/* Inspector Field Workflow */}
            <Route path="inspector" element={<InspectorDashboard />} />
            <Route path="inspector/inspect/:id" element={<FieldInspectionWizard />} />
            <Route path="inspector/confirmed/:id" element={<InspectionConfirmation />} />

            {/* AI Vigilance, Anomaly & Explainable Risk */}
            <Route path="ai-demo" element={<AiDemoPage />} />
            <Route path="human-verification" element={<HumanVerificationPage />} />
            <Route path="human-verification/:id" element={<HumanVerificationPage />} />

            {/* CCTV & Remote VC Monitoring */}
            <Route path="cctv" element={<CctvDemoPage />} />
            <Route path="vc" element={<RandomVcPage />} />

            {/* Inspection Reports & Audit Dossiers */}
            <Route path="reports" element={<InspectionReportPage />} />
            <Route path="reports/:id" element={<InspectionReportPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
