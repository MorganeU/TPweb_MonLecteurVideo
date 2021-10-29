import "./lib/webaudio-controls.js";

const getBaseURL = () => {
  return new URL('.', import.meta.url);
};
// let nb=5; ${nb}

const template = document.createElement("template");
template.innerHTML = /*html*/`
<style>
#player {
  height: 350px;
}
</style>

<video id="player"><br></video>
<button id="play" onclick="play()">PLAY</button>
<button id="pause" onclick="pause()">PAUSE</button>
<button id="sec" onclick="avance10s()">+10s</button>
<button id="vite" onclick="vitesse4x()">Vitesse 4x</button>
<button id="infos" onclick="getInfo()">Informations</button> 
<button id="ecran" onclick="pleinEcran()">Mettre en plein écran</button>
<button id="precedente" onclick="changerVideo()">Vidéo precedente</button>
<button id="suivante" onclick="changerVideo()">Vidéo suivante</button>

<webaudio-knob diameter=40 id="volume" min=0 max=1 value=0.5 step="0.1" tooltip="%s" src="./assets/SimpleFlat3.png"></webaudio-knob>
<webaudio-param></webaudio-param>
<webaudio-slider></webaudio-slider>
<webaudio-switch></webaudio-switch>
<webaudio-keyboard></webaudio-keyboard>
`;

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
    // Recuperation des attributs
    this.src = this.getAttribute("src");
    this.player.src = this.src;
    // fonctions pour les boutons
    this.definitEcouteurs();

    this.fixRelativeURLS();
  }

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
    let cpt = 0;
    console.log(videos.length)
    this.shadowRoot.querySelector("#suivante").onclick = () => {
      cpt += 1;
      if (cpt > videos.length-1) { cpt = 0 }
      this.player.src = videos[cpt];
      console.log(cpt + " " + videos[cpt]);
    }
    this.shadowRoot.querySelector("#precedente").onclick = () => {
      cpt -= 1;
      if (cpt < 0) { cpt = videos.length-1 }
      this.player.src = videos[cpt];
      console.log(cpt + " " + videos[cpt]);
    }
    // Augmenter et baisser le volume
    this.shadowRoot.querySelector("#volume").oninput = (event) => {
      console.log(event.target.value);
      const vol = parseFloat(event.target.value);
      this.player.volume = vol;
    }
  }
  // this.player.ended

  fixRelativeURLS() {
    // pour les knobs
    let knobs = this.shadowRoot.querySelectorAll('webaudio-knob');
    knobs.forEach((e) => {
      let path = e.getAttribute('src');
      e.src = getBaseURL() + '/' + path;
    });
  }


  // API
  // play() {
  //   player.play();
  // }
  // pause() {
  //   player.pause();
  // }
  // avance10s() {
  //   player.currentTime += 10;
  // }
  // vitesse4x() {
  //   player.playbackRate = 4;
  // }
  // getInfo() {
  //   console.log("Durée de la vidéo : " + player.duration);
  //   console.log("Temps courant : " + player.currentTime);
  // }
}

customElements.define("my-player", MyVideoPlayer);


// sources
// http://g200kg.github.io/webaudio-controls/docs/knobgallery.html