const imageWidth = 1920; //image width in pixels
const imageHeight = 1080; //image height in pixels
const collectionSize = 70;
const collectionId = 3678981;

const galleryView = $(".gallery-view");
const galleryDots = $(".gallery-dots");

let galleryItem = $(
  '<div class="gallery-item" style="left:0"><img src=""></div>'
);
let galleryDot = $("<div>").addClass("gallery-dot");
let playTimer;
let currentActiveIndex = 0;
let slideDuration = 600;
let autoPlayDuration = 1500;

let resObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    $(entry.target).each(function () {
      let width = $(this).width();
      let height = $(this).height();
      $(this)
        .find(".gallery-item")
        .each(function () {
          let src = $(this).children().attr("src");
          src = actualizeURL(src, width, height);
          $(this).children().attr({ src: src });
        });
    });
  }
});
$(".gallery-container").on("click", ".gallery-dot", dotHandler);
$(".gallery-container").on("click", ".gallery-button", buttonHandler);
$(".gallery-view").each(function () {
  resObserver.observe($(this)[0]);
});

function actualizeURL(url, width, height) {
  url = url.replace(/(?<=w=)\d+/, width);
  url = url.replace(/(?<=h=)\d+/, height);
  url = url.replace(/(?<=crop=)\w+/, "center");
  return url;
}
getImage();
getImage();
getImage();
getImage();
getImage();

function moveImages(cont) {
  let items = cont.find(".gallery-item");
  let active = items.filter(".active");
  let activeIndex = items.index(active);
  let galleryView = cont.find(".gallery-view");

  // console.log("current: " + currentActiveIndex);
  // console.log("active: " + activeIndex);

  if (currentActiveIndex != activeIndex) {
    items.each(function (index) {
      if (
        index < activeIndex &&
        index != activeIndex &&
        index != currentActiveIndex
      ) {
        $(this).stop();
        $(this).css({ left: "-100%" });
      }
      if (
        index > activeIndex &&
        index != activeIndex &&
        index != currentActiveIndex
      ) {
        $(this).stop();
        $(this).css({ left: "100%" });
      }
    });

    if (currentActiveIndex < activeIndex) {
      items
        .eq(currentActiveIndex)
        .animate({ left: "-100%" }, slideDuration, function () {
          $(this).css({ left: "-100%" });
        });
      setTimeout(function () {
        items.eq(activeIndex).animate({ left: 0 }, slideDuration, function () {
          $(this).css({ left: 0 });
        });
      }, 200);
    } else {
      // console.log("current: " + galleryView.width());
      // console.log("active: 0");
      items
        .eq(currentActiveIndex)
        .animate({ left: "100%" }, slideDuration, function () {
          $(this).css({ left: "100%" });
        });
      setTimeout(function () {
        items.eq(activeIndex).animate({ left: 0 }, slideDuration, function () {
          $(this).css({ left: 0 });
        });
      }, 200);
    }
  }

  currentActiveIndex = activeIndex;
}

function getImage() {
  if (true) {
    fetch(
      `https://source.unsplash.com/collection/${collectionId}/${imageWidth}x${imageHeight}/?sig=${Math.round(
        Math.random() * collectionSize
      )}`
    ).then((response) => {
      addItem(response.url);
    });
  } else {
    addItem("");
  }
}
function addItem(url) {
  url = actualizeURL(url, galleryView.width(), galleryView.height());
  let newImg = galleryItem.clone();
  if (galleryView.find(".gallery-item").length > 0) {
    newImg.css({ left: "100%" });
  }
  newImg.children().first().attr({ src: url });
  galleryView.append(newImg);
  galleryDots.append(galleryDot.clone());
  if (galleryDots.find(".gallery-dot").length == 1) {
    galleryDots.find(".gallery-dot").first().trigger("click");
  } else {
    checkDots(galleryView.closest(".gallery-container"));
  }
}

function dotHandler() {
  let $cont = $(this).closest(".gallery-container");
  let $dots = $cont.find(".gallery-dot");
  let index = $dots.index($(this));
  $dots.removeClass("active");
  $dots.eq(index).addClass("active");
  let $items = $cont.find(".gallery-item");
  $items.removeClass("active");
  $items.eq(index).addClass("active");
  checkDots($cont);
  moveImages($cont);
  // }
}

function checkDots($cont) {
  let $dots = $cont.find(".gallery-dot");
  let $activeDot = $cont.find(".gallery-dot.active");
  let index = $dots.index($activeDot);

  $cont.find('[name="start"]').removeClass("disabled");
  $cont.find('[name="back"]').removeClass("disabled");
  $cont.find('[name="forward"]').removeClass("disabled");
  $cont.find('[name="end"]').removeClass("disabled");
  $cont.find('[name="play"]').removeClass("disabled");
  switch (index) {
    case 0:
      $cont.find('[name="start"]').addClass("disabled");
      $cont.find('[name="back"]').addClass("disabled");
      break;
    case $dots.length - 1:
      $cont.find('[name="forward"]').addClass("disabled");
      $cont.find('[name="end"]').addClass("disabled");
      $cont.find('[name="play"]').hasClass("active") &&
        $cont.find('[name="play"]').trigger("click");
      $cont.find('[name="play"]').addClass("disabled");
      break;
  }
}

function buttonHandler(e) {
  if ($(this).hasClass("disabled")) return;
  let $cont = $(this).closest(".gallery-container");
  let $dots = $cont.find(".gallery-dot");
  let $activeDot = $cont.find(".gallery-dot.active");
  let index = $dots.index($activeDot);
  switch ($(this).attr("name")) {
    case "start":
      $dots.eq(0).trigger("click");
      break;
    case "back":
      $dots.eq(index - 1).trigger("click");
      break;
    case "forward":
      $dots.eq(index + 1).trigger("click");
      break;
    case "end":
      $dots.eq($dots.length - 1).trigger("click");
      break;
    case "play":
      if ($(this).hasClass("active")) {
        $(this).text("play_arrow");
        clearInterval(playTimer);
      } else {
        $(this).text("stop");
        playTimer = setInterval(() => {
          $(this).parent().find("[name='forward']").trigger("click");
        }, autoPlayDuration);
      }
      $(this).toggleClass("active");
      break;
    case "fullscreen":
      if ($(this).hasClass("active")) {
        fullScreenOff();
      } else {
        fullScreenOn($(this).closest(".gallery-container")[0]);
      }
      break;
    case "add":
      getImage();
      checkDots($cont);
  }
}
$(".gallery-container").on("fullscreenchange", fullScreenHandler);

function fullScreenHandler(e) {
  if (document.fullscreenElement) {
    $(this).find('[name="fullscreen"]').text("fullscreen_exit");
    $(this).find('[name="fullscreen"]').addClass("active");
    $(this).addClass("fullscreen");
  } else {
    $(this).find('[name="fullscreen"]').text("fullscreen");
    $(this).find('[name="fullscreen"]').removeClass("active");
    $(this).removeClass("fullscreen");
  }
}
function fullScreenOn(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitrequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullScreen();
  }
}
function fullScreenOff() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozExitFullscreen) {
    document.mozExitFullscreen();
  }
}
