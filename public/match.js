// Matches dictated text like "thinking of sofs wondering how her exam went" to a friend, even when
// Siri spells the name differently ("sofs" for Sophs, "daniele" for Dan L) or drops the comma.
// Exposes matchThought(text, friends) -> {best:{id, note, score}|null, candidates:[...]}.
(function(){
  const LETTERS = {a:"ay",b:"bee",c:"see",d:"dee",e:"ee",f:"ef",g:"jee",h:"aitch",i:"eye",j:"jay",k:"kay",l:"el",m:"em",
    n:"en",o:"oh",p:"pee",q:"cue",r:"ar",s:"ess",t:"tee",u:"you",v:"vee",w:"doubleyou",x:"ex",y:"why",z:"zed"};
  const clean = s => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  // "Dan L" is said "dan el": spell out lone letters so it sounds like it's said
  const spoken = s => clean(s).split(" ").map(w => w.length === 1 && LETTERS[w] ? LETTERS[w] : w).join(" ");
  const squash = s => s.replace(/\s+/g, "");
  function phon(s){
    s = squash(s);
    s = s.replace(/ph/g,"f").replace(/ck/g,"k").replace(/q/g,"k").replace(/x/g,"ks").replace(/z/g,"s")
         .replace(/c(?=[eiy])/g,"s").replace(/c/g,"k").replace(/gh/g,"g").replace(/wh/g,"w").replace(/^kn/,"n").replace(/y/g,"i")
         .replace(/(.)\1+/g,"$1");
    return (s[0] || "") + s.slice(1).replace(/[aeiou]/g,"").replace(/(.)\1+/g,"$1");
  }
  function lev(a, b){
    if(a === b) return 0; if(!a.length) return b.length; if(!b.length) return a.length;
    let prev = [...Array(b.length+1).keys()];
    for(let i=1;i<=a.length;i++){
      const cur = [i];
      for(let j=1;j<=b.length;j++) cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1] + (a[i-1]===b[j-1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  const ratio = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);
  // how alike a spoken phrase is to one way of saying a name: mostly by sound, partly by spelling
  function sim(phrase, variant){
    const a = squash(phrase), b = squash(variant);
    if(a === b) return 1;
    return .6 * ratio(phon(phrase), phon(variant)) + .4 * ratio(a, b);
  }
  // [way of saying the name, weight]; first name alone ("Dan" for "Dan L") counts slightly less than the full name
  function variantsOf(f){
    const out = [[spoken(f.name), 1]];
    (f.aliases || "").split(",").map(s => s.trim()).filter(Boolean).forEach(a => out.push([spoken(a), 1]));
    const parts = clean(f.name).split(" ");
    if(parts.length > 1 && parts[0].length > 1) out.push([parts[0], .96]);
    return out.filter(([v]) => v);
  }

  window.matchThought = function(text, friends){
    const words = clean(text).replace(/^(i m |im |i am )?(thinking|thought) (of|about) /, "").split(" ").filter(Boolean);
    const rawWords = text.trim().replace(/^\s*(i'?m |i am )?(thinking|thought) (of|about)\s+/i, "").split(/\s+/);
    const scored = [];
    for(const f of friends){
      const vs = variantsOf(f);
      let best = null;
      for(let k = 1; k <= Math.min(4, words.length); k++){
        const phrase = spoken(words.slice(0, k).join(" "));
        const s = Math.max(...vs.map(([v, w]) => w * sim(phrase, v)));
        // prefer the longer phrase when it matches as well (so "sam k" picks Sam K over Sam)
        if(!best || s > best.score + .02 || (s >= best.score - .02 && s >= .66 && k > best.k)) best = {score:s, k};
      }
      // for a mere candidate, assume the name took as many words as it has ("Rosalind" 1, "Dan L" 2)
      if(best) scored.push({id:f.id, name:f.name, score:best.score, k:best.k, kc: Math.min(clean(f.name).split(" ").length, words.length)});
    }
    scored.sort((a,b) => b.score - a.score || b.k - a.k);
    const noteFor = k => rawWords.slice(k).join(" ").replace(/^[\s,.:;\-–—]+/, "").trim();
    const top = scored[0];
    // confident if it's a good match and clearly ahead of the next friend
    // (or, at an equal score, it accounts for more of the words: "sam k …" is Sam K, not Sam)
    const second = scored[1];
    const confident = top && top.score >= .66 && (!second || top.score - second.score >= .03 || (top.k > second.k && top.score >= second.score));
    return {
      best: confident ? {id:top.id, score:top.score, note:noteFor(top.k)} : null,
      candidates: scored.filter(c => c.score >= .4).slice(0, 3).map(c => ({id:c.id, name:c.name, score:c.score, note:noteFor(c.kc)})),
      guess: words.slice(0, 2).join(" "),
    };
  };
})();
