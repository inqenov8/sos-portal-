import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Star, ShoppingBag, Users, Bell, BarChart3,
  CheckCircle, XCircle, Clock, LogOut, Upload, TrendingUp,
  Shield, Plus, Home, X, ChevronRight, Activity,
  User, Send, Eye, Wallet, Zap, Award, FileText,
  ChevronDown, AlertCircle, Gift, Target, Menu, Mail, Lock,
  EyeOff, ArrowLeft, KeyRound
} from "lucide-react";

// ─── BRAND (new theme: crimson / coral / grey / white) ───────────────────────
const C = {
  // Primary crimson
  crimson:  '#661723',
  crimson2: '#7d1d2c',
  crimson3: '#921f30',
  // Coral accent
  coral:    '#ff4952',
  coralL:   '#fff0f1',
  coralD:   '#cc2f38',
  // Neutral greys
  grey:     '#c4c4c3',
  greyL:    '#f5f5f4',
  greyD:    '#8a8a89',
  // Whites
  white:    '#FFFFFF',
  off:      '#fafafa',
  bg:       '#f4f4f3',
  // Semantic
  green:    '#1A6B3A',
  greenL:   '#EAF7EE',
  red:      '#C0392B',
  redL:     '#FDEDEC',
  amber:    '#D35400',
  amberL:   '#FEF0E7',
  purple:   '#7D3C98',
  purpleL:  '#F5EEF8',
  // Text
  dark:     '#1a0508',
  muted:    '#9a9a99',
  silver:   '#7a7a79',
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const TIERS = [
  { id:1, title:'Associate',   mrc:250000,   pay:40000,   ip:50,   c:'#778899' },
  { id:2, title:'Soldier',     mrc:800000,   pay:66000,   ip:100,  c:'#5588AA' },
  { id:3, title:'Caporegime',  mrc:1650000,  pay:123750,  ip:300,  c:C.coral   },
  { id:4, title:'Consigliere', mrc:3350000,  pay:233750,  ip:500,  c:'#e83d45' },
  { id:5, title:'Underboss',   mrc:6050000,  pay:401250,  ip:700,  c:C.crimson3},
  { id:6, title:'The Don',     mrc:10050000, pay:751250,  ip:1000, c:C.crimson },
];
const getTier = mrc => { for(let i=TIERS.length-1;i>=0;i--) if(mrc>=TIERS[i].mrc) return TIERS[i]; return null; };
const getNextTier = mrc => TIERS.find(t=>mrc<t.mrc)||null;
const ngn = n => `₦${Number(n).toLocaleString()}`;

const MISSION_CATS = [
  { key:'presales',   label:'Pre-Sales Support',   color:C.coral,    bg:C.coralL,   icon:'📋',
    items:[
      {id:'L2Q', name:'Lead-to-Quotation',   desc:'Convert a qualified lead into a formal quotation within 5 working days',      ip:75, ev:'AM CRM entry + Quotation log'},
      {id:'Q2C', name:'Quote-to-Contract',    desc:'Convert an SOS quotation into a signed customer contract within 5 working days',ip:75, ev:'Quotation log + Contract sign-off'},
      {id:'C2B', name:'Contract-to-Billing',  desc:'Convert a signed contract to a JCC / billing within 14 working days',         ip:75, ev:'Contract log + PED + JCC'},
    ]},
  { key:'postsales',  label:'Post-Sales Support',   color:C.green,   bg:C.greenL,   icon:'🔄',
    items:[
      {id:'CHR', name:'Re-sign Churned Customer',  desc:'Reactivate a previously disconnected customer with a new service agreement',    ip:75, ev:'CRM contract entry + AM confirmation'},
      {id:'DEB', name:'Recover >90-Day Debt',      desc:'Support collection of overdue payments exceeding 90 days from a customer',      ip:75, ev:'Credit control confirmation statement'},
      {id:'NPS', name:'Sign to New Product',        desc:'Onboard an existing customer to a new product or service offering',             ip:75, ev:'CRM contract entry + AM confirmation'},
    ]},
  { key:'engagement', label:'Special Engagement',   color:C.amber,   bg:C.amberL,   icon:'⚡',
    items:[
      {id:'TRN', name:'Product Training',         desc:'Attend internal training session and score >70% in administered assessment',      ip:75, ev:'Attendance register + facilitator confirmation'},
      {id:'SOC', name:'Social Media Engagement',  desc:'Follow and engage on official inq. Nigeria social media posts across platforms',  ip:75, ev:'Screenshot with required hashtag or @tag'},
      {id:'INT', name:'Competitive Intelligence', desc:'Share competitor insights on products, pricing, or market activities',            ip:75, ev:'Product Manager email confirmation'},
    ]},
  { key:'star',       label:'Customer Star',         color:C.purple,  bg:C.purpleL,  icon:'⭐',
    items:[
      {id:'CST', name:'Customer Commendation', desc:'Receive a customer email commending you for outstanding support or service',         ip:200, ev:'Customer email verification (forwarded to HCM)'},
    ]},
];

const MARKET = [
  {id:'M1', cat:'Quick Win',  ip:50,   name:'Half-day off',                  icon:'☀️'},
  {id:'M2', cat:'Quick Win',  ip:150,  name:'Remote work day',               icon:'🏠'},
  {id:'M3', cat:'Experience', ip:250,  name:'Movie ticket (Genesis Cinemas)',icon:'🎬'},
  {id:'M4', cat:'Experience', ip:500,  name:'Spa voucher',                   icon:'💆'},
  {id:'M5', cat:'Premium',    ip:1500, name:'Executive lunch with the MD',   icon:'🍽️'},
  {id:'M6', cat:'Premium',    ip:3000, name:'Restaurant dinner for two',     icon:'🥂'},
  {id:'M7', cat:'Legendary',  ip:5000, name:'Professional certification',    icon:'📜'},
  {id:'M8', cat:'Legendary',  ip:5000, name:'Luxury hotel weekend',          icon:'🏨'},
];
const MARKET_CAT_COLORS = { 'Quick Win':C.coral, 'Experience':C.amber, 'Premium':C.crimson3, 'Legendary':C.purple };

function seed() {
  return {
    users: [
      // Pre-seeded users with hashed passwords (format: email → data)
      { id:'A001', email:'adaeze.okonkwo@inq.ng',   password:'Pass1234!', name:'Adaeze Okonkwo',     role:'Finance Analyst',          dept:'Finance',          ip:680,  mrc:950000,  accountType:'agent' },
      { id:'A002', email:'emeka.nwosu@inq.ng',       password:'Pass1234!', name:'Emeka Nwosu',         role:'Project Manager',          dept:'Delivery',         ip:225,  mrc:310000,  accountType:'agent' },
      { id:'A003', email:'chioma.eze@inq.ng',         password:'Pass1234!', name:'Chioma Eze',           role:'Technical Support Lead',   dept:'Technology',       ip:1450, mrc:1800000, accountType:'agent' },
      { id:'A004', email:'bayo.adeyemi@inq.ng',       password:'Pass1234!', name:'Bayo Adeyemi',         role:'HR Business Partner',      dept:'HCM',              ip:125,  mrc:260000,  accountType:'agent' },
      { id:'A005', email:'ngozi.okafor@inq.ng',       password:'Pass1234!', name:'Ngozi Okafor',         role:'Marketing Executive',      dept:'Marketing',        ip:520,  mrc:720000,  accountType:'agent' },
      { id:'A006', email:'tunde.afolabi@inq.ng',      password:'Pass1234!', name:'Tunde Afolabi',        role:'Customer Success Manager', dept:'Customer Success', ip:345,  mrc:480000,  accountType:'agent' },
      { id:'A007', email:'amaka.obiora@inq.ng',       password:'Pass1234!', name:'Amaka Obiora',         role:'Product Analyst',          dept:'Product',          ip:900,  mrc:2100000, accountType:'agent' },
      { id:'A008', email:'kunle.fashola@inq.ng',      password:'Pass1234!', name:'Kunle Fashola',        role:'Network Engineer',         dept:'Technology',       ip:210,  mrc:390000,  accountType:'agent' },
      { id:'ADMIN', email:'hcm.admin@inq.ng',         password:'Admin123!', name:'HCM Admin',            role:'HCM Administrator',        dept:'HCM',              ip:0,    mrc:0,       accountType:'admin' },
    ],
    agents: [
      {id:'A001',name:'Adaeze Okonkwo',     role:'Finance Analyst',         dept:'Finance',          ip:680,  mrc:950000 },
      {id:'A002',name:'Emeka Nwosu',         role:'Project Manager',         dept:'Delivery',         ip:225,  mrc:310000 },
      {id:'A003',name:'Chioma Eze',           role:'Technical Support Lead',  dept:'Technology',       ip:1450, mrc:1800000},
      {id:'A004',name:'Bayo Adeyemi',         role:'HR Business Partner',     dept:'HCM',              ip:125,  mrc:260000 },
      {id:'A005',name:'Ngozi Okafor',         role:'Marketing Executive',     dept:'Marketing',        ip:520,  mrc:720000 },
      {id:'A006',name:'Tunde Afolabi',        role:'Customer Success Manager',dept:'Customer Success', ip:345,  mrc:480000 },
      {id:'A007',name:'Amaka Obiora',         role:'Product Analyst',         dept:'Product',          ip:900,  mrc:2100000},
      {id:'A008',name:'Kunle Fashola',        role:'Network Engineer',        dept:'Technology',       ip:210,  mrc:390000 },
    ],
    missions:[
      {id:'MS001',agentId:'A001',missionId:'L2Q',cat:'Pre-Sales Support', name:'Lead-to-Quotation',       ip:75,  status:'pending', date:'2025-03-12',dealRef:'SF-2025-0142',notes:'Worked with Chidi on the Acme Networks lead.',evidence:'CRM_Acme_log.pdf'},
      {id:'MS002',agentId:'A002',missionId:'CHR',cat:'Post-Sales Support',name:'Re-sign Churned Customer',ip:75,  status:'pending', date:'2025-03-14',dealRef:'SF-2025-0138',notes:'Sterling Bank reconnected after 8 months.',evidence:'Contract_Sterling.pdf'},
      {id:'MS003',agentId:'A005',missionId:'CST',cat:'Customer Star',     name:'Customer Commendation',  ip:200, status:'pending', date:'2025-03-15',dealRef:'N/A',         notes:'Received commendation email from GTBank.',evidence:'Email_GTBank.pdf'},
      {id:'MS004',agentId:'A001',missionId:'TRN',cat:'Special Engagement',name:'Product Training',        ip:75,  status:'approved',date:'2025-02-20',dealRef:'N/A',         notes:'Edge AI training — scored 82%.',evidence:'Attendance_Feb.pdf'},
      {id:'MS005',agentId:'A001',missionId:'Q2C',cat:'Pre-Sales Support', name:'Quote-to-Contract',       ip:75,  status:'approved',date:'2025-02-28',dealRef:'SF-2025-0121',notes:'Supported Dangote Cement deal.',evidence:'Contract_Dangote.pdf'},
      {id:'MS006',agentId:'A001',missionId:'SOC',cat:'Special Engagement',name:'Social Media Engagement', ip:75,  status:'approved',date:'2025-03-01',dealRef:'N/A',         notes:'Shared announcement on LinkedIn.',evidence:'Screenshot_LinkedIn.pdf'},
      {id:'MS007',agentId:'A001',missionId:'CST',cat:'Customer Star',     name:'Customer Commendation',  ip:200, status:'rejected',date:'2025-03-05',dealRef:'N/A',         notes:'Customer email did not clearly name me.',evidence:'Email_unclear.pdf',rejectReason:'Evidence insufficient — customer email does not name you specifically. Please resubmit.'},
      {id:'MS008',agentId:'A003',missionId:'CHR',cat:'Post-Sales Support',name:'Re-sign Churned Customer',ip:75,  status:'approved',date:'2025-03-10',dealRef:'SF-2025-0130',notes:'Access Bank reactivated.',evidence:'Contract_Access.pdf'},
      {id:'MS009',agentId:'A007',missionId:'L2Q',cat:'Pre-Sales Support', name:'Lead-to-Quotation',       ip:75,  status:'approved',date:'2025-03-08',dealRef:'SF-2025-0135',notes:'Fidelity Bank lead.',evidence:'CRM_Fidelity.pdf'},
      {id:'MS010',agentId:'A007',missionId:'Q2C',cat:'Pre-Sales Support', name:'Quote-to-Contract',       ip:75,  status:'approved',date:'2025-03-11',dealRef:'SF-2025-0135',notes:'Fidelity Bank contract.',evidence:'Contract_Fidelity.pdf'},
    ],
    redemptions:[],
    announcements:[
      {id:'AN1',title:'SOS Campaign FY2025/26 — Now Live!',body:'Welcome to the SOS Campaign! All eligible non-sales staff can log in, complete mandatory training, and start earning inq.credible Points. The portal is open. Your first claim can be submitted today. Good luck, Agents!',date:'2025-04-01',author:'HCM Team',pinned:true},
      {id:'AN2',title:'Q1 Recognition Event — Save the Date',body:'The Q1 SOS Recognition Event takes place on 3 July 2025. Four category winners will be announced — Churn Rescue, Brand Enforcer, Opportunity Scout, and Support Wingman. Each winner receives a 500 IP bonus.',date:'2025-03-18',author:'HCM Team',pinned:false},
      {id:'AN3',title:'Priority Products — Edge AI & Edge Sentry',body:'Support missions tied to Edge AI and Edge Sentry will be fast-tracked in the approval queue this quarter. Speak to your Account Manager to get involved.',date:'2025-03-10',author:'Innovation & Partnerships',pinned:false},
    ],
    passwordResets: [], // { email, token, expiry }
  };
}

// ─── EMAIL SIMULATION ─────────────────────────────────────────────────────────
// In production, replace these with real API calls (SendGrid, AWS SES, etc.)
function simulateEmail(type, data) {
  const emailLog = { type, to: data.email, timestamp: new Date().toISOString(), data };
  console.log(`[EMAIL SENT] ${type.toUpperCase()} → ${data.email}`, emailLog);

  const templates = {
    onboarding: {
      subject: `Welcome to the SOS Portal — inq. Nigeria`,
      preview: `Hi ${data.name}, your SOS Portal account is ready.`,
      body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOS — SELL OUR SOLUTION
inq. Nigeria · FY 2025/26
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${data.name},

Welcome to the SOS Campaign! Your portal account has been created.

Your login details:
  Email: ${data.email}
  Portal: https://sos.inq.ng

Getting started:
  1. Log in with your corporate email
  2. Complete the mandatory Product Training mission
  3. Submit your first claim within 5 working days

Your current tier: ${data.tier || '—'}
Starting IP balance: 0

Questions? Contact hcm@inq.ng

The HCM Team
inq. Nigeria
      `
    },
    passwordReset: {
      subject: `SOS Portal — Password Reset Request`,
      body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOS — SELL OUR SOLUTION
inq. Nigeria
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${data.name},

A password reset was requested for your SOS Portal account.

Use this reset code (valid for 30 minutes):

  CODE: ${data.token}

If you did not request this, ignore this email.

The HCM Team
      `
    }
  };

  return templates[type] || null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const initials = name => name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
const statusColor = s => s==='approved'?C.green:s==='rejected'?C.red:C.amber;
const statusBg    = s => s==='approved'?C.greenL:s==='rejected'?C.redL:C.amberL;
const statusLabel = s => s==='approved'?'Approved':s==='rejected'?'Rejected':'Pending';
const isCorpEmail = email => /^[^\s@]+@inq\.ng$/i.test(email);
const genToken = () => Math.floor(100000 + Math.random() * 900000).toString();
const genId = prefix => prefix + Date.now().toString(36).toUpperCase();

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
function Avatar({ name, size=40, bg=C.crimson2 }) {
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',
      fontWeight:700,fontSize:size*0.36,color:C.white,fontFamily:'Georgia,serif',flexShrink:0 }}>
      {initials(name)}
    </div>
  );
}
function Badge({ label, color, bg }) {
  return <span style={{ background:bg,color,fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:20,letterSpacing:0.3 }}>{label}</span>;
}
function IpBadge({ ip }) {
  return <span style={{ background:C.coralL,color:C.coralD,fontWeight:800,fontSize:12,padding:'3px 10px',borderRadius:20 }}>{ip} IP</span>;
}
function Stat({ label, value, sub, icon:Icon, accent=C.coral }) {
  return (
    <div style={{ background:C.white,borderRadius:14,padding:'18px 22px',boxShadow:'0 2px 12px rgba(102,23,35,0.07)',border:`1px solid #ede8e9`,flex:1,minWidth:140 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11,fontWeight:600,color:C.silver,letterSpacing:0.5,marginBottom:4,textTransform:'uppercase' }}>{label}</div>
          <div style={{ fontSize:26,fontWeight:800,color:C.dark,letterSpacing:-0.5,fontFamily:'Georgia,serif' }}>{value}</div>
          {sub && <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{sub}</div>}
        </div>
        {Icon && <div style={{ width:38,height:38,borderRadius:10,background:`${accent}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon size={18} color={accent}/>
        </div>}
      </div>
    </div>
  );
}
function ProgressBar({ value, max, color=C.coral }) {
  const pct = max>0 ? Math.min(100, (value/max)*100) : 0;
  return (
    <div style={{ height:8,borderRadius:8,background:'#ede8e9',overflow:'hidden' }}>
      <div style={{ height:'100%',width:`${pct}%`,borderRadius:8,background:color,transition:'width 0.5s ease' }}/>
    </div>
  );
}
function Modal({ isOpen, onClose, title, children, width=580 }) {
  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(26,5,8,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 }}>
      <div style={{ background:C.white,borderRadius:18,width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 60px rgba(102,23,35,0.25)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:`1px solid #ede8e9` }}>
          <div style={{ fontSize:17,fontWeight:700,color:C.dark,fontFamily:'Georgia,serif' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',padding:4,borderRadius:8,color:C.silver }}><X size={20}/></button>
        </div>
        <div style={{ overflowY:'auto',padding:'20px 24px',flex:1 }}>{children}</div>
      </div>
    </div>
  );
}
function Toast({ message, type='success', onClose }) {
  if (!message) return null;
  const bg = type==='success'?C.greenL:type==='error'?C.redL:C.coralL;
  const col = type==='success'?C.green:type==='error'?C.red:C.coralD;
  const Icon = type==='success'?CheckCircle:type==='error'?XCircle:AlertCircle;
  return (
    <div style={{ position:'fixed',top:20,right:20,zIndex:2000,background:bg,border:`1.5px solid ${col}`,borderRadius:12,padding:'14px 20px',
      display:'flex',alignItems:'center',gap:10,boxShadow:'0 8px 24px rgba(102,23,35,0.15)',maxWidth:380 }}>
      <Icon size={18} color={col}/>
      <span style={{ fontSize:13,fontWeight:600,color:col,flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:col,padding:0,marginLeft:8 }}><X size={14}/></button>
    </div>
  );
}
function Btn({ children, onClick, variant='primary', small=false, full=false, disabled=false }) {
  const styles = {
    primary:   { background:C.coral,    color:C.white,  border:'none' },
    secondary: { background:C.crimson,  color:C.white,  border:'none' },
    ghost:     { background:'transparent', color:C.dark, border:`1.5px solid #d0cccd` },
    danger:    { background:C.red,      color:C.white,  border:'none' },
    success:   { background:C.green,    color:C.white,  border:'none' },
    teal:      { background:C.crimson3, color:C.white,  border:'none' },
    crimson:   { background:C.crimson,  color:C.white,  border:'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], borderRadius:10, padding:small?'8px 16px':'11px 22px', fontSize:small?12:13, fontWeight:700,
        cursor:disabled?'not-allowed':'pointer', width:full?'100%':'auto', letterSpacing:0.2, transition:'opacity 0.15s',
        display:'flex', alignItems:'center', gap:6, justifyContent:'center', opacity:disabled?0.6:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.opacity='0.88'; }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.opacity='1'; }}>
      {children}
    </button>
  );
}

function InputField({ label, type='text', value, onChange, placeholder, required, icon:Icon, error, hint }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
      {label && <label style={{ fontSize:12,fontWeight:600,color:C.dark,letterSpacing:0.2 }}>
        {label} {required && <span style={{color:C.coral}}>*</span>}
      </label>}
      <div style={{ position:'relative' }}>
        {Icon && <div style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.muted,pointerEvents:'none' }}>
          <Icon size={15}/>
        </div>}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width:'100%',border:`1.5px solid ${error?C.red:'#d0cccd'}`,borderRadius:10,
            padding:`10px ${isPassword?'40px':'14px'} 10px ${Icon?'38px':'14px'}`,
            fontSize:13,outline:'none',boxSizing:'border-box',
            background:C.white,color:C.dark,transition:'border-color 0.15s',
            fontFamily:'inherit',
          }}
          onFocus={e=>e.target.style.borderColor=error?C.red:C.coral}
          onBlur={e=>e.target.style.borderColor=error?C.red:'#d0cccd'}
        />
        {isPassword && <button type="button" onClick={()=>setShow(s=>!s)}
          style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:C.muted,padding:0 }}>
          {show?<EyeOff size={15}/>:<Eye size={15}/>}
        </button>}
      </div>
      {error && <div style={{ fontSize:11,color:C.red,display:'flex',alignItems:'center',gap:4 }}><AlertCircle size={11}/>{error}</div>}
      {hint && !error && <div style={{ fontSize:11,color:C.muted }}>{hint}</div>}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ items, active, onSelect, agent, onLogout, role }) {
  return (
    <div style={{ width:240,background:C.crimson,height:'100vh',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0 }}>
      {/* Logo */}
      <div style={{ padding:'24px 20px 20px',borderBottom:`1px solid ${C.crimson2}` }}>
        <div style={{ fontFamily:'Georgia,serif',fontWeight:700,fontSize:22,color:C.white,letterSpacing:1 }}>SOS</div>
        <div style={{ fontSize:9,color:'rgba(255,255,255,0.5)',letterSpacing:2,fontWeight:600,marginTop:1 }}>SELL OUR SOLUTION</div>
        <div style={{ fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:6,fontWeight:500 }}>inq. Nigeria  ·  FY 2025/26</div>
      </div>
      {/* Agent profile */}
      {agent && (
        <div style={{ padding:'16px 20px',borderBottom:`1px solid ${C.crimson2}`,display:'flex',alignItems:'center',gap:10 }}>
          <Avatar name={agent.name} size={38} bg={C.crimson2}/>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:700,color:C.white,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{agent.name.split(' ')[0]}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{role==='admin'?'HCM Admin':agent.role}</div>
          </div>
          {role==='agent' && <div style={{ fontSize:10,fontWeight:700,color:C.white,background:`rgba(255,73,82,0.35)`,borderRadius:8,padding:'2px 8px',whiteSpace:'nowrap' }}>{agent.ip} IP</div>}
        </div>
      )}
      {/* Nav */}
      <nav style={{ flex:1,overflowY:'auto',padding:'10px 10px' }}>
        {items.map(item => {
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>onSelect(item.id)}
              style={{ display:'flex',alignItems:'center',gap:11,width:'100%',padding:'11px 14px',borderRadius:10,marginBottom:2,
                background:isActive?`rgba(255,73,82,0.25)`:'transparent',border:'none',cursor:'pointer',
                color:isActive?C.white:'rgba(255,255,255,0.55)',fontWeight:isActive?700:500,fontSize:13,transition:'all 0.15s',textAlign:'left',position:'relative' }}>
              <item.icon size={17} color={isActive?C.coral:'rgba(255,255,255,0.45)'}/>
              <span>{item.label}</span>
              {item.badge>0 && <span style={{ marginLeft:'auto',background:C.coral,color:C.white,borderRadius:20,fontSize:10,fontWeight:700,padding:'1px 7px',minWidth:20,textAlign:'center' }}>{item.badge}</span>}
              {isActive && <div style={{ position:'absolute',left:0,top:'20%',bottom:'20%',width:3,background:C.coral,borderRadius:2 }}/>}
            </button>
          );
        })}
      </nav>
      {/* Logout */}
      <button onClick={onLogout} style={{ display:'flex',alignItems:'center',gap:10,padding:'16px 22px',background:'none',border:'none',
        borderTop:`1px solid ${C.crimson2}`,color:'rgba(255,255,255,0.45)',cursor:'pointer',fontSize:13,fontWeight:600 }}>
        <LogOut size={15}/> Sign Out
      </button>
    </div>
  );
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

function AuthScreen({ onLogin, onSignup, onResetPassword }) {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const DEPTS = ['Finance','Delivery','Technology','HCM','Marketing','Customer Success','Product','Operations','Legal','Strategy'];

  const validate = {
    login: () => {
      const e = {};
      if (!email) e.email = 'Email is required';
      else if (!isCorpEmail(email)) e.email = 'Must be a corporate @inq.ng email address';
      if (!password) e.password = 'Password is required';
      return e;
    },
    signup: () => {
      const e = {};
      if (!fullName.trim()) e.fullName = 'Full name is required';
      if (!email) e.email = 'Email is required';
      else if (!isCorpEmail(email)) e.email = 'Must be a corporate @inq.ng email address';
      if (!dept) e.dept = 'Please select your department';
      if (!jobTitle.trim()) e.jobTitle = 'Job title is required';
      if (!password) e.password = 'Password is required';
      else if (password.length < 8) e.password = 'Minimum 8 characters';
      else if (!/[A-Z]/.test(password)) e.password = 'Include at least one uppercase letter';
      else if (!/[0-9]/.test(password)) e.password = 'Include at least one number';
      if (password !== confirmPw) e.confirmPw = 'Passwords do not match';
      return e;
    },
    forgot: () => {
      const e = {};
      if (!resetEmail) e.resetEmail = 'Email is required';
      else if (!isCorpEmail(resetEmail)) e.resetEmail = 'Must be a corporate @inq.ng email address';
      return e;
    },
    reset: () => {
      const e = {};
      if (!resetCode || resetCode.length !== 6) e.resetCode = 'Enter the 6-digit code from your email';
      if (!newPassword) e.newPassword = 'New password is required';
      else if (newPassword.length < 8) e.newPassword = 'Minimum 8 characters';
      else if (!/[A-Z]/.test(newPassword)) e.newPassword = 'Include at least one uppercase letter';
      else if (!/[0-9]/.test(newPassword)) e.newPassword = 'Include at least one number';
      return e;
    }
  };

  function handleLogin(e) {
    e.preventDefault();
    const errs = validate.login();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onLogin(email, password); }, 600);
  }

  function handleSignup(e) {
    e.preventDefault();
    const errs = validate.signup();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSignup({ email, password, name: fullName.trim(), dept, role: jobTitle.trim() });
    }, 800);
  }

  function handleForgot(e) {
    e.preventDefault();
    const errs = validate.forgot();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onResetPassword('request', { email: resetEmail });
      setResetSent(true);
    }, 800);
  }

  function handleReset(e) {
    e.preventDefault();
    const errs = validate.reset();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onResetPassword('confirm', { email: resetEmail, token: resetCode, newPassword });
    }, 800);
  }

  const bgStyle = {
    minHeight:'100vh',
    background:`linear-gradient(135deg, ${C.crimson} 0%, ${C.crimson2} 50%, ${C.crimson3} 100%)`,
    display:'flex',alignItems:'center',justifyContent:'center',padding:20,
    position:'relative',overflow:'hidden',
  };

  return (
    <div style={bgStyle}>
      {/* Background decoration */}
      <div style={{ position:'absolute',top:-80,right:-80,width:360,height:360,borderRadius:'50%',background:'rgba(255,73,82,0.12)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:-100,left:-60,width:280,height:280,borderRadius:'50%',background:'rgba(255,73,82,0.08)',pointerEvents:'none' }}/>

      <div style={{ width:'100%',maxWidth:460,position:'relative' }}>
        {/* Brand */}
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ fontFamily:'Georgia,serif',fontSize:60,fontWeight:900,color:C.white,lineHeight:1,letterSpacing:3,textShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>SOS</div>
          <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:4,fontWeight:700,marginTop:4 }}>SELL OUR SOLUTION</div>
          <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:8 }}>inq. Nigeria · FY 2025 / 2026</div>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.97)',backdropFilter:'blur(20px)',borderRadius:22,padding:'32px 36px',boxShadow:'0 24px 60px rgba(26,5,8,0.35)' }}>

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div>
                <div style={{ fontSize:20,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif',marginBottom:4 }}>Welcome back</div>
                <div style={{ fontSize:13,color:C.muted }}>Sign in with your corporate email to continue</div>
              </div>
              <InputField label="Corporate Email" type="email" value={email} onChange={e=>{setEmail(e.target.value);setErrors({}); }}
                placeholder="yourname@inq.ng" required icon={Mail} error={errors.email}
                hint="Use your @inq.ng email address"/>
              <InputField label="Password" type="password" value={password} onChange={e=>{setPassword(e.target.value);setErrors({});}}
                placeholder="Enter your password" required icon={Lock} error={errors.password}/>
              <div style={{ textAlign:'right',marginTop:-8 }}>
                <button type="button" onClick={()=>{setView('forgot');setErrors({});}}
                  style={{ background:'none',border:'none',cursor:'pointer',fontSize:12,color:C.coral,fontWeight:600 }}>
                  Forgot password?
                </button>
              </div>
              {errors.auth && <div style={{ background:C.redL,border:`1px solid ${C.red}44`,borderRadius:10,padding:'10px 14px',fontSize:13,color:C.red,display:'flex',alignItems:'center',gap:8 }}>
                <XCircle size={15}/> {errors.auth}
              </div>}
              <Btn variant="primary" full disabled={submitting}>
                {submitting ? 'Signing in…' : <><Mail size={14}/> Sign In →</>}
              </Btn>
              <div style={{ textAlign:'center',fontSize:12,color:C.muted }}>
                New to SOS? <button type="button" onClick={()=>{setView('signup');setErrors({});}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:C.coral,fontWeight:700 }}>Create account</button>
              </div>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {view === 'signup' && (
            <form onSubmit={handleSignup} style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                <button type="button" onClick={()=>{setView('login');setErrors({});}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:C.muted,padding:0,display:'flex' }}><ArrowLeft size={18}/></button>
                <div>
                  <div style={{ fontSize:18,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Create Account</div>
                  <div style={{ fontSize:12,color:C.muted }}>Register with your corporate @inq.ng email</div>
                </div>
              </div>
              <InputField label="Full Name" value={fullName} onChange={e=>{setFullName(e.target.value);setErrors({});}}
                placeholder="e.g. Adaeze Okonkwo" required icon={User} error={errors.fullName}/>
              <InputField label="Corporate Email" type="email" value={email} onChange={e=>{setEmail(e.target.value);setErrors({});}}
                placeholder="yourname@inq.ng" required icon={Mail} error={errors.email}
                hint="Only @inq.ng email addresses are accepted"/>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:5 }}>Department <span style={{color:C.coral}}>*</span></label>
                  <select value={dept} onChange={e=>{setDept(e.target.value);setErrors({});}}
                    style={{ width:'100%',border:`1.5px solid ${errors.dept?C.red:'#d0cccD'}`,borderRadius:10,padding:'10px 14px',fontSize:13,outline:'none',
                      background:C.white,color:dept?C.dark:C.muted,fontFamily:'inherit',boxSizing:'border-box',cursor:'pointer' }}>
                    <option value="">Select dept.</option>
                    {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.dept && <div style={{ fontSize:11,color:C.red,marginTop:3 }}>{errors.dept}</div>}
                </div>
                <InputField label="Job Title" value={jobTitle} onChange={e=>{setJobTitle(e.target.value);setErrors({});}}
                  placeholder="e.g. Finance Analyst" required error={errors.jobTitle}/>
              </div>
              <InputField label="Password" type="password" value={password} onChange={e=>{setPassword(e.target.value);setErrors({});}}
                placeholder="Min. 8 chars, 1 uppercase, 1 number" required icon={Lock} error={errors.password}/>
              <InputField label="Confirm Password" type="password" value={confirmPw} onChange={e=>{setConfirmPw(e.target.value);setErrors({});}}
                placeholder="Re-enter password" required icon={Lock} error={errors.confirmPw}/>
              {errors.auth && <div style={{ background:C.redL,border:`1px solid ${C.red}44`,borderRadius:10,padding:'10px 14px',fontSize:12,color:C.red,display:'flex',alignItems:'center',gap:8 }}>
                <XCircle size={14}/> {errors.auth}
              </div>}
              <Btn variant="primary" full disabled={submitting}>
                {submitting ? 'Creating account…' : <><User size={14}/> Create Account</>}
              </Btn>
              <div style={{ textAlign:'center',fontSize:12,color:C.muted }}>
                Already registered? <button type="button" onClick={()=>{setView('login');setErrors({});}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:C.coral,fontWeight:700 }}>Sign in</button>
              </div>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                <button type="button" onClick={()=>{setView('login');setErrors({});setResetSent(false);}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:C.muted,padding:0,display:'flex' }}><ArrowLeft size={18}/></button>
                <div>
                  <div style={{ fontSize:18,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Reset Password</div>
                  <div style={{ fontSize:12,color:C.muted }}>Enter your corporate email to receive a reset code</div>
                </div>
              </div>
              {!resetSent ? (
                <>
                  <InputField label="Corporate Email" type="email" value={resetEmail} onChange={e=>{setResetEmail(e.target.value);setErrors({});}}
                    placeholder="yourname@inq.ng" required icon={Mail} error={errors.resetEmail}/>
                  <Btn variant="primary" full disabled={submitting}>
                    {submitting ? 'Sending…' : <><Send size={14}/> Send Reset Code</>}
                  </Btn>
                </>
              ) : (
                <div style={{ background:C.greenL,borderRadius:12,padding:'14px 18px',display:'flex',flexDirection:'column',gap:8 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,color:C.green,fontWeight:700,fontSize:13 }}>
                    <CheckCircle size={16}/> Reset code sent!
                  </div>
                  <div style={{ fontSize:12,color:C.green }}>
                    A 6-digit code was sent to <strong>{resetEmail}</strong>. Check your inbox.
                  </div>
                  <button type="button" onClick={()=>setView('reset')}
                    style={{ background:'none',border:'none',cursor:'pointer',color:C.coral,fontSize:13,fontWeight:700,textAlign:'left',padding:0 }}>
                    Enter the code →
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ── RESET CODE + NEW PASSWORD ── */}
          {view === 'reset' && (
            <form onSubmit={handleReset} style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                <button type="button" onClick={()=>{setView('forgot');setErrors({});}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:C.muted,padding:0,display:'flex' }}><ArrowLeft size={18}/></button>
                <div>
                  <div style={{ fontSize:18,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>New Password</div>
                  <div style={{ fontSize:12,color:C.muted }}>Enter the code from your email and set a new password</div>
                </div>
              </div>
              <InputField label="6-Digit Reset Code" value={resetCode} onChange={e=>{setResetCode(e.target.value.replace(/\D/,'').slice(0,6));setErrors({});}}
                placeholder="Enter 6-digit code" required icon={KeyRound} error={errors.resetCode}/>
              <InputField label="New Password" type="password" value={newPassword} onChange={e=>{setNewPassword(e.target.value);setErrors({});}}
                placeholder="Min. 8 chars, 1 uppercase, 1 number" required icon={Lock} error={errors.newPassword}/>
              {errors.auth && <div style={{ background:C.redL,border:`1px solid ${C.red}44`,borderRadius:10,padding:'10px 14px',fontSize:12,color:C.red,display:'flex',alignItems:'center',gap:8 }}>
                <XCircle size={14}/> {errors.auth}
              </div>}
              <Btn variant="primary" full disabled={submitting}>
                {submitting ? 'Updating…' : <><KeyRound size={14}/> Set New Password</>}
              </Btn>
            </form>
          )}
        </div>

        <div style={{ textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:20 }}>
          SOS Portal · inq. Nigeria · Restricted access
        </div>
      </div>
    </div>
  );
}

// ─── AGENT VIEWS ─────────────────────────────────────────────────────────────
function DashboardView({ agent, missions, onNav, onNewClaim }) {
  const tier = getTier(agent.mrc);
  const nextTier = getNextTier(agent.mrc);
  const agentMissions = missions.filter(m=>m.agentId===agent.id);
  const approved = agentMissions.filter(m=>m.status==='approved');
  const pending  = agentMissions.filter(m=>m.status==='pending');
  const totalIpEarned = approved.reduce((s,m)=>s+m.ip,0);
  const mrcToNext = nextTier ? nextTier.mrc - agent.mrc : 0;

  return (
    <div style={{ padding:'28px 32px',maxWidth:960 }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:24,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>
          Good morning, {agent.name.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize:13,color:C.silver,marginTop:4 }}>Here's your SOS performance overview</div>
      </div>

      {tier && (
        <div style={{ background:`linear-gradient(135deg, ${C.crimson} 0%, ${C.crimson2} 60%, ${C.crimson3} 100%)`,borderRadius:18,padding:'24px 28px',marginBottom:22,color:C.white,position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',top:-30,right:-30,width:160,height:160,borderRadius:'50%',background:'rgba(255,73,82,0.15)' }}/>
          <div style={{ position:'absolute',bottom:-40,right:40,width:120,height:120,borderRadius:'50%',background:'rgba(255,73,82,0.10)' }}/>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,flexWrap:'wrap',position:'relative' }}>
            <div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:2,fontWeight:600,marginBottom:4 }}>CURRENT RANK</div>
              <div style={{ fontSize:32,fontWeight:900,color:C.coral,fontFamily:'Georgia,serif',letterSpacing:-0.5 }}>{tier.title}</div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2 }}>Tier {tier.id} of 6 — Cumulative MRC {ngn(agent.mrc)}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:2,fontWeight:600,marginBottom:4 }}>MONTHLY REWARD</div>
              <div style={{ fontSize:28,fontWeight:800,color:C.white,fontFamily:'Georgia,serif' }}>{ngn(tier.pay)}</div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2 }}>paid with payroll</div>
            </div>
          </div>
          {nextTier && (
            <div style={{ marginTop:18 }}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:6 }}>
                <span>Progress to <strong style={{color:C.coral}}>{nextTier.title}</strong></span>
                <span>{ngn(mrcToNext)} remaining</span>
              </div>
              <ProgressBar value={agent.mrc} max={nextTier.mrc} color={C.coral}/>
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex',gap:14,marginBottom:22,flexWrap:'wrap' }}>
        <Stat label="inq.credible Points" value={agent.ip.toLocaleString()} sub="IP in wallet" icon={Zap} accent={C.coral}/>
        <Stat label="Missions Completed" value={approved.length} sub="this FY" icon={CheckCircle} accent={C.green}/>
        <Stat label="IP Earned This FY" value={totalIpEarned.toLocaleString()} sub="from missions" icon={TrendingUp} accent={C.crimson3}/>
        <Stat label="Pending Review" value={pending.length} sub="awaiting approval" icon={Clock} accent={C.amber}/>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:20 }}>
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',boxShadow:'0 2px 12px rgba(102,23,35,0.07)',border:'1px solid #ede8e9' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.dark }}>Recent Submissions</div>
            <button onClick={()=>onNav('missions')} style={{ fontSize:12,color:C.coral,background:'none',border:'none',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:4 }}>View all <ChevronRight size={13}/></button>
          </div>
          {agentMissions.length===0 && <div style={{ textAlign:'center',padding:'24px 0',color:C.muted,fontSize:13 }}>No missions submitted yet</div>}
          {agentMissions.slice(0,5).map(m=>(
            <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #f5f0f1' }}>
              <div style={{ width:34,height:34,borderRadius:10,background:statusBg(m.status),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                {m.status==='approved'?<CheckCircle size={16} color={C.green}/>:m.status==='rejected'?<XCircle size={16} color={C.red}/>:<Clock size={16} color={C.amber}/>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:600,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.name}</div>
                <div style={{ fontSize:11,color:C.silver }}>{m.cat} · {m.date}</div>
              </div>
              <IpBadge ip={m.ip}/>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ background:C.crimson,borderRadius:14,padding:'20px 22px' }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.white,marginBottom:14 }}>Quick Actions</div>
            {[{icon:Plus,label:'Submit New Claim',sub:'Log a mission for review',action:()=>onNewClaim(),color:C.coral},
              {icon:ShoppingBag,label:'Browse Marketplace',sub:`${agent.ip} IP available`,action:()=>onNav('marketplace'),color:'#ff8086'},
              {icon:Trophy,label:'View Leaderboard',sub:'See your ranking',action:()=>onNav('leaderboard'),color:C.purple},
            ].map((a,i)=>(
              <button key={i} onClick={a.action} style={{ display:'flex',alignItems:'center',gap:12,width:'100%',background:`rgba(255,73,82,0.2)`,border:`1px solid rgba(255,73,82,0.3)`,borderRadius:10,padding:'12px 14px',marginBottom:8,cursor:'pointer',textAlign:'left' }}>
                <a.icon size={16} color={C.coral}/>
                <div>
                  <div style={{ fontSize:12,fontWeight:700,color:C.white }}>{a.label}</div>
                  <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>{a.sub}</div>
                </div>
                <ChevronRight size={13} color='rgba(255,255,255,0.3)' style={{ marginLeft:'auto' }}/>
              </button>
            ))}
          </div>
          <div style={{ background:C.coralL,borderRadius:14,padding:'18px 20px',border:`1px solid rgba(255,73,82,0.3)` }}>
            <div style={{ fontSize:11,color:C.coralD,fontWeight:600,letterSpacing:0.5,marginBottom:4 }}>MARKETPLACE HIGHLIGHT</div>
            {MARKET.filter(m=>m.ip<=agent.ip).slice(-1).map(m=>(
              <div key={m.id}>
                <div style={{ fontSize:22,marginBottom:4 }}>{m.icon}</div>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark }}>{m.name}</div>
                <div style={{ fontSize:12,color:C.coralD,marginTop:2 }}>{m.ip} IP · You can redeem this now</div>
              </div>
            ))}
            {MARKET.filter(m=>m.ip<=agent.ip).length===0 && <div style={{ fontSize:12,color:C.coralD }}>Earn IP to unlock rewards!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionsView({ agent, missions, onSubmit }) {
  const [activeTab, setActiveTab] = useState('presales');
  const [showForm, setShowForm] = useState(null);
  const [form, setForm] = useState({ dealRef:'', notes:'', evidence:'' });
  const agentMissions = missions.filter(m=>m.agentId===agent.id);
  const cat = MISSION_CATS.find(c=>c.key===activeTab);

  function handleSubmit(mission) {
    if (!form.dealRef && !['SOC','INT','TRN','CST'].includes(mission.id)) {
      alert('Please enter a Deal Reference / Salesforce ID'); return;
    }
    if (!form.notes) { alert('Please add notes about this claim'); return; }
    onSubmit({ missionId:mission.id, cat:cat.label, name:mission.name, ip:mission.ip, ...form });
    setShowForm(null); setForm({ dealRef:'', notes:'', evidence:'' });
  }

  return (
    <div style={{ padding:'28px 32px',maxWidth:960 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Mission Control</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>Submit claims for completed missions. All submissions are reviewed within 10 working days.</div>
      </div>
      <div style={{ display:'flex',gap:8,marginBottom:22,flexWrap:'wrap' }}>
        {MISSION_CATS.map(c=>(
          <button key={c.key} onClick={()=>setActiveTab(c.key)}
            style={{ padding:'9px 18px',borderRadius:30,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',
              background:activeTab===c.key?c.color:C.greyL,color:activeTab===c.key?C.white:C.dark,transition:'all 0.15s' }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:28 }}>
        {cat.items.map(m=>{
          const completed = agentMissions.filter(am=>am.missionId===m.id&&am.status==='approved').length;
          return (
            <div key={m.id} style={{ background:C.white,borderRadius:14,padding:'20px',border:`1px solid #ede8e9`,boxShadow:'0 2px 10px rgba(102,23,35,0.05)',display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:4 }}>{m.name}</div>
                  <div style={{ fontSize:12,color:C.silver,lineHeight:1.5 }}>{m.desc}</div>
                </div>
                <IpBadge ip={m.ip}/>
              </div>
              <div style={{ fontSize:11,color:C.muted,background:C.greyL,padding:'8px 12px',borderRadius:8 }}>
                <strong style={{color:C.dark}}>Evidence required:</strong><br/>{m.ev}
              </div>
              {completed>0 && <div style={{ fontSize:11,color:C.green,fontWeight:600 }}>✓ Completed {completed}× this FY</div>}
              <Btn onClick={()=>setShowForm(m)} small variant="teal">+ Submit Claim</Btn>
            </div>
          );
        })}
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>My Submission History</div>
        {agentMissions.length===0 && <div style={{ textAlign:'center',padding:24,color:C.muted }}>No submissions yet. Submit your first claim above!</div>}
        {agentMissions.map(m=>(
          <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 0',borderBottom:'1px solid #f5f0f1' }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:statusColor(m.status),flexShrink:0 }}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.dark }}>{m.name} <span style={{ fontSize:11,color:C.silver,fontWeight:400 }}>— {m.cat}</span></div>
              <div style={{ fontSize:11,color:C.muted }}>{m.date} {m.dealRef&&m.dealRef!=='N/A'?`· Ref: ${m.dealRef}`:''}</div>
              {m.status==='rejected'&&m.rejectReason&&<div style={{ fontSize:11,color:C.red,marginTop:3,background:C.redL,padding:'4px 8px',borderRadius:6 }}>⚠ {m.rejectReason}</div>}
            </div>
            <Badge label={statusLabel(m.status)} color={statusColor(m.status)} bg={statusBg(m.status)}/>
            <IpBadge ip={m.ip}/>
          </div>
        ))}
      </div>
      <Modal isOpen={!!showForm} onClose={()=>setShowForm(null)} title={showForm?`Submit: ${showForm.name}`:''}>
        {showForm && (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ background:C.coralL,borderRadius:10,padding:'12px 16px' }}>
              <div style={{ fontSize:12,fontWeight:700,color:C.coralD }}>IP Reward: {showForm.ip} IP</div>
              <div style={{ fontSize:12,color:C.dark,marginTop:2 }}>Evidence required: {showForm.ev}</div>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Deal Reference / Salesforce ID <span style={{color:C.silver}}>(if applicable)</span></label>
              <input value={form.dealRef} onChange={e=>setForm(f=>({...f,dealRef:e.target.value}))}
                placeholder="e.g. SF-2025-0142" style={{ width:'100%',border:'1.5px solid #d0cccD',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Notes <span style={{color:C.coral}}>*</span></label>
              <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={4}
                placeholder="Describe the activity and your contribution in detail..." style={{ width:'100%',border:'1.5px solid #d0cccD',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit' }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Evidence File Reference</label>
              <div style={{ border:'2px dashed #d0cccD',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:C.greyL }}
                onClick={()=>setForm(f=>({...f,evidence:`Evidence_${showForm.id}_${Date.now()}.pdf`}))}>
                <Upload size={20} color={C.muted} style={{ margin:'0 auto 6px' }}/>
                <div style={{ fontSize:12,color:C.muted }}>{form.evidence || 'Click to attach evidence file'}</div>
              </div>
            </div>
            <div style={{ display:'flex',gap:10,marginTop:4 }}>
              <Btn onClick={()=>setShowForm(null)} variant="ghost" full>Cancel</Btn>
              <Btn onClick={()=>handleSubmit(showForm)} variant="teal" full><Send size={14}/>Submit Claim</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function WalletView({ agent, missions }) {
  const agentMissions = missions.filter(m=>m.agentId===agent.id);
  const approved = agentMissions.filter(m=>m.status==='approved');
  const totalEarned = approved.reduce((s,m)=>s+m.ip,0);
  const tier = getTier(agent.mrc);

  return (
    <div style={{ padding:'28px 32px',maxWidth:880 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>IP Wallet</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>Your inq.credible Points balance and earning history</div>
      </div>
      <div style={{ background:`linear-gradient(135deg,${C.crimson} 0%,${C.crimson2} 100%)`,borderRadius:18,padding:'28px 32px',marginBottom:22,display:'flex',alignItems:'center',gap:32,flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:11,color:'rgba(255,255,255,0.45)',letterSpacing:2,fontWeight:600,marginBottom:6 }}>AVAILABLE BALANCE</div>
          <div style={{ fontSize:52,fontWeight:900,color:C.coral,fontFamily:'Georgia,serif',lineHeight:1 }}>{agent.ip.toLocaleString()}</div>
          <div style={{ fontSize:13,color:'rgba(255,255,255,0.45)',marginTop:4 }}>inq.credible Points</div>
        </div>
        <div style={{ flex:1,minWidth:200 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22,fontWeight:800,color:C.white,fontFamily:'Georgia,serif' }}>{totalEarned}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.45)' }}>Total Earned FY</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22,fontWeight:800,color:C.white,fontFamily:'Georgia,serif' }}>{approved.length}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.45)' }}>Missions Done</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22,fontWeight:800,color:C.coral,fontFamily:'Georgia,serif' }}>{tier?.title||'—'}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.45)' }}>Current Tier</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)',marginBottom:16 }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Tier Milestone IP Bonuses</div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {TIERS.map(t=>{
            const unlocked = agent.mrc>=t.mrc;
            return (
              <div key={t.id} style={{ flex:'1 1 80px',padding:'12px',borderRadius:10,border:`1.5px solid ${unlocked?t.c:'#ede8e9'}`,background:unlocked?`${t.c}12`:C.greyL,textAlign:'center' }}>
                <div style={{ fontSize:18,fontWeight:800,color:unlocked?t.c:C.muted,fontFamily:'Georgia,serif' }}>{t.ip}</div>
                <div style={{ fontSize:10,fontWeight:700,color:unlocked?t.c:C.muted }}>IP</div>
                <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>{t.title}</div>
                {unlocked && <div style={{ fontSize:10,color:C.green,fontWeight:700,marginTop:3 }}>✓ Earned</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Earnings History</div>
        {approved.length===0 && <div style={{ textAlign:'center',padding:24,color:C.muted }}>No approved missions yet.</div>}
        {approved.map(m=>(
          <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #f5f0f1' }}>
            <div style={{ width:36,height:36,borderRadius:10,background:C.greenL,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <CheckCircle size={16} color={C.green}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.dark }}>{m.name}</div>
              <div style={{ fontSize:11,color:C.silver }}>{m.cat} · {m.date}</div>
            </div>
            <div style={{ fontSize:15,fontWeight:800,color:C.green }}>+{m.ip} IP</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceView({ agent, redemptions, onRedeem }) {
  const [filter, setFilter] = useState('All');
  const [confirm, setConfirm] = useState(null);
  const cats = ['All', ...new Set(MARKET.map(m=>m.cat))];
  const filtered = filter==='All' ? MARKET : MARKET.filter(m=>m.cat===filter);

  return (
    <div style={{ padding:'28px 32px',maxWidth:960 }}>
      <div style={{ marginBottom:24,display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>IP Marketplace</div>
          <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>Redeem your inq.credible Points for rewards. Purchases are reviewed within 3–7 working days.</div>
        </div>
        <div style={{ background:C.crimson,borderRadius:12,padding:'10px 20px',display:'flex',alignItems:'center',gap:10 }}>
          <Zap size={16} color={C.coral}/>
          <span style={{ fontSize:16,fontWeight:800,color:C.coral,fontFamily:'Georgia,serif' }}>{agent.ip.toLocaleString()}</span>
          <span style={{ fontSize:11,color:'rgba(255,255,255,0.5)' }}>IP available</span>
        </div>
      </div>
      <div style={{ display:'flex',gap:8,marginBottom:22,flexWrap:'wrap' }}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{ padding:'8px 18px',borderRadius:30,fontSize:12,fontWeight:700,cursor:'pointer',
            border:'none',background:filter===c?C.crimson:C.greyL,color:filter===c?C.white:C.dark,transition:'all 0.15s' }}>{c}</button>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14,marginBottom:28 }}>
        {filtered.map(item=>{
          const canAfford = agent.ip>=item.ip;
          const catColor = MARKET_CAT_COLORS[item.cat]||C.coral;
          const myRedemptions = redemptions.filter(r=>r.itemId===item.id).length;
          return (
            <div key={item.id} style={{ background:C.white,borderRadius:14,padding:'20px',border:`1px solid ${canAfford?catColor+'33':'#ede8e9'}`,boxShadow:'0 2px 10px rgba(102,23,35,0.05)',display:'flex',flexDirection:'column',gap:12,opacity:canAfford?1:0.6 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                <div style={{ fontSize:28 }}>{item.icon}</div>
                <Badge label={item.cat} color={catColor} bg={`${catColor}18`}/>
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark,marginBottom:4 }}>{item.name}</div>
                <div style={{ fontSize:20,fontWeight:900,color:catColor,fontFamily:'Georgia,serif' }}>{item.ip} <span style={{ fontSize:11,fontWeight:600 }}>IP</span></div>
              </div>
              {myRedemptions>0 && <div style={{ fontSize:11,color:C.green,fontWeight:600 }}>✓ Redeemed {myRedemptions}×</div>}
              <Btn onClick={()=>canAfford&&setConfirm(item)} variant={canAfford?'teal':'ghost'} small full>
                {canAfford?'Redeem Now':'Insufficient IP'}
              </Btn>
            </div>
          );
        })}
      </div>
      {redemptions.length>0 && (
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9' }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>My Redemptions</div>
          {redemptions.map((r,i)=>{
            const item = MARKET.find(m=>m.id===r.itemId);
            return (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f5f0f1' }}>
                <div style={{ fontSize:22 }}>{item?.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.dark }}>{item?.name}</div>
                  <div style={{ fontSize:11,color:C.silver }}>{r.date}</div>
                </div>
                <Badge label={r.status} color={r.status==='approved'?C.green:C.amber} bg={r.status==='approved'?C.greenL:C.amberL}/>
                <div style={{ fontSize:13,fontWeight:700,color:C.red }}>−{item?.ip} IP</div>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={!!confirm} onClose={()=>setConfirm(null)} title="Confirm Redemption" width={440}>
        {confirm && (
          <div style={{ display:'flex',flexDirection:'column',gap:16,textAlign:'center' }}>
            <div style={{ fontSize:48 }}>{confirm.icon}</div>
            <div style={{ fontSize:17,fontWeight:700,color:C.dark }}>{confirm.name}</div>
            <div style={{ background:C.amberL,borderRadius:10,padding:'12px 16px' }}>
              <div style={{ fontSize:13,color:C.amber,fontWeight:600 }}>This will deduct <strong>{confirm.ip} IP</strong> from your wallet</div>
              <div style={{ fontSize:12,color:C.amber,marginTop:2 }}>New balance: {agent.ip-confirm.ip} IP</div>
            </div>
            <div style={{ fontSize:12,color:C.muted }}>Redemption is processed within 3–7 working days. Time-off items require line manager approval.</div>
            <div style={{ display:'flex',gap:10 }}>
              <Btn onClick={()=>setConfirm(null)} variant="ghost" full>Cancel</Btn>
              <Btn onClick={()=>{onRedeem(confirm);setConfirm(null);}} variant="success" full><CheckCircle size={14}/>Confirm</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function LeaderboardView({ agents, currentAgentId, missions }) {
  const [view, setView] = useState('ip');
  const ranked = [...agents].sort((a,b)=>view==='ip'?b.ip-a.ip:b.mrc-a.mrc);
  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{ padding:'28px 32px',maxWidth:800 }}>
      <div style={{ marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Leaderboard</div>
          <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>FY 2025/26 standings — updated in real time</div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {[['ip','By IP Balance'],['mrc','By MRC Generated']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{ padding:'8px 16px',borderRadius:30,fontSize:12,fontWeight:700,cursor:'pointer',
              border:'none',background:view===k?C.crimson:C.greyL,color:view===k?C.white:C.dark }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex',gap:14,marginBottom:24,justifyContent:'center',flexWrap:'wrap' }}>
        {ranked.slice(0,3).map((a,i)=>{
          const t = getTier(a.mrc);
          return (
            <div key={a.id} style={{ background:i===0?C.crimson:C.white,borderRadius:14,padding:'20px 24px',flex:'1 1 180px',maxWidth:220,
              border:`2px solid ${i===0?C.coral:'#ede8e9'}`,boxShadow:'0 4px 16px rgba(102,23,35,0.1)',textAlign:'center' }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{medals[i]||''}</div>
              <Avatar name={a.name} size={44} bg={i===0?C.crimson2:C.greyL}/>
              <div style={{ fontSize:13,fontWeight:700,color:i===0?C.white:C.dark,marginTop:8 }}>{a.name.split(' ')[0]}</div>
              <div style={{ fontSize:10,color:i===0?'rgba(255,255,255,0.45)':C.silver }}>{a.dept}</div>
              <div style={{ fontSize:22,fontWeight:900,color:i===0?C.coral:C.dark,fontFamily:'Georgia,serif',marginTop:8 }}>
                {view==='ip'?a.ip.toLocaleString():ngn(a.mrc)}
              </div>
              <div style={{ fontSize:10,color:i===0?'rgba(255,255,255,0.45)':C.silver }}>{view==='ip'?'IP':'MRC'}</div>
              {t&&<div style={{ fontSize:10,fontWeight:700,color:t.c,marginTop:4,background:`${t.c}18`,padding:'2px 8px',borderRadius:20,display:'inline-block' }}>{t.title}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ background:C.white,borderRadius:14,border:'1px solid #ede8e9',overflow:'hidden',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
        {ranked.map((a,i)=>{
          const t = getTier(a.mrc);
          const isMe = a.id===currentAgentId;
          return (
            <div key={a.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 20px',
              background:isMe?`rgba(255,73,82,0.05)`:'transparent',borderBottom:'1px solid #f5f0f1',
              borderLeft:isMe?`3px solid ${C.coral}`:'3px solid transparent' }}>
              <div style={{ width:28,fontSize:isMe?16:14,fontWeight:800,color:i<3?[C.coral,C.silver,'#CD7F32'][i]:C.muted,textAlign:'center' }}>
                {i<3?medals[i]:i+1}
              </div>
              <Avatar name={a.name} size={36} bg={isMe?C.coral:C.greyL}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark,display:'flex',alignItems:'center',gap:6 }}>
                  {a.name} {isMe&&<span style={{ fontSize:10,color:C.coral,fontWeight:700 }}>(you)</span>}
                </div>
                <div style={{ fontSize:11,color:C.silver }}>{a.dept} {t&&`· ${t.title}`}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:16,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>
                  {view==='ip'?a.ip.toLocaleString():ngn(a.mrc)}
                </div>
                <div style={{ fontSize:10,color:C.muted }}>{view==='ip'?'IP':'MRC'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementsView({ announcements }) {
  return (
    <div style={{ padding:'28px 32px',maxWidth:800 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Announcements</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>SOS programme updates and news from HCM</div>
      </div>
      {announcements.map(a=>(
        <div key={a.id} style={{ background:C.white,borderRadius:14,padding:'22px 24px',border:`1px solid ${a.pinned?C.coral+'44':'#ede8e9'}`,
          boxShadow:'0 2px 10px rgba(102,23,35,0.05)',marginBottom:14,
          borderLeft:`4px solid ${a.pinned?C.coral:C.crimson3}` }}>
          {a.pinned && <div style={{ fontSize:11,color:C.coralD,fontWeight:700,marginBottom:6,display:'flex',alignItems:'center',gap:4 }}><Star size={12} fill={C.coralD}/> PINNED</div>}
          <div style={{ fontSize:16,fontWeight:700,color:C.dark,marginBottom:6 }}>{a.title}</div>
          <div style={{ fontSize:13,color:C.silver,lineHeight:1.65,marginBottom:10 }}>{a.body}</div>
          <div style={{ fontSize:11,color:C.muted }}>{a.author} · {a.date}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN VIEWS ─────────────────────────────────────────────────────────────
function AdminOverview({ agents, missions }) {
  const pending = missions.filter(m=>m.status==='pending');
  const approved = missions.filter(m=>m.status==='approved');
  const totalIp = agents.reduce((s,a)=>s+a.ip,0);
  const totalMrc = agents.reduce((s,a)=>s+a.mrc,0);

  return (
    <div style={{ padding:'28px 32px',maxWidth:960 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Campaign Overview</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>FY 2025/26 — Live dashboard</div>
      </div>
      <div style={{ display:'flex',gap:14,marginBottom:22,flexWrap:'wrap' }}>
        <Stat label="Active Agents" value={agents.length} sub="registered this FY" icon={Users} accent={C.coral}/>
        <Stat label="Pending Approvals" value={pending.length} sub="awaiting review" icon={Clock} accent={C.amber}/>
        <Stat label="IP Issued" value={totalIp.toLocaleString()} sub="total this FY" icon={Zap} accent={C.crimson3}/>
        <Stat label="Total MRC" value={ngn(totalMrc)} sub="SOS-attributed" icon={TrendingUp} accent={C.green}/>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Agent Leaderboard</div>
          {[...agents].sort((a,b)=>b.ip-a.ip).map((a,i)=>{
            const t=getTier(a.mrc);
            const done=missions.filter(m=>m.agentId===a.id&&m.status==='approved').length;
            return (
              <div key={a.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #f5f0f1' }}>
                <div style={{ fontSize:13,fontWeight:700,color:i<3?C.coral:C.muted,width:20 }}>{i+1}</div>
                <Avatar name={a.name} size={34} bg={C.crimson}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.name}</div>
                  <div style={{ fontSize:11,color:C.silver }}>{a.dept} · {done} missions</div>
                </div>
                {t&&<Badge label={t.title} color={t.c} bg={`${t.c}18`}/>}
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:C.coral }}>{a.ip} IP</div>
                  <div style={{ fontSize:10,color:C.muted }}>{ngn(a.mrc)} MRC</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Tier Distribution</div>
          {TIERS.map(t=>{
            const count=agents.filter(a=>getTier(a.mrc)?.id===t.id).length;
            return (
              <div key={t.id} style={{ marginBottom:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:600,marginBottom:5 }}>
                  <span style={{ color:t.c }}>{t.title}</span>
                  <span style={{ color:C.dark }}>{count} agent{count!==1?'s':''}</span>
                </div>
                <ProgressBar value={count} max={agents.length||1} color={t.c}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApprovalsView({ missions, agents, onApprove, onReject }) {
  const [detail, setDetail] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const pending = missions.filter(m=>m.status==='pending');
  const getAgent = id => agents.find(a=>a.id===id);

  return (
    <div style={{ padding:'28px 32px',maxWidth:900 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Approval Queue</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>{pending.length} submission{pending.length!==1?'s':''} awaiting review</div>
      </div>
      {pending.length===0 && (
        <div style={{ textAlign:'center',padding:'60px 0',color:C.muted }}>
          <CheckCircle size={40} color={C.green} style={{ margin:'0 auto 12px' }}/>
          <div style={{ fontSize:15,fontWeight:600,color:C.green }}>All clear! No pending submissions.</div>
        </div>
      )}
      {pending.map(m=>{
        const agent = getAgent(m.agentId);
        return (
          <div key={m.id} style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:`1px solid ${C.amberL}`,boxShadow:'0 2px 10px rgba(102,23,35,0.05)',marginBottom:12 }}>
            <div style={{ display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap' }}>
              {agent && <Avatar name={agent.name} size={42} bg={C.crimson}/>}
              <div style={{ flex:1,minWidth:200 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:C.dark }}>{m.name}</div>
                  <Badge label={m.cat} color={C.amber} bg={C.amberL}/>
                  <IpBadge ip={m.ip}/>
                </div>
                <div style={{ fontSize:12,color:C.silver,marginBottom:6 }}>
                  {agent?.name} · {agent?.dept} · Submitted {m.date}
                  {m.dealRef&&m.dealRef!=='N/A'&&<span> · Ref: <strong style={{color:C.dark}}>{m.dealRef}</strong></span>}
                </div>
                <div style={{ fontSize:12,color:C.dark,background:C.greyL,padding:'8px 12px',borderRadius:8,marginBottom:10 }}>{m.notes}</div>
                <div style={{ fontSize:11,color:C.muted,display:'flex',alignItems:'center',gap:4 }}>
                  <FileText size={12}/> Evidence: <strong style={{color:C.dark}}>{m.evidence}</strong>
                </div>
              </div>
              <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                <Btn onClick={()=>setDetail({...m,action:'reject'})} variant="ghost" small><XCircle size={14} color={C.red}/> Reject</Btn>
                <Btn onClick={()=>onApprove(m.id)} variant="success" small><CheckCircle size={14}/> Approve</Btn>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop:28 }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>All Submissions Log</div>
        <div style={{ background:C.white,borderRadius:14,border:'1px solid #ede8e9',overflow:'hidden' }}>
          {missions.filter(m=>m.status!=='pending').map(m=>{
            const agent=getAgent(m.agentId);
            return (
              <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:'1px solid #f5f0f1' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:statusColor(m.status),flexShrink:0 }}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                    {m.name} <span style={{ fontWeight:400,color:C.silver }}>— {agent?.name}</span>
                  </div>
                  <div style={{ fontSize:11,color:C.muted }}>{m.date} · {m.cat}</div>
                </div>
                <Badge label={statusLabel(m.status)} color={statusColor(m.status)} bg={statusBg(m.status)}/>
                <IpBadge ip={m.ip}/>
              </div>
            );
          })}
        </div>
      </div>
      <Modal isOpen={!!detail&&detail.action==='reject'} onClose={()=>{setDetail(null);setRejectNote('');}} title="Reject Submission" width={480}>
        {detail && (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ background:C.redL,borderRadius:10,padding:'12px 16px' }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.red }}>{detail.name}</div>
              <div style={{ fontSize:12,color:C.red,marginTop:2 }}>{getAgent(detail.agentId)?.name}</div>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Reason for rejection (sent to agent) <span style={{color:C.coral}}>*</span></label>
              <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} rows={4}
                placeholder="Explain clearly what evidence is missing or incorrect..." style={{ width:'100%',border:'1.5px solid #d0cccD',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit' }}/>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <Btn onClick={()=>{setDetail(null);setRejectNote('');}} variant="ghost" full>Cancel</Btn>
              <Btn onClick={()=>{if(!rejectNote.trim()){alert('Please provide a rejection reason.');return;}onReject(detail.id,rejectNote);setDetail(null);setRejectNote('');}} variant="danger" full>Reject Submission</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AdminAgentsView({ agents, missions }) {
  return (
    <div style={{ padding:'28px 32px',maxWidth:960 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Agent Directory</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>{agents.length} registered SOS agents this FY</div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14 }}>
        {agents.map(a=>{
          const t=getTier(a.mrc); const nt=getNextTier(a.mrc);
          const done=missions.filter(m=>m.agentId===a.id&&m.status==='approved').length;
          const pend=missions.filter(m=>m.agentId===a.id&&m.status==='pending').length;
          return (
            <div key={a.id} style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
                <Avatar name={a.name} size={44} bg={C.crimson}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.name}</div>
                  <div style={{ fontSize:11,color:C.silver,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.role}</div>
                  <div style={{ fontSize:10,color:C.muted }}>{a.dept}</div>
                </div>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:12 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:18,fontWeight:800,color:C.coral,fontFamily:'Georgia,serif' }}>{a.ip}</div>
                  <div style={{ fontSize:10,color:C.muted }}>IP Balance</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:18,fontWeight:800,color:C.green,fontFamily:'Georgia,serif' }}>{done}</div>
                  <div style={{ fontSize:10,color:C.muted }}>Approved</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:18,fontWeight:800,color:C.amber,fontFamily:'Georgia,serif' }}>{pend}</div>
                  <div style={{ fontSize:10,color:C.muted }}>Pending</div>
                </div>
              </div>
              {t && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4 }}>
                    <Badge label={t.title} color={t.c} bg={`${t.c}18`}/>
                    <span style={{ fontSize:11,color:C.muted }}>{ngn(a.mrc)}</span>
                  </div>
                  {nt && <ProgressBar value={a.mrc} max={nt.mrc} color={t.c}/>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminReportsView({ agents, missions }) {
  const approved = missions.filter(m=>m.status==='approved');
  const byCategory = MISSION_CATS.map(c=>({
    label:c.label, count:approved.filter(m=>m.cat===c.label).length, ip:approved.filter(m=>m.cat===c.label).reduce((s,m)=>s+m.ip,0), color:c.color
  }));
  const totalIpIssued = approved.reduce((s,m)=>s+m.ip,0);
  const totalMrc = agents.reduce((s,a)=>s+a.mrc,0);
  const annualRevenue = totalMrc*12;
  const estBudget = 7303766;

  return (
    <div style={{ padding:'28px 32px',maxWidth:900 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Campaign Reports</div>
        <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>KPI tracking and performance summary — FY 2025/26</div>
      </div>
      <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)',marginBottom:18 }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:16 }}>KPI Progress — Base Case Targets</div>
        {[
          {label:'Employee Participation Rate', value:agents.length, target:20, targetLabel:'20 agents (base)', color:C.coral},
          {label:'Total SOS-Attributable MRC',  value:totalMrc, target:10300000, targetLabel:ngn(10300000)+' (base)', color:C.crimson3, fmt:ngn},
          {label:'Missions Completed This FY',  value:approved.length, target:30, targetLabel:'30 missions', color:C.green},
          {label:'IP Issued This FY',           value:totalIpIssued, target:3000, targetLabel:'3,000 IP', color:C.purple},
        ].map(k=>(
          <div key={k.label} style={{ marginBottom:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:600,marginBottom:5 }}>
              <span style={{ color:C.dark }}>{k.label}</span>
              <span style={{ color:k.color }}>{k.fmt?k.fmt(k.value):k.value.toLocaleString()} / {k.targetLabel}</span>
            </div>
            <ProgressBar value={k.value} max={k.target} color={k.color}/>
          </div>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18 }}>
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Missions by Category</div>
          {byCategory.map(c=>(
            <div key={c.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4 }}>
                <span style={{ fontWeight:600,color:c.color }}>{c.label}</span>
                <span style={{ color:C.dark }}>{c.count} · {c.ip} IP</span>
              </div>
              <ProgressBar value={c.count} max={Math.max(...byCategory.map(x=>x.count),1)} color={c.color}/>
            </div>
          ))}
        </div>
        <div style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:'1px solid #ede8e9',boxShadow:'0 2px 10px rgba(102,23,35,0.05)' }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark,marginBottom:14 }}>Financial Summary</div>
          {[
            {label:'Total SOS MRC (monthly)', value:ngn(totalMrc),    color:C.coral},
            {label:'Projected Annual Revenue',value:ngn(annualRevenue),color:C.crimson3},
            {label:'Campaign Budget (Base)',   value:ngn(estBudget),   color:C.amber},
            {label:'Estimated ROI',            value:'14.4×',          color:C.green},
            {label:'Total IP Issued FY',       value:totalIpIssued+' IP',color:C.purple},
          ].map(f=>(
            <div key={f.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid #f5f0f1' }}>
              <span style={{ fontSize:12,color:C.silver }}>{f.label}</span>
              <span style={{ fontSize:14,fontWeight:800,color:f.color,fontFamily:'Georgia,serif' }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAnnouncementsView({ announcements, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', body:'' });
  return (
    <div style={{ padding:'28px 32px',maxWidth:800 }}>
      <div style={{ marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:22,fontWeight:800,color:C.dark,fontFamily:'Georgia,serif' }}>Announcements</div>
          <div style={{ fontSize:13,color:C.silver,marginTop:3 }}>Publish updates to all active SOS agents</div>
        </div>
        <Btn onClick={()=>setShowForm(true)} variant="primary"><Plus size={14}/> New Announcement</Btn>
      </div>
      {announcements.map(a=>(
        <div key={a.id} style={{ background:C.white,borderRadius:14,padding:'20px 22px',border:`1px solid ${a.pinned?C.coral+'44':'#ede8e9'}`,boxShadow:'0 2px 10px rgba(102,23,35,0.05)',marginBottom:14,borderLeft:`4px solid ${a.pinned?C.coral:C.crimson3}` }}>
          {a.pinned && <div style={{ fontSize:11,color:C.coralD,fontWeight:700,marginBottom:6 }}>📌 PINNED</div>}
          <div style={{ fontSize:15,fontWeight:700,color:C.dark,marginBottom:6 }}>{a.title}</div>
          <div style={{ fontSize:13,color:C.silver,lineHeight:1.65,marginBottom:10 }}>{a.body}</div>
          <div style={{ fontSize:11,color:C.muted }}>{a.author} · {a.date}</div>
        </div>
      ))}
      <Modal isOpen={showForm} onClose={()=>{setShowForm(false);setForm({title:'',body:''});}} title="New Announcement" width={540}>
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Title</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Announcement title"
              style={{ width:'100%',border:'1.5px solid #d0cccD',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',boxSizing:'border-box' }}/>
          </div>
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:C.dark,display:'block',marginBottom:6 }}>Message</label>
            <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} rows={5} placeholder="Write your announcement..."
              style={{ width:'100%',border:'1.5px solid #d0cccD',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit' }}/>
          </div>
          <div style={{ display:'flex',gap:10 }}>
            <Btn onClick={()=>{setShowForm(false);setForm({title:'',body:''});}} variant="ghost" full>Cancel</Btn>
            <Btn onClick={()=>{if(!form.title||!form.body){alert('Please fill in both fields.');return;}onAdd(form);setShowForm(false);setForm({title:'',body:''});}} variant="crimson" full><Send size={14}/>Publish</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('auth');
  const [role, setRole] = useState(null);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const saved = await window.storage.get('sos_portal_v2');
        const d = saved ? JSON.parse(saved.value) : seed();
        setData(d);
      } catch { setData(seed()); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!data) return;
    window.storage.set('sos_portal_v2', JSON.stringify(data)).catch(()=>{});
  }, [data]);

  function showToast(message, type='success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── AUTH HANDLERS ──
  function handleLogin(email, password) {
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showToast('No account found with that email address.', 'error');
      return;
    }
    if (user.password !== password) {
      showToast('Incorrect password. Please try again.', 'error');
      return;
    }
    const r = user.accountType;
    setRole(r);
    setCurrentAgentId(user.id);
    setActiveView(r==='agent'?'dashboard':'overview');
    setScreen(r);
    showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
  }

  function handleSignup({ email, password, name, dept, role: jobTitle }) {
    // Check duplicate
    if (data.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('An account already exists with this email address.', 'error');
      return;
    }
    const newId = genId('U');
    const newUser = {
      id: newId, email, password, name, role: jobTitle, dept,
      ip: 0, mrc: 0, accountType: 'agent',
    };
    const newAgent = { id: newId, name, role: jobTitle, dept, ip: 0, mrc: 0 };

    setData(d => ({
      ...d,
      users: [...d.users, newUser],
      agents: [...d.agents, newAgent],
    }));

    // Send onboarding email (simulated)
    const emailResult = simulateEmail('onboarding', { email, name, tier: '—' });
    console.log('[ONBOARDING EMAIL TEMPLATE]', emailResult);

    showToast(`Account created! Welcome to SOS, ${name.split(' ')[0]}. Check your email for onboarding details.`, 'success');

    // Auto-login after signup
    setTimeout(() => {
      setRole('agent');
      setCurrentAgentId(newId);
      setActiveView('dashboard');
      setScreen('agent');
    }, 1500);
  }

  function handleResetPassword(action, payload) {
    if (action === 'request') {
      const user = data.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
      if (!user) {
        // Don't reveal if email exists — just show success (security best practice)
        showToast('If that email exists, a reset code has been sent.', 'success');
        return;
      }
      const token = genToken();
      const expiry = Date.now() + 30 * 60 * 1000; // 30 min
      setData(d => ({
        ...d,
        passwordResets: [
          ...(d.passwordResets||[]).filter(r=>r.email!==payload.email),
          { email: payload.email, token, expiry }
        ]
      }));
      // Send password reset email (simulated)
      const emailResult = simulateEmail('passwordReset', { email: user.email, name: user.name, token });
      console.log('[PASSWORD RESET EMAIL TEMPLATE]', emailResult);
      showToast(`Reset code sent to ${payload.email}. Check your inbox.`, 'success');
    }

    if (action === 'confirm') {
      const reset = (data.passwordResets||[]).find(r =>
        r.email.toLowerCase() === payload.email.toLowerCase() &&
        r.token === payload.token &&
        r.expiry > Date.now()
      );
      if (!reset) {
        showToast('Invalid or expired reset code. Please request a new one.', 'error');
        return;
      }
      setData(d => ({
        ...d,
        users: d.users.map(u => u.email.toLowerCase()===payload.email.toLowerCase() ? {...u, password: payload.newPassword} : u),
        passwordResets: (d.passwordResets||[]).filter(r=>r.email!==payload.email),
      }));
      showToast('Password updated successfully! You can now sign in.', 'success');
      setTimeout(() => setScreen('auth'), 1000);
    }
  }

  function logout() { setScreen('auth'); setRole(null); setCurrentAgentId(null); setActiveView('dashboard'); }

  function submitMission(payload) {
    const newMission = {
      id: 'MS'+Date.now(), agentId: currentAgentId, status: 'pending',
      date: new Date().toISOString().split('T')[0], ...payload,
    };
    setData(d => ({ ...d, missions: [...d.missions, newMission] }));
    showToast('Claim submitted! You\'ll be notified when it\'s reviewed.', 'success');
  }

  function approveMission(missionId) {
    setData(d => {
      const m = d.missions.find(x=>x.id===missionId);
      if (!m) return d;
      return {
        ...d,
        missions: d.missions.map(x=>x.id===missionId?{...x,status:'approved'}:x),
        agents: d.agents.map(a=>a.id===m.agentId?{...a,ip:a.ip+m.ip}:a),
        users: d.users.map(u=>u.id===m.agentId?{...u,ip:u.ip+m.ip}:u),
      };
    });
    showToast(`Approved! ${data.missions.find(m=>m.id===missionId)?.ip||0} IP credited to agent.`, 'success');
  }

  function rejectMission(missionId, reason) {
    setData(d => ({
      ...d,
      missions: d.missions.map(x=>x.id===missionId?{...x,status:'rejected',rejectReason:reason}:x),
    }));
    showToast('Submission rejected. Agent has been notified.', 'error');
  }

  function redeemItem(item) {
    setData(d => ({
      ...d,
      agents: d.agents.map(a=>a.id===currentAgentId?{...a,ip:Math.max(0,a.ip-item.ip)}:a),
      users: d.users.map(u=>u.id===currentAgentId?{...u,ip:Math.max(0,u.ip-item.ip)}:u),
      redemptions: [...d.redemptions, { itemId:item.id, agentId:currentAgentId, date:new Date().toISOString().split('T')[0], status:'pending' }],
    }));
    showToast(`${item.name} redeemed! Processing within 3–7 working days.`, 'success');
  }

  function addAnnouncement(form) {
    setData(d => ({
      ...d,
      announcements: [{ id:'AN'+Date.now(), title:form.title, body:form.body, date:new Date().toISOString().split('T')[0], author:'HCM Admin', pinned:false }, ...d.announcements],
    }));
    showToast('Announcement published to all agents.', 'success');
  }

  if (!data) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:C.crimson,color:C.coral,fontSize:16,fontFamily:'Georgia,serif',letterSpacing:2 }}>
      Loading SOS Portal…
    </div>
  );

  if (screen==='auth') return (
    <>
      <AuthScreen onLogin={handleLogin} onSignup={handleSignup} onResetPassword={handleResetPassword}/>
      <Toast {...(toast||{})} onClose={()=>setToast(null)}/>
    </>
  );

  const currentAgent = data.agents.find(a=>a.id===currentAgentId) || data.agents[0];
  const pendingCount = data.missions.filter(m=>m.status==='pending').length;
  const agentRedemptions = data.redemptions.filter(r=>r.agentId===currentAgentId);

  const agentNav = [
    { id:'dashboard',     label:'Dashboard',     icon:Home    },
    { id:'missions',      label:'Missions',       icon:Target  },
    { id:'wallet',        label:'IP Wallet',      icon:Wallet  },
    { id:'marketplace',   label:'Marketplace',    icon:ShoppingBag },
    { id:'leaderboard',   label:'Leaderboard',    icon:Trophy  },
    { id:'announcements', label:'Announcements',  icon:Bell, badge:data.announcements.filter(a=>a.pinned).length },
  ];
  const adminNav = [
    { id:'overview',      label:'Overview',       icon:BarChart3 },
    { id:'approvals',     label:'Approvals',      icon:CheckCircle, badge:pendingCount },
    { id:'agents',        label:'Agents',         icon:Users   },
    { id:'reports',       label:'Reports',        icon:TrendingUp },
    { id:'announcements', label:'Announcements',  icon:Bell    },
  ];

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:C.bg,fontFamily:'Trebuchet MS,Tahoma,sans-serif' }}>
      <Sidebar items={role==='agent'?agentNav:adminNav} active={activeView} onSelect={setActiveView}
        agent={currentAgent} onLogout={logout} role={role}/>

      <div style={{ flex:1,overflowY:'auto',minHeight:'100vh' }}>
        {/* Top bar */}
        <div style={{ background:C.white,borderBottom:'1px solid #ede8e9',padding:'0 32px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100 }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.dark }}>
            {role==='agent'
              ? ['Dashboard','Missions','IP Wallet','Marketplace','Leaderboard','Announcements'][agentNav.findIndex(n=>n.id===activeView)]
              : ['Overview','Approvals','Agents','Reports','Announcements'][adminNav.findIndex(n=>n.id===activeView)]}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            {pendingCount>0 && role==='admin' && (
              <button onClick={()=>setActiveView('approvals')} style={{ background:C.amberL,border:`1px solid ${C.amber}44`,borderRadius:20,padding:'5px 14px',fontSize:12,fontWeight:700,color:C.amber,cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
                <Clock size={13}/> {pendingCount} pending
              </button>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Avatar name={role==='admin'?'HCM Admin':currentAgent?.name||'User'} size={32} bg={C.crimson}/>
              <div style={{ fontSize:12,fontWeight:600,color:C.dark }}>{role==='admin'?'HCM Admin':currentAgent?.name?.split(' ')[0]||'Agent'}</div>
            </div>
          </div>
        </div>

        {/* Views */}
        {role==='agent' && activeView==='dashboard'     && <DashboardView agent={currentAgent} missions={data.missions} onNav={setActiveView} onNewClaim={()=>setActiveView('missions')}/>}
        {role==='agent' && activeView==='missions'      && <MissionsView agent={currentAgent} missions={data.missions} onSubmit={submitMission}/>}
        {role==='agent' && activeView==='wallet'        && <WalletView agent={currentAgent} missions={data.missions}/>}
        {role==='agent' && activeView==='marketplace'   && <MarketplaceView agent={currentAgent} redemptions={agentRedemptions} onRedeem={redeemItem}/>}
        {role==='agent' && activeView==='leaderboard'   && <LeaderboardView agents={data.agents} currentAgentId={currentAgentId} missions={data.missions}/>}
        {role==='agent' && activeView==='announcements' && <AnnouncementsView announcements={data.announcements}/>}

        {role==='admin' && activeView==='overview'      && <AdminOverview agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='approvals'     && <ApprovalsView missions={data.missions} agents={data.agents} onApprove={approveMission} onReject={rejectMission}/>}
        {role==='admin' && activeView==='agents'        && <AdminAgentsView agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='reports'       && <AdminReportsView agents={data.agents} missions={data.missions}/>}
        {role==='admin' && activeView==='announcements' && <AdminAnnouncementsView announcements={data.announcements} onAdd={addAnnouncement}/>}
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={()=>setToast(null)}/>
    </div>
  );
}
