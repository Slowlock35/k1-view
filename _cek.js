
var QS=new URLSearchParams(location.search),TOK=QS.get("tok");
var TOKEN_BENAR="k1-ssot-2026-9f4c2a71";
if(TOK!==TOKEN_BENAR){document.body.innerHTML='<div style="font-family:sans-serif;padding:26px;max-width:560px;margin:0 auto"><h2 style="font-family:Sora,sans-serif">Akses ditolak</h2><p style="color:#667">Tautan tidak lengkap — pastikan memakai tautan resmi yang mengandung token.</p></div>';throw new Error("no-token");}
var BLN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function fD(v){if(!v)return"";var d=new Date(v);if(isNaN(d))return String(v).replace("T"," ").slice(0,10);return d.getDate()+" "+BLN[d.getMonth()]}
function fmtRp(n){n=Number(n)||0;return"Rp"+n.toLocaleString("id-ID")}
function hk(ttd,n){var d=new Date(ttd),c=0;while(c<n){d.setDate(d.getDate()+1);var w=d.getDay();if(w!==0&&w!==6)c++}return d}
var DATAB=null,DATT=null;
/* ============ BELANJA ============ */
var stB=["SP ttd","NRK/KPPN","Tiba","BAPP/BAST","SPP","SPM","SP2D"];
var MODEB="all";
var KETB={
all:"Menampilkan seluruh item belanja K-1.",
pelaksana:"Fokus TIM PELAKSANA — item sudah pesan: aktivasi lisensi, pemeriksaan barang, instalasi, uji fungsi.",
pengawas:"Fokus TIM PENGAWAS — titik kendali aktif: NRK jalur LS, pemeriksaan barang, BAPP/BAST, dan item menyimpang.",
persiapan:"Fokus QDI PERSIAPAN — item belum pesan atau masih perakitan jalur (perencanaan dan penetapan)."};
function grp(r){
var stt=String(r["Status Inaproc"]||"");
var ls=String(r["Mekanisme Bayar"]||"").indexOf("LS")>=0;
var nrk=String(r["NRK Daftar KPPN"]||"").trim();var nrkOk=nrk&&!/up bendahara/i.test(nrk);
var ttd=r["Tgl TTD SP"];var kri=(stt==="Sudah Pesan"&&ls&&!nrkOk&&ttd);
var tiba=r["Tgl Pesanan Tiba (Pemeriksaan Tim)"],ba=r["Tgl BAPP/BAST"];
var pengawas=(kri||!!ba||!!tiba||(stt&&stt!=="Sudah Pesan"&&stt!=="Belum Pesan"));
var pelaksana=(stt==="Sudah Pesan");
var persiapan=(stt==="Belum Pesan"||!stt);
if(MODEB==="pelaksana")return pelaksana;
if(MODEB==="pengawas")return pengawas||kri;
if(MODEB==="persiapan")return persiapan&&!pengawas;
return true;}
function pc(r){var s=String(r["Status Inaproc"]||"");
if(s==="Sudah Pesan"){var ls=String(r["Mekanisme Bayar"]||"").indexOf("LS")>=0;
var nrk=String(r["NRK Daftar KPPN"]||"").trim();var ok=nrk&&!/up bendahara/i.test(nrk);
if(ls&&!ok&&r["Tgl TTD SP"])return"late";return"done";}
if(s&&s!=="Belum Pesan")return"run";if(s==="Belum Pesan")return"late";return"plan"}
function stampId(p){return p==="done"?"Sudah Pesan":p==="late"?"Kritis":p==="run"?"Proses":"Terjadwal"}
function renderB(){
var ROWS=DATAB.rows,sp=0,kr=0;
var L=document.getElementById("list"),S=document.getElementById("sum");
L.innerHTML="";S.innerHTML="";var tampil=0;
ROWS.forEach(function(r){
if(!grp(r))return;tampil++;
var it=String(r["Item"]||""),nm=it.replace(/\*+/g,"");
if(!nm)return;
var stt=String(r["Status Inaproc"]||"");if(stt==="Sudah Pesan")sp++;
var ls=String(r["Mekanisme Bayar"]||"").indexOf("LS")>=0;
var nrk=String(r["NRK Daftar KPPN"]||"").trim();var nrkOk=nrk&&!/up bendahara/i.test(nrk);
var ttd=r["Tgl TTD SP"],tiba=r["Tgl Pesanan Tiba (Pemeriksaan Tim)"],ba=r["Tgl BAPP/BAST"],sp2d=r["SP2D"];
var vals=[ttd,(ls?nrk:(nrkOk?nrk:"UP-VA")),tiba,ba,r["SPP"],r["SPM"],sp2d];
var warn="";if(stt==="Sudah Pesan"&&ls&&!nrkOk&&ttd){var d=hk(ttd,5);
warn="NRK jalur LS belum tercatat — batas 5 hari kerja: "+fD(d.toISOString())+" (PER-9/PB/2026)"}
if(warn)kr++;
var chain=stB.map(function(s,i){var on=vals[i]&&String(vals[i]).trim()!=="";
return '<div class="st'+(on?" on":"")+(i===1&&!nrkOk&&ls?" kri":"")+'"><i></i>'+s+"</div>"}).join("");
var p=pc(r);
var link=r["Link Katalog/Pesanan Inaproc"];
var spn=String(r["No. SP"]||"");
var c=document.createElement("div");c.className="card";c.dataset.pc=p;
c.innerHTML='<div class="stamp">'+stampId(p)+'</div><div class="nm">'+nm+"</div>"+
'<div class="meta"><span>Nilai: <b>'+fmtRp(r["Nilai Nego (Rp)"])+"</b></span><span>"+(r["Mekanisme Bayar"]||"")+"</span>"+((link&&String(link).indexOf("http")===0)?'<a href="'+link+'">Pesanan</a>':"")+"</div>"+
'<div class="meta"><span>TTD SP: <b>'+fD(ttd)+"</b></span>"+(nrk?'<span class="u">NRK: '+(nrkOk?nrk:"jalur UP-VA")+"</span>":"")+(spn?'<span class="u">SP: '+spn+"</span>":"")+"</div>"+
'<div class="chain">'+chain+"</div>"+(warn?'<div class="warn">'+warn+"</div>":"");
L.appendChild(c);});
var sy=DATAB.sync||{};document.getElementById("sync").hidden=false;document.getElementById("syncTxt").textContent=(sy.hari?sy.hari+", ":"")+(sy.tanggal||"")+(sy.jam?" — "+sy.jam:"");S.innerHTML='<div class="stat k-done"><b>'+tampil+"</b><span>Item tampil</span></div>"+
'<div class="stat"><b>'+sp+"/"+ROWS.length+"</b><span>Sudah pesan</span></div>"+
'<div class="stat k-late"><b>'+kr+"</b><span>Titik kritis</span></div>"+
'<div class="stat"><b>'+fD(new Date().toISOString())+"</b><span>WITA dibuka</span></div>";
document.getElementById("noteB").textContent=KETB[MODEB]||KETB.all;}
document.getElementById("tabsB").addEventListener("click",function(e){
var b=e.target.closest("button");if(!b)return;
document.querySelectorAll("#tabsB button").forEach(function(x){x.classList.toggle("on",x===b)});
MODEB=b.dataset.t;if(DATAB)renderB();});
/* ============ TIMELINE ============ */
var D0=new Date("2026-09-22"),D1=new Date("2027-01-03"),SPAN=(D1-D0)/864e5;
var MODET="all";
var pct=function(iso){return ((new Date(iso)-D0)/864e5)/SPAN*100};
var pcts=function(iso){return "calc(var(--lblw) + (100% - var(--lblw)) * "+(pct(iso)/100).toFixed(4)+")"};
var STL={done:"terlaksana",run:"berjalan",late:"telat/deviasi",plan:"terjadwal"};
var TEAMS=["TIM PERSIAPAN","TIM PELAKSANA","TIM PENGAWAS"];
function renderT(){
var T=DATT,HB=T.hari;
var ax=document.createElement("div");ax.className="tl-axis";
[["2026-09-22","22 Sep"],["2026-10-01","1 Okt"],["2026-10-15","15 Okt"],["2026-11-01","1 Nov"],["2026-11-15","15 Nov"],["2026-12-01","1 Des"],["2026-12-15","15 Des"],["2027-01-03","31 Des"]].forEach(function(m,i,arr){
var s=document.createElement("span");s.style.left=pct(m[0])+"%";s.textContent=m[1];
if(i===arr.length-1){s.style.transform="translateX(-100%)";s.style.left="calc(100% - 1px)";}
ax.appendChild(s);});
var lastSub="";
var body=document.getElementById("tlbody");
var wrap=document.createElement("div");wrap.className="tlwrap";wrap.appendChild(ax);
var today=document.createElement("div");today.className="tl-today";
today.style.setProperty("--tp",(pct(HB)/100).toFixed(4));
today.innerHTML="<b>HARI INI "+fD(HB)+"</b>";
wrap.appendChild(today);
function subOf(r){if(r.team!=="TIM PELAKSANA")return "";return r.sub==="NON-BELANJA (SISTEM)"?"NON-BELANJA":"BELANJA";}
function cocok(r,t){if(t==="all")return true;if(t==="PEL-BELANJA")return r.team==="TIM PELAKSANA"&&subOf(r)==="BELANJA";if(t==="PEL-NONBELANJA")return r.team==="TIM PELAKSANA"&&subOf(r)==="NON-BELANJA";return r.team===t;}
TEAMS.forEach(function(team){
var rows=T.rows.filter(function(r){return r.team===team});
if(!rows.length)return;
var done=rows.filter(function(d){return d.st==="done"}).length;
var late=rows.filter(function(d){return d.st==="late"}).length;
var g=document.createElement("div");g.className="tl-grp";g.dataset.t=team;lastSub="";
g.innerHTML=team+'<span class="n">'+done+"/"+rows.length+" terlaksana"+(late?" · <b>"+late+" telat</b>":"")+"</span>";
wrap.appendChild(g);
var lastSub="";
rows.forEach(function(r){
var tampil=(MODET==="all")||(MODET==="PEL-BELANJA"&&r.team==="TIM PELAKSANA"&&subOf(r)==="BELANJA")||(MODET==="PEL-NONBELANJA"&&r.team==="TIM PELAKSANA"&&subOf(r)==="NON-BELANJA")||(r.team===MODET&&MODET!=="PEL-BELANJA"&&MODET!=="PEL-NONBELANJA");
if(!tampil)return;
var sv=subOf(r);
if(r.team==="TIM PELAKSANA"&&sv!==lastSub){lastSub=sv;
var sh=document.createElement("div");sh.className="subgrp";sh.dataset.t=team;sh.dataset.sub=sv;
sh.textContent=(sv==="BELANJA")?"· BELANJA":"· NON-BELANJA — SISTEM";wrap.appendChild(sh);}
var row=document.createElement("div");row.className="trow";row.dataset.t=team;row.dataset.sub=(r.sub||"");
var lbl=document.createElement("div");lbl.className="tlbl";lbl.title=r.id+" — "+r.label;
lbl.textContent=r.id+". "+r.label;
var track=document.createElement("div");track.className="track";
r.plan.forEach(function(rg){
var l=Math.max(0,pct(rg[0])),w=Math.min(100,pct(rg[1])+100/SPAN)-l;
var b=document.createElement("span");b.className="tbar "+r.st;
b.style.left=l+"%";b.style.width=Math.max(0.8,w)+"%";
b.title=r.id+" — "+r.label+" · Rencana: "+fD(rg[0])+(rg[1]!==rg[0]?"–"+fD(rg[1]):"")+" · "+STL[r.st];
track.appendChild(b);});
r.real.forEach(function(iso){
var dt=document.createElement("span");dt.className="tdot";
dt.style.left=pct(iso)+"%";dt.title=r.id+" — realisasi "+fD(iso);
track.appendChild(dt);});
var mk=document.createElement("span");mk.className="tmark";
mk.style.left="calc("+pct(HB).toFixed(4)+"% - 1px)";track.appendChild(mk);
row.appendChild(lbl);row.appendChild(track);wrap.appendChild(row);});
});
body.innerHTML="";body.appendChild(wrap);
var db=document.getElementById("devbox");db.innerHTML='<span class="lbl">Deviasi tercatat (F-27 §B)</span>'+(T.deviasi||"—")+
'<br><br><span class="lbl">Rekomendasi / mitigasi</span>'+(T.rekomendasi||"—");
}
document.getElementById("tabsT").addEventListener("click",function(e){
var b=e.target.closest("button");if(!b)return;
document.querySelectorAll("#tabsT button").forEach(function(x){x.classList.toggle("on",x===b)});
MODET=b.dataset.t;
document.querySelectorAll("#tlbody [data-t]").forEach(function(el){
var ok=(MODET==="all")||(el.dataset.t===MODET)||
(el.dataset.t==="TIM PELAKSANA"&&((MODET==="PEL-BELANJA"&&el.dataset.sub==="BELANJA")||(MODET==="PEL-NONBELANJA"&&el.dataset.sub==="NON-BELANJA")));
if(el.classList.contains("subgrp")){ok=(MODET==="all")||(el.dataset.t===MODET&&el.dataset.sub===MODET.replace("PEL-",""))||(MODET==="PEL-BELANJA"&&el.dataset.sub==="BELANJA")||(MODET==="PEL-NONBELANJA"&&el.dataset.sub==="NON-BELANJA")||(MODET==="all");if(MODET==="all")ok=true;}
el.style.display=ok?"":"none";});});
/* ============ GAP / DEVIASI (alert-only) ============ */
function kumpulAlert(){
var A=[];
(DATAB?DATAB.rows:[]).forEach(function(r){
var it=String(r["Item"]||"").replace(/\*+/g,"");if(!it)return;
var stt=String(r["Status Inaproc"]||"");
var ls=String(r["Mekanisme Bayar"]||"").indexOf("LS")>=0;
var nrk=String(r["NRK Daftar KPPN"]||"").trim();var nrkOk=nrk&&!/up bendahara/i.test(nrk);
var ttd=r["Tgl TTD SP"];
if(stt==="Sudah Pesan"&&ls&&!nrkOk&&ttd){var d=hk(ttd,5);
A.push({src:"BELANJA",tim:"Pelaksana + Pengawas",nm:it,isi:"Daftarkan NRK ke KPPN sekarang — tanpa ini SP2D tertahan.",
 batas:fD(d.toISOString())+" (5 HK - PER-9)",lvl:1,lvlTx:"SEGERA"});}
if(stt==="Belum Pesan"){A.push({src:"BELANJA",tim:"Persiapan",nm:it,isi:"Segerakan penetapan & pemesanan — item masih menyusul jalur.",
 batas:"Sebelum tagihan berjalan",lvl:2,lvlTx:"KEJAR"});}});
(DATT?DATT.rows:[]).forEach(function(r){
if(r.st!=="late")return;
var cat=(/^10[a-m]$/i.test(String(r.id||""))||/portal/i.test(String(r.label||"")))?+"""+" (catatan: belanja penopang portal—Azure SWA/logic/M365—sudah hijau di view Belanja; alert ini PEKERJAAN pembangunannya)":"";
A.push({src:"TIMELINE F-27",tim:r.team.replace("TIM ",""),nm:r.id+". "+r.label,
 isi:"Tahap telat/deviasi terhadap jadwal F-27 — kejar penyelesaian atau update jadwal resmi."+cat,
 batas:"Ikuti jendela F-17",lvl:2,lvlTx:"TELAT"});});
A.sort(function(a,b){return a.lvl-b.lvl;});
return A;}
function updateBadge(){if(!DATAB||!DATT)return;var n=kumpulAlert().length;var gb=document.getElementById("gapBadge");gb.textContent=n;gb.style.display=n?"inline-block":"none";}
function renderG(){
var A=kumpulAlert();
var kr=A.filter(function(a){return a.lvl===1}).length;
var GH=document.getElementById("gapstats");
document.getElementById("gapstats").outerHTML=
'<div class="gaphead" id="gapstats"><div class="row"><div><div class="big">'+A.length+'</div>'+
'<div class="cap">alert berjalan</div></div><div class="mini">'+
'<span><b>'+kr+'</b> &middot; segera (ada batas)</span><span><b>'+(A.length-kr)+
'</b> &middot; kejar/telat</span></div></div>'+
'<div class="mini"><span>Kondisi data: tarikan SSOT terakhir</span></div></div>';
var GL=document.getElementById("gaplist");GL.innerHTML="";
var gb=document.getElementById("gapBadge");gb.textContent=A.length;gb.style.display=A.length?"inline-block":"none";
if(!A.length){GL.innerHTML='<div class="acard" style="--alv:var(--done)"><div class="nm">Tidak ada alert</div>'+
'<div class="act">Seluruh item dan tahapan dalam jalur normal.</div></div>';return;}
A.forEach(function(a){
var lv=a.lvl===1?"#dc2626":"#d97706";
var c=document.createElement("div");c.className="acard";c.style.setProperty("--alv",lv);
c.innerHTML='<div class="lv">'+a.lvlTx+'</div><div class="src">ALERT &middot; '+a.src+' &middot; TIM '+a.tim+'</div>'+
'<div class="nm">'+a.nm+'</div><div class="act">'+a.isi+'</div>'+
'<div class="meta2"><span>Batas: <b>'+a.batas+"</b></span></div>";
GL.appendChild(c);});}
/* ============ MODE SWITCH ============ */
function statsT(){
var R=DATT.rows,dn=0,lt=0;
R.forEach(function(r){if(r.st==="done")dn++;if(r.st==="late")lt++;});
document.getElementById("sum").innerHTML=
'<div class="stat"><b>'+R.length+"</b><span>Tahapan F-27</span></div>"+
'<div class="stat k-done"><b>'+dn+"</b><span>Terlaksana</span></div>"+
'<div class="stat k-late"><b>'+lt+"</b><span>Titik kritis</span></div>"+
'<div class="stat"><b>'+fD(DATT.hari)+"</b><span>Hari pengendalian</span></div>";}
document.getElementById("modes").addEventListener("click",function(e){
var b=e.target.closest("button");if(!b)return;
document.querySelectorAll("#modes button").forEach(function(x){x.classList.toggle("on",x===b)});
var m=b.dataset.m;
var tl=(m==="timeline"),gp=(m==="gap"),op=(m==="output");
document.getElementById("v-belanja").hidden=!(m==="belanja");
document.getElementById("v-timeline").hidden=!tl;
document.getElementById("v-gap").hidden=!gp;
document.getElementById("v-output").hidden=!op;
document.getElementById("sum").hidden=(gp||op);
document.getElementById("hTitle").textContent=op?"Output Swakelola":(gp?"GAP/Deviasi":(tl?"Timeline TIM":"Pengendalian Belanja"));
document.getElementById("hLede").innerHTML=op
?'Keluaran <b>Swakelola Tipe I "Inovasi Layanan Berbasis Kepulauan"</b>: QDI System (aktif), Portal Integrasi (pengembangan), Konektivitas 3 titik kepulauan — dibangun TIM, dibiayai paket.'
:(gp?'Hanya menampilkan yang <b>ALERT</b> — item belanja dan tahapan kritis/telat/menyimpang, dari sheet SSOT dan F-27. Kosong berarti semua dalam jalur normal.'
:(tl?'Aktual vs jadwal turunan <b>F-27</b> — 3 TIM SK 5999 (Persiapan · Pelaksana · Pengawas). Karakter Swakelola Tipe I: pengelolaan terhadap TIM — rantai keuangan PPK mengiringi TIM PELAKSANA.'
:'Posisi setiap item belanja dari <b>SP elektronik</b> hingga <b>SP2D</b> — mengalir dari sheet SSOT, diperbarui sistem per tarikan. Tautan bertoken.'));
if(tl&&DATT){renderT();statsT();}else if(gp){renderG();}else if(DATAB){renderB();updateBadge();}});
/* ============ MUAT ============ */
function muat(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
muat("data.json").then(function(d){DATAB=d;updateBadge();if(!document.getElementById("v-gap").hidden&&!document.getElementById("v-timeline").hidden)renderG();
document.querySelector("#v-belanja .sub");
renderB();updateBadge();}).catch(function(e){
document.getElementById("list").innerHTML='<div class="card"><div class="nm">Gagal memuat data belanja</div><div class="meta">'+e+'</div></div>';});
muat("timeline.json").then(function(d){DATT=d;updateBadge();if(!document.getElementById("v-gap").hidden)renderG();}).catch(function(e){
document.getElementById("devbox").hidden=false;
document.getElementById("devbox").innerHTML="Gagal memuat timeline: "+e;});
