global.window = {}; require(require('path').join(__dirname, '../public/match.js'));
const F = ['Sophs','Dan L','Sam','Sam K','Sophie','Priya','Tom','Jo','Dana'].map((n,i)=>({id:'f'+i,name:n}));
const cases = [
 ['sofs wondering how her exam went','Sophs','wondering how her exam went'],
 ['Thinking of sofs wondering how her exam went','Sophs','wondering how her exam went'],
 ['Daniele hope the move went well','Dan L','hope the move went well'],
 ['dan el hope the move went well','Dan L','hope the move went well'],
 ['Sophie, wondering how her exam went','Sophie','wondering how her exam went'],
 ['sophie wondering how her exam went','Sophie','wondering how her exam went'],
 ['sam k how was the gig','Sam K','how was the gig'],
 ['Sam kicked a ball today','Sam','kicked a ball today'],
 ['Sam','Sam',''],
 ['priyah big day','Priya','big day'],
 ['Tom.','Tom',''],
 ['dana says hi','Dana','says hi'],
 ['jo jo','Jo','jo'],
 ['Bob loves cake',null,''],
];
let fail=0;
for(const [t,exp,note] of cases){ const r=window.matchThought(t,F); const got=r.best?F.find(f=>f.id===r.best.id).name:null;
  const ok = got===exp && (!exp || r.best.note===note); if(!ok) fail++;
  console.log(ok?'ok  ':'FAIL', JSON.stringify(t),'->',got, r.best?JSON.stringify(r.best.note)+' '+r.best.score.toFixed(2):'', ok?'':'| cands '+r.candidates.map(c=>c.name+':'+c.score.toFixed(2)).join(' '));}
console.log(fail?fail+' failing':'all pass'); process.exitCode = fail ? 1 : 0;
