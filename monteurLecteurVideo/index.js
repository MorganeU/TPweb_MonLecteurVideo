import "./lib/webaudio-controls.js";

const getBaseURL = () => {
  return new URL('.', import.meta.url);
};
// let nb=5; ${nb}

const template = document.createElement("template");
template.innerHTML = /*html*/`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />    <script src="./monteurLecteurVideo/index.js" type="module"></script>

<style>
  #player {
    height: 500px;
  }
  #barre {
    background-color:rgba(0, 0, 0, .5);
    position:absolute;
    height:35px;
    bottom: 0;
    opacity:0;
    display: flex;
    align-items: center;
    transition: opacity cubic-bezier(0.4, 0, 1, 1) .3s;
  }
  #barre > button {
    display: block;
  }
  #over {
    width: fit-content;
    position: relative;
    margin: 25px;
    color:white;
    font-family: Arial;
  }
  #over:hover > #barre,  #over:hover > #infos, #over:hover > #avancement {
    opacity:1;
  }
  #infos{
    opacity:0;
    transition: opacity cubic-bezier(0.4, 0, 1, 1) .3s;
  }
  #sec{
    margin-left:auto;
    font-size:16px;
  }
  #vite{
    font-size:16px;
  }
  #ecran {
    margin-right: 5px;
  }
  #infos {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  i {
    color:white;
  }
  button {
    all:unset;
    padding: 0 8px;
    cursor: pointer;
    color:white;
    font-size:20px;
  }
  #play > i{
    font-size:18px;
    padding:0 1px;
  }
  #vol {
    font-size:25px;
    margin-left:5px;
    width:30px;
  }
  #temps{
    padding-left:20px;
  }
  #avancement{
    position:absolute;
    bottom:35px;
    width:100%;
    height:5px;
    background-color:white;
    opacity:0;
    cursor: pointer;
    transition: opacity cubic-bezier(0.4, 0, 1, 1) .3s;
  }
  #avancement > div{
    height:5px;
    width:0;
    background-color:#8FA6CB;
  }
  #liste{
    height:200px;
    width:200px;
  }
  #nvlleVideo{
    margin: 25px;
    font-family: Arial;
    position:absolute;
    display: flex;
    align-items: center;
    margin-top:0px;
  }
  #form{
    position:relative;
    top:8px;
    left:7px;
  }
  #liste{
    position:relative;
    cursor: pointer;
  }
  #listeVideos{
    font-family: Arial;
    position:absolute;
    bottom:400px;
    right:100px;
    padding:5px;
  }
</style>

<div id="over">
  <video id="player"><br></video>
  <div id="barre">
    <button id="precedente"><i class="fas fa-step-backward"></i></button>
    <button id="play"><i class="fas fa-play"></i></button>
    <button id="suivante"><i class="fas fa-step-forward"></i></button>
    <i id="vol" class="fas fa-volume-up"></i>
    <webaudio-slider id="volume" height=17 width=70 tracking="rel" min=0 max=1 value=0.85 step="0.05"></webaudio-slider>
    <div id="temps">0:00 / 0:00</div>
    <button id="sec">+10s</button>
    <button id="vite">x1</button>
    <button id="ecran"><i class="fas fa-expand"></i></button>
  </div>
  <button id="infos"><i class="fas fa-info-circle"></i></button> 
  <div id="avancement">
    <div></div>
  </div>
</div>
<div id="nvlleVideo">
  <p>Ajouter le lien d'une vidéo (.mp4) : </p>
  <form id="form">
    <input id="input" type="text"></input>
    <input id="ajout" type="button" value="OK"></input>
  </form>
</div>
<div id="listeVideos">
  <p>Autres videos : </p>
  <div id="liste"></div>
</div>
`;
// <webaudio-knob diameter=50 id="volume" min=0 max=1 value=0.5 step="0.1" tooltip="%s" src="./assets/SimpleFlat3.png"></webaudio-knob>
// <webaudio-knob diameter=40 id="volume" min=0 max=1 value=0.5 step="0.1" tooltip="%s" src="./assets/SimpleFlat3.png"></webaudio-knob>
// <webaudio-param></webaudio-param>
// <webaudio-switch></webaudio-switch>
// <webaudio-keyboard></webaudio-keyboard>

class MyVideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // appelé avant affichage du composant
    this.shadowRoot.appendChild(template.content.cloneNode(true)); // appel au template
    // ecouteurs sur les boutons
    this.player = this.shadowRoot.querySelector("#player");
    // this.player.crossOrigin = "anonymous";
    // Recuperation des attributs
    this.src = this.getAttribute("src");
    this.player.src = this.src;
    // fonctions pour les boutons
    this.definitEcouteurs();
    this.dimensionVideo(this.player);
    this.fixRelativeURLS();
  }

  // Pour jouer avec la video 
  definitEcouteurs() {
    // Lecture vidéo
    this.shadowRoot.querySelector("#play").onclick = () => {
      let icon = this.shadowRoot.querySelector("#play > i");
      // Lancer la vidéo
      if (this.player.paused) {
        this.player.play();
        icon.className = 'fas fa-pause';
        icon.style.fontSize = 20 + 'px';
        icon.style.padding = '0px';
      }
      // Arreter la vidéo
      else {
        this.player.pause();
        icon.className = 'fas fa-play';
        icon.style.fontSize = 18 + 'px';
        icon.style.padding = '0 1px';
      }
    }

    // Avancer de 10 sec la vidéo
    this.shadowRoot.querySelector("#sec").onclick = () => {
      this.player.currentTime += 10;
    }

    // Mettre la vidéo en vitesse x4
    this.shadowRoot.querySelector("#vite").onclick = (e) => {
      if (this.player.playbackRate == 1) this.player.playbackRate = 2;
      else if (this.player.playbackRate == 2) this.player.playbackRate = 4;
      else if (this.player.playbackRate == 4) this.player.playbackRate = 1;
      e.currentTarget.innerHTML = 'x' + this.player.playbackRate;
    }

    // Obtenir dans la console des informations sur la vidéo
    this.shadowRoot.querySelector("#infos").onclick = () => {
      console.log("Lien de la video : " + this.player.src)
      console.log("Durée de la vidéo : " + this.player.duration);
      console.log("Temps courant : " + this.player.currentTime);
      console.log("Volume de la video : " + this.player.volume);
      console.log("Vitesse de la video : " + this.player.playbackRate);
    }

    // Mettre en grand écran la vidéo
    this.shadowRoot.querySelector("#ecran").onclick = () => {
      this.player.requestFullscreen();
    }

    // Changer de vidéo
    this.videos = [
      "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4",
      "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    ]; //"https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    this.cpt = 0;
    this.shadowRoot.querySelector("#suivante").onclick = () => { // passer à la suivante
      this.videoSuivante()
    }
    this.shadowRoot.querySelector("#precedente").onclick = () => { // passer à la precedente
      this.videoPrecedente()
    }
    this.player.onended = () => { // passer à la suivante quand la video est fini
      this.videoSuivante();
      this.player.play();
      let icon = this.shadowRoot.querySelector("#play > i");
      icon.className = 'fas fa-pause';
      icon.style.fontSize = 20 + 'px';
      icon.style.padding = '0px';
    }

    // Augmenter et baisser le volume
    this.shadowRoot.querySelector("#volume").oninput = (event) => {
      const vol = parseFloat(event.target.value);
      this.player.volume = vol;
      let icon = this.shadowRoot.querySelector("#vol");
      let iconName;
      if (vol == 0) iconName = 'fas fa-volume-off'
      else if (vol < 0.8) iconName = 'fas fa-volume-down'
      else iconName = 'fas fa-volume-up'
      icon.className = iconName
    }

    // Avancement vidéo
    this.player.ontimeupdate = () => {
      // affichage du temps
      this.shadowRoot.querySelector("#temps").innerHTML = this.formatTime(this.player.currentTime) + ' / ' + this.formatTime(this.player.duration);
      // barre d'avancement
      this.shadowRoot.querySelector("#avancement > div").style.width = this.player.currentTime / this.player.duration * 100 + '%';
    };
    const barreAvancement = this.shadowRoot.querySelector("#avancement")
    barreAvancement.onclick = (e) => {
      const x = e.clientX - 30
      const width = barreAvancement.getBoundingClientRect().width
      this.player.currentTime = this.player.duration * (x / width)
    }

    // Ajouter une video à la liste
    this.shadowRoot.querySelector("#ajout").onclick = () => {
      this.videos.push(this.shadowRoot.querySelector("#input").value);
      console.log(this.videos);
    }

    // Liste des autres videos (ne fonctionne pas)
    let num = this.autresVideos();
    console.log(num)
    console.log(this.shadowRoot.querySelector("#autreVideo1"))
    for (let i = 0; i < num.length; i++) {
      console.log(num[i])
      this.shadowRoot.querySelector("#autreVideo" + num[i]).onclick = () => {
        this.player.src = this.video[num];
        console.log("click")
      }
    }
  }

  fixRelativeURLS() {
    // pour les knobs
    let knobs = this.shadowRoot.querySelectorAll('webaudio-knob');
    knobs.forEach((e) => {
      let path = e.getAttribute('src');
      e.src = getBaseURL() + '/' + path;
    });
  }

  videoSuivante() {
    this.cpt++;
    if (this.cpt > this.videos.length - 1) { this.cpt = 0 }
    this.player.src = this.videos[this.cpt];
    let icon = this.shadowRoot.querySelector("#play > i");
    icon.className = 'fas fa-play';
    icon.style.fontSize = 18 + 'px';
    icon.style.padding = '0 1px';
    this.shadowRoot.querySelector("#avancement > div").style.width = '0%';
  }

  videoPrecedente() {
    this.cpt--;
    if (this.cpt < 0) { this.cpt = this.videos.length - 1 }
    this.player.src = this.videos[this.cpt];
    let icon = this.shadowRoot.querySelector("#play > i");
    icon.className = 'fas fa-play';
    icon.style.fontSize = 18 + 'px';
    icon.style.padding = '0 1px';
    this.shadowRoot.querySelector("#avancement > div").style.width = '0%';
  }

  dimensionVideo(v) {
    v.addEventListener("loadedmetadata", () => {
      const barre = this.shadowRoot.querySelector('#barre')
      barre.style.width = v.getBoundingClientRect().width + 'px'
    }, false);
  }

  formatTime(time) {
    if (isNaN(time)) {
      return '00:00';
    }
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    return minutes + ":" + seconds;
  }

  autresVideos() {
    let vid = [];
    for (let i = 0; i < this.videos.length; i++) {
      if (this.player.src != this.videos[i]) {
        this.shadowRoot.querySelector("#liste").innerHTML += '<video id=autreVideo' + i + ' src="' + this.videos[i] + '"></video>';
        this.shadowRoot.querySelector("#autreVideo" + i).style.width = 200 + 'px';
        // this.shadowRoot.querySelector("#autreVideo"+i).style.heigth=50+'px';
        this.shadowRoot.querySelector("#autreVideo" + i).style.marginBottom = 8 + 'px';
        vid.push(i);
      }
    }
    return vid
  }
}

customElements.define("my-player", MyVideoPlayer);



// Sources
// http://g200kg.github.io/webaudio-controls/docs/knobgallery.html