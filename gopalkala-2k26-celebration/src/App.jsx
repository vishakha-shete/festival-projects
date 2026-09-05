import React, { useEffect, useRef, useState } from 'react';

const INGREDIENTS = [
  ['Poha', '🍚'], ['Chana Dal', '🫘'], ['Cucumber', '🥒'], ['Apple', '🍎'],
  ['Pomegranate', '❤️'], ['Corn', '🌽'], ['Cut Banana', '🍌'], ['Coconut', '🥥'],
  ['Coriander', '🌿'], ['Salt', '🧂'], ['Lemon', '🍋']
];

const FLY_POSITIONS = [
  ['8%', '18%'], ['24%', '8%'], ['44%', '5%'], ['66%', '9%'], ['84%', '18%'],
  ['90%', '43%'], ['78%', '68%'], ['57%', '75%'], ['38%', '72%'], ['17%', '66%'], ['4%', '43%']
];

function Child({ side, name, delay, color, eating }) {
  return (
    <div className={`child ${side} ${eating ? 'eating' : ''}`} style={{ '--delay': `${delay}ms`, '--shirt': color }}>
      <div className="child-hair" />
      <div className="child-head"><span className="tilak" /></div>
      <div className="child-body" />
      <div className="child-arm arm-a" />
      <div className="child-arm arm-b" />
      <div className="child-leg leg-a" /><div className="child-leg leg-b" />
      <div className="child-bowl">🥣</div>
      <span className="child-name">{name}</span>
    </div>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState('intro');
  const [collected, setCollected] = useState([]);
  const [flying, setFlying] = useState(null);
  const [eating, setEating] = useState(false);
  const [music, setMusic] = useState(true);
  const audioRef = useRef(null);

  const startCelebration = async () => {
    setStarted(true);
    setPhase('ingredients');
    if (audioRef.current) {
      audioRef.current.volume = 0.32;
      try { await audioRef.current.play(); } catch {}
    }
  };

  const replay = () => {
    setCollected([]); setFlying(null); setEating(false); setPhase('ingredients');
    if (audioRef.current && music) audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (!started || phase !== 'ingredients') return;
    if (collected.length >= INGREDIENTS.length) {
      const t = setTimeout(() => setPhase('mixing'), 850);
      return () => clearTimeout(t);
    }
    const index = collected.length;
    setFlying(index);
    const t = setTimeout(() => {
      setCollected((prev) => [...prev, index]);
      setFlying(null);
    }, 900);
    return () => clearTimeout(t);
  }, [started, phase, collected]);

  useEffect(() => {
    if (phase !== 'mixing') return;
    const t = setTimeout(() => setPhase('children'), 3600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'children') return;
    const eatTimer = setTimeout(() => setEating(true), 1800);
    const endTimer = setTimeout(() => setPhase('final'), 6200);
    return () => { clearTimeout(eatTimer); clearTimeout(endTimer); };
  }, [phase]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (!music) audioRef.current.pause();
    else if (started) audioRef.current.play().catch(() => {});
  }, [music, started]);

  const statusText = phase === 'ingredients' ? 'सगळे पदार्थ येत आहेत…'
    : phase === 'mixing' ? 'प्रेमाने गोपालकाला मिसळत आहोत…'
    : phase === 'children' ? 'मुलं आली… आता प्रसादाची वेळ!'
    : phase === 'final' ? 'गोपालकाला तयार! जय श्री कृष्ण!'
    : 'गोपालकाला उत्सव';

  return (
    <main className={`festival ${phase}`}>
      <audio ref={audioRef} src="/krishna_flute.mp3" loop preload="auto" />
      <div className="sky-glow" />
      <img className="krishna-bg left" src="/images/krish1.jpg" alt="Krishna celebration" />
      <img className="krishna-bg right" src="/images/krish2.jpg" alt="Krishna and children" />
      <div className="dark-vignette" />

      <header className="topbar">
        <div><span className="mini-feather">🦚</span><strong>Gopalkala 2K26</strong></div>
        <div className="top-actions">
          <span className="status">{statusText}</span>
          <button className="music" onClick={() => setMusic(!music)}>{music ? '🔊 Music' : '🔇 Music'}</button>
        </div>
      </header>

      <section className="hero">
        <div className="title-wrap">
          <p className="eyebrow">॥ जय श्री कृष्ण ॥</p>
          <h1>गोपालकाला</h1>
          <p>A little bit of everything… mixed with love ❤️</p>
        </div>

        <div className="celebration-stage">
          <div className="arch arch-left" /><div className="arch arch-right" />
          <div className="garland garland-top">🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼</div>
          <div className="rope rope-left" /><div className="rope rope-right" />
          <div className="leaves">🌿 🌿 🌿</div>

          {flying !== null && (
            <div className="flying-ingredient" style={{ '--sx': FLY_POSITIONS[flying][0], '--sy': FLY_POSITIONS[flying][1] }}>
              <span>{INGREDIENTS[flying][1]}</span><b>{INGREDIENTS[flying][0]}</b>
            </div>
          )}

          <div className={`handi-wrap ${phase === 'mixing' ? 'mixing' : ''}`}>
            <div className="handi-rope-knot" />
            <div className="handi">
              <div className="handi-mouth"><span className="food" /></div>
              <div className="handi-band band-one" />
              <div className="handi-band band-two" />
              <div className="handi-pattern">◇ ◆ ◇ ◆ ◇</div>
              <div className="handi-bottom" />
              {phase === 'mixing' && <div className="mix-spoon">🥄</div>}
              <div className="handi-items">
                {collected.map((i) => <span key={i} title={INGREDIENTS[i][0]}>{INGREDIENTS[i][1]}</span>)}
              </div>
            </div>
          </div>

          <div className="mat-line" />
          <div className="diyas"><span>🪔</span><span>🪔</span><span>🪔</span></div>

          {phase === 'children' || phase === 'final' ? <div className="children-scene">
            <Child side="child-one" name="Gopal" delay={0} color="#f08a3e" eating={eating} />
            <Child side="child-two" name="Radha" delay={250} color="#e56a9d" eating={eating} />
            <Child side="child-three" name="Mohan" delay={500} color="#4e9be8" eating={eating} />
            <Child side="child-four" name="Kanha" delay={750} color="#7e62d8" eating={eating} />
          </div> : null}

          <img className="real-handi" src="/images/dahihandi.jpg" alt="Decorated dahi handi" />
        </div>

        <div className="ingredient-tray">
          {INGREDIENTS.map(([name, emoji], i) => <div className={`tray-item ${collected.includes(i) ? 'done' : ''}`} key={name}>
            <span>{emoji}</span><small>{name}</small>
          </div>)}
        </div>
      </section>

      {phase === 'final' && <section className="final-card">
        <img src="/images/gopalkala-poster.png" alt="Gopalkala celebration poster" />
        <div className="final-copy">
          <p>🌼 सर्वांनी मिळून केलेली मेजवानी 🌼</p>
          <h2>गोपालकाला तयार! 🎉</h2>
          <p>Good Food • Good Company • Greater Happiness</p>
          <button onClick={replay}>↻ Celebrate Again</button>
        </div>
      </section>}

      {!started && <div className="start-screen">
        <div className="start-card">
          <div className="peacock">🦚</div>
          <p className="eyebrow">॥ जय श्री कृष्ण ॥</p>
          <h2>Gopalkala <span>2K26</span></h2>
          <p>Watch the celebration come alive — ingredients fly in, Gopalkala gets mixed, and the children arrive to share the feast.</p>
          <button onClick={startCelebration}>✨ Start Celebration</button>
          <small>Click once to start the flute music. Everything after that is automatic.</small>
        </div>
      </div>}

      <footer>Made with ❤️ for Gopalkala 2K26 • कृष्णार्पणमस्तु</footer>
    </main>
  );
}
