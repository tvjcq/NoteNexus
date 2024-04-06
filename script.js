var currentAudio = null;

function playAudio(url, i) {
  if (url == null) {
    var modal = document.getElementById("noPreviewModal");
    modal.classList.add("show");
    modal.style.display = "block";
    return;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (playurl == url) {
      document
        .getElementById(`play-icon-${i}`)
        .classList.remove("bi-pause-fill");
      document.getElementById(`play-icon-${i}`).classList.add("bi-play-fill");
      playurl = null;
      return;
    }
  }
  const previousIcon = document.querySelector(".bi-pause-fill");
  if (previousIcon) {
    previousIcon.classList.remove("bi-pause-fill");
    previousIcon.classList.add("bi-play-fill");
  }
  playurl = url;

  document.getElementById(`play-icon-${i}`).classList.remove("bi-play-fill");
  document.getElementById(`play-icon-${i}`).classList.add("bi-pause-fill");

  currentAudio = new Audio(url);
  currentAudio.play();
}

function closeModal() {
  var modal = document.getElementById("noPreviewModal");
  modal.classList.remove("show");
  modal.style.display = "none";
}

function msToMinSec(ms) {
  let minutes = Math.floor(ms / 60000);
  let seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + "min " + (seconds < 10 ? "0" : "") + seconds + "s";
}

var songCountByArtist = {};

fetch("data.json")
  .then((response) => response.json())
  .then((jsonData) => {
    var cardGrid = document.getElementById("cardGrid");
    var chart = document.getElementById("myChart");
    jsonData.forEach(function (cardData, i) {
      i++;
      const durationInMs = `${cardData.duration_ms}`;
      const durationInMinSec = msToMinSec(durationInMs);
      var card = document.createElement("div");
      card.classList.add("col-md-4", "col-sm-6", "my-3");

      var cardHtml = `
                <div class="card" id="card${i}" >
                  <div class="imgPlayer">
                    <img src="${
                      cardData.album.images[0].url
                    }" class="card-img-top" alt="Card Image">
                    <div class="playButton" >
                      <i id="play-icon-${i}"  class="bi bi-play-fill"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <h4 class="card-title"><b>${i}.</b> ${cardData.name}</h4>
                    <p class="card-text mb-0">
                      ${cardData.artists
                        .map((artist) => artist.name)
                        .join(", ")}
                    </p>
                    <p class="card-text">
                      <small class="text-muted">${cardData.album.name}</small>
                    </p>
                    <button id="moreInfo-${i}" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${i}"">
                      Plus d'infos
                    </button>
                  </div>
                </div>

                <div class="modal fade" id="modal-${i}" tabindex="-1" aria-labelledby="modalLabel-${i}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalLabel-${i}">${
        cardData.name
      }</h5> </br>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <img src="${
                cardData.album.images[0].url
              }" class="card-img-top rounded" alt="Card Image">
              <p>Titre : ${cardData.name}</p>
              <p>Album : ${cardData.album.name}</p>
              <p>Date de sortie : ${new Date(
                cardData.album.release_date
              ).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}</p>
              <p>Durée : ${durationInMinSec}</p>
              <p>Artiste(s) : ${cardData.artists
                .map((artist) => artist.name)
                .join(", ")}</p>
              <p>Followers : ${cardData.artists[0].followers.total.toLocaleString(
                undefined,
                { useGrouping: true }
              )}</p>

            </div>
            <div class="modal-footer">
              <button type="button" id="spotifyBtn-${i}" class="btn btn-primary">Écouter sur Spotify</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            </div>
          </div>
        </div>
      </div>
              `;

      card.innerHTML = cardHtml;
      cardGrid.appendChild(card);

      document
        .getElementById(`play-icon-${i}`)
        .addEventListener("click", function () {
          playAudio(cardData.preview_url, i);
        });

      document
        .getElementById(`spotifyBtn-${i}`)
        .addEventListener("click", function () {
          window.open(cardData.external_urls.spotify);
        });

      document
        .getElementById(`closeModalBtn`)
        .addEventListener("click", function () {
          closeModal();
        });

      cardData.artists.forEach((artist) => {
        let artistName = artist.name;
        if (songCountByArtist[artistName]) {
          songCountByArtist[artistName]++;
        } else {
          songCountByArtist[artistName] = 1;
        }
      });
    });

    var colors = ["#5356FF", "#378CE7", "#4ECC90", "#FFD166", "#FF6B6B"];

    var backgroundColors = Object.keys(songCountByArtist).map(
      (_, i) => colors[i % colors.length]
    );

    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(songCountByArtist),
        datasets: [
          {
            label: "Nombre de sons",
            data: Object.values(songCountByArtist),
            backgroundColor: backgroundColors,
            borderColor: backgroundColors + "99",
            borderWidth: 1,
          },
        ],
      },
    });

    var popularityData = jsonData.map((cardData) => cardData.popularity);

    var popularityChart = document
      .getElementById("popularityChart")
      .getContext("2d");
    var myPopularityChart = new Chart(popularityChart, {
      type: "bar",
      data: {
        labels: jsonData.map((cardData, i) => `${i + 1}. ${cardData.name}`),
        datasets: [
          {
            label: "Popularité",
            data: popularityData,
            backgroundColor: "rgba(83, 86, 255, 0.8)",
            borderColor: "rgba(83, 86, 255, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });

    console.log("Popularity Data:", popularityData);
  })
  .catch((error) => {
    console.error("Error fetching JSON data:", error);
  });
