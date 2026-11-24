
function fmt(n,d){if(!isFinite(n))return"–";return n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});}
function val(id){var e=document.getElementById(id);if(!e)return NaN;var v=parseFloat(String(e.value).replace(',','.'));return isNaN(v)?NaN:v;}
function show(id){document.getElementById(id).classList.add('show');}

/* ---------- Ohmsches Gesetz ---------- */
function calcOhm(){
  var U=val('oU'),I=val('oI'),R=val('oR'),P=val('oP'),known=0,msg='';
  [U,I,R,P].forEach(function(x){if(!isNaN(x))known++;});
  if(known<2){document.getElementById('oRes').innerHTML='<b>Bitte zwei Werte eingeben</b> – der Rechner ermittelt die beiden anderen.';show('oRes');return;}
  if(!isNaN(U)&&!isNaN(I)){R=U/I;P=U*I;msg='Aus U und I: R = U / I, P = U · I';}
  else if(!isNaN(U)&&!isNaN(R)){I=U/R;P=U*U/R;msg='Aus U und R: I = U / R, P = U² / R';}
  else if(!isNaN(U)&&!isNaN(P)){I=P/U;R=U*U/P;msg='Aus U und P: I = P / U, R = U² / P';}
  else if(!isNaN(I)&&!isNaN(R)){U=I*R;P=I*I*R;msg='Aus I und R: U = I · R, P = I² · R';}
  else if(!isNaN(I)&&!isNaN(P)){U=P/I;R=P/(I*I);msg='Aus I und P: U = P / I, R = P / I²';}
  else if(!isNaN(R)&&!isNaN(P)){U=Math.sqrt(P*R);I=Math.sqrt(P/R);msg='Aus R und P: U = √(P · R), I = √(P / R)';}
  document.getElementById('oRes').innerHTML='<div class="big">U = '+fmt(U,2)+' V &nbsp;·&nbsp; I = '+fmt(I,3)+' A &nbsp;·&nbsp; R = '+fmt(R,2)+' Ω &nbsp;·&nbsp; P = '+fmt(P,1)+' W</div><div class="small">'+msg+'</div>';
  show('oRes');
}

/* ---------- Leistung ---------- */
function calcLeistung(){
  var sys=document.getElementById('lSys').value;
  var U=val('lU'),I=val('lI'),P=val('lP'),cos=val('lCos'); if(isNaN(cos))cos=1;
  var k=(sys==='ds')?Math.sqrt(3):1;
  if(isNaN(U)){document.getElementById('lRes').innerHTML='<b>Bitte die Spannung U eingeben.</b>';show('lRes');return;}
  var out='';
  if(!isNaN(I)&&isNaN(P)){P=k*U*I*cos;out='P = '+(sys==='ds'?'√3 · U · I · cos φ':'U · I · cos φ');}
  else if(!isNaN(P)&&isNaN(I)){I=P/(k*U*cos);out='I = P / ('+(sys==='ds'?'√3 · U':'U')+' · cos φ)';}
  else if(!isNaN(I)&&!isNaN(P)){out='Beide Werte vorgegeben – Kontrolle: P berechnet = '+fmt(k*U*I*cos,1)+' W';}
  else{document.getElementById('lRes').innerHTML='<b>Bitte entweder Strom I oder Leistung P eingeben.</b>';show('lRes');return;}
  var S=(cos>0)?P/cos:NaN;
  document.getElementById('lRes').innerHTML='<div class="big">P = '+fmt(P,1)+' W ('+fmt(P/1000,3)+' kW) &nbsp;·&nbsp; I = '+fmt(I,2)+' A</div><div>Scheinleistung S = '+fmt(S,1)+' VA &nbsp;·&nbsp; '+out+'</div>';
  show('lRes');
}

/* ---------- Spannungsfall & Querschnitt ---------- */
var STD=[1.5,2.5,4,6,10,16,25,35,50,70,95,120];
var AMP_B2={1.5:15.5,2.5:21,4:28,6:36,10:49,16:64,25:83,35:103,50:125,70:160,95:194,120:223};
function dU(sys,L,I,kap,A,cos){
  if(sys==='ds')return Math.sqrt(3)*L*I*cos/(kap*A);
  return 2*L*I*cos/(kap*A);
}
function calcFall(){
  var sys=document.getElementById('fSys').value;
  var kap=parseFloat(document.getElementById('fMat').value);
  var L=val('fL'),I=val('fI'),U=val('fU'),A=parseFloat(document.getElementById('fA').value);
  var cos=val('fCos'); if(isNaN(cos))cos=1;
  var lim=parseFloat(document.getElementById('fLim').value);
  if(isNaN(L)||isNaN(I)||isNaN(U)){document.getElementById('fRes').innerHTML='<b>Bitte Länge, Strom und Spannung eingeben.</b>';show('fRes');return;}
  var d=dU(sys,L,I,kap,A,cos),pct=d/U*100,rest=U-d;
  var rec='–';for(var i=0;i<STD.length;i++){if(dU(sys,L,I,kap,STD[i],cos)/U*100<=lim){rec=fmt(STD[i],1)+' mm²';break;}}
  if(rec==='–')rec='> 120 mm² (gesondert planen)';
  var amp=AMP_B2[A],ampTxt='';
  if(amp){ampTxt='<div>Belastbarkeit Richtwert (Verlegeart B2, vereinfacht): '+fmt(amp,1)+' A – Ihr Strom: '+fmt(I,1)+' A '+(I<=amp?'<span class="verdict ok">✓ im Richtwert</span>':'<span class="verdict bad">✗ über dem Richtwert – Querschnitt erhöhen!</span>')+'</div>';}
  var ok=pct<=lim;
  document.getElementById('fRes').innerHTML='<div class="big">ΔU = '+fmt(d,2)+' V = '+fmt(pct,2)+' % &nbsp;·&nbsp; am Verbraucher: '+fmt(rest,1)+' V</div>'
    +'<div class="verdict '+(ok?'ok':'bad')+'">'+(ok?'✓ Innerhalb des Grenzwerts von '+fmt(lim,0)+' %':'✗ Grenzwert von '+fmt(lim,0)+' % überschritten')+'</div>'
    +'<div>Empfohlener Mindestquerschnitt für ≤ '+fmt(lim,0)+' %: <b>'+rec+'</b></div>'+ampTxt;
  show('fRes');
}

/* ---------- Stromkosten ---------- */
function calcKosten(){
  var W=val('kW'),h=val('kH'),days=val('kDays'),ct=val('kCt');
  if(isNaN(W)||isNaN(h)){document.getElementById('kRes').innerHTML='<b>Bitte Leistung und Stunden pro Tag eingeben.</b>';show('kRes');return;}
  if(isNaN(days))days=365; if(isNaN(ct))ct=39.6;
  var kwhDay=W/1000*h,kwhYear=kwhDay*days,eurYear=kwhYear*ct/100;
  document.getElementById('kRes').innerHTML='<div class="big">'+fmt(eurYear,2)+' € pro Jahr &nbsp;·&nbsp; '+fmt(eurYear/12,2)+' € pro Monat</div><div>Verbrauch: '+fmt(kwhDay,3)+' kWh/Tag · '+fmt(kwhYear,1)+' kWh/Jahr bei '+fmt(ct,1)+' ct/kWh</div>';
  show('kRes');
}
