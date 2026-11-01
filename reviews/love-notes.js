/* BFK Love Notes — renders window.BFK_REVIEWS (reviews/reviews.js) into #love-notes / #reviews. No network calls. */
(function(){
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function stars(n){n=Math.max(0,Math.min(5,Math.round(+n)||0));return '<div class="ln-stars" aria-label="'+n+' out of 5 stars">'+"★★★★★".slice(0,n)+'<span style="opacity:.25">'+"★★★★★".slice(0,5-n)+"</span></div>"}
  function card(r){return '<article class="ln-card">'+(r.photo?'<img loading="lazy" src="'+esc(r.photo)+'" alt="'+esc(r.name)+'">':'')+
    '<div class="ln-body">'+(r.stars?stars(r.stars):'<div class="ln-mark">“</div>')+'<p class="ln-quote">'+esc(r.quote)+'</p>'+
    '<div class="ln-who">'+esc(r.name)+'</div><div class="ln-meta">'+esc(r.event)+'</div></div></article>'}
  function mount(){
    var el=document.getElementById("love-notes")||document.querySelector("#reviews[data-love-notes]");
    if(!el){if(document.getElementById("root"))return false;var f=document.querySelector("footer");if(!f)return false;el=document.createElement("section");el.id="love-notes";f.parentNode.insertBefore(el,f)}
    if(el.dataset.done)return true;el.dataset.done=1;
    var wall=el.dataset.wall==="1",limit=+(el.dataset.limit||6),list=(window.BFK_REVIEWS||[]).filter(function(r){return r&&r.quote&&r.name});
    var g=window.BFK_GOOGLE_REVIEW_URL||"",hasG=/^https:\/\//.test(g);
    var leave=hasG?'<a class="ln-btn ln-leave" href="'+esc(g)+'" target="_blank" rel="noopener">★ Leave a review on Google</a>':'';
    var more=(!wall&&list.length>limit)||(!wall&&list.length)?'<a class="ln-btn ghost" href="/reviews/">Read all love notes</a>':'';
    el.className="ln-section";
    el.innerHTML='<div class="ln-inner"><p class="ln-kicker">Love Notes</p><h2 class="ln-title">'+(wall?"Every word, from our clients":"Kind words from our clients")+'</h2>'+
      '<p class="ln-sub">Real notes from the people we’ve had the honour of photographing and filming.</p><div class="ln-grid">'+
      (list.length?list.slice(0,wall?999:limit).map(card).join(""):'<div class="ln-empty">Love notes coming soon. ♡</div>')+
      '</div>'+((leave||more)?'<div class="ln-cta">'+leave+more+'</div>':'')+'</div>';
    return true}
  function boot(){if(mount())return;var o=new MutationObserver(function(){if(mount())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(function(){o.disconnect()},15000)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
