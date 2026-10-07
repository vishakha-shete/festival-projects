import React,{useEffect,useRef}from"react";
import{createRoot}from"react-dom/client";
import"./style.css";

function App(){
 const canvas=useRef(null);
 const image=useRef(null);

 useEffect(()=>{
  const c=canvas.current,ctx=c.getContext("2d");
  let W,H,raf,particles=[],start;

  function resize(){
   const d=Math.min(devicePixelRatio||1,2);
   W=c.clientWidth;H=c.clientHeight;
   c.width=W*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0);
   particles=Array.from({length:520},(_,i)=>({
    x:Math.random()*W,y:Math.random()*H,
    r:.6+Math.random()*2.2,
    delay:Math.random()*3200,
    phase:Math.random()*Math.PI*2,
    speed:.4+Math.random()
   }));
  }

  function draw(t){
   ctx.clearRect(0,0,W,H);
   const e=Math.min(1,(t-start)/5200);

   for(const p of particles){
    const a=Math.sin(t*.0015*p.speed+p.phase)*.5+.5;
    const alpha=.15+.65*a;
    ctx.beginPath();
    ctx.shadowBlur=8;
    ctx.shadowColor="rgba(255,190,75,.9)";
    ctx.fillStyle=`rgba(255,190,75,${alpha})`;
    ctx.arc(
      p.x+Math.sin(t*.0005+p.phase)*8,
      p.y+Math.cos(t*.0007+p.phase)*8,
      p.r*(.7+a*.5),0,Math.PI*2
    );
    ctx.fill();
   }
   ctx.shadowBlur=0;
   raf=requestAnimationFrame(draw);
  }

  start=performance.now();
  resize();
  window.addEventListener("resize",resize);
  raf=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize)};
 },[]);

 return <main>
   <img ref={image} src="/gannu-bappa.jpg" alt="Gannu Bappa" />
   <canvas ref={canvas}/>
 </main>
}

createRoot(document.getElementById("root")).render(<App/>);
