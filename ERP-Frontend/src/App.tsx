import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './Pages/LoginPage';
import { Dashboard } from './Pages/Dashboard';
import { TicketsList } from './Pages/Helpdesk/Ticket/TicketsList';
import { TicketDetail } from './Pages/Helpdesk/Ticket/TicketDetail';
import { Timesheets } from './Pages/Timesheets/Timesheets';
import { TimesheetValidation } from './Pages/Timesheets/TimesheetValidation';
import { AllAgents } from './Pages/Helpdesk/Ticket/AllAgents';
import { AllClients } from './Pages/Helpdesk/Ticket/AllClients';
import { AgentDetail } from './Pages/Helpdesk/Ticket/AgentDetail';
import { ClientDetail } from './Pages/Helpdesk/Ticket/ClientDetail';
import { Knowledge } from './Pages/Helpdesk/Knowledge/Knowledge';
import { ClientDashboard } from './Pages/Helpdesk/Ticket/ClientDashboard';
import { SubClientDashboard } from './Pages/Helpdesk/Ticket/SubClientDashboard';

// Import des types et mocks restants
import { USERS, TIMESHEETS, PROJECTS } from './data/mockData';
import type { User, TimesheetTask, Timesheet } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // On initialise avec le premier utilisateur du mock pour le dev
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>(TIMESHEETS);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // --- Handlers Timesheet (Gardés en local en attendant l'API Timesheet) ---
  const handleSaveTask = (task: TimesheetTask) => {
    setTimesheets(prev => prev.map(ts => 
      ts.userId === currentUser.id 
        ? { ...ts, tasks: [...ts.tasks, task], totalHours: ts.totalHours + task.hours } 
        : ts
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTimesheets(prev => prev.map(ts => {
      if (ts.userId === currentUser.id) {
        const taskToDelete = ts.tasks.find(t => t.id === taskId);
        return {
          ...ts,
          tasks: ts.tasks.filter(t => t.id !== taskId),
          totalHours: ts.totalHours - (taskToDelete?.hours || 0)
        };
      }
      return ts;
    }));
  };

  const handleSubmitTimesheet = () => {
    setTimesheets(prev => prev.map(ts => 
      (ts.userId === currentUser.id && ts.status === 'draft') ? { ...ts, status: 'submitted' } : ts
    ));
  };

  const handleValidateTimesheet = (timesheetId: string) => {
    setTimesheets(prev => prev.map(ts => 
      ts.id === timesheetId ? { ...ts, status: 'validated', validatedBy: currentUser.id.toString() } : ts
    ));
  };

  const handleRejectTimesheet = (timesheetId: string) => {
    setTimesheets(prev => prev.map(ts => ts.id === timesheetId ? { ...ts, status: 'rejected' } : ts));
  };

  // --- Helpers ---
  const getCurrentUserTimesheet = () => timesheets.find(ts => ts.userId === currentUser.id);

  const getDefaultRoute = () => {
    if (currentUser.role === 'client') return '/company';
    if (currentUser.role === 'subclient') return '/my-dashboard';
    return '/dashboard';
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginPage users={USERS} onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppLayout
        currentUser={currentUser}
        title="HelpDesk Pro"
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* Les pages gèrent maintenant leurs propres données de tickets via ticketService */}
          <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
          
          <Route path="/tickets" element={<TicketsList currentUser={currentUser} mode="all" />} />
          
          <Route path="/my-tickets" element={<TicketsList currentUser={currentUser} mode="my-tickets" />} />
          
          <Route path="/tickets/:id" element={<TicketDetail currentUser={currentUser} />} />

          <Route path="/company" element={<ClientDashboard currentUser={currentUser} />} />
          
          <Route path="/my-dashboard" element={<SubClientDashboard currentUser={currentUser} />} />

          <Route 
            path="/timesheets" 
            element={
              <Timesheets 
                currentUser={currentUser} 
                timesheet={getCurrentUserTimesheet()} 
                projects={PROJECTS}
                onSaveTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                onSubmitTimesheet={handleSubmitTimesheet}
              />
            } 
          />

          <Route 
            path="/validation" 
            element={
              <TimesheetValidation 
                timesheets={timesheets} 
                users={USERS} 
                onValidate={handleValidateTimesheet}
                onReject={handleRejectTimesheet}
              />
            } 
          />

          <Route path="/agents" element={<AllAgents agents={USERS.filter(u => u.role === 'agent' || u.role === 'Admin')} />} />
          
          <Route path="/clients" element={<AllClients clients={USERS.filter(u => u.role === 'client')} />} />

          <Route path="/knowledge" element={<Knowledge />} />
          
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;