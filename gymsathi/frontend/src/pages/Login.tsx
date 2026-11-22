import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Check, Dumbbell, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store";
import { loginUser, registerUser } from "../store/authSlice";
import { createWorkspace } from "../store/gymSlice";
import { joiErrors, loginSchema, registerSchema } from "../validation";

type AuthForm = { name: string; gymName: string; email: string; password: string };
const demoForm: AuthForm = { name: "Alex Morgan", gymName: "Studio North", email: "owner@studionorth.fit", password: "demo1234" };

export default function Login() {
  const [createAccount, setCreateAccount] = useState(false);
  const [form, setForm] = useState<AuthForm>(demoForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const schema = createAccount ? registerSchema : loginSchema;
    const { error: validationError } = schema.validate(form, { abortEarly: false });
    setErrors(joiErrors(validationError));
    if (validationError) return;
    try {
      if (createAccount) {
        await dispatch(registerUser(form)).unwrap();
        dispatch(createWorkspace({ name: form.gymName, address: "", phone: "", email: form.email, currency: "INR" }));
      } else {
        await dispatch(loginUser({ email: form.email, password: form.password })).unwrap();
      }
      navigate("/", { replace: true });
    } catch {
      // Redux keeps the server message close to the form.
    }
  }

  return <main className="auth-screen"><section className="auth-visual"><div className="auth-brand"><span className="brand-mark"><Dumbbell size={19} strokeWidth={2.5} /></span>gymsathi</div><div className="auth-art-orbit orbit-a" /><div className="auth-art-orbit orbit-b" /><div className="auth-art-content"><span className="eyebrow light-eyebrow"><Sparkles size={13} /> YOUR STUDIO, IN SYNC</span><h1>Make room for<br /><em>stronger days.</em></h1><p>Good gyms are built on good routines. Bring your members, your team and your day into one steady rhythm.</p><div className="auth-proof"><div className="proof-avatars"><span>AS</span><span>RK</span><span>MI</span><span>+9</span></div><span>Made for the people who<br />make everyone stronger.</span></div></div><div className="auth-visual-footer"><span>BUILT FOR YOUR GYM FLOOR</span><span>01 — 04</span></div></section>
    <section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-form-top"><div className="auth-mobile-brand"><span className="brand-mark"><Dumbbell size={18} /></span>gymsathi</div><span className="secure-label"><LockKeyhole size={13} /> SECURE WORKSPACE</span></div><div className="auth-title"><span className="section-kicker">{createAccount ? "A FRESH START" : "WELCOME BACK"}</span><h2>{createAccount ? "Build your gym’s home." : "Good to see you again."}</h2><p>{createAccount ? "Set up your workspace in just a few steps." : "Your gym is ready when you are."}</p></div>
      <form className="auth-form" onSubmit={submit} noValidate>{createAccount && <><label className="field">Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" />{errors.name && <small className="field-error">{errors.name}</small>}</label><label className="field">Gym or studio name<input value={form.gymName} onChange={(event) => setForm({ ...form, gymName: event.target.value })} placeholder="Studio North" />{errors.gymName && <small className="field-error">{errors.gymName}</small>}</label></>}
        <label className="field">Work email<div className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@yourgym.com" /></div>{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <label className="field">Password<div className="auth-input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete={createAccount ? "new-password" : "current-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={createAccount ? "At least 8 characters" : "Enter your password"} /></div>{errors.password && <small className="field-error">{errors.password}</small>}</label>
        {!createAccount && <div className="auth-remember"><label><input type="checkbox" defaultChecked /> Keep me signed in</label><span><Check size={13} /> Private & secure</span></div>}
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="button button-primary auth-submit" disabled={loading}>{loading ? "One moment..." : createAccount ? "Create workspace" : "Sign in to your gym"}<ArrowRight size={16} /></button>
      </form>
      <div className="auth-switch">{createAccount ? "Already have an account?" : "New to GymSathi?"}<button onClick={() => { setCreateAccount(!createAccount); setErrors({}); }}>{createAccount ? "Sign in" : "Create a workspace"}</button></div>
      {!createAccount && <div className="demo-access"><div className="demo-access-icon">✦</div><div><strong>Just having a look?</strong><p>Explore the workspace with sample gym data.</p></div><button onClick={() => { setForm(demoForm); setErrors({}); }} type="button">Use demo <ArrowRight size={13} /></button></div>}
      <div className="auth-legal">By continuing, you agree to GymSathi’s <span>Terms</span> and <span>Privacy Policy</span>.</div></div><footer className="auth-footer"><span>© {new Date().getFullYear()} GymSathi</span><span>Made for the daily work that matters <i>✦</i></span></footer></section></main>;
}
