// ------- Osmo [https://osmo.supply/] ------- //
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

// Register plugins
gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");


// Loading Animation
function initCrispLoadingAnimation() {

  const container = document.querySelector(".crisp-header");
  const heading = container.querySelectorAll(".crisp-header__h1");
  const revealImages = container.querySelectorAll(".crisp-loader__group > *");
  const isScaleUp = container.querySelectorAll(".crisp-loader__media");
  const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
  const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
  const smallElements = container.querySelectorAll(".crisp-header__top, .crisp-header__p");
  const sliderNav = container.querySelectorAll(".crisp-header__slider-nav > *");


  /* GSAP Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove('is--hidden');
    }
  });

  /* GSAP SplitText */
  let split;
  if (heading.length) {
    split = new SplitText(heading, {
      type: "words",
      mask: "words"
    });

    gsap.set(split.words, {
      yPercent: 110,
    });
  }

  /* Start of Timeline */
  if (revealImages.length) {
    tl.fromTo(revealImages, {
      xPercent: 500
    }, {
      xPercent: -500,
      duration: 2.5,
      stagger: 0.05
    });
  }

  if (isScaleDown.length) {
    tl.to(isScaleDown, {
      scale: 0.5,
      duration: 2,
      stagger: {
        each: 0.05,
        from: "edges",
        ease: "none"
      },
      onComplete: () => {
        if (isRadius) {
          isRadius.forEach(el => el.classList.remove('is--radius'));
        }
      }
    }, "-=0.1");
  }

  if (isScaleUp.length) {
    tl.fromTo(isScaleUp, {
      width: "10em",
      height: "10em"
    }, {
      width: "100vw",
      height: "100dvh",
      duration: 2
    }, "< 0.5");
  }

  if (sliderNav.length) {
    tl.from(sliderNav, {
      yPercent: 150,
      stagger: 0.05,
      ease: "expo.out",
      duration: 1
    }, "-=0.9");
  }

  if (split && split.words.length) {
    tl.to(split.words, {
      yPercent: 0,
      stagger: 0.075,
      ease: "expo.out",
      duration: 1
    }, "< 0.1");
  }

  if (smallElements.length) {
    tl.from(smallElements, {
      opacity: 0,
      ease: "power1.inOut",
      duration: 0.2
    }, "< 0.15");
  }

  tl.call(function () {
    container.classList.remove('is--loading');
  }, null, "+=0.45");
}

// Initialize Crisp Loading Animation
document.addEventListener('DOMContentLoaded', () => {
  document.fonts.ready.then(() => {
    initCrispLoadingAnimation();
  });
});

// Slideshow
const SLIDE_ANIMATION_DURATION = 1.5;

function getNextSlideIndex(currentIndex, direction, targetIndex, slideCount) {
  if (targetIndex !== null && targetIndex !== undefined) return targetIndex;

  if (direction === 1) {
    return currentIndex < slideCount - 1 ? currentIndex + 1 : 0;
  }

  return currentIndex > 0 ? currentIndex - 1 : slideCount - 1;
}

function animateSlideTransition(slideshow, previousIndex, nextIndex, direction, onComplete) {
  const currentSlide = slideshow.slides[previousIndex];
  const currentImage = slideshow.images[previousIndex];
  const upcomingSlide = slideshow.slides[nextIndex];
  const upcomingImage = slideshow.images[nextIndex];

  gsap.timeline({
    defaults: { duration: SLIDE_ANIMATION_DURATION, ease: 'slideshow-wipe' },
    onStart() {
      upcomingSlide.classList.add('is--current');
      slideshow.thumbnails[previousIndex].classList.remove('is--current');
      slideshow.thumbnails[nextIndex].classList.add('is--current');
    },
    onComplete() {
      currentSlide.classList.remove('is--current');
      onComplete();
    }
  })
    .to(currentSlide, { xPercent: -direction * 100 }, 0)
    .to(currentImage, { xPercent: direction * 75 }, 0)
    .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
    .fromTo(upcomingImage, { xPercent: -direction * 75 }, { xPercent: 0 }, 0);
}

function bindThumbnailNavigation(thumbnails, onSelectIndex) {
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', event => {
      const targetIndex = parseInt(event.currentTarget.getAttribute('data-index'), 10);
      onSelectIndex(targetIndex);
    });
  });
}

function initSlideShow(element) {
  const slideshow = {
    slides: Array.from(element.querySelectorAll('[data-slideshow="slide"]')),
    images: Array.from(element.querySelectorAll('[data-slideshow="parallax"]')),
    thumbnails: Array.from(element.querySelectorAll('[data-slideshow="thumb"]'))
  };

  let currentIndex = 0;
  let isAnimating = false;

  slideshow.slides.forEach((slide, index) => slide.setAttribute('data-index', index));
  slideshow.thumbnails.forEach((thumbnail, index) => thumbnail.setAttribute('data-index', index));

  slideshow.slides[currentIndex].classList.add('is--current');
  slideshow.thumbnails[currentIndex].classList.add('is--current');

  function transitionToSlide(direction, targetIndex = null) {
    if (isAnimating) return;
    isAnimating = true;

    const previousIndex = currentIndex;
    currentIndex = getNextSlideIndex(
      currentIndex,
      direction,
      targetIndex,
      slideshow.slides.length
    );

    animateSlideTransition(slideshow, previousIndex, currentIndex, direction, () => {
      isAnimating = false;
    });
  }

  function selectSlide(targetIndex) {
    if (targetIndex === currentIndex || isAnimating) return;

    const direction = targetIndex > currentIndex ? 1 : -1;
    transitionToSlide(direction, targetIndex);
  }

  bindThumbnailNavigation(slideshow.thumbnails, selectSlide);
}

// Initialize Slideshow
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slideshow="wrap"]').forEach(wrap => initSlideShow(wrap));
});