$ = document.getElementById.bind document
esc = (st) ->
  st.replace /&/g, '&amp;'
    .replace /</g, '&lt;'
    .replace /"/g, '&quot;'


class WebCam
  getUserMedia =
    navigator.getUserMedia or
    navigator.webkitGetUserMedia or
    navigator.mozGetUserMedia
  enabled: getUserMedia?

  constructor: (@video) ->
    @canvas = document.createElement 'canvas'
    @video.addEventListener 'canplay', -> @play()

  start: ->
    new Promise (resolve, reject) =>
      if not @enabled
        reject 'getUserMedia is not supported'
      if @video.src
        @video.play()
        resolve @video
        return
      getUserMedia.call navigator,
        video: true
        (src) =>
          @video.src = URL.createObjectURL src
          resolve @video
        reject

  stop: ->
    @video.pause()

  capture: ->
    new Promise (resolve, reject) =>
      width = @canvas.width = @video.videoWidth
      height = @canvas.height = @video.videoHeight
      ctx = @canvas.getContext('2d')
      # 「1回でダメなら10回たたく」
      # Windows 7 + Chrome 40.0.2188.2 dev-m
      for i in [0...10]
        ctx.drawImage @video, 0, 0
        if ctx.getImageData(0, 0, 1, 1).data[3]
          @canvas.toBlob resolve, 'image/jpeg'
          return
      reject()


class FileListView
  constructor: (@el) ->
    @_idx = 0
    @files = []
    @el.addEventListener 'click', ({ target }) =>
      idx = parseInt target.dataset.index, 10
      if not isNaN idx
        @remove idx

  add: (file, name) ->
    # file should be a File or a Blob
    url = URL.createObjectURL file
    li = document.createElement 'li'
    li.innerHTML = """
      <span>#{esc name or file.name}</span>
      <a href="#" style="color:red;" data-index="#{@_idx}">x</a>
      <img src="#{url}" height="100">
    """
    @el.appendChild li
    @files[@_idx] = file
    @_idx++

  remove: (idx) ->
    li = @el.querySelector("[data-index='#{idx}']").parentNode
    li.parentNode.removeChild li
    delete @files[idx]

  getAll: ->
    @files.filter Boolean


main = ->
  fileList = new FileListView $ 'fileList'
  
  fileSelector = new FileUpload.FileSelector $ 'fileInput'
  $('fileSelectButton').addEventListener 'click', ->
    fileSelector.get().then (file) ->
      fileList.add file

  webcam = new WebCam $('webcamVideo')
  $('webcamButton').addEventListener 'click', ->
    webcam.start().then ->
      $('webcam').style.display = 'block'
  $('stopButton').addEventListener 'click', ->
    webcam.stop()
  $('okButton').addEventListener 'click', ->
    webcam.capture().then (blob) ->
      $('webcam').style.display = 'none'
      fileList.add blob, 'video capture'
  $('cancelButton').addEventListener 'click', ->
    $('webcam').style.display = 'none'

  dropzone = $ 'dropzone'
  dnd = new FileUpload.DragDropSelector dropzone
  dropzone.addEventListener 'dragenter', ->
    @style.background = 'yellow'
    dnd.get().then (file) =>
      @style.background = 'transparent'
      fileList.add file

  $('submitButton').addEventListener 'click', ->
    form = $ 'form'
    data = new FormData form
    fileList.getAll().forEach (f) -> data.append 'file', f
    form.submit()

document.addEventListener 'DOMContentLoaded', main
