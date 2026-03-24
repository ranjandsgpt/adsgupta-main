(function(w,d){'use strict';
  var A='https://exchange.adsgupta.com/api/openrtb/auction';
  var T='https://exchange.adsgupta.com/api/track';
  var mde=w.mde=w.mde||{};
  var slots=[],cfg={};
  mde.init=function(c){cfg=c||{};};
  mde.defineSlot=function(s){slots.push(s);};
  mde.enableServices=function(){};
  mde.display=function(divId){
    var slot=slots.find(function(s){return s.div===divId;});
    if(!slot)return;
    var req={id:uid(),imp:[{id:'1',tagid:slot.unitId,bidfloor:slot.floor||0.50,
      banner:{format:sizes(slot.sizes)},secure:loc()?1:0}],
      site:{page:location.href,domain:location.hostname},
      device:{ua:navigator.userAgent,w:screen.width,h:screen.height},at:2,tmax:500};
    fetch(A,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(req)})
      .then(function(r){return r.json();})
      .then(function(res){
        if(!res.seatbid||!res.seatbid[0])return;
        var bid=res.seatbid[0].bid[0];
        var el=d.getElementById(divId);
        if(!el||!bid.adm)return;
        var sz=(slot.sizes||['300x250'])[0].split('x');
        var f=d.createElement('iframe');
        f.width=sz[0];f.height=sz[1];f.frameBorder='0';f.scrolling='no';
        f.style.border='none';f.srcdoc=bid.adm;el.appendChild(f);
        new Image().src=T+'/impression?id='+encodeURIComponent(bid.id);
        if(bid.nurl)fetch(bid.nurl.replace('${AUCTION_PRICE}',String(bid.price))).catch(function(){});
      }).catch(function(){});
  };
  function uid(){return Math.random().toString(36).substr(2,9)+Date.now().toString(36);}
  function loc(){return location.protocol==='https:';}
  function sizes(s){return(s||['300x250']).map(function(x){var p=x.split('x');return{w:+p[0],h:+p[1]};});}
  var q=mde.cmd||[];mde.cmd={push:function(fn){fn();}};
  if(q.forEach)q.forEach(function(fn){fn();});
})(window,document);
