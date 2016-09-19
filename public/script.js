MIN_WIDTH = 360;

var curr_page = (function () {
  var url = window.location.href;
  var anchor = url.match(/\#(.*)$/);
  return anchor ? anchor[1] : null;
})();

$(document).ready(function () {
  if (curr_page) {
    var page_element = document.getElementById(curr_page);
    if (page_element) openSection.call(page_element);
  }

  var $window = $(window);
  var scroller = new PhotoScroller();

  $window.scroll(function () {
    var bottom_of_object = scroller.$.offset().top + scroller.$.outerHeight();
    var bottom_of_window = $window.scrollTop() + $window.height();
    if (bottom_of_window > bottom_of_object) {
      $window.off('scroll');
      scroller.scroll(scroller.bounce);
    }
  });

  //$window.resize(sizeAllBackgrounds);
  sizeAllBackgrounds();

  $('h2').click(openSection);

  function sizeAllBackgrounds () {
    $('.primary-cntnr').each(setBackgroundImageSize);
  }
});

/**
 * Functions for PhotoScroller
 */

function PhotoScroller () {
  this.image_path = 'public/images/';
  this.letter_width = 50;
  this.letter_height = 50;
  this.name = 'scroll';
  this.id = 'photoscroll';
  this.phrase = ['will', 'you', 'marry', 'me'];

  this.$ = $('#' + this.id);
  this.words = [];
  this.letters = [];

  for (var i = 0; i < this.phrase.length; i++) {
    this._addWord(this.phrase[i]);
  }
}

PhotoScroller.prototype._addWord = function (word) {
  var width = this.letter_width * word.length;
  var $word = $('<div>').width(width + 'px');

  for (var i = 0; i < word.length; i++) {
    this._addLetter($word);
  }
  this.words.push($word);
  this.$.append($word);
};

PhotoScroller.prototype._addLetter = function ($word) {
  var $letter = $('<img>')
  var i = this.letters.length;
  var attributes = {
    src: this.image_path + this.name + '-' + i + '.jpg',
    height: this.letter_height + 'px',
    width: this.letter_width + 'px'
  };
  $letter.attr(attributes).css('opacity', '0');
  this.letters.push($letter);
  $word.append($letter);
};

PhotoScroller.prototype._scrollLetter = function (i) { 
  var $letter = this.letters[i];
  var left = $letter.offset().left;
  $letter.css('left', '-' + left + 'px');
  $letter.animate({ opacity: '.5', left: 0 }, 1000)
    .animate({ opacity: '1' }, 500);
};

PhotoScroller.prototype.scroll = function (callback) {
  var self = this;
  var i = 0;
  var length = this.letters.length;
  var interval = setInterval(function () {
    self._scrollLetter(i);
    if (++i === length) {
      clearInterval(interval);
      callback.call(self);
    }
  }, 250);
};

PhotoScroller.prototype.bounce = function () {
  var self = this;
  setInterval(function () {
    self.letters.forEach(function ($letter, i) {
      $letter.delay(i * 100).animate({ top: '-50px' }).animate({ top: '0' });
    });
  }, 3000);
};

/**
 * Get section heights/widths and set background sizes
 */
function setBackgroundImageSize () {
  var $this = $(this);
  var $drop = $this.children('.drop-down');
  var height = $drop.outerHeight(true) + $this.height();
  var width = $(window).width() - 20;
  var ratio = 1.5 / (width / height);
  var percent = ratio > 1.1 ? 100 * ratio + '%' : '110%';
  $this.css('background-size', percent);
}

/**
 * Functions for clicking h2 tags
 */
function disableClick (bool) {
  disableClick.on = bool
  var method = bool ? 'addClass' : 'removeClass';
  $('h2')[method]('no-click');
}

function openSection () {
  if (disableClick.on) return;

  var _this = this;
  if (this.id != curr_page) {
    curr_page = this.id;
    setTimeout(function () {
      window.location.replace(window.location.href.replace(/(#.*)?$/, '#' + _this.id));
    }, 600);
  }
  disableClick(true);
  $('h2').filter(function () {
    return $(this).hasClass('open') && this !== _this;
  }).each(toggleSection);
  toggleSection.call(this);
}

function toggleSection () {
  heading = $(this);
  var drop_down = heading.next();
  var content = drop_down.children();
  var opening = !heading.hasClass('open');

  if (opening) {
    content.stop(true);
    content.css('opacity', 0);
    centerWindow(this);
  }
  heading.toggleClass('open');
  drop_down.slideToggle(500, function () {
    disableClick(false);
  });
  animateSibling(content.first(), {
    opacity: opening ? 1 : 0
  }, 1000);
}

function animateSibling (first, animation, speed) {
  first.animate(animation, speed, function () {
    if (first.next()) animateSibling(first.next(), animation, speed);
  });
}

function centerWindow (element) {
  var index = $('h2').index(element);
  var height = $(element).outerHeight();
  var target = index * height + $('#header').outerHeight();
  $('html, body').animate({
    scrollTop: target
  }, 500);
}
