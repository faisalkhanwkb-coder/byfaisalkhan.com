/* BFK Love Notes — renders approved reviews into #love-notes (or injects before the footer). */
(function(){
  var SAMPLE=[{couple:"Your names here",event:"Wedding",month:"",stars:5,review:"Your love note could be the first one here.",photo:""}];
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function stars(n){n=Math.max(0,Math.min(5,+n||0));return "★★★★★".slice(0,n)+'<span style="opacity:.25">'+"★★★★★".slice(0,5-n)+"</span>"}
  function card(r){return '<article class="ln-card">'+(r.photo?'<img loading="lazy" src="'+esc(r.photo)+'" alt="'+esc(r.couple)+'">':'')+
    '<div class="ln-body"><div class="ln-stars" aria-label="'+r.stars+' stars">'+stars(r.stars)+'</div><p class="ln-quote">“'+esc(r.review)+'”</p>'+
    '<div class="ln-who">'+esc(r.couple)+'</div><div class="ln-meta">'+esc([r.event,r.month].filter(Boolean).join(" · "))+'</div></div></article>'}
  function mount(){
    var el=document.getElementById("love-notes");
    if(!el){var f=document.querySelector("footer");if(!f)return false;el=document.createElement("section");el.id="love-notes";f.parentNode.insertBefore(el,f)}
    if(el.dataset.done)return true;el.dataset.done=1;
    var limit=+(el.dataset.limit||6), wall=el.dataset.wall==="1";
    el.className="ln-section";
    el.innerHTML='<div class="ln-inner"><p class="ln-kicker">Love Notes</p><h2 class="ln-title">'+(wall?"Every word, from our couples":"Kind words from our couples")+'</h2>'+
      '<p class="ln-sub">Real notes from the families we’ve had the honour of filming and photographing.</p><div class="ln-grid"><div class="ln-empty">Loading love notes…</div></div>'+
      '<div class="ln-cta">'+(wall?'':'<a class="ln-btn" href="/reviews/">Read all love notes</a>')+'<a class="ln-btn'+(wall?'':' ghost')+'" href="/review/">Leave yours</a></div></div>';
    var grid=el.querySelector(".ln-grid");
    function empty(){grid.innerHTML='<div class="ln-empty">Our love notes are on their way. ♡<br>Worked with BFK? <a href="/review/" style="color:#A8742F">Be the first to leave one.</a></div>'}
    var url=window.BFK_REVIEWS_ENDPOINT||"";
    if(/demo=1/.test(location.search)){grid.innerHTML=DEMO.slice(0,wall?99:limit).map(card).join("");return true}
    if(!/^https:\/\/script\.google/.test(url)){empty();return true}
    fetch(url+"?action=list").then(function(r){return r.json()}).then(function(d){
      var list=(d&&d.reviews)||[];if(!list.length)return empty();
      grid.innerHTML=list.slice(0,wall?999:limit).map(card).join("")}).catch(empty);
    return true}
  var DEMO=[
    {couple:"Ayesha & Bilal",event:"Wedding",month:"Dec 2025",stars:5,review:"Faisal made us forget the camera was even there. Every frame feels like that day.",photo:"/og.jpg"},
    {couple:"Hira & Usman",event:"Walima",month:"Feb 2026",stars:5,review:"The film made our parents cry happy tears. Calm, kind and so talented.",photo:""},
    {couple:"Sana & Hamza",event:"Mehndi",month:"Mar 2026",stars:4,review:"Colours, dancing, chaos — he caught all of it beautifully.",photo:""}];
  function boot(){if(mount())return;var o=new MutationObserver(function(){if(mount())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(function(){o.disconnect()},15000)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
