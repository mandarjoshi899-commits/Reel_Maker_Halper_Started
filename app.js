let mode="text", photo=null;
const $=id=>document.getElementById(id);
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 mode=b.dataset.mode;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 $("textBox").hidden=mode!=="text";$("imageBox").hidden=mode!=="image";$("download").hidden=true;
}));
$("photo").addEventListener("change",()=>{
 const f=$("photo").files[0];photo=null;$("preview").hidden=true;
 if(!f)return;
 if(!["image/jpeg","image/png","image/webp"].includes(f.type)||f.size>5*1024*1024){$("status").textContent="Choose JPG, PNG or WebP under 5 MB."; $("photo").value="";return;}
 const url=URL.createObjectURL(f);photo=new Image();photo.onload=()=>{$("preview").src=url;$("preview").hidden=false;};photo.src=url;
});
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
$("make").addEventListener("click",async()=>{
 const status=$("status"),canvas=$("stage"),ctx=canvas.getContext("2d");
 $("download").hidden=true;
 const seconds=Number($("seconds").value), ratio=$("ratio").value;
 let W=540,H=960;if(ratio==="16:9"){W=960;H=540}else if(ratio==="1:1"){W=720;H=720}
 canvas.width=W;canvas.height=H;canvas.hidden=false;
 let title=mode==="text"?$("prompt").value.trim():$("motion").value.trim();
 if(mode==="text"&&title.length<5){status.textContent="Please type a video idea first.";return}
 if(mode==="image"&&!photo){status.textContent="Please choose a photo first.";return}
 const stream=canvas.captureStream(24);
 const mime=["video/mp4;codecs=h264","video/webm;codecs=vp9","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));
 if(!mime){status.textContent="This browser does not support video recording. Try current Chrome.";return}
 let recorder;try{recorder=new MediaRecorder(stream,{mimeType:mime})}catch(e){status.textContent="Video recording is not supported on this browser.";return}
 const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onerror=()=>status.textContent="Could not record this sample.";
 recorder.onstop=()=>{
   const blob=new Blob(chunks,{type:mime}),url=URL.createObjectURL(blob);
   const ext=mime.startsWith("video/mp4")?"mp4":"webm";
   const a=$("download");a.href=url;a.download=`reel-maker-free-sample.${ext}`;a.textContent=`⬇ Download sample ${ext.toUpperCase()}`;a.hidden=false;
   status.textContent=`Your free ${ext.toUpperCase()} sample is ready. This is a browser-made animated sample, not AI-generated footage.`;
   stream.getTracks().forEach(t=>t.stop());
 };
 status.textContent="Creating your free sample on this phone…";
 const start=performance.now();
 recorder.start();
 function frame(now){
   const p=Math.min((now-start)/(seconds*1000),1),t=now-start;
   const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,"#171a3a");grad.addColorStop(.55,"#433b79");grad.addColorStop(1,"#102e40");ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
   for(let i=0;i<18;i++){ctx.fillStyle=`rgba(255,255,255,${.12+(i%4)*.04})`;ctx.beginPath();ctx.arc((i*97+t*.018)%W,(i*173)%H,2+(i%3),0,Math.PI*2);ctx.fill()}
   if(mode==="image"&&photo){const scale=Math.max(W/photo.width,H/photo.height)*(1+.07*p),dw=photo.width*scale,dh=photo.height*scale;ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();ctx.drawImage(photo,(W-dw)/2,(H-dh)/2,dw,dh);ctx.restore();ctx.fillStyle="rgba(5,8,20,.48)";ctx.fillRect(0,0,W,H)}
   else {ctx.fillStyle="rgba(255,255,255,.09)";rounded(ctx,W*.08,H*.23,W*.84,H*.48,30)}
   ctx.textAlign="center";ctx.fillStyle="#ffffff";ctx.font=`bold ${Math.round(W*.075)}px system-ui`;wrapText(ctx,mode==="text"?title:"IMAGE TO VIDEO",W/2,H*.43,W*.76,Math.round(W*.095));
   ctx.font=`${Math.round(W*.035)}px system-ui`;ctx.fillStyle="#d8d9ff";ctx.fillText("REEL MAKER HELPER · FREE TRIAL",W/2,H*.86);
   ctx.fillStyle="#8b7cff";rounded(ctx,W*.12,H*.91,W*.76,8,5);ctx.fillStyle="#49d6d0";rounded(ctx,W*.12,H*.91,W*.76*p,8,5);
   if(p<1)requestAnimationFrame(frame);else setTimeout(()=>recorder.stop(),120);
 }
 requestAnimationFrame(frame);
});
function wrapText(ctx,text,x,y,maxWidth,lineHeight){
 const words=text.split(/\s+/);let line="",lines=[];
 for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}
 if(line)lines.push(line);lines=lines.slice(0,5);const start=y-(lines.length-1)*lineHeight/2;
 lines.forEach((l,i)=>ctx.fillText(l,x,start+i*lineHeight));
                           }
