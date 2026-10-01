import { sendHtmlApp } from "../../lib/utils/htmlRich.js";
import { gameApi } from "../../lib/games/gameApiClient.js";

function esc(value) { return JSON.stringify(String(value ?? "")).replace(/<\/script/gi, "<\\/script"); }

const handler = {
  name: "ttt",
  command: "ttt",
  aliases: [],
  category: "games",
  help: ["ttt", "ttt ROOMID"],
  cooldown: 2,
  async execute(ctx) {
    if (!ctx.number) return ctx.reply("❌ Nomor player tidak dapat dibaca.");
    try {
      const playerRes = await gameApi.createPlayer(ctx.number, ctx.pushName || "Player");
      const player = playerRes.player;
      const roomId = ctx.args[0] ? String(ctx.args[0]).toUpperCase() : null;
      const roomRes = roomId ? await gameApi.joinTttRoom(roomId, player.playerId, player.token) : await gameApi.createTttRoom(player.playerId, player.token);
      const room = roomRes.room;
      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{margin:0;background:#0f0f18;color:#fff;font-family:system-ui}body{padding:18px;display:flex;justify-content:center}.app{width:min(92vw,420px);text-align:center}.board{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px auto;width:min(88vw,360px)}button.cell{aspect-ratio:1;border:0;border-radius:16px;background:#202033;color:#fff;font-size:42px;font-weight:900}button.cell:disabled{opacity:1}.room{background:#181827;border-radius:14px;padding:10px;margin:8px 0}.muted{color:#aaa;font-size:13px}.status{font-weight:800;margin-top:8px}.leave{border:0;border-radius:10px;padding:10px 16px;background:#333344;color:#fff}</style></head><body><main class="app"><h2>⭕ Tic-Tac-Toe ❌</h2><div class="room">Room <b id="room"></b><br><span id="players" class="muted"></span></div><div id="status" class="status">Memuat...</div><div id="board" class="board"></div><button id="leave" class="leave">Keluar Room</button></main><script>const API=${esc(gameApi.baseUrl)},ROOM=${esc(room.roomId)},PLAYER=${esc(player.playerId)},TOKEN=${esc(player.token)};let state=null;const roomEl=document.getElementById('room'),playersEl=document.getElementById('players'),statusEl=document.getElementById('status'),boardEl=document.getElementById('board');roomEl.textContent=ROOM;async function api(path,opt={}){const r=await fetch(API+path,{...opt,headers:{'content-type':'application/json','x-player-token':TOKEN,...(opt.headers||{})}});const j=await r.json();if(!r.ok)throw new Error(j.message||j.error);return j}function render(){if(!state)return;playersEl.textContent=state.players.map(p=>p.symbol+': '+(p.playerId===PLAYER?'Kamu':'Lawan')).join('  •  ');const g=state.gameState;if(!g){statusEl.textContent='Menunggu pemain kedua...';boardEl.innerHTML='';return}if(g.status==='finished')statusEl.textContent=g.winner==='draw'?'🤝 Seri!':(g.winner==='X'?'❌':'⭕')+' Menang!';else{const me=state.players.find(p=>p.playerId===PLAYER);statusEl.textContent=g.turn===me?.symbol?'🎯 Giliran kamu ('+me.symbol+')':'⏳ Menunggu lawan ('+g.turn+')'}boardEl.innerHTML='';g.board.forEach((v,i)=>{const b=document.createElement('button');b.className='cell';b.textContent=v||'';b.disabled=!!v||g.status!=='playing'||g.turn!==state.players.find(p=>p.playerId===PLAYER)?.symbol;b.onclick=async()=>{try{await api('/api/v1/ttt/rooms/'+encodeURIComponent(ROOM)+'/move',{method:'POST',body:JSON.stringify({playerId:PLAYER,position:i})});await refresh()}catch(e){statusEl.textContent='❌ '+e.message}};boardEl.appendChild(b)})}async function refresh(){try{const j=await api('/api/v1/ttt/rooms/'+encodeURIComponent(ROOM));state=j.room;render()}catch(e){statusEl.textContent='❌ '+e.message}}document.getElementById('leave').onclick=async()=>{try{await api('/api/v1/ttt/rooms/'+encodeURIComponent(ROOM)+'/leave',{method:'POST',body:JSON.stringify({playerId:PLAYER})});statusEl.textContent='Kamu keluar dari room.';document.getElementById('leave').disabled=true}catch(e){statusEl.textContent='❌ '+e.message}};refresh();setInterval(refresh,1000);</script></body></html>`;
      await sendHtmlApp(ctx.bot, ctx.chat, html, { title: `TTT Room ${room.roomId}` });
      await ctx.reply(`🎮 *TTT Room ${room.roomId}*\n\n${room.players.length < 2 ? "Bagikan kode Room ke lawan. Lawan bisa ketik:" : "Room sudah dimulai."}\n${ctx.prefix}ttt ${room.roomId}`);
    } catch (error) {
      await ctx.reply(`❌ ${error.message || "Game Server tidak dapat dihubungi."}`);
    }
  }
};
export default handler;
