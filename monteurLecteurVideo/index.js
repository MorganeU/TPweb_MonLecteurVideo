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
}
#over:hover > #barre {
  opacity:1;
}
#ecran {
  margin-left:auto;
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
  font-weight:bold;
  font-family: Arial;
  font-size:20px;
}
#play{
  font-size:18px;
}
#vol {
  font-size:25px;
  margin-left:5px;
  width:30px;
}
</style>

<div id="over">
  <video id="player"><br></video>
  <div id="barre">
    <button id="precedente" onclick="changerVideo()"><i class="fas fa-step-backward"></i></button>
    <button id="play" onclick="play()"><i class="fas fa-play"></i></button>
    <button id="pause" onclick="pause()"><i class="fas fa-pause"></i></button>
    <button id="suivante" onclick="changerVideo()"><i class="fas fa-step-forward"></i></button>
    <i id="vol" class="fas fa-volume-up"></i>
    <webaudio-slider id="volume" height=17 width=70 tracking="rel" min=0 max=1 value=0.85 step="0.1"></webaudio-slider>
    <button id="sec" onclick="avance10s()">+10s</button>
    <button id="vite" onclick="vitesse4x()">x4</button>
    <button id="ecran" onclick="pleinEcran()"><i class="fas fa-expand"></i></button>
  </div>
  <button id="infos" onclick="getInfo()"><i class="fas fa-info-circle"></i></button> 
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
    // Lancer la vidéo
    this.shadowRoot.querySelector("#play").onclick = () => {
      this.player.play();
    }
    // Arreter la vidéo
    this.shadowRoot.querySelector("#pause").onclick = () => {
      this.player.pause();
    }
    // Avancer de 10 sec la vidéo
    this.shadowRoot.querySelector("#sec").onclick = () => {
      this.player.currentTime += 10;
    }
    // Mettre la vidéo en vitesse x4
    this.shadowRoot.querySelector("#vite").onclick = () => {
      this.player.playbackRate = 4;
    }
    // Obtenir dans la console des informations sur la vidéo
    this.shadowRoot.querySelector("#infos").onclick = () => {
      console.log("Durée de la vidéo : " + this.player.duration);
      console.log("Temps courant : " + this.player.currentTime);
    }
    // Mettre en grand écran la vidéo
    this.shadowRoot.querySelector("#ecran").onclick = () => {
      this.player.requestFullscreen();
    }
    // Changer de vidéo
    let videos = ["https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
      "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4",
      "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
    ];
    this.cpt = 0;
    this.shadowRoot.querySelector("#suivante").onclick = () => { // passer à la suivante
      this.videoSuivante(videos)
    }
    this.shadowRoot.querySelector("#precedente").onclick = () => { // passer à la precedente
      this.videoPrecedente(videos)
    }
    this.player.onended = () => { // passer à la suivante quand la video est fini
      this.videoSuivante(videos);
      this.player.play();
    }
    // Augmenter et baisser le volume
    this.shadowRoot.querySelector("#volume").oninput = (event) => {
      const vol = parseFloat(event.target.value);
      this.player.volume = vol;
      let icon = this.shadowRoot.querySelector("#vol");
      let iconName;
      if(vol==0) iconName='fas fa-volume-off'
      else if(vol<0.8) iconName='fas fa-volume-down'
      else iconName='fas fa-volume-up'
      icon.className = iconName
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

  videoSuivante(videos) {
    this.cpt++;
    if (this.cpt > videos.length - 1) { this.cpt = 0 }
    this.player.src = videos[this.cpt];
  }

  videoPrecedente(videos) {
    this.cpt--;
    if (this.cpt < 0) { this.cpt = videos.length - 1 }
    this.player.src = videos[this.cpt];
  }

  dimensionVideo(v) {
    v.addEventListener("loadedmetadata", () => {
      const barre = this.shadowRoot.querySelector('#barre')
      barre.style.width = v.getBoundingClientRect().width + 'px'
    }, false);
  }
}

customElements.define("my-player", MyVideoPlayer);


// sources
// http://g200kg.github.io/webaudio-controls/docs/knobgallery.html