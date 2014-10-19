// Generated by CoffeeScript 1.8.0
(function() {
  var $, FileListView, WebCam, esc, main;

  $ = document.getElementById.bind(document);

  esc = function(st) {
    return st.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  };

  WebCam = (function() {
    var getUserMedia;

    getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    WebCam.prototype.enabled = getUserMedia != null;

    function WebCam(video) {
      this.video = video;
      this.canvas = document.createElement('canvas');
      this.video.addEventListener('canplay', function() {
        return this.play();
      });
    }

    WebCam.prototype.start = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          if (!_this.enabled) {
            reject('getUserMedia is not supported');
          }
          if (_this.video.src) {
            _this.video.play();
            resolve(_this.video);
            return;
          }
          return getUserMedia.call(navigator, {
            video: true
          }, function(src) {
            _this.video.src = URL.createObjectURL(src);
            return resolve(_this.video);
          }, reject);
        };
      })(this));
    };

    WebCam.prototype.stop = function() {
      return this.video.pause();
    };

    WebCam.prototype.capture = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var ctx, height, i, width, _i;
          width = _this.canvas.width = _this.video.videoWidth;
          height = _this.canvas.height = _this.video.videoHeight;
          ctx = _this.canvas.getContext('2d');
          for (i = _i = 0; _i < 10; i = ++_i) {
            ctx.drawImage(_this.video, 0, 0);
            if (ctx.getImageData(0, 0, 1, 1).data[3]) {
              _this.canvas.toBlob(resolve, 'image/jpeg');
              return;
            }
          }
          return reject();
        };
      })(this));
    };

    return WebCam;

  })();

  FileListView = (function() {
    function FileListView(el) {
      this.el = el;
      this._idx = 0;
      this.files = [];
      this.el.addEventListener('click', (function(_this) {
        return function(_arg) {
          var idx, target;
          target = _arg.target;
          idx = parseInt(target.dataset.index, 10);
          if (!isNaN(idx)) {
            return _this.remove(idx);
          }
        };
      })(this));
    }

    FileListView.prototype.add = function(file, name) {
      var li, url;
      url = URL.createObjectURL(file);
      li = document.createElement('li');
      li.innerHTML = "<span>" + (esc(name || file.name)) + "</span>\n<a href=\"#\" style=\"color:red;\" data-index=\"" + this._idx + "\">x</a>\n<img src=\"" + url + "\" height=\"100\">";
      this.el.appendChild(li);
      this.files[this._idx] = file;
      return this._idx++;
    };

    FileListView.prototype.remove = function(idx) {
      var li;
      li = this.el.querySelector("[data-index='" + idx + "']").parentNode;
      li.parentNode.removeChild(li);
      return delete this.files[idx];
    };

    FileListView.prototype.getAll = function() {
      return this.files.filter(Boolean);
    };

    return FileListView;

  })();

  main = function() {
    var dnd, dropzone, fileList, fileSelector, webcam;
    fileList = new FileListView($('fileList'));
    fileSelector = new FileUpload.FileSelector($('fileInput'));
    $('fileSelectButton').addEventListener('click', function() {
      return fileSelector.get().then(function(file) {
        return fileList.add(file);
      });
    });
    webcam = new WebCam($('webcamVideo'));
    $('webcamButton').addEventListener('click', function() {
      return webcam.start().then(function() {
        return $('webcam').style.display = 'block';
      });
    });
    $('stopButton').addEventListener('click', function() {
      return webcam.stop();
    });
    $('okButton').addEventListener('click', function() {
      return webcam.capture().then(function(blob) {
        $('webcam').style.display = 'none';
        return fileList.add(blob, 'video capture');
      });
    });
    $('cancelButton').addEventListener('click', function() {
      return $('webcam').style.display = 'none';
    });
    dropzone = $('dropzone');
    dnd = new FileUpload.DragDropSelector(dropzone);
    dropzone.addEventListener('dragenter', function() {
      this.style.background = 'yellow';
      return dnd.get().then((function(_this) {
        return function(file) {
          _this.style.background = 'transparent';
          return fileList.add(file);
        };
      })(this));
    });
    return $('submitButton').addEventListener('click', function() {
      var data, form;
      form = $('form');
      data = new FormData(form);
      fileList.getAll().forEach(function(f) {
        return data.append('file', f);
      });
      return form.submit();
    });
  };

  document.addEventListener('DOMContentLoaded', main);

}).call(this);

//# sourceMappingURL=main.js.map
