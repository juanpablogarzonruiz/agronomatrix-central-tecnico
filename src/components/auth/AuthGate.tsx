import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Smartphone, AlertCircle, Clock, ArrowRight, BadgeCheck, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoUrl from '../../Logo Agronomatrix .png';

export const AuthGate: React.FC = () => {
  const { step, pendingUser, verifyCredentials, verifyGoogleAuthenticator, cancelTwoFactor, loginError, setLoginError, remainingSeconds, signInGoogle } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'totp') {
      setTotpDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    }
  }, [step]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsVerifyingCredentials(true); setLoginError(null);
    await verifyCredentials(emailInput, passwordInput);
    setIsVerifyingCredentials(false);
  };

  const handleDigitChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, ''); const next = [...totpDigits];
    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
      setTotpDigits(next); inputRefs.current[Math.min(pasted.length, 5)]?.focus(); return;
    }
    next[index] = sanitized; setTotpDigits(next);
    if (sanitized && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleTotpSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); const code = totpDigits.join('');
    if (code.length !== 6) { setLoginError('Por favor ingresa los 6 dígitos generados por Google Authenticator.'); return; }
    setIsVerifyingTotp(true); setLoginError(null);
    const res = await verifyGoogleAuthenticator(code); setIsVerifyingTotp(false);
    if (!res.success) inputRefs.current[0]?.focus();
  };

  return (
    <main className="auth-screen">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <img src={logoUrl} alt="Agronomatrix" className="auth-brand-logo" />
          <span className="auth-eyebrow">Portal Técnico · Central de Beneficio</span>
          <h1>Agronomatrix</h1>
          <p>Gestión agroindustrial y trazabilidad para fortalecer el origen del cacao.</p>
          <div className="auth-cacao-mark" aria-hidden="true"><span>✳</span><span>◉</span><span>✳</span></div>
          <div className="auth-brand-foot"><ShieldCheck size={17} /> Acceso seguro a la operación cacaotera</div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><img src={logoUrl} alt="" /><strong>AGRONOMATRIX</strong></div>
          <div className="auth-form-heading">
            <span className="auth-step-label"><ShieldCheck size={16} /> {step === 'credentials' ? 'ACCESO SEGURO' : 'VERIFICACIÓN EN DOS PASOS'}</span>
            <h2>{step === 'credentials' ? 'Bienvenido de nuevo' : 'Verifica tu identidad'}</h2>
            <p>{step === 'credentials' ? 'Ingresa tus credenciales para acceder al portal técnico.' : 'Confirma el código de Google Authenticator para continuar.'}</p>
          </div>

          {step === 'credentials' && <>
            <form onSubmit={handleCredentialsSubmit} className="auth-form">
              <label className="auth-field"><span><Mail size={16} /> Correo electrónico o usuario</span><input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="nombre@asociacion.org" autoComplete="username" required /></label>
              <label className="auth-field"><span><Lock size={16} /> Contraseña</span><div className="auth-password-field"><input type={showPassword ? 'text' : 'password'} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Ingresa tu contraseña" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              {loginError && <div role="alert" className="auth-error"><AlertCircle size={18} /><span>{loginError}</span></div>}
              <button type="submit" disabled={isVerifyingCredentials} className="auth-primary-button">{isVerifyingCredentials ? <><span className="auth-spinner" />Validando credenciales...</> : <>Ingresar al portal <ArrowRight size={17} /></>}</button>
            </form>
            <div className="auth-divider"><span>o continúa con</span></div>
            <button type="button" onClick={() => void signInGoogle()} className="auth-google-button"><span className="google-g">G</span> Continuar con Google</button>
            <p className="auth-security-note"><ShieldCheck size={14} /> El acceso requiere una cuenta autorizada y validación de seguridad.</p>
          </>}

          {step === 'totp' && pendingUser && <form onSubmit={handleTotpSubmit} className="auth-form">
            <div className="auth-account-card"><div className="auth-avatar">{pendingUser.name.slice(0, 2).toUpperCase()}</div><div className="auth-account-info"><strong>{pendingUser.name}</strong><span>{pendingUser.email}</span><small>{pendingUser.role}</small></div><div className="auth-countdown"><Clock size={15} /> {remainingSeconds}s</div></div>
            <label className="auth-field"><span><Smartphone size={16} /> Código de Google Authenticator <small>6 dígitos</small></span></label>
            <div className="auth-totp-inputs">{totpDigits.map((digit, index) => <input key={index} ref={el => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digit} onChange={e => handleDigitChange(index, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !totpDigits[index] && index > 0) inputRefs.current[index - 1]?.focus(); if (e.key === 'Enter') void handleTotpSubmit(); }} aria-label={`Dígito ${index + 1}`} />)}</div>
            <p className="auth-helper">Ingresa el código dinámico generado en la aplicación Google Authenticator vinculada a tu cuenta.</p>
            {loginError && <div role="alert" className="auth-error"><AlertCircle size={18} /><span>{loginError}</span></div>}
            <button type="submit" disabled={isVerifyingTotp} className="auth-primary-button">{isVerifyingTotp ? <><span className="auth-spinner" />Verificando código...</> : <><BadgeCheck size={18} /> Verificar y entrar <ArrowRight size={17} /></>}</button>
            <button type="button" onClick={cancelTwoFactor} className="auth-back-button"><ArrowLeft size={16} /> Volver y cambiar cuenta</button>
          </form>}
          <footer className="auth-form-footer">Ecosistema seguro Agronomatrix · Conexión cifrada</footer>
        </div>
      </section>
    </main>
  );
};
