import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const items = [
    ["poha", "Poha", "🥣"], ["chana", "Chana Dal", "🫘"], ["cucumber", "Cucumber", "🥒"],
    ["apple", "Apple", "🍎"], ["pomegranate", "Pomegranate", "❤️"], ["corn", "Corn", "🌽"],
    ["banana", "Cut Banana", "🍌"], ["coconut", "Coconut", "🥥"], ["coriander", "Coriander", "🌿"],
    ["salt", "Salt", "🧂"], ["lemon", "Lemon", "🍋"]
];

function App() {
    const [added, setAdded] = useState([]),
        [progress, setProgress] = useState(0),
        [done, setDone] = useState(false);

    const matki = useRef(null), mix = useRef({ on: false, last: 0, total: 0 });
    const list = useMemo(() => items.filter(x => added.includes(x[0])), [added]);
    const add = id => { if (!added.includes(id) && !done) setAdded(a => [...a, id]) };
    const angle = e => { const r = matki.current.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) };
    const down = e => { if (added.length !== items.length || done) return; e.preventDefault(); mix.current = { on: true, last: angle(e), total: mix.current.total } };
    const move = e => {
        if (!mix.current.on || done) return;
        let a = angle(e), d = a - mix.current.last;
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        if (Math.abs(d) > .01) {
            mix.current.last = a;
            mix.current.total += Math.abs(d) * 12; let p = Math.min(100, mix.current.total); setProgress(p);
            if (p >= 100) { mix.current.on = false; setDone(true) }
        }
    };
    const reset = () => { setAdded([]); setProgress(0); setDone(false); mix.current = { on: false, last: 0, total: 0 } };
    return <main className="app">
        <div className="decor">✦</div>
        <div className="decor d2">✿</div>
        <header>
            <div className="eyebrow">🪔 GOVINDA • GOPALA • KANHA</div>
            <h1>Gopalkala <b>2K26</b></h1>
            <p className="tag">Different ingredients. One celebration.</p>
            <p className="intro">Bring every ingredient together, fill the matki, and mix the celebration with your own hands.</p>
        </header>
        <section className="layout">
            <aside>
                <div className="head"><div>
                    <small>THE INGREDIENTS</small>
                    <h2>Build the Kala</h2>
                </div>
                    <strong>{added.length}/{items.length}</strong>
                </div>
                <p className="hint">Drag an ingredient into the matki — or tap it on mobile.</p>
                <div className="items">{items.map(([id, name, emoji]) => <button key={id} draggable={!added.includes(id)} onDragStart={e => e.dataTransfer.setData("id", id)} onClick={() => add(id)} disabled={added.includes(id)} className={added.includes(id) ? "used" : ""}><i>{emoji}</i><span>{name}</span><em>{added.includes(id) ? "✓" : "+"}</em></button>)}</div></aside>
            <section className="stage"><div className="step"><span>STEP {added.length === items.length ? "02" : "01"}</span><b>{added.length === items.length ? "Mix the Gopalkala" : "Fill the Matki"}</b></div>
                <div className={"zone " + (added.length === items.length ? "ready " : "") + (mix.current.on ? "mixing" : "")} ref={matki} onDragOver={e => e.preventDefault()} onDrop={e => add(e.dataTransfer.getData("id"))} onPointerDown={down} onPointerMove={move} onPointerUp={() => mix.current.on = false} onPointerCancel={() => mix.current.on = false}>
                    <div className="ring"></div><div className="ring r2"></div><div className="shadow"></div>
                    <div className="matki"><div className="neck"></div><div className="body"><div className="food">{list.map(x => <span key={x[0]}>{x[2]}</span>)}</div><div className="spoon"></div></div><div className="rim"></div></div>
                    {added.length < items.length ? <div className="message"><b>🥣</b><strong>Drop ingredients here</strong><small>{items.length - added.length} more to go</small></div> : !done && <div className="mixmsg"><b>🥄</b><strong>{mix.current.on ? "Keep mixing..." : "Move in circles!"}</strong><small>{Math.round(progress)}% mixed</small></div>}
                </div>
                <div className="progress"><div><span>{added.length === items.length ? "Mixing progress" : "Ingredients collected"}</span><b>{Math.round(added.length === items.length ? progress : added.length / items.length * 100)}%</b></div><i><u style={{ width: `${added.length === items.length ? progress : added.length / items.length * 100}%` }} /></i></div>
            </section>
        </section>
        <div className="quote"><span>❝</span><p>वेगवेगळे पदार्थ, एकच आनंद.</p><small>Different ingredients, one shared joy.</small></div>
        <footer>Gopalkala 2K26 <span>Made with ❤️ & devotion</span> ॥ गोपाळकाला ॥</footer>
        {done && <div className="overlay"><div className="card"><div className="feather">🦚</div><p>॥ जय श्री कृष्ण ॥</p><h2>Gopalkala तयार! 🥣</h2><span>A little bit of everything, mixed with love, becomes a celebration everyone can share.</span><button onClick={reset}>Make it Again ↻</button></div></div>}
    </main>
}
createRoot(document.getElementById("root")).render(<App />);
