(function(){
  var cfg=window.BFK_REVIEWS||{};
  var live=/^https:\/\/.+/.test(cfg.SUPABASE_URL||"")&&cfg.SUPABASE_ANON_KEY&&cfg.SUPABASE_ANON_KEY.indexOf("PASTE_")!==0&&window.supabase;
  var sb=live?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  var $=function(id){return document.getElementById(id)};
  if(!live){$("demo-banner").hidden=false;}
  function esc(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML}
  function empty(msg){$("reviews-grid").innerHTML='<div class="ln-empty" style="grid-column:1/-1">'+esc(msg)+'</div>'}
  function render(rows){
    if(!rows||!rows.length)return empty("Reviews coming soon. Be the first to share yours!");
    $("reviews-grid").innerHTML=rows.map(function(r){
      var n=Math.max(1,Math.min(5,r.rating|0)),meta=[r.event_type];
      if(r.event_date){var d=new Date(r.event_date+"T00:00:00");if(!isNaN(d))meta.push(d.toLocaleDateString(undefined,{month:"long",year:"numeric"}))}
      var img=/^https:\/\//.test(r.photo_url||"")?'<img loading="lazy" src="'+esc(r.photo_url)+'" alt="Photo from '+esc(r.name)+'">':"";
      return '<article class="ln-card">'+img+'<div class="ln-body"><div class="ln-stars" aria-label="'+n+' out of 5 stars">'+"★".repeat(n)+"☆".repeat(5-n)+'</div><blockquote class="ln-quote">'+esc(r.text)+'</blockquote><div class="ln-who">'+esc(r.name)+'</div><div class="ln-meta">'+esc(meta.join(" · "))+'</div></div></article>';
    }).join("");
  }
  if(sb){
    sb.from("reviews").select("id,created_at,name,event_type,event_date,rating,text,photo_url").eq("approved",true).order("created_at",{ascending:false}).limit(100)
      .then(function(res){if(res.error){console.warn(res.error);empty("Reviews coming soon.")}else render(res.data)});
  } else render([]);

  function resize(file){
    return new Promise(function(ok,fail){
      var url=URL.createObjectURL(file),img=new Image();
      img.onload=function(){
        var max=1600,s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");
        c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
        (function tryQ(q){c.toBlob(function(b){if(!b)return fail(new Error("Could not read photo"));
          if(b.size>2*1024*1024&&q>0.45)return tryQ(q-0.1);
          if(b.size>2*1024*1024)return fail(new Error("Photo is too large, please choose a smaller one."));ok(b)},"image/jpeg",q)})(0.85);
      };
      img.onerror=function(){URL.revokeObjectURL(url);fail(new Error("That file doesn't look like a photo."))};
      img.src=url;
    });
  }
  var f=$("review-form");
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var err=[],name=f.name.value.trim(),type=f.event_type.value,text=f.text.value.trim(),date=f.event_date.value||null;
    var rEl=f.querySelector('input[name="rating"]:checked'),rating=rEl?+rEl.value:0,file=f.photo.files[0];
    [f.name,f.event_type,f.text].forEach(function(el){el.classList.remove("invalid")});
    if(!name){err.push("your name");f.name.classList.add("invalid")}
    if(!type){err.push("the event type");f.event_type.classList.add("invalid")}
    if(!rating)err.push("a star rating");
    if(text.length<10){err.push("a review (at least 10 characters)");f.text.classList.add("invalid")}
    if(file&&!/^image\//.test(file.type))err.push("a valid photo file");
    if(err.length){$("form-error").textContent="Please add "+err.join(", ")+".";return}
    $("form-error").textContent="";
    var btn=f.querySelector("button");btn.disabled=true;btn.textContent="Sending…";
    var done=function(){f.hidden=true;$("thanks").hidden=false;$("thanks-demo").hidden=!!sb;$("thanks").focus()};
    var fail=function(m){btn.disabled=false;btn.textContent="Send review";$("form-error").textContent=m||"Something went wrong, please try again."};
    var p=file?resize(file):Promise.resolve(null);
    p.then(function(blob){
      if(!sb)return done();
      var up=blob?sb.storage.from("review-photos").upload("pending/"+Date.now()+"-"+Math.random().toString(36).slice(2)+".jpg",blob,{contentType:"image/jpeg",upsert:false})
        .then(function(r){if(r.error)throw r.error;return sb.storage.from("review-photos").getPublicUrl(r.data.path).data.publicUrl}):Promise.resolve(null);
      return up.then(function(photo_url){
        return sb.from("reviews").insert({name:name,event_type:type,event_date:date,rating:rating,text:text,photo_url:photo_url,approved:false})
          .then(function(r){if(r.error)throw r.error;done()});
      });
    }).catch(function(e){console.warn(e);fail(e&&e.message&&/photo/i.test(e.message)?e.message:null)});
  });
})();
