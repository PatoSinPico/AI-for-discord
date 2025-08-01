const Ollama = require("ollama")
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require("discord.js")
const { join } = require("path");
const client = new Discord.Client({
    intents: [ "AutoModerationConfiguration", "AutoModerationExecution", "DirectMessageReactions", "DirectMessageTyping", "DirectMessages", "GuildBans", "GuildEmojisAndStickers", "GuildIntegrations", "GuildInvites", "GuildMembers", "GuildMessageReactions", "GuildMessageTyping", "GuildMessages", "GuildPresences", "GuildScheduledEvents", "GuildVoiceStates", "GuildWebhooks", "Guilds", "MessageContent"]    
});
const voice  = require('@discordjs/voice');
const CONFIG = require("./config.json");

 
  const AudioPlayer = voice.createAudioPlayer({
      behaviors:{
        noSubscriber: voice.NoSubscriberBehavior.Pause
      }
       
    });

let IsInVoice = false;

const AIvoice = require("@andresaya/edge-tts")
const tts = new AIvoice.EdgeTTS();
 
 
const Transcriber = require("discord-speech-to-text");

const transcriber = new Transcriber("TU TOKEN DE WIT.AI"); //Necesitas un token de esta pagina https://wit.ai/apps una vez creado un bot entra en configuracion y copia el token
let UserParsedSpeech = "Empty";
let user = "Empty";
let IsHearingOne = false;

//La IA
const AI = new Ollama.Ollama({
  baseUrl: "https://localhost:11434"
})

//La memoria de la IA
const fs = require("fs");

const MemoriaGeneralPath = "./Memoria_General.txt";
const MemoriaCallPath = "./Memoria_Call.txt";
const MemoriaImportantePath = "./Memoria_Importante.txt";
const MemoriaImportantePathCall = "./Memoria_Importante_Call.txt";


var contenidoGeneral = fs.readFileSync(MemoriaGeneralPath, "utf-8");
var MemoriaImportante = fs.readFileSync(MemoriaImportantePath, "utf-8");
var MemoriaImportanteCall = fs.readFileSync(MemoriaImportantePathCall, "utf-8");
var MemoriaCall = fs.readFileSync(MemoriaCallPath, "utf-8");
var UltimaCosaDicha = "Hola"
var MessageHistory

client.login(CONFIG.Token).then(() => console.log("Bot listo!")),

client.on("ready" , async () => {
   /*
  //Codigo para obtener todas las voces disponibles, filtra por nacionalidas, si quieres cambiarla solo pon la abreviatura en la linea 60, si no quieres que se filtre borrala y deja ese espacio vacio
  
    try {
        const voices = await tts.getVoices();

        // Filtrar solo las voces en español (es-*)
        const spanishVoices = voices.filter(v => v.Locale.startsWith("es")).map(v => ({
            Name: v.Name,
            Locale: v.Locale,
            Gender: v.Gender,
            DisplayName: v.DisplayName,
            
        }));

        // Ruta de destino
        const outputPath = join(_dirname, "Voices.json");

        // Escribir archivo
        fs.writeFileSync(outputPath, JSON.stringify(spanishVoices, null, 2), "utf-8");

        console.log(`Voces en español guardadas en: ${outputPath}`);
    } catch (error) {
        console.error("Error al obtener o guardar las voces:", error);
    }
     */   
});


  
 async function MandarMensajeALaIA(Mensaje, Autor) {
  if(IsInVoice){
        return AI.generate({
    model: "gurubot/TopicalStorm-uncensored:latest",
    prompt: Mensaje,
    system:  "Eres Amoral " + "Tu comportamiento: " + MemoriaImportanteCall + " Tus recuerdos: " + MemoriaCall + " El mensaje te lo mando: " + Autor,
    options:{
      temperature: 1
    }

  }  )
  }


  else{
     return AI.generate({
    model: "gurubot/TopicalStorm-uncensored:latest",
    prompt: Mensaje,
    system:  "Eres Amoral" + "Tu comportamiento: " + MemoriaImportante + " Tus recuerdos: " + contenidoGeneral + " El mensaje te lo mando: " + Autor,
    options:{
      temperature: 1
    }

  }  )
  }
}

//Actualiza la memoria
async function ActualizarMemoriaGeneral(message, DijeronODijiste)
{
  UltimaCosaDicha = message
if(IsInVoice){
 try {
     FixedMessage = message.replace("<@1378097438610686002>", "") || ""
    fs.appendFileSync(MemoriaCallPath, "\n" + DijeronODijiste + FixedMessage, "utf-8");
    console.log("Texto añadido correctamente.");
    IsHearingOne = false;
     } catch (error) {
    console.error("Error escribiendo en el archivo:", error.message);
  }
     }
        
     
     
     
     
        else
      {
      try {
     
    fs.appendFileSync(MemoriaGeneralPath, "\n" + DijeronODijiste + message, "utf-8");
    console.log("Texto añadido correctamente.");
     } catch (error) {
    console.error("Error escribiendo en el archivo:", error.message);
  }
     }
   
}
async function EntrarEnVoiceChat() {

    const currentguild = await client.guilds.fetch("ID DEL SERVIDOR");
    const connection = voice.joinVoiceChannel({
	   channelId: "ID DEL CANAL AL QUE UNIRSE",
	   guildId: "ID DEL SERVIDOR",
	   adapterCreator: currentguild.voiceAdapterCreator,
     selfDeaf: false
    });
    IsInVoice = true;
    

    const subscription = connection.subscribe(AudioPlayer)

    connection.receiver.speaking.on("start", async userId => {
       if(!IsHearingOne){
        await transcriber.listen(connection.receiver, userId, client.users.cache.get(userId)).then((data) =>{
        UserParsedSpeech = data.transcript.text;
        user = data.username;
        console.log(UserParsedSpeech)
        if(UserParsedSpeech.length > 30){
          TalkToAI(UserParsedSpeech, client.users.cache.get(user))
          IsHearingOne = true;
        }
      })
       }
       
       
   });

 

    //Usado para pruebas, descomentalo si necesitas testear algo

   /* googleTTS
     .getAudioBase64('Prueba de la generacion de archivos', { lang: 'es' })
     .then((base64) => {

       // save the audio file
       const buffer = Buffer.from(base64, 'base64');
       fs.writeFileSync('Bot_Words.mp3', buffer, { encoding: 'base64' });
       let Words = (join(__dirname, "Bot_Words.mp3"))
       let TestMP3 = voice.createAudioResource(Words);
       AudioPlayer.play(TestMP3)
     })


     .catch(console.error);*/


    
    
    
      

      
      
}


const connection = voice.getVoiceConnection("1020697652402339890")
try{

connection.on(voice.VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
	try {
		await Promise.race([
			entersState(connection, voice.VoiceConnectionStatus.Signalling, 5_000),
			entersState(connection, voice.VoiceConnectionStatus.Connecting, 5_000),
		]);
		// Seems to be reconnecting to a new channel - ignore disconnect
	} catch {
    AudioPlayer.stop()
		connection.destroy()
    IsInVoice = false;
	}

});
    
}
catch{
  console.log("No conection")
}





client.on("messageCreate", async message =>{

       
     
     if(!message.author.bot && message.mentions.has(client.user) && !IsInVoice){

        
   
      const respuesta = await MandarMensajeALaIA(message.content, message.author);
      const contenido = respuesta.response || "No sé qué decirte, bro.";
     
      ActualizarMemoriaGeneral(message.content, message.author.username + " te dijo: ")
      ActualizarMemoriaGeneral(contenido, " Tu dijisites: ")
     
         
           
           message.channel.send({
                 content: contenido.replace("/tts", "") || "",
                 tts: contenido.startsWith("/tts"),                
         },)  
     }
     if(!message.author.bot && message.channel.isThread() && !IsInVoice)
      {
      try{
      Pins = await message.channel.messages.fetchPinned()
      FirstPin = Pins.first()
     
      }
      catch{
           console.log("No se ha podido conseguir el ping!")
      }
         
        if(FirstPin.mentions.has(client.user)){
        message.channel.messages.fetch({ limit: 50, cache: true }).then(messages => {
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => MessageHistory = MessageHistory + " \n " + message.content)
          })
      const respuesta = await MandarMensajeALaIA(message.content, message.author.username, MessageHistory);
      const contenido =  respuesta.response || "No sé qué decirte, bro.";
     
      ActualizarMemoriaGeneral(message.content, message.author.username + " te dijo: ")
      ActualizarMemoriaGeneral(contenido, " Tu dijisites: ")
     
           if(contenido.includes("/voice"))
           {
             EntrarEnVoiceChat()
           }
           message.channel.send({
              content: contenido.replace("/tts", "") && contenido.replace("/voice", ".") || "",             
              tts: contenido.startsWith("/tts"),
         },)  

       }

      }
     
     
     
     if(!message.author.bot && IsInVoice && message.mentions.has(client.user) ||!message.author.bot && IsInVoice &&  message.channel.isThread())
      {    
        const respuesta = await MandarMensajeALaIA(message.content, message.author);
         
        
      
      const contenido = respuesta.response || "No sé qué decirte, bro.";
      contenido.replace("/tts", "") && contenido.replace("/voice", "")  && contenido.replace("<@ID DEL BOT>", "")|| "", //Se reemplaza el id del bot porque aveces decide tratar de mencionarse a si mismo.
      ActualizarMemoriaGeneral(message.content, message.author.username + " te dijo: ")
      ActualizarMemoriaGeneral(contenido, " Tu dijisites: ")
     
         
      
      
        
      //En desuso, descomentalo si quieres usar la libreria de google-tts-api
      /*
      if(contenido.length > 10){
         googleTTS
       .getAllAudioBase64(contenido, { lang: 'es' })
        .then((results) => {
         // Combina todos los buffers en un solo array
        const buffers = results.map(obj => Buffer.from(obj.base64, 'base64'));

        // Concatena todos los buffers en uno solo
        const finalBuffer = Buffer.concat(buffers);

      // Guarda el buffer combinado en un único archivo .mp3
      fs.writeFileSync("Bot_Words.mp3", finalBuffer, {encoding: "base64"});

      let Words = (join(__dirname, "Bot_Words.mp3"))
      // Luego, crea el recurso de audio y lo reproduce
      const TestMP3 = voice.createAudioResource(Words);
      AudioPlayer.play(TestMP3);
    })
    .catch((err) => {
      console.error("Error al obtener audio TTS:", err);
    });
      }



      else{
      googleTTS
     .getAudioBase64(contenido, { lang: 'es' })
     .then((base64) => { 
       // save the audio file
       const buffer = Buffer.from(base64, 'base64');
       fs.writeFileSync('Bot_Words.mp3', buffer, { encoding: 'base64' });
       let Words = (join(__dirname, "Bot_Words.mp3"))
       let TestMP3 = voice.createAudioResource(Words);
       AudioPlayer.play(TestMP3)
     })


     .catch(console.error);
      }*/
     console.log(Math.round(contenido.length/100) + "%")
     await tts.synthesize(contenido, "es-ES-AlvaroNeural",{
       rate: Math.round(contenido.length/100) + "%",       // Rapidez del habla (de: -100% a 100%)
       volume: '0%',     // Volumen (de: -100% a 100%)
       pitch: '0Hz'      // Agudeza de la voz (de: -100Hz a 100Hz)
     })
      console.log("Texto parseado")
      
       tts.toFile(join(__dirname, "Bot_Words"))
       Words = join(__dirname, "Bot_Words.mp3" )
       let Speech = voice.createAudioResource(Words);
       AudioPlayer.play(Speech)
   
  }
     
})
 

async function  TalkToAI(mensaje, autor ) {


      const respuesta = await MandarMensajeALaIA(mensaje, autor);
         
        
      
      const contenido = respuesta.response || "No sé qué decirte, bro.";
      contenido.replace("/tts", "") && contenido.replace("/voice", "")  && contenido.replace("<@ID DEL BOT>", "")|| "",
      ActualizarMemoriaGeneral(mensaje, autor + " te dijo: ")
      ActualizarMemoriaGeneral(contenido, " Tu dijisites: ")
     
      console.log(Math.round(contenido.length/100) + "%")
       await tts.synthesize(contenido, "es-ES-AlvaroNeural",{
       rate: Math.round(contenido.length/100) + "%",       // Rapidez del habla (de: -100% a 100%)
       volume: '0%',     // Volumen (de: -100% a 100%)
       pitch: '0Hz'      // Agudeza de la voz (de: -100Hz a 100Hz)
       })
      console.log("Texto parseado")
      
       tts.toFile(join(__dirname, "Bot_Words"))
       Words = join(__dirname, "Bot_Words.mp3" )
       let Speech = voice.createAudioResource(Words);
       AudioPlayer.play(Speech)     
      
}




