// This is the client-side JS
const sidebar = document.querySelector(".sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("collapsed");
  Array.from(sidebar.getElementsByClassName("nav-link")).forEach((a) => {
    a.classList.toggle("disabled");
  });
}

const carouselTracks = document.querySelectorAll("[data-carousel-track]");

carouselTracks.forEach((track) => {
  const carousel = track.closest(".profile-carousel");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");

  if (!prevButton || !nextButton) return;

  const scrollByPage = (direction) => {
    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.8, 200),
      behavior: "smooth",
    });
  };

  const updateButtons = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;

    carousel.classList.toggle("has-overflow", maxScroll > 1);
    prevButton.disabled = track.scrollLeft <= 1;
    nextButton.disabled = track.scrollLeft >= maxScroll - 1;
  };

  prevButton.addEventListener("click", () => scrollByPage(-1));
  nextButton.addEventListener("click", () => scrollByPage(1));
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  updateButtons();
});
