import '../apps/api/dist/env.js';
import OpenAI from 'openai';
const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY || process.env.LLM_API_KEY});
const audio = await client.audio.speech.create({
  model:'tts-1', voice:'alloy',
  input:'This is a test meeting. Alex will prepare the design. Sam will review the payment API. The deadline is not decided.',
  response_format:'mp3',
});
const result=await fetch('http://127.0.0.1:8787/api/transcribe',{
  method:'POST',headers:{'Content-Type':'audio/mpeg'},body:await audio.arrayBuffer(),
});
const body=await result.json();
if(!result.ok || !body.text?.trim()) throw new Error(JSON.stringify(body));
console.log(JSON.stringify({status:result.status,text:body.text}));
