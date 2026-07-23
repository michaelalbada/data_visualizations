"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Ulysses.module.css";

type Episode = {
  id: number;
  title: string;
  act: "Telemachiad" | "Odyssey" | "Nostos";
  scene: string;
  time: string;
  clock: number;
  organ: string;
  art: string;
  technique: string;
  symbol: string;
  words: number;
  unique: number;
  lexical: number;
  questions: number;
  exclaims: number;
  paragraphs: number;
  opening: string;
};

type EpisodeGuide = {
  summary: string;
  homer: string;
  characters: string[];
  motifs: string[];
  form: string;
};

const EPISODES: Episode[] = [
  { id:1,title:"Telemachus",act:"Telemachiad",scene:"The Tower",time:"8 a.m.",clock:8,organ:"—",art:"Theology",technique:"Narrative (young)",symbol:"Heir",words:7165,unique:2036,lexical:28.4,questions:97,exclaims:61,paragraphs:368,opening:"Stately, plump Buck Mulligan came from the stairhead" },
  { id:2,title:"Nestor",act:"Telemachiad",scene:"The School",time:"10 a.m.",clock:10,organ:"—",art:"History",technique:"Catechism (personal)",symbol:"Horse",words:4398,unique:1513,lexical:34.4,questions:52,exclaims:11,paragraphs:207,opening:"You, Cochrane, what city sent for him?" },
  { id:3,title:"Proteus",act:"Telemachiad",scene:"The Strand",time:"11 a.m.",clock:11,organ:"—",art:"Philology",technique:"Monologue (male)",symbol:"Tide",words:5680,unique:2315,lexical:40.8,questions:73,exclaims:37,paragraphs:101,opening:"Ineluctable modality of the visible" },
  { id:4,title:"Calypso",act:"Odyssey",scene:"The House",time:"8 a.m.",clock:8,organ:"Kidney",art:"Economics",technique:"Narrative (mature)",symbol:"Nymph",words:5875,unique:2025,lexical:34.5,questions:50,exclaims:20,paragraphs:173,opening:"Mr Leopold Bloom ate with relish" },
  { id:5,title:"Lotus Eaters",act:"Odyssey",scene:"The Bath",time:"10 a.m.",clock:10,organ:"Genitals",art:"Botany / chemistry",technique:"Narcissism",symbol:"Eucharist",words:6385,unique:2024,lexical:31.7,questions:80,exclaims:19,paragraphs:151,opening:"By lorries along Sir John Rogerson’s quay" },
  { id:6,title:"Hades",act:"Odyssey",scene:"The Graveyard",time:"11 a.m.",clock:11,organ:"Heart",art:"Religion",technique:"Incubism",symbol:"Caretaker",words:10890,unique:2817,lexical:25.9,questions:113,exclaims:43,paragraphs:402,opening:"Martin Cunningham first poked his silkhatted head" },
  { id:7,title:"Aeolus",act:"Odyssey",scene:"The Newspaper",time:"12 noon",clock:12,organ:"Lungs",art:"Rhetoric",technique:"Enthymemic",symbol:"Editor",words:9905,unique:2877,lexical:29,questions:140,exclaims:86,paragraphs:539,opening:"In the heart of the Hibernian metropolis" },
  { id:8,title:"Lestrygonians",act:"Odyssey",scene:"The Lunch",time:"1 p.m.",clock:13,organ:"Oesophagus",art:"Architecture",technique:"Peristaltic",symbol:"Constables",words:12575,unique:3606,lexical:28.7,questions:135,exclaims:59,paragraphs:385,opening:"Pineapple rock, lemon platt, butter scotch" },
  { id:9,title:"Scylla and Charybdis",act:"Odyssey",scene:"The Library",time:"2 p.m.",clock:14,organ:"Brain",art:"Literature",technique:"Dialectic",symbol:"Stratford / London",words:11740,unique:3552,lexical:30.3,questions:139,exclaims:55,paragraphs:482,opening:"Urbane, to comfort them, the quaker librarian" },
  { id:10,title:"Wandering Rocks",act:"Odyssey",scene:"The Streets",time:"3 p.m.",clock:15,organ:"Blood",art:"Mechanics",technique:"Labyrinth",symbol:"Citizens",words:12462,unique:3430,lexical:27.5,questions:118,exclaims:63,paragraphs:546,opening:"The superior, the very reverend John Conmee" },
  { id:11,title:"Sirens",act:"Odyssey",scene:"The Concert Room",time:"4 p.m.",clock:16,organ:"Ear",art:"Music",technique:"Fuga per canonem",symbol:"Barmaids",words:12140,unique:3207,lexical:26.4,questions:145,exclaims:103,paragraphs:635,opening:"Bronze by gold heard the hoofirons steelyringing" },
  { id:12,title:"Cyclops",act:"Odyssey",scene:"The Tavern",time:"5 p.m.",clock:17,organ:"Muscle",art:"Politics",technique:"Gigantism",symbol:"Fenian",words:21225,unique:5646,lexical:26.6,questions:171,exclaims:82,paragraphs:566,opening:"I was just passing the time of day" },
  { id:13,title:"Nausicaa",act:"Odyssey",scene:"The Rocks",time:"8 p.m.",clock:20,organ:"Eye / nose",art:"Painting",technique:"Tumescence / detumescence",symbol:"Virgin",words:16739,unique:3569,lexical:21.3,questions:98,exclaims:74,paragraphs:134,opening:"The summer evening had begun to fold" },
  { id:14,title:"Oxen of the Sun",act:"Odyssey",scene:"The Hospital",time:"10 p.m.",clock:22,organ:"Womb",art:"Medicine",technique:"Embryonic development",symbol:"Mothers",words:20333,unique:5918,lexical:29.1,questions:106,exclaims:130,paragraphs:65,opening:"Deshil Holles Eamus. Deshil Holles Eamus." },
  { id:15,title:"Circe",act:"Odyssey",scene:"The Brothel",time:"12 a.m.",clock:24,organ:"Locomotor apparatus",art:"Magic",technique:"Hallucination",symbol:"Whore",words:38042,unique:9849,lexical:25.9,questions:358,exclaims:702,paragraphs:1441,opening:"The Mabbot street entrance of nighttown" },
  { id:16,title:"Eumaeus",act:"Nostos",scene:"The Shelter",time:"1 a.m.",clock:25,organ:"Nerves",art:"Navigation",technique:"Narrative (old)",symbol:"Sailors",words:22692,unique:5360,lexical:23.6,questions:55,exclaims:27,paragraphs:291,opening:"Preparatory to anything else Mr Bloom brushed" },
  { id:17,title:"Ithaca",act:"Nostos",scene:"The House",time:"2 a.m.",clock:26,organ:"Skeleton",art:"Science",technique:"Catechism (impersonal)",symbol:"Comets",words:22001,unique:6930,lexical:31.5,questions:303,exclaims:2,paragraphs:654,opening:"What parallel courses did Bloom and Stephen follow?" },
  { id:18,title:"Penelope",act:"Nostos",scene:"The Bed",time:"after 2 a.m.",clock:27,organ:"Flesh",art:"—",technique:"Monologue (female)",symbol:"Earth",words:24065,unique:3579,lexical:14.9,questions:0,exclaims:0,paragraphs:10,opening:"Yes because he never did a thing like that" }
];

const GUIDES: Record<number, EpisodeGuide> = {
  1:{summary:"Stephen Dedalus begins the day in the Martello Tower with Buck Mulligan and Haines. Breakfast, a swim, and the tower key expose grief over Stephen’s mother and his sense that Mulligan has usurped his home.",homer:"Telemachus is crowded out of his own house by Penelope’s suitors; Stephen likewise leaves a home dominated by an irreverent intruder.",characters:["Stephen Dedalus","Buck Mulligan","Haines","The milkwoman"],motifs:["Usurpation","Motherhood","Sea","Keys"],form:"A comparatively stable young narrative voice keeps slipping toward Stephen’s private resentment and memory."},
  2:{summary:"At Garrett Deasy’s school in Dalkey, Stephen teaches an uninspired history lesson, receives his pay, and agrees to deliver Deasy’s letter about foot-and-mouth disease to the press.",homer:"The aged Nestor gives Telemachus counsel but cannot tell him where his father is. Deasy offers Stephen advice that is equally compromised.",characters:["Stephen Dedalus","Garrett Deasy","Cyril Sargent"],motifs:["History","Debt","Fathers","Empire"],form:"Personal catechism turns teaching, accounting, and historical certainty into uneasy question-and-answer exchanges."},
  3:{summary:"Walking alone on Sandymount Strand, Stephen tests the limits of perception, remembers Paris and his family, watches strangers and a dog, and writes a fragment of a poem.",homer:"Proteus can reveal truth only after being held through many transformations. Stephen’s thought likewise changes shape faster than it can be fixed.",characters:["Stephen Dedalus","A dog","Cocklepickers"],motifs:["Perception","Change","Paternity","The sea"],form:"Male interior monologue makes syntax itself protean, moving through philosophy, memory, sensation, fantasy, and sound."},
  4:{summary:"The story restarts at 8 a.m. Leopold Bloom cooks a kidney, feeds the cat, brings Molly breakfast and a letter, then reads in the outhouse while beginning his own Dublin day.",homer:"Odysseus is held on Calypso’s island. Bloom’s domestic island is loving but shadowed by Molly’s coming meeting with Blazes Boylan.",characters:["Leopold Bloom","Molly Bloom","Milly Bloom","The cat"],motifs:["Appetite","Home","Infidelity","The body"],form:"Mature narrative moves fluidly between ordinary action and Bloom’s practical, associative inner life."},
  5:{summary:"Bloom collects a clandestine letter from Martha Clifford, enters a church, visits Sweny’s pharmacy, buys lemon soap, and imagines the narcotic ease of flowers, baths, and correspondence.",homer:"The lotus makes Odysseus’s crew forget the desire to return. Dublin offers Bloom smaller forms of languor, escape, ritual, and perfume.",characters:["Leopold Bloom","Martha Clifford","C. P. M’Coy","The chemist"],motifs:["Drugs","Flowers","Desire","Ritual"],form:"Narcissism turns the city into a soft field of reflections, scents, folded messages, and private self-absorption."},
  6:{summary:"Bloom rides in Paddy Dignam’s funeral carriage through Dublin and joins the burial at Glasnevin Cemetery. Death repeatedly opens into memories of fathers, children, sex, and bodily survival.",homer:"Odysseus descends among the dead. Bloom’s underworld is a modern cemetery populated by remembered voices and ordinary mortality.",characters:["Leopold Bloom","Martin Cunningham","Simon Dedalus","Jack Power"],motifs:["Death","Fathers and sons","Burial","Rudolph Bloom"],form:"Incubism layers the living over the dead: passing streets and social talk continually hatch private recollection."},
  7:{summary:"In the Freeman’s Journal offices, Bloom pursues an advertisement while editors trade speeches and Stephen arrives with Deasy’s letter and his Parable of the Plums.",homer:"Aeolus bags the winds for Odysseus, whose crew lets them loose. The newspaper office is filled with gusts of rhetoric, headlines, and thwarted messages.",characters:["Leopold Bloom","Stephen Dedalus","Myles Crawford","Professor MacHugh"],motifs:["Rhetoric","Headlines","Wind","Advertising"],form:"Newspaper headlines interrupt the episode, framing its talk as fragments of public persuasion and comic bombast."},
  8:{summary:"Hungry, Bloom walks through a city eating and being eaten. Repelled by the Burton restaurant, he takes a gorgonzola sandwich and burgundy at Davy Byrne’s before heading toward the library.",homer:"The Lestrygonians are cannibal giants. Joyce miniaturizes their appetite into restaurants, digestion, commerce, and the city’s endless consumption.",characters:["Leopold Bloom","Mrs Breen","Nosey Flynn","Davy Byrne"],motifs:["Hunger","Digestion","Consumption","Kindness"],form:"Peristaltic prose moves by contractions and releases, carrying food, memory, and street observation through Bloom’s mind."},
  9:{summary:"At the National Library, Stephen presents an elaborate theory of Shakespeare, Hamlet, paternity, and artistic creation. Bloom passes through the building without meeting him.",homer:"Odysseus must steer between a devouring rock and a fatal whirlpool. Stephen navigates rival absolutes—material fact and mystical idealism.",characters:["Stephen Dedalus","John Eglinton","A. E.","Buck Mulligan","Leopold Bloom"],motifs:["Shakespeare","Paternity","Art","Duality"],form:"Dialectic makes the chapter an intellectual performance: claims divide, reverse, and recombine without settling into certainty."},
  10:{summary:"Nineteen short sections follow priests, children, workers, lovers, and familiar characters crossing Dublin, while the viceregal cavalcade passes through their dispersed lives.",homer:"Homer’s Wandering Rocks are a route Odysseus avoids. Joyce travels directly into them, making the whole city a field of moving obstacles.",characters:["Father Conmee","Leopold Bloom","Stephen Dedalus","Blazes Boylan","Dublin"],motifs:["Simultaneity","Parallax","Movement","The city"],form:"A labyrinth of interlocking vignettes cuts between lives. Small verbal echoes reveal that apparently separate scenes occupy one system."},
  11:{summary:"Music saturates the Ormond Hotel bar as Bloom eats, writes to Martha, listens to Simon Dedalus sing, and thinks about Molly while Boylan travels toward her.",homer:"The Sirens lure sailors with irresistible song. Bloom survives not by blocking sound but by listening through seduction, memory, and pain.",characters:["Leopold Bloom","Simon Dedalus","Ben Dollard","Miss Douce","Miss Kennedy"],motifs:["Music","Desire","Echo","Absence"],form:"Fuga per canonem composes prose as music: motifs announce themselves in an overture, return, overlap, and change key."},
  12:{summary:"In Barney Kiernan’s pub, an unnamed narrator and the Citizen turn drink, gossip, nationalism, and antisemitism into confrontation. Bloom escapes as a biscuit tin flies after him.",homer:"The one-eyed Cyclops traps Odysseus in a cave. Joyce’s giant is a narrow, monocular nationalism that cannot accommodate Bloom’s plural identity.",characters:["Leopold Bloom","The Citizen","The unnamed narrator","Martin Cunningham"],motifs:["Nationalism","Antisemitism","Violence","Hospitality"],form:"Gigantism alternates pub vernacular with enormous parodies of legal, biblical, epic, scientific, and journalistic language."},
  13:{summary:"On Sandymount Strand, Gerty MacDowell watches fireworks and imagines herself through sentimental romance conventions while Bloom watches her; the episode then shifts into his chastened reflection.",homer:"Nausicaa discovers the shipwrecked Odysseus by the shore. Joyce turns rescue into an uneasy encounter structured by looking and fantasy.",characters:["Gerty MacDowell","Leopold Bloom","Cissy Caffrey"],motifs:["The gaze","Romance","Fireworks","Distance"],form:"The first half swells with magazine-romance cliché before detumescence brings a flatter, more embarrassed Bloomian aftermath."},
  14:{summary:"At the National Maternity Hospital, Bloom waits for news of Mina Purefoy’s labor among medical students. The prose gestates through successive historical styles of English before erupting into slang.",homer:"Odysseus’s crew slaughter the sacred cattle of the sun. The students’ irreverence around childbirth becomes Joyce’s corresponding violation.",characters:["Leopold Bloom","Stephen Dedalus","Mina Purefoy","Buck Mulligan","Dixon"],motifs:["Birth","Language history","Paternity","Creation"],form:"Embryonic development recapitulates literary history, from Latinate beginnings through major English prose styles to modern speech."},
  15:{summary:"Nighttown becomes a vast dramatic hallucination. Bloom’s desires, guilt, gender, parenthood, and public fantasies take the stage; Stephen smashes a chandelier and is struck by a soldier.",homer:"Circe transforms Odysseus’s men into swine. In Nighttown, identities and objects transform without limit until Bloom begins guiding Stephen home.",characters:["Leopold Bloom","Stephen Dedalus","Bella Cohen","Rudy Bloom","The city’s phantoms"],motifs:["Metamorphosis","Guilt","Sexuality","Parenthood"],form:"A play script gives speech to objects, memories, accusations, fantasies, and the dead. Stage directions become an engine of hallucination."},
  16:{summary:"Bloom brings the exhausted Stephen to a cabman’s shelter. They listen to the sailor Murphy, exchange stories and misunderstandings, and slowly approach the possibility of companionship.",homer:"The swineherd Eumaeus shelters the disguised Odysseus and hears his doubtful tales. Hospitality arrives here through fatigue and imperfect narration.",characters:["Leopold Bloom","Stephen Dedalus","The sailor Murphy","Skin-the-Goat"],motifs:["Hospitality","Storytelling","Exhaustion","Return"],form:"Old narrative deliberately wanders, qualifies, repeats, and misfires, reproducing the tired clichés and uncertain facts of the shelter."},
  17:{summary:"At 7 Eccles Street, Bloom and Stephen make cocoa, compare beliefs, urinate beneath the stars, and part. Bloom enters the marital bed and inventories the altered evidence of Boylan’s visit.",homer:"Odysseus returns to Ithaca and reclaims his house. Bloom’s homecoming is quieter: hospitality, separation, cosmic scale, and negotiated acceptance.",characters:["Leopold Bloom","Stephen Dedalus","Molly Bloom"],motifs:["Home","Water","Stars","Fathers and sons"],form:"Impersonal catechism asks and answers hundreds of questions, making emotion emerge through apparently exact scientific description."},
  18:{summary:"Awake beside Bloom, Molly’s mind moves through Boylan, marriage, motherhood, Gibraltar, music, bodies, jealousy, pleasure, and the memory of accepting Bloom’s proposal.",homer:"Penelope waits and weaves while Odysseus travels. Molly’s fidelity is ironic, but her monologue becomes the book’s final act of embodied recognition.",characters:["Molly Bloom","Leopold Bloom","Blazes Boylan","Milly Bloom","Marion Tweedy’s past"],motifs:["Memory","Marriage","The body","Yes"],form:"Female monologue flows through eight famous long sentences in many editions; this Gutenberg file is divided into ten paragraph blocks with almost no terminal punctuation."}
};

const ACT_COLORS = { Telemachiad:"#e1b44e", Odyssey:"#e1644f", Nostos:"#55b2a6" } as const;
const TOTAL_WORDS = EPISODES.reduce((sum, episode) => sum + episode.words, 0);
const MAX_WORDS = Math.max(...EPISODES.map((episode) => episode.words));
const CENTER = { x:490, y:378 };

export function Ulysses() {
  const [selectedId, setSelectedId] = useState(15);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [detailTab, setDetailTab] = useState<"story" | "form" | "measure">("story");
  const activeId = hoveredId ?? selectedId;
  const active = EPISODES[activeId - 1];
  const guide = GUIDES[activeId];
  const weather = useMemo(() => buildWeather(active), [active]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSelectedId((current) => {
        if (current === EPISODES.length) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1150);
    return () => window.clearInterval(timer);
  }, [playing]);

  const points = useMemo(() => EPISODES.map((episode, index) => {
    const angle = ((episode.clock % 24) / 24) * Math.PI * 2 - Math.PI / 2;
    const radius = 116 + index * 12.2;
    return {
      episode,
      x:CENTER.x + Math.cos(angle) * radius,
      y:CENTER.y + Math.sin(angle) * radius,
      r:6 + Math.sqrt(episode.words / MAX_WORDS) * 14
    };
  }), []);

  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

  function togglePlayback() {
    if (!playing && selectedId === EPISODES.length) setSelectedId(1);
    setHoveredId(null);
    setPlaying((value) => !value);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div><p className={styles.kicker}>Dublin · 16 June 1904 · 18 experiments</p><h1>One day. An entire world.</h1></div>
        <p className={styles.intro}><em>Ulysses</em> turns a walk through Dublin into an anatomy of consciousness. Time doubles back, language changes its laws, and an ordinary day expands to hold an epic.</p>
      </header>

      <section className={styles.workspace}>
        <div className={styles.chartCard}>
          <div className={styles.chartIntro}>
            <div><p className={styles.eyebrow}>The day spiral</p><h2>Eighteen episodes. One clock that refuses to stay flat.</h2></div>
            <p>Angle is time; distance is narrative order; circle area is word count. Behind the route, the selected episode blooms into language weather shaped by paragraph breaks, questions, and exclamations.</p>
          </div>

          <div className={styles.chartFrame}>
            <div className={styles.weatherKey}><span><i />Paragraph field</span><span><i />Questions</span><span><i />Exclamations</span></div>
            <svg className={styles.chart} role="img" aria-label="A spiral of the eighteen episodes of Ulysses arranged by time of day and narrative order" viewBox="0 0 980 760">
              <defs>
                <radialGradient id="ulyssesGlow">
                  <stop offset="0" stopColor="#fff7dd" stopOpacity=".18" />
                  <stop offset="1" stopColor="#fff7dd" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle className={styles.glow} cx={CENTER.x} cy={CENTER.y} r="336" />
              <path className={styles.paragraphWeather} d={weather.paragraphs} fill={ACT_COLORS[active.act]} />
              <path className={styles.questionWeather} d={weather.questions} />
              <path className={styles.exclaimWeather} d={weather.exclaims} />
              <text className={styles.weatherWord} x={CENTER.x} y="720">{active.title}</text>
              {[116,177,238,299].map((radius) => <circle className={styles.orbit} cx={CENTER.x} cy={CENTER.y} key={radius} r={radius} />)}
              {Array.from({ length:8 }, (_, index) => index * 3).map((hour) => {
                const angle = hour / 24 * Math.PI * 2 - Math.PI / 2;
                const x1 = CENTER.x + Math.cos(angle) * 100;
                const y1 = CENTER.y + Math.sin(angle) * 100;
                const x2 = CENTER.x + Math.cos(angle) * 323;
                const y2 = CENTER.y + Math.sin(angle) * 323;
                const lx = CENTER.x + Math.cos(angle) * 350;
                const ly = CENTER.y + Math.sin(angle) * 350;
                return <g key={hour}><line className={styles.hourLine} x1={x1} y1={y1} x2={x2} y2={y2} /><text className={styles.hourLabel} x={lx} y={ly + 4}>{formatHour(hour)}</text></g>;
              })}
              <path className={styles.dayPath} d={path} />
              <circle className={styles.centerDisc} cx={CENTER.x} cy={CENTER.y} r="88" />
              <text className={styles.centerOverline} x={CENTER.x} y={CENTER.y - 24}>BLOOMSDAY</text>
              <text className={styles.centerDate} x={CENTER.x} y={CENTER.y + 6}>16 June</text>
              <text className={styles.centerYear} x={CENTER.x} y={CENTER.y + 31}>1904</text>

              {points.map(({ episode, x, y, r }) => {
                const isActive = episode.id === activeId;
                const showLabel = isActive || [1,4,7,11,15,18].includes(episode.id);
                const side = episode.id === 15 ? -1 : x < CENTER.x ? -1 : 1;
                const labelShift = ({ 1:-22, 4:14, 7:12 } as Record<number,number>)[episode.id] ?? 0;
                return <g className={styles.episode} key={episode.id} onMouseEnter={() => setHoveredId(episode.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(episode.id)} onBlur={() => setHoveredId(null)} onClick={() => setSelectedId(episode.id)} role="button" tabIndex={0}>
                  {isActive && <circle className={styles.activeHalo} cx={x} cy={y} r={r + 9} />}
                  <circle className={styles.episodeDot} cx={x} cy={y} fill={ACT_COLORS[episode.act]} r={r} />
                  <text className={styles.episodeNumber} x={x} y={y + 3}>{episode.id}</text>
                  {showLabel && <text className={`${styles.episodeLabel} ${isActive ? styles.activeLabel : ""}`} textAnchor={side < 0 ? "end" : "start"} x={x + side * (r + 8)} y={y - 4 + labelShift}>{episode.title}</text>}
                  {showLabel && <text className={styles.episodeTime} textAnchor={side < 0 ? "end" : "start"} x={x + side * (r + 8)} y={y + 12 + labelShift}>{episode.time} · {episode.words.toLocaleString()} words</text>}
                </g>;
              })}
            </svg>
          </div>

          <div className={styles.transport}>
            <button className={styles.playButton} onClick={togglePlayback} type="button"><span>{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause the day" : selectedId === 18 ? "Replay the day" : "Walk the day"}</button>
            <div className={styles.episodeRail} aria-label="Episode word counts">
              {EPISODES.map((episode) => <button aria-label={`${episode.title}: ${episode.words.toLocaleString()} words`} aria-pressed={episode.id === activeId} key={episode.id} onClick={() => { setPlaying(false); setSelectedId(episode.id); }} style={{ "--bar":`${Math.max(12, episode.words / MAX_WORDS * 100)}%`, "--color":ACT_COLORS[episode.act] } as React.CSSProperties} type="button"><i /><span>{episode.id}</span></button>)}
            </div>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.inspectorTop}><span>{String(active.id).padStart(2,"0")}</span><div><p>{active.act} · {active.time}</p><h2>{active.title}</h2></div></div>
          <p className={styles.scene}>{active.scene}</p>
          <div className={styles.detailTabs} aria-label="Episode details">
            <button aria-pressed={detailTab === "story"} onClick={() => setDetailTab("story")} type="button">Story</button>
            <button aria-pressed={detailTab === "form"} onClick={() => setDetailTab("form")} type="button">Form</button>
            <button aria-pressed={detailTab === "measure"} onClick={() => setDetailTab("measure")} type="button">Measure</button>
          </div>

          {detailTab === "story" && <div className={styles.detailPanel}>
            <p className={styles.summary}>{guide.summary}</p>
            <div className={styles.detailBlock}><span>Homeric mirror</span><p>{guide.homer}</p></div>
            <div className={styles.detailBlock}><span>People in the room</span><div className={styles.chips}>{guide.characters.map((character) => <i key={character}>{character}</i>)}</div></div>
            <div className={styles.detailBlock}><span>Motifs in motion</span><div className={styles.chips}>{guide.motifs.map((motif) => <i key={motif}>{motif}</i>)}</div></div>
          </div>}

          {detailTab === "form" && <div className={styles.detailPanel}>
            <blockquote>“{active.opening} …”</blockquote>
            <p className={styles.formNote}>{guide.form}</p>
            <dl className={styles.schema}>
              <div><dt>Body</dt><dd>{active.organ}</dd></div>
              <div><dt>Art</dt><dd>{active.art}</dd></div>
              <div><dt>Technique</dt><dd>{active.technique}</dd></div>
              <div><dt>Symbol</dt><dd>{active.symbol}</dd></div>
            </dl>
          </div>}

          {detailTab === "measure" && <div className={styles.detailPanel}>
            <div className={styles.wordMetric}><span>Measured text</span><strong>{active.words.toLocaleString()}</strong><small>words · {(active.words / TOTAL_WORDS * 100).toFixed(1)}% of the novel</small></div>
            <div className={styles.measureGrid}>
              <div><span>Distinct words</span><strong>{active.unique.toLocaleString()}</strong></div>
              <div><span>Vocabulary share</span><strong>{active.lexical.toFixed(1)}%</strong></div>
              <div><span>Paragraph blocks</span><strong>{active.paragraphs.toLocaleString()}</strong></div>
              <div><span>Words / block</span><strong>{Math.round(active.words / active.paragraphs)}</strong></div>
              <div><span>Question marks</span><strong>{active.questions.toLocaleString()}</strong></div>
              <div><span>Exclamation marks</span><strong>{active.exclaims.toLocaleString()}</strong></div>
            </div>
            <div className={styles.fingerprint}>
              <p>Language pressure / 10,000 words</p>
              <Metric label="Questions" value={`${Math.round(active.questions / active.words * 10000)}`} width={Math.min(100,active.questions / active.words * 10000 / 140 * 100)} />
              <Metric label="Exclaims" value={`${Math.round(active.exclaims / active.words * 10000)}`} width={Math.min(100,active.exclaims / active.words * 10000 / 190 * 100)} />
              <Metric label="Paragraph breaks" value={`${Math.round(active.paragraphs / active.words * 10000)}`} width={Math.min(100,active.paragraphs / active.words * 10000 / 520 * 100)} />
            </div>
          </div>}
          <small className={styles.hint}>Hover to inspect. Click to pin.</small>
        </aside>
      </section>

      <section className={styles.factBand} aria-label="Ulysses measurements">
        <div><strong>{TOTAL_WORDS.toLocaleString()}</strong><span>measured words</span></div>
        <div><strong>18</strong><span>episodes</span></div>
        <div><strong>38,042</strong><span>words in Circe</span></div>
        <div><strong>10</strong><span>paragraphs in Penelope</span></div>
      </section>

      <section className={styles.reading}>
        <div><p className={styles.eyebrow}>Three impossible shapes</p><h2>The book keeps changing the instrument used to measure it.</h2></div>
        <div className={styles.readingGrid}>
          <article><span>01 · Time folds</span><h3>Two mornings occupy the same clock.</h3><p>Stephen reaches 11 a.m. in episode three. Episode four returns to 8 a.m. and begins Bloom’s day, creating the spiral’s only dramatic backward leap.</p></article>
          <article><span>02 · Night expands</span><h3>Midnight becomes the largest room.</h3><p><em>Circe</em> alone contains 38,042 measured words—14.4% of this edition—and stages Nighttown as an erupting dramatic hallucination.</p></article>
          <article><span>03 · Punctuation dissolves</span><h3>Ten paragraphs carry the final voice.</h3><p><em>Penelope</em> closes with 24,065 words in only ten paragraph blocks. Its measured question and exclamation marks fall to zero; syntax yields to Molly’s current of thought.</p></article>
        </div>
      </section>

      <footer className={styles.dataNote}>
        <strong>Source &amp; method</strong>
        <div><p>Episode text is Project Gutenberg eBook 4300, based on pre-1923 print editions. Counts use letter-based word tokens and Gutenberg paragraph breaks, so they are edition- and method-specific. Episode names, scenes, hours, organs, arts, symbols, and techniques follow Joyce’s Gilbert schema; concise episode dossiers were cross-checked against UlyssesGuide. “Penelope” is placed just after 2 a.m. for legibility because the schema gives no hour.</p><div><a href="https://www.gutenberg.org/ebooks/4300">Project Gutenberg text ↗</a><a href="https://en.wikipedia.org/wiki/Gilbert_schema_for_Ulysses">Gilbert schema table ↗</a><a href="https://www.ulyssesguide.com/">UlyssesGuide ↗</a><a href="https://ulysseseurope.eu/about/our-schemas-themes/">Schema background ↗</a></div></div>
      </footer>
    </main>
  );
}

function Metric({ label, value, width }: { label:string; value:string; width:number }) {
  return <div className={styles.metric}><span>{label}</span><strong>{value}</strong><i><b style={{ width:`${width}%` }} /></i></div>;
}

function formatHour(hour:number) {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

function buildWeather(episode:Episode) {
  const paragraphPressure = Math.log1p(episode.paragraphs) / Math.log1p(1441);
  const questionPressure = Math.min(1, episode.questions / episode.words * 10000 / 140);
  const exclaimPressure = Math.min(1, episode.exclaims / episode.words * 10000 / 190);
  return {
    paragraphs:polarBlob(95 + paragraphPressure * 54, 30 + paragraphPressure * 76, episode.id * .47, 5 + episode.id % 5),
    questions:polarBlob(126 + questionPressure * 47, 12 + questionPressure * 48, episode.id * .31, 7),
    exclaims:polarBlob(151 + exclaimPressure * 60, 10 + exclaimPressure * 55, episode.id * .23, 11)
  };
}

function polarBlob(base:number, amplitude:number, phase:number, lobes:number) {
  const points = Array.from({ length:96 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2 - Math.PI / 2;
    const wave = .52 + .3 * Math.sin(angle * lobes + phase) + .18 * Math.sin(angle * (lobes + 4) - phase * .7);
    const radius = base + amplitude * wave;
    return `${CENTER.x + Math.cos(angle) * radius},${CENTER.y + Math.sin(angle) * radius}`;
  });
  return `M${points.join(" L")} Z`;
}
