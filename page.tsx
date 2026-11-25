 "use client";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";

type Exercise = { name: string; muscles: string; instructions: string[]; setup: string; tips: string[]; };
type Analysis = { machine: string; confidence: string; notes: string; exercises: Exercise[]; };
type SetEntry = { reps: number; weight: number; done: boolean };

const examples: Record<string, Exercise[]> = {
  "Lat pulldown": [
    {name:"Wide-grip lat pulldown",muscles:"Latissimus dorsi · upper back · biceps",setup:"Set thigh pads snugly and choose a comfortable wide bar grip.",instructions:["Sit tall with feet flat and thighs secured.","Pull the bar toward your upper chest by driving elbows down.","Pause briefly, then return slowly until arms are extended."],tips:["Avoid swinging or leaning far backward.","Do not pull the bar behind your neck."]},
    {name:"Close-grip pulldown",muscles:"Lats · biceps",setup:"Attach a close-grip handle and secure your thighs.",instructions:["Keep your chest lifted and torso steady.","Pull the handle toward your upper chest.","Control the return without letting the stack slam."],tips:["Keep wrists neutral.","Use a range of motion that feels comfortable."]}
  ],
  "Chest press": [
    {name:"Seated chest press",muscles:"Pectorals · triceps · anterior deltoids",setup:"Adjust seat so handles align around mid-chest.",instructions:["Keep shoulder blades comfortably supported.","Press forward smoothly without locking elbows hard.","Return slowly until you feel a comfortable chest stretch."],tips:["Keep wrists straight.","Do not force a deep stretch."]}
  ],
  "Leg press": [
    {name:"Leg press",muscles:"Quadriceps · glutes · hamstrings",setup:"Set seat and backrest so hips stay supported.",instructions:["Place feet about shoulder-width on the platform.","Lower with control while keeping heels down and knees tracking with toes.","Press through the whole foot without forcefully locking knees."],tips:["Never let the lower back curl off the pad.","Use a pain-free depth and follow the machine's safety instructions."]}
  ],
  "Cable machine": [
    {name:"Cable triceps pushdown",muscles:"Triceps",setup:"Set pulley high and attach a rope or straight bar.",instructions:["Stand tall with elbows close to your sides.","Extend elbows to move the handle down.","Return slowly while keeping upper arms still."],tips:["Avoid leaning your body weight onto the handle."]},
    {name:"Cable biceps curl",muscles:"Biceps · brachialis",setup:"Set pulley low and choose a suitable handle.",instructions:["Stand upright with elbows near your sides.","Curl the handle toward your shoulders.","Lower slowly without letting the stack drop."],tips:["Avoid swinging your torso."]}
  ],
  "Seated row": [
    {name:"Seated cable row",muscles:"Mid-back · lats · biceps",setup:"Adjust footplates and choose a handle that allows a neutral wrist.",instructions:["Sit tall with knees slightly bent.","Pull handle toward lower ribs while drawing elbows back.","Return slowly without rounding your lower back."],tips:["Avoid excessive torso rocking."]}
  ]
};

const initialSets = (): SetEntry[] => Array.from({length:3},()=>({reps:10,weight:20,done:false}));



function BodyMuscleMap({ exercise }: { exercise: Exercise }) {
  const text = `${exercise.name} ${exercise.muscles}`.toLowerCase();
  const active = {
    chest: /chest|pectoral/.test(text),
    shoulders: /shoulder|deltoid/.test(text),
    biceps: /bicep|curl/.test(text),
    triceps: /tricep/.test(text),
    abs: /core|abdom|oblique|woodchop/.test(text),
    quads: /quad|leg press|leg extension|squat/.test(text),
    glutes: /glute|hip|squat|leg press/.test(text),
    hamstrings: /hamstring|leg curl/.test(text),
    calves: /calf|calves/.test(text),
    lats: /lat|pulldown|row/.test(text),
    upperBack: /upper back|mid-back|trape|rear delt|face pull|row/.test(text),
    rearDelts: /rear delt|face pull|row/.test(text)
  };
  const hot = (key: keyof typeof active) => active[key] ? "muscle-hot" : "muscle-cold";
  const muscleLabels = Object.entries(active).filter(([,v])=>v).map(([k])=>({
    chest:"Chest", shoulders:"Shoulders", biceps:"Biceps", triceps:"Triceps", abs:"Core",
    quads:"Quadriceps", glutes:"Glutes", hamstrings:"Hamstrings", calves:"Calves",
    lats:"Lats", upperBack:"Upper back", rearDelts:"Rear deltoids"
  } as Record<string,string>)[k]);
  return <section className="body-map">
    <div className="body-map-head"><div><p className="eyebrow">MUSCLE ACTIVATION MAP</p><h3>Muscles trained</h3></div><span className="muscle-key"><i/> TARGETED</span></div>
    <div className="body-views">
      <div className="body-view"><b>FRONT</b><svg viewBox="0 0 150 260" role="img" aria-label="Front body muscle map">
        <g className="anatomy-base" stroke="#829184" strokeWidth="1.5" fill="#26352c">
          <circle cx="75" cy="20" r="13"/><path d="M62 37 L48 42 L37 87 L48 111 L55 103 L57 78 L60 118 L53 171 L49 236 L65 236 L75 177 L85 236 L101 236 L97 171 L90 118 L93 78 L95 103 L102 111 L113 87 L102 42 L88 37Z"/>
          <path d="M62 37Q75 43 88 37L94 74Q75 83 56 74Z"/>
        </g>
        <g stroke="#b7ff3c" strokeWidth="1.3">
          <path className={hot("shoulders")} d="M48 44Q56 37 64 43L61 61Q51 65 45 57Z M86 43Q94 37 102 44L105 57Q99 65 89 61Z"/>
          <path className={hot("chest")} d="M60 49Q75 43 74 66Q61 73 54 63Z M76 49Q90 43 96 63Q89 73 76 66Z"/>
          <path className={hot("biceps")} d="M43 61L53 65L49 91L42 88Z M97 65L107 61L108 88L101 91Z"/>
          <path className={hot("abs")} d="M64 76L86 76L88 111L62 111Z"/>
          <path className={hot("quads")} d="M59 119L73 119L69 169L56 169Z M77 119L91 119L94 169L81 169Z"/>
          <path className={hot("calves")} d="M56 177L68 177L64 224L52 224Z M82 177L94 177L98 224L86 224Z"/>
        </g>
      </svg></div>
      <div className="body-view"><b>BACK</b><svg viewBox="0 0 150 260" role="img" aria-label="Back body muscle map">
        <g className="anatomy-base" stroke="#829184" strokeWidth="1.5" fill="#26352c">
          <circle cx="75" cy="20" r="13"/><path d="M62 37 L48 42 L37 87 L48 111 L55 103 L57 78 L60 118 L53 171 L49 236 L65 236 L75 177 L85 236 L101 236 L97 171 L90 118 L93 78 L95 103 L102 111 L113 87 L102 42 L88 37Z"/>
          <path d="M62 37Q75 43 88 37L94 74Q75 83 56 74Z"/>
        </g>
        <g stroke="#b7ff3c" strokeWidth="1.3">
          <path className={hot("rearDelts")} d="M48 44Q56 37 64 43L61 59Q51 65 45 57Z M86 43Q94 37 102 44L105 57Q99 65 89 59Z"/>
          <path className={hot("upperBack")} d="M65 43L85 43L91 75L75 87L59 75Z"/>
          <path className={hot("lats")} d="M59 73L73 84L70 115L54 105L51 83Z M77 84L91 73L99 83L96 105L80 115Z"/>
          <path className={hot("triceps")} d="M42 62L52 64L49 91L42 88Z M98 64L108 62L108 88L101 91Z"/>
          <path className={hot("glutes")} d="M58 116Q75 109 75 139L56 145Z M75 139Q75 109 92 116L94 145Z"/>
          <path className={hot("hamstrings")} d="M58 146L73 143L69 177L56 178Z M77 143L92 146L94 178L81 177Z"/>
          <path className={hot("calves")} d="M56 180L68 180L64 224L52 224Z M82 180L94 180L98 224L86 224Z"/>
        </g>
      </svg></div>
    </div>
    <div className="muscle-legend">{muscleLabels.length?muscleLabels.map(x=><span key={x}>{x}</span>):<span>Muscle targets not confidently mapped — check exercise guidance.</span>}</div>
    <p className="map-disclaimer">Illustrative muscle groups, not a clinical anatomy display. Highlighting is inferred from the exercise and AI muscle labels; it does not measure actual muscle activation.</p>
  </section>;
}

function AnimatedDemo({ exercise }: { exercise: Exercise }) {
  const n = exercise.name.toLowerCase();
  const mode = /squat|leg press|leg extension|leg curl|calf|lunge/.test(n) ? "legs" :
    /row|pulldown|pull-up|face pull|curl/.test(n) ? "pull" : "push";
  return <div className={`motion-card ${mode}`}>
    <div className="motion-top"><span className="motion-live"><i/> LIVE MOTION PREVIEW</span><span className="motion-loop">↻ LOOP</span></div>
    <svg viewBox="0 0 320 180" role="img" aria-label={`Illustrative animated ${exercise.name} movement`} className="motion-svg">
      <defs><linearGradient id="machineGlow" x1="0" x2="1"><stop stopColor="#b7ff3c" stopOpacity=".2"/><stop offset="1" stopColor="#b7ff3c" stopOpacity=".02"/></linearGradient></defs>
      <path d="M25 153H295" stroke="#435344" strokeWidth="3" strokeLinecap="round"/>
      <g className="machine-art" stroke="#81917f" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 145V35M45 38H275M275 38V145M45 145H275"/>
        <path d="M60 70H82M60 70V128M82 70V128" opacity=".65"/>
        <rect x="252" y="48" width="18" height="42" rx="4" fill="url(#machineGlow)" stroke="#b7ff3c"/>
        <path d="M261 90V118" stroke="#b7ff3c"/>
      </g>
      <g className="person-art" stroke="#e6f0e6" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="151" cy="38" r="11" fill="#b7ff3c" stroke="none"/>
        <path d="M151 51L151 99"/>
        <path className="arm-left" d="M151 62L126 81L103 72"/>
        <path className="arm-right" d="M151 62L178 81L205 72"/>
        <path className="leg-left" d="M151 99L132 133L123 151"/>
        <path className="leg-right" d="M151 99L171 133L181 151"/>
      </g>
      <path className="motion-arrow" d={mode==="pull"?"M211 61Q235 78 211 96":mode==="legs"?"M197 128Q218 105 198 88":"M209 90Q236 73 250 91"} fill="none" stroke="#b7ff3c" strokeWidth="3" strokeLinecap="round"/>
      <path d="M213 88L210 97L220 94" fill="none" stroke="#b7ff3c" strokeWidth="3" strokeLinecap="round"/>
    </svg>
    <div className="motion-caption"><b>{mode==="pull"?"Pull with control":mode==="legs"?"Drive through your feet":"Press smoothly"}</b><span>Illustrative movement cycle · Follow the written setup cues</span></div>
  </div>;
}

export default function Home() {
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [selected,setSelected]=useState<Exercise|null>(null);
  const [sets,setSets]=useState<SetEntry[]>(initialSets);
  const [history,setHistory]=useState<any[]>([]);
  const [tab,setTab]=useState("scan");
  const [user,setUser]=useState<User|null>(null);
  const [authMode,setAuthMode]=useState<"signin"|"signup">("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [authBusy,setAuthBusy]=useState(false);
  const [authMessage,setAuthMessage]=useState("");
  const totalReps=useMemo(()=>sets.filter(s=>s.done).reduce((n,s)=>n+s.reps,0),[sets]);
  const volume=useMemo(()=>sets.filter(s=>s.done).reduce((n,s)=>n+s.reps*s.weight,0),[sets]);
  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getUser().then(({data})=>setUser(data.user));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{ if(user) loadHistory(); },[user]);

  function chooseFile(f?:File) {
    if(!f)return;
    if(!f.type.startsWith("image/")){setError("Please choose an image file.");return;}
    if(f.size>12*1024*1024){setError("Please use an image smaller than 12 MB.");return;}
    setFile(f);setPreview(URL.createObjectURL(f));setAnalysis(null);setSelected(null);setError("");
  }
  async function scan(){
    if(!file){setError("Upload a clear photo of the machine first.");return;}
    setLoading(true);setError("");setAnalysis(null);setSelected(null);
    try{
      const body=new FormData();body.append("image",file);
      const res=await fetch("/api/analyze",{method:"POST",body});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Could not identify this machine.");
      setAnalysis(data);setSelected(data.exercises?.[0]||null);setSets(initialSets());setTab("scan");
    }catch(e:any){setError(e.message||"Something went wrong. Please try again.");}
    finally{setLoading(false);}
  }
  async function saveWorkout(){
    if(!selected||!analysis)return;
    const done=sets.filter(s=>s.done);if(!done.length){setError("Mark at least one set as complete.");return;}
    const entry={machine:analysis.machine,exercise:selected.name,sets:done.length,reps:done.reduce((n,s)=>n+s.reps,0),volume:done.reduce((n,s)=>n+s.reps*s.weight,0)};
    if(user && supabase){
      const {error:dbError}=await supabase.from("workouts").insert({...entry,user_id:user.id});
      if(dbError){setError("Could not sync workout: "+dbError.message);return;}
      await loadHistory();setError("Workout saved to your account.");setTab("history");return;
    }
    const localEntry={...entry,id:Date.now(),date:new Date().toLocaleString()};
    const next=[localEntry,...history];setHistory(next);try{localStorage.setItem("repai-history",JSON.stringify(next));}catch{}
    setError("Workout saved on this device. Sign in to sync across devices.");setTab("history");
  }
  async function loadHistory(){
    if(user && supabase){
      const {data,error:dbError}=await supabase.from("workouts").select("*").order("created_at",{ascending:false}).limit(100);
      if(!dbError && data){setHistory(data);return;}
    }
    try{setHistory(JSON.parse(localStorage.getItem("repai-history")||"[]"));}catch{}
  }
  async function authenticate(){
    if(!supabase){setAuthMessage("Add your Supabase project URL and publishable/anon key to the deployment environment first.");return;}
    setAuthBusy(true);setAuthMessage("");
    const result=authMode==="signup"
      ? await supabase.auth.signUp({email,password})
      : await supabase.auth.signInWithPassword({email,password});
    setAuthBusy(false);
    if(result.error){setAuthMessage(result.error.message);return;}
    if(authMode==="signup" && !result.data.session)setAuthMessage("Account created. Check your email to confirm, then sign in.");
    else setAuthMessage("You're signed in.");
  }
  async function signOut(){if(supabase)await supabase.auth.signOut();setUser(null);setAuthMessage("Signed out.");}
  return <main className="shell">
    <header className="topbar"><a className="logo" href="#">REP<span>//</span>AI</a><button className="account-chip" onClick={()=>setTab("account")}>{user?user.email:"Sign in / Create account"}</button></header>
    <section className="hero"><p className="eyebrow">SCAN · SELECT · TRAIN</p><h1>Your machine.<br/><span>Your next PR.</span></h1><p className="muted">Identify gym equipment, discover exercises that fit it, and track every set in one place.</p></section>
    <nav className="tabs"><button className={tab==="scan"?"on":""} onClick={()=>setTab("scan")}>⌁ Machine scanner</button><button className={tab==="workout"?"on":""} onClick={()=>setTab("workout")}>▣ Workout</button><button className={tab==="history"?"on":""} onClick={()=>{loadHistory();setTab("history")}}>◷ History</button><button className={tab==="account"?"on":""} onClick={()=>setTab("account")}>♙ Account</button></nav>
    {tab==="scan"&&<section className="panel">
      <div className="section-title"><div><p className="eyebrow">01 / MACHINE SCANNER</p><h2>What machine are you using?</h2></div><span className="tag">AI VISION</span></div>
      <label className="dropzone" htmlFor="machine-photo"><span className="upload-icon">＋</span><b>{file?"Change machine photo":"Take a photo or upload"}</b><small>Use a clear, well-lit photo showing the whole machine</small><input id="machine-photo" type="file" accept="image/*" capture="environment" onChange={e=>chooseFile(e.target.files?.[0])}/></label>
      {preview&&<img className="preview" src={preview} alt="Selected gym machine"/>}
      <button className="primary full" disabled={!file||loading} onClick={scan}>{loading?"Analysing machine…":"Identify machine with AI →"}</button>
      {error&&<p className="feedback">{error}</p>}
      {analysis&&<div className="result">
        <div className="result-head"><div><p className="eyebrow">02 / MACHINE IDENTIFIED</p><h2>{analysis.machine}</h2></div><span className="confidence">{analysis.confidence} match</span></div>
        <p className="muted">{analysis.notes}</p>
        <div className="section-title compact"><h3>Exercises you can try</h3><span className="muted">{analysis.exercises.length} suggestions</span></div>
        {analysis.exercises.map((ex,i)=><button key={i} className={"exercise "+(selected?.name===ex.name?"selected":"")} onClick={()=>{setSelected(ex);setSets(initialSets());setTab("workout")}}><span className="exercise-icon">✳</span><span className="exercise-copy"><b>{ex.name}</b><small>{ex.muscles}</small></span><span className="choose">Select ↗</span></button>)}
        <p className="safety">AI suggestions can be imperfect. Confirm the machine, attachments and setup with gym staff before loading it.</p>
      </div>}
    </section>}
    {tab==="workout"&&<section className="panel">
      <p className="eyebrow">03 / EXERCISE GUIDE</p>
      {selected?<><div className="workout-title"><div><h2>{selected.name}</h2><p className="muted">{selected.muscles}</p></div><span className="tag">GUIDE</span></div>
        <BodyMuscleMap exercise={selected}/><AnimatedDemo exercise={selected}/><div className="demo"><div className="demo-symbol">↗</div><b>Machine setup</b><p>{selected.setup}</p></div>
        <h3>How to perform</h3><ol className="steps">{selected.instructions.map((s,i)=><li key={i}>{s}</li>)}</ol>
        <h3>Form reminders</h3><ul className="steps">{selected.tips.map((s,i)=><li key={i}>{s}</li>)}</ul>
        <div className="divider"></div><div className="section-title"><div><p className="eyebrow">04 / MANUAL REP COUNTER</p><h2>Log your sets</h2></div><span className="tag">MANUAL</span></div>
        <div className="metrics"><div><strong>{totalReps}</strong><small>REPS DONE</small></div><div><strong>{sets.filter(s=>s.done).length}</strong><small>SETS DONE</small></div><div><strong>{volume.toLocaleString()}</strong><small>VOLUME KG</small></div></div>
        <div className="set-head"><span>SET</span><span>REPS</span><span>WEIGHT KG</span><span>DONE</span></div>
        {sets.map((s,i)=><div className="set-row" key={i}><b>{i+1}</b><input type="number" min="0" value={s.reps} onChange={e=>setSets(old=>old.map((x,j)=>j===i?{...x,reps:Number(e.target.value)}:x))}/><input type="number" min="0" value={s.weight} onChange={e=>setSets(old=>old.map((x,j)=>j===i?{...x,weight:Number(e.target.value)}:x))}/><button className={s.done?"done checked":"done"} onClick={()=>setSets(old=>old.map((x,j)=>j===i?{...x,done:!x.done}:x))}>{s.done?"✓":"○"}</button></div>)}
        <div className="row-actions"><button className="secondary" onClick={()=>setSets(old=>[...old,{reps:10,weight:20,done:false}])}>＋ Add set</button><button className="primary" onClick={saveWorkout}>Save workout</button></div>
        {error&&<p className="feedback">{error}</p>}
      </>:<div className="empty"><div>🏋️</div><h2>No exercise selected</h2><p>Scan a machine and select an exercise to open its guide and rep tracker.</p><button className="primary" onClick={()=>setTab("scan")}>Go to scanner</button></div>}
    </section>}
    {tab==="history"&&<section className="panel"><p className="eyebrow">YOUR TRAINING LOG</p><h2>Workout history</h2>{history.length?history.map(x=><div className="history" key={x.id}><b>{x.exercise}</b><span>{x.machine}</span><small>{x.created_at?new Date(x.created_at).toLocaleString():x.date} · {x.sets} sets · {x.reps} reps · {x.volume} kg volume</small></div>):<div className="empty"><div>◷</div><h3>No workouts saved yet</h3><p>Complete a set and save your first workout to see it here.</p></div>}</section>}
    {tab==="account"&&<section className="panel account-panel"><p className="eyebrow">YOUR REP//AI PROFILE</p><h2>{user?"Account connected":"Create your account"}</h2>
      {user?<><p className="muted">Signed in as <b>{user.email}</b>. Your saved workouts sync to your account.</p><button className="secondary" onClick={signOut}>Sign out</button></>
      :<><p className="muted">Create an account to keep your workout history available when you sign in on another device.</p>
        <div className="auth-switch"><button className={authMode==="signin"?"chosen":""} onClick={()=>setAuthMode("signin")}>Sign in</button><button className={authMode==="signup"?"chosen":""} onClick={()=>setAuthMode("signup")}>Create account</button></div>
        <label className="auth-label">Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
        <label className="auth-label">Password<input type="password" autoComplete={authMode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
        <button className="primary full" disabled={authBusy||!email||password.length<8} onClick={authenticate}>{authBusy?"Please wait…":authMode==="signup"?"Create account":"Sign in"}</button>
        {!supabaseConfigured&&<p className="safety">Account sign-in is ready in the project, but needs your Supabase URL and public anon/publishable key in Vercel environment variables.</p>}
        {authMessage&&<p className="feedback">{authMessage}</p>}
      </>}
    </section>}
    <footer>REP//AI <span>TRAIN WITH CONTROL. PROGRESS WITH PURPOSE.</span></footer>
  </main>;
}
