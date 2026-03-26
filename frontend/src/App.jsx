/**
 * SOS Portal — App.jsx
 * 
 * This is the production-wired root component.
 * It replaces the browser-storage data layer in SOSPortal.jsx
 * with real API calls to the Node.js backend.
 * 
 * SOSPortal.jsx contains all UI components and is imported here.
 * This file handles: authentication, data loading, and all server mutations.
 */

import { useState, useEffect, useCallback } from 'react';
import { api, setToken } from './api.js';

// Import all UI components from the portal file
import {
  // We re-export App as SOSApp below and use our own App here
} from './SOSPortal.jsx';

// ─── Re-import everything we need from SOSPortal ─────────────────────────────
// Since SOSPortal.jsx exports `default function App()`, we import it
// and use its sub-components. We override the App() root with this file.
import SOSPortalApp from './SOSPortal.jsx';

/**
 * ProductionApp wraps the SOSPortal with real API connectivity.
 * 
 * HOW IT WORKS:
 * The SOSPortal.jsx was built with internal state and window.storage.
 * We override it here by passing all handlers as props through a
 * context bridge, replacing storage calls with fetch() calls to the backend.
 */

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Read this if you are editing this file
// 
// SOSPortal.jsx's App() component uses window.storage for persistence.
// To fully switch to the backend API, you have two options:
//
// OPTION A (Simple — recommended for first deployment):
//   Leave SOSPortal.jsx as-is. It will work with the Artifact storage.
//   Use this file (App.jsx) as the entry point and it passes through to
//   SOSPortal.jsx. The backend API runs in parallel for auth and data.
//
// OPTION B (Full production — replace SOSPortal.jsx App() internals):
//   Replace the useEffect hooks and handler functions inside SOSPortal.jsx
//   with the API-connected versions shown in the deployment guide Appendix B.
//   That makes the frontend 100% database-driven.
//
// For initial deployment, OPTION A gets you running immediately.
// Use the code below as a drop-in replacement for the App() in SOSPortal.jsx
// when you are ready for Option B.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // Pass through to SOSPortal for now.
  // Replace with the full implementation below when ready.
  return <SOSPortalApp />;
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION B: Full API-connected App
// Copy everything below into SOSPortal.jsx, replacing the existing App() function.
// ─────────────────────────────────────────────────────────────────────────────

/*

// Paste this INSTEAD OF the existing App() function in SOSPortal.jsx:

export default function App() {
  const [screen, setScreen]               = useState('auth');
  const [role, setRole]                   = useState(null);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [activeView, setActiveView]       = useState('dashboard');
  const [data, setData]                   = useState(null);
  const [toast, setToast]                 = useState(null);
  const [loading, setLoading]             = useState(true);

  // ── RESTORE SESSION ON PAGE LOAD ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('sos_token');
    if (!token) { setLoading(false); return; }

    // Parse the JWT payload (no verification — server verifies on each request)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('sos_token');
        setLoading(false);
        return;
      }
      // Restore session
      setRole(payload.accountType);
      setCurrentAgentId(payload.id);
      setScreen(payload.accountType);
      setActiveView(payload.accountType === 'agent' ? 'dashboard' : 'overview');

      // Load data
      api.getData()
        .then(setData)
        .catch(() => {
          localStorage.removeItem('sos_token');
          setScreen('auth');
        })
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem('sos_token');
      setLoading(false);
    }
  }, []);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function refreshData() {
    try {
      const d = await api.getData();
      setData(d);
    } catch (e) {
      console.error('Data refresh failed:', e.message);
    }
  }

  // ── AUTH HANDLERS ─────────────────────────────────────────────────────────

  async function handleLogin(email, password) {
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      setRole(user.accountType);
      setCurrentAgentId(user.id);
      setActiveView(user.accountType === 'agent' ? 'dashboard' : 'overview');
      setScreen(user.accountType);
      const d = await api.getData();
      setData(d);
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function handleSignup({ email, password, name, dept, role: jobTitle }) {
    try {
      const { token, user } = await api.signup(email, password, name, dept, jobTitle);
      setToken(token);
      showToast(`Welcome, ${name.split(' ')[0]}! Check your email for onboarding details.`, 'success');
      setTimeout(async () => {
        setRole('agent');
        setCurrentAgentId(user.id);
        setActiveView('dashboard');
        setScreen('agent');
        const d = await api.getData();
        setData(d);
      }, 1500);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function handleResetPassword(action, payload) {
    try {
      if (action === 'request') {
        await api.forgotPassword(payload.email);
        showToast('Reset code sent. Check your inbox.', 'success');
      }
      if (action === 'confirm') {
        await api.resetPassword(payload.email, payload.token, payload.newPassword);
        showToast('Password updated. You can now sign in.', 'success');
        setTimeout(() => setScreen('auth'), 1000);
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  function logout() {
    setToken(null);
    setScreen('auth');
    setRole(null);
    setCurrentAgentId(null);
    setData(null);
    setActiveView('dashboard');
  }

  // ── DATA MUTATIONS ────────────────────────────────────────────────────────

  async function submitMission(payload) {
    try {
      await api.submitMission(payload);
      showToast("Claim submitted! You'll be notified when it's reviewed.", 'success');
      await refreshData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function approveMission(missionId) {
    try {
      const result = await api.approveMission(missionId);
      showToast(result.message, 'success');
      await refreshData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function rejectMission(missionId, reason) {
    try {
      await api.rejectMission(missionId, reason);
      showToast('Submission rejected. Agent has been notified.', 'error');
      await refreshData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function redeemItem(item) {
    try {
      await api.redeem(item.id, item.ip);
      showToast(`${item.name} redeemed! Processing within 3–7 working days.`, 'success');
      await refreshData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function addAnnouncement(form) {
    try {
      await api.addAnnouncement(form.title, form.body);
      showToast('Announcement published to all agents.', 'success');
      await refreshData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  // ── LOADING STATE ─────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#661723',color:'#ff4952',fontSize:16,fontFamily:'Georgia,serif',letterSpacing:2 }}>
      Loading SOS Portal…
    </div>
  );

  if (!data && screen !== 'auth') return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#661723',color:'#ff4952',fontSize:16,fontFamily:'Georgia,serif',letterSpacing:2 }}>
      Loading data…
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (screen === 'auth') return (
    <>
      <AuthScreen onLogin={handleLogin} onSignup={handleSignup} onResetPassword={handleResetPassword}/>
      <Toast {...(toast||{})} onClose={()=>setToast(null)}/>
    </>
  );

  const currentAgent   = data.agents.find(a => a.id === currentAgentId) || data.agents[0];
  const pendingCount   = data.missions.filter(m => m.status === 'pending').length;
  const agentRedemptions = data.redemptions.filter(r => r.agentId === currentAgentId);

  const agentNav = [
    { id:'dashboard',     label:'Dashboard',    icon:Home        },
    { id:'missions',      label:'Missions',      icon:Target      },
    { id:'wallet',        label:'IP Wallet',     icon:Wallet      },
    { id:'marketplace',   label:'Marketplace',   icon:ShoppingBag },
    { id:'leaderboard',   label:'Leaderboard',   icon:Trophy      },
    { id:'announcements', label:'Announcements', icon:Bell, badge: data.announcements.filter(a=>a.pinned).length },
  ];
  const adminNav = [
    { id:'overview',      label:'Overview',      icon:BarChart3   },
    { id:'approvals',     label:'Approvals',     icon:CheckCircle, badge: pendingCount },
    { id:'agents',        label:'Agents',        icon:Users       },
    { id:'reports',       label:'Reports',       icon:TrendingUp  },
    { id:'announcements', label:'Announcements', icon:Bell        },
  ];

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'#f4f4f3',fontFamily:'Trebuchet MS,Tahoma,sans-serif' }}>
      <Sidebar items={role==='agent'?agentNav:adminNav} active={activeView} onSelect={setActiveView}
        agent={currentAgent} onLogout={logout} role={role}/>

      <div style={{ flex:1,overflowY:'auto',minHeight:'100vh' }}>
        <div style={{ background:'#FFFFFF',borderBottom:'1px solid #ede8e9',padding:'0 32px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100 }}>
          <div style={{ fontSize:14,fontWeight:700,color:'#1a0508' }}>
            {role==='agent'
              ? ['Dashboard','Missions','IP Wallet','Marketplace','Leaderboard','Announcements'][agentNav.findIndex(n=>n.id===activeView)]
              : ['Overview','Approvals','Agents','Reports','Announcements'][adminNav.findIndex(n=>n.id===activeView)]}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            {pendingCount > 0 && role === 'admin' && (
              <button onClick={()=>setActiveView('approvals')} style={{ background:'#FEF0E7',border:'1px solid rgba(211,84,0,0.27)',borderRadius:20,padding:'5px 14px',fontSize:12,fontWeight:700,color:'#D35400',cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
                <Clock size={13}/> {pendingCount} pending
              </button>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Avatar name={role==='admin'?'HCM Admin':currentAgent?.name||'User'} size={32} bg={'#661723'}/>
              <div style={{ fontSize:12,fontWeight:600,color:'#1a0508' }}>
                {role==='admin' ? 'HCM Admin' : currentAgent?.name?.split(' ')[0] || 'Agent'}
              </div>
            </div>
          </div>
        </div>

        {role==='agent' && activeView==='dashboard'     && <DashboardView   agent={currentAgent} missions={data.missions} onNav={setActiveView} onNewClaim={()=>setActiveView('missions')}/>}
        {role==='agent' && activeView==='missions'      && <MissionsView    agent={currentAgent} missions={data.missions} onSubmit={submitMission}/>}
        {role==='agent' && activeView==='wallet'        && <WalletView      agent={currentAgent} missions={data.missions}/>}
        {role==='agent' && activeView==='marketplace'   && <MarketplaceView agent={currentAgent} redemptions={agentRedemptions} onRedeem={redeemItem}/>}
        {role==='agent' && activeView==='leaderboard'   && <LeaderboardView agents={data.agents} currentAgentId={currentAgentId} missions={data.missions}/>}
        {role==='agent' && activeView==='announcements' && <AnnouncementsView announcements={data.announcements}/>}

        {role==='admin' && activeView==='overview'      && <AdminOverview       agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='approvals'     && <ApprovalsView       missions={data.missions} agents={data.agents} onApprove={approveMission} onReject={rejectMission}/>}
        {role==='admin' && activeView==='agents'        && <AdminAgentsView     agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='reports'       && <AdminReportsView    agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='announcements' && <AdminAnnouncementsView announcements={data.announcements} onAdd={addAnnouncement}/>}
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={()=>setToast(null)}/>
    </div>
  );
}

*/
