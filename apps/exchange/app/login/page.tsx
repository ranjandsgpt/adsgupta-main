"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  return <div style={{maxWidth:420,margin:"80px auto"}}><div className="card"><h1>Login</h1><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><div style={{height:8}} /><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /><div style={{height:12}} /><button onClick={()=>signIn("credentials",{email,password,callbackUrl:"/"})}>Sign in</button></div></div>;
}
